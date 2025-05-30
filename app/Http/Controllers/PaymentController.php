<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Transaction;
use App\Models\User; // Added User model
use Illuminate\Http\Request; // Added Request
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) // Added Request $request
    {
        $user = Auth::user();
        $cards = $user->cards()->where('active', true)->get();
        $isAdmin = $user->is_admin ?? false; // Assuming an 'is_admin' attribute on User model

        $transactionsQuery = Transaction::with(['fromCard.user', 'toCard.user'])->latest();

        $allUsers = null;

        if ($isAdmin) {
            $allUsers = User::orderBy('name')->get(); // For admin filter dropdown
            $filterUserId = $request->input('user_id');

            if ($filterUserId) {
                $transactionsQuery->where(function ($query) use ($filterUserId) {
                    $query->whereHas('fromCard', function ($q) use ($filterUserId) {
                        $q->where('user_id', $filterUserId);
                    })->orWhereHas('toCard', function ($q) use ($filterUserId) {
                        $q->where('user_id', $filterUserId);
                    });
                });
            }
            // Admins see all transactions if no filter, or filtered transactions
        } else {
            // Non-admins see only their transactions
            $userCardIds = $user->cards()->pluck('id');
            $transactionsQuery->where(function ($query) use ($userCardIds) {
                $query->whereIn('from_card_id', $userCardIds)
                      ->orWhereIn('to_card_id', $userCardIds);
            });
        }

        $transactions = $transactionsQuery->paginate(10)->withQueryString();

        return Inertia::render('payments/PaymentTransferPage', [
            'cards' => $cards,
            'transactions' => $transactions,
            'isAdmin' => $isAdmin,
            'allUsers' => $allUsers, // For admin filter
            'filters' => $request->only(['user_id']), // Pass current filters back to the view
            'flash' => [
                'message' => session('message'),
                // Include other flash messages if needed
            ],
            'errors' => session('errors') ? session('errors')->getBag('default')->getMessages() : (object)[],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not used for this implementation
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'from_card_id' => ['required', 'exists:cards,id'],
            'to_card_number' => ['required', 'digits:16', 'regex:/^[0-9]+$/'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $fromCard = Card::find($request->from_card_id);
        $toCard = Card::where('card_number', $request->to_card_number)->first();

        // Check if the sender owns the card
        if ($fromCard->user_id !== Auth::id()) {
            return back()->withErrors(['message' => 'Invalid sender card.']);
        }

        if (!$toCard) {
            return back()->withErrors(['message' => 'Receiver card not found.']);
        }

        if ($fromCard->id === $toCard->id) {
            return back()->withErrors(['message' => 'Cannot transfer to the same card.']);
        }

        if (!$fromCard->active || !$toCard->active) {
            return back()->withErrors(['message' => 'One or both cards are inactive.']);
        }

        $requestedAmount = (float) $request->amount;

        // Commission Logic
        $commissionRate = (float) env('COMMISSION', 0.0); // Default to 0 if not set
        $commissionAdminCardPan = env('COMMISION_BALANCE_PAN');

        $adminCommissionCard = null;
        $commissionAmount = 0;

        if ($commissionRate > 0) {
            if (empty($commissionAdminCardPan)) {
                return back()->withErrors(['message' => 'Transaction failed due to commission configuration error.']);
            }
            $adminCommissionCard = Card::where('card_number', $commissionAdminCardPan)->first();

            if (!$adminCommissionCard) {
                return back()->withErrors(['message' => 'Transaction failed: Commission beneficiary card not found.']);
            }

            if (!$adminCommissionCard->active) {
                return back()->withErrors(['message' => 'Transaction failed: Commission beneficiary card is inactive.']);
            }

            if ($adminCommissionCard->id === $fromCard->id || $adminCommissionCard->id === $toCard->id) {
                return back()->withErrors(['message' => 'Commission card cannot be the sender or receiver card.']);
            }
            $commissionAmount = round($requestedAmount * $commissionRate, 2, PHP_ROUND_HALF_UP);
        }

        $amountToDebitFromSender = $requestedAmount;
        $amountToCreditToReceiver = $requestedAmount - $commissionAmount;

        if ($amountToCreditToReceiver < 0) {
            $commissionAmount = $requestedAmount;
            $amountToCreditToReceiver = 0;
        }

        if ($commissionAmount < 0) {
            $commissionAmount = 0;
            $amountToCreditToReceiver = $requestedAmount;
        }

        if ($fromCard->balance < $amountToDebitFromSender) {
            return back()->withErrors(['message' => 'Insufficient balance.']);
        }

        DB::beginTransaction();

        try {
            $fromCard->balance -= $amountToDebitFromSender;
            $fromCard->save();

            $toCard->balance += $amountToCreditToReceiver;
            $toCard->save();

            if ($adminCommissionCard && $commissionAmount > 0) {
                $adminCommissionCard->balance += $commissionAmount;
                $adminCommissionCard->save();
            }

            $transactionDescription = 'Transfer from ' . $fromCard->card_number . ' to ' . $toCard->card_number;
            if ($commissionAmount > 0) {
                $transactionDescription .= '. Commission: ' . number_format($commissionAmount, 2);
            }

            Transaction::create([
                'from_card_id' => $fromCard->id,
                'to_card_id' => $toCard->id,
                'amount' => $requestedAmount,
                'description' => $transactionDescription,
            ]);

            DB::commit();

            return redirect()->route('payments.index')->with('message', 'Transfer successful.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Transfer failed. Please try again.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Not used for this implementation
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Not used for this implementation
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Not used for this implementation
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Not used for this implementation
    }
}

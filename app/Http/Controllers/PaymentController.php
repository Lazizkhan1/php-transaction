<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cards = Auth::user()->cards()->where('active', true)->get();
        return Inertia::render('payments/PaymentTransferPage', [ // Changed from payments/index
            'cards' => $cards,
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

        if ($fromCard->balance < $request->amount) {
            return back()->withErrors(['message' => 'Insufficient balance.']);
        }

        DB::beginTransaction();

        try {
            $fromCard->balance -= $request->amount;
            $fromCard->save();

            $toCard->balance += $request->amount;
            $toCard->save();

            Transaction::create([
                'from_card_id' => $fromCard->id,
                'to_card_id' => $toCard->id,
                'amount' => $request->amount,
                'description' => 'Transfer from ' . $fromCard->card_number . ' to ' . $toCard->card_number,
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

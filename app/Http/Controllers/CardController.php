<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardTypes;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cards = Card::with(['user', 'cardType'])->latest()->get();
        $users = User::all()->map(fn($user) => ['id' => $user->id, 'name' => $user->name]);
        $cardTypes = CardTypes::where('active', true)->get()->map(fn($type) => ['id' => $type->id, 'title' => $type->title]);
        return Inertia::render('cards/index', [
            'cards' => $cards,
            'users' => $users,
            'cardTypesList' => $cardTypes // Pass as cardTypesList
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::all()->map(fn($user) => ['id' => $user->id, 'name' => $user->name]);
        $cardTypes = CardTypes::where('active', true)->get()->map(fn($type) => ['id' => $type->id, 'title' => $type->title]);
        return Inertia::render('cards/create', [
            'users' => $users,
            'cardTypesList' => $cardTypes // Pass as cardTypesList
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'balance' => 'required|numeric|min:0',
            'card_number' => 'required|string|min:16|max:16|unique:cards,card_number',
            'exp_month' => 'required|integer|min:1|max:12',
            'exp_year' => 'required|integer|min:' . date('y') . '|max:' . (intval(date('y')) + 9),
            'cvv' => 'nullable|string|min:3|max:3',
            'card_holder' => 'required|string|max:50',
            'card_type_id' => 'required|exists:card_types,id',
            'active' => 'required|boolean',
        ];

        if (Auth::user()->role === 'admin') {
            $rules['user_id'] = 'required|exists:users,id';
        }

        $validatedData = $request->validate($rules);

        if (Auth::user()->role !== 'admin') {
            $validatedData['user_id'] = Auth::id();
        }

        Card::create($validatedData);

        return redirect()->route('cards.index')->with('message', 'Card Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Card $card)
    {
        $card->load(['user', 'cardType']);
        return Inertia::render('cards/show', compact('card')); // Optional: if you need a dedicated show page
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Card $card)
    {
        $users = User::all()->map(fn($user) => ['id' => $user->id, 'name' => $user->name]);
        $cardTypes = CardTypes::where('active', true)->get()->map(fn($type) => ['id' => $type->id, 'title' => $type->title]);
        $card->load(['user', 'cardType']);
        return Inertia::render('cards/edit', [
            'card' => $card,
            'users' => $users,
            'cardTypesList' => $cardTypes // Pass as cardTypesList
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Card $card)
    {
        $rules = [
            'balance' => 'required|numeric|min:0',
            'card_number' => 'required|string|min:16|max:16|unique:cards,card_number,' . $card->id,
            'exp_month' => 'required|integer|min:1|max:12',
            'exp_year' => 'required|integer|min:' . date('y') . '|max:' . (intval(date('y')) + 9),
            'cvv' => 'nullable|string|min:3|max:3',
            'card_holder' => 'required|string|max:50',
            'card_type_id' => 'required|exists:card_types,id',
            'active' => 'required|boolean',
        ];

        if (Auth::user()->role === 'admin') {
            $rules['user_id'] = 'required|exists:users,id';
        }

        $validatedData = $request->validate($rules);

        $card->update($validatedData);

        return redirect()->route('cards.index')->with('message', 'Card Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Card $card)
    {
        $card->delete();
        return redirect()->route('cards.index')->with('message', 'Card Deleted Successfully');
    }
}

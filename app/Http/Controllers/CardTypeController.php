<?php

namespace App\Http\Controllers;

use App\Models\CardTypes;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cardTypes = CardTypes::all();
        return Inertia::render('card-types/index', compact('cardTypes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('card-types/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255|unique:card_types,title',
            'active' => 'required|boolean',
        ]);
        CardTypes::create($request->all());
        return redirect()->route('card-types.index')->with('message', 'Card Type Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cardType = CardTypes::all()->find($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $cardType = CardTypes::all()->find($id);
        return Inertia::render('card-types/edit', compact('cardType'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string|max:255|unique:card_types,title,' . $id,
            'active' => 'required|boolean',
        ]);

        $cardType = CardTypes::findOrFail($id);
        $cardType->update($request->only(['title', 'active']));

        return redirect()->route('card-types.index')->with('message', 'Card Type Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        CardTypes::destroy($id);
        return redirect()->route('card-types.index')->with('message', 'Card Type Deleted Successfully');
    }
}

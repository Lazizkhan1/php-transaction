<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'from_card_id',
        'to_card_id',
        'amount',
        'description',
    ];

    /**
     * Get the card from which the transaction originated.
     */
    public function fromCard(): BelongsTo
    {
        return $this->belongsTo(Card::class, 'from_card_id');
    }

    /**
     * Get the card that received the transaction.
     */
    public function toCard(): BelongsTo
    {
        return $this->belongsTo(Card::class, 'to_card_id');
    }
}

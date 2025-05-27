<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'card_number',
        'exp_month',
        'exp_year',
        'cvv',
        'card_holder',
        'card_type_id',
        'active',
    ];

    /**
     * Get the user that owns the card.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the card type associated with the card.
     */
    public function cardType(): BelongsTo
    {
        return $this->belongsTo(CardTypes::class);
    }
}


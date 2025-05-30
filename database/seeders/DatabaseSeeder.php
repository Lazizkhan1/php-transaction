<?php

namespace Database\Seeders;

use App\Models\Card;
use App\Models\CardTypes;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'role' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Demo User',
            'role' => 'user',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $bankAccountType = CardTypes::factory()->create([
            'title' => 'Bank Account',
            'active' => true,
        ]);

        // Create a card for the admin user with Bank Account type
        Card::create([
            'user_id' => $admin->id,
            'card_type_id' => $bankAccountType->id,
            'card_number' => '1234567890123456',
            'exp_year' => 27,
            'balance' => 10000,
            'cvv' => 123,
            'exp_month' => 12,
            'card_holder' => 'Super Admin',
        ]);
    }
}

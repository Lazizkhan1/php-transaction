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

        User::factory()->create([
            'name' => 'Super Admin',
            'role' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),]);
        User::factory()->create([
            'name' => 'Demo User',
            'role' => 'user',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);
        CardTypes::factory()->create([
            'title' => 'Bank Account',
            'active' => true,
        ]);


    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with baseline institutional configuration.
     * Question bank remains empty by default until entered/approved by HOD (Mandatory Correction 6).
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            ProgramSeeder::class,
            AdmissionSessionSeeder::class,
            SystemSettingSeeder::class,
            UserSeeder::class,
        ]);
    }
}

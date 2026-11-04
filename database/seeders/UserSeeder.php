<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Initial Super Admin Account
        $adminEmail = env('INITIAL_ADMIN_EMAIL', 'admin@bcmt.edu.pk');
        $adminPassword = env('INITIAL_ADMIN_PASSWORD', 'BcmtAdmin@2026!Secure');

        $superAdmin = User::updateOrCreate(['email' => $adminEmail], [
            'name' => 'BCMT System Administrator',
            'password' => Hash::make($adminPassword),
            'cnic' => '1110100000001',
            'phone' => '0928-622699',
            'is_active' => true,
            'must_change_password' => true, // Mandatory password change on first login (Mandatory Correction 8)
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // 2. Head of Department (HOD)
        $hod = User::updateOrCreate(['email' => 'hod@bcmt.edu.pk'], [
            'name' => 'Prof. Dr. Academic HOD',
            'password' => Hash::make('BcmtHod@2026!Secure'),
            'cnic' => '1110100000002',
            'phone' => '0334-0580180',
            'is_active' => true,
            'must_change_password' => true,
            'email_verified_at' => now(),
        ]);
        $hod->assignRole('hod');

        // 3. Admission Officer
        $admissionOfficer = User::updateOrCreate(['email' => 'admission@bcmt.edu.pk'], [
            'name' => 'Admission Processing Officer',
            'password' => Hash::make('BcmtAdmission@2026!Secure'),
            'cnic' => '1110100000003',
            'phone' => '0928-622699',
            'is_active' => true,
            'must_change_password' => true,
            'email_verified_at' => now(),
        ]);
        $admissionOfficer->assignRole('admission_officer');

        // 4. Campus Invigilator
        $invigilator = User::updateOrCreate(['email' => 'invigilator@bcmt.edu.pk'], [
            'name' => 'Campus Exam Invigilator',
            'password' => Hash::make('BcmtInvigilation@2026!Secure'),
            'cnic' => '1110100000004',
            'phone' => '0334-0580180',
            'is_active' => true,
            'must_change_password' => true,
            'email_verified_at' => now(),
        ]);
        $invigilator->assignRole('invigilator');
    }
}

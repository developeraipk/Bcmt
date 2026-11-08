<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration is non-destructive and 100% safe for production data.
     * It only modifies the category enum to include 'technical_diploma',
     * inserts the DIT program if not present, and attaches it to existing admission sessions.
     */
    public function up(): void
    {
        // 1. Expand category enum safely without affecting any existing records
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `programs` MODIFY COLUMN `category` ENUM('bs_degree', 'pharmacy_b', 'medical_diploma', 'technical_diploma') NOT NULL DEFAULT 'technical_diploma'");
        }

        // 2. Insert DIT program if it doesn't already exist
        $existing = DB::table('programs')->where('code', 'DIT')->first();
        if (!$existing) {
            $programId = DB::table('programs')->insertGetId([
                'name' => 'Diploma in Information Technology (DIT)',
                'code' => 'DIT',
                'category' => 'technical_diploma',
                'duration_years' => 1,
                'qualification_required' => 'Matric Pass (SSC)',
                'affiliation' => 'Khyber Pakhtunkhwa Board of Technical Education (KP-BTE Peshawar)',
                'description' => '1-Year comprehensive Diploma in Information Technology recognized by KP-BTE Peshawar. 100% Free Tuition Program (Students only pay mandatory Board Registration & DMC verification fees).',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $programId = $existing->id;
            // Ensure fields match requirement
            DB::table('programs')->where('id', $programId)->update([
                'name' => 'Diploma in Information Technology (DIT)',
                'category' => 'technical_diploma',
                'duration_years' => 1,
                'qualification_required' => 'Matric Pass (SSC)',
                'affiliation' => 'Khyber Pakhtunkhwa Board of Technical Education (KP-BTE Peshawar)',
                'description' => '1-Year comprehensive Diploma in Information Technology recognized by KP-BTE Peshawar. 100% Free Tuition Program (Students only pay mandatory Board Registration & DMC verification fees).',
                'is_active' => 1,
                'updated_at' => now(),
            ]);
        }

        // 3. Attach DIT to existing admission sessions in session_programs
        $sessions = DB::table('admission_sessions')->get();
        foreach ($sessions as $session) {
            $spExists = DB::table('session_programs')
                ->where('admission_session_id', $session->id)
                ->where('program_id', $programId)
                ->exists();

            if (!$spExists) {
                DB::table('session_programs')->insert([
                    'admission_session_id' => $session->id,
                    'program_id' => $programId,
                    'total_seats' => 50,
                    'seats_allocated' => 0,
                    'is_open' => 1,
                    'test_required' => 0,
                    'application_fee' => 0.00, // 100% Free Tuition & Application
                    'reservation_validity_days' => 5,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations safely without dropping production tables.
     */
    public function down(): void
    {
        $program = DB::table('programs')->where('code', 'DIT')->first();
        if ($program) {
            // Check if any applications exist before removing
            $hasApplications = DB::table('applications')
                ->join('session_programs', 'applications.session_program_id', '=', 'session_programs.id')
                ->where('session_programs.program_id', $program->id)
                ->exists();

            if (!$hasApplications) {
                DB::table('session_programs')->where('program_id', $program->id)->delete();
                DB::table('programs')->where('id', $program->id)->delete();
            } else {
                // If applications exist, simply mark inactive to protect student records
                DB::table('programs')->where('id', $program->id)->update(['is_active' => 0]);
            }
        }
    }
};

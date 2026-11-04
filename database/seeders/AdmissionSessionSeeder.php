<?php

namespace Database\Seeders;

use App\Models\AdmissionSession;
use App\Models\Program;
use App\Models\SessionProgram;
use Illuminate\Database\Seeder;

class AdmissionSessionSeeder extends Seeder
{
    public function run(): void
    {
        // Primary Admission Session: 2026-2027
        $session = AdmissionSession::updateOrCreate(['code' => '2026-2027'], [
            'name' => 'Admission Session 2026-2027',
            'start_date' => now()->startOfYear(),
            'closing_date' => now()->endOfYear(),
            'status' => 'open',
            'is_active' => true,
            'admission_instructions' => 'Welcome to Bannu College of Medical Technologies (BCMT). Please complete all 5 steps of the online admission form accurately. Male and female candidates compete for combined merit seats.',
            'settings' => [
                'allow_reupload_on_correction' => true,
                'max_document_size_kb' => 2048,
            ],
        ]);

        // Official Initial Program Quotas (Total: 200 Seats)
        $seatQuotas = [
            'BSECT' => 20,
            'BSMLT' => 30,
            'PCB' => 100,
            'HT' => 20,
            'PATH' => 10,
            'SURG' => 5,
            'ANES' => 5,
            'PHARMA' => 5,
            'RADIO' => 5,
        ];

        foreach ($seatQuotas as $code => $seats) {
            $program = Program::where('code', $code)->first();
            if ($program) {
                SessionProgram::updateOrCreate(
                    [
                        'admission_session_id' => $session->id,
                        'program_id' => $program->id,
                    ],
                    [
                        'total_seats' => $seats,
                        'seats_allocated' => 0,
                        'is_open' => true,
                        'test_required' => true,
                        'application_fee' => 1000.00,
                        'reservation_validity_days' => 5,
                    ]
                );
            }
        }
    }
}

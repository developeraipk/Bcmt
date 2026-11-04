<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\ApplicantProfile;
use App\Models\Program;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use App\Models\User;
use App\Models\ExaminationAccessToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ConsoleCommandsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_expire_reservations_command_releases_lapsed_seats(): void
    {
        $session = AdmissionSession::first();
        $program = Program::where('code', 'BSMLT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)->where('program_id', $program->id)->first();

        $user = User::factory()->create();
        $app = Application::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'user_id' => $user->id,
            'application_number' => 'BCMT-TEST-EXP1',
            'normalized_cnic' => '1110199999991',
            'status' => 'submitted',
            'verification_status' => 'verified',
            'selection_status' => 'seat_offered',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Expired Candidate',
            'father_name' => 'Candidate Father',
            'cnic' => '11101-9999999-1',
            'dob' => '2005-01-01',
            'gender' => 'male',
            'email' => 'expired@example.com',
            'mobile_number' => '03001234567',
            'whatsapp_number' => '03001234567',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu City',
            'current_address' => 'Bannu City',
        ]);

        // Create seat allocation that expired 2 days ago
        $allocation = SeatAllocation::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_id' => $app->id,
            'seat_number' => 1,
            'status' => 'reserved',
            'offer_extended_at' => now()->subDays(7),
            'reservation_expires_at' => now()->subDays(2),
            'allocated_by_user_id' => $user->id,
        ]);

        $this->artisan('bcmt:expire-reservations')
            ->assertSuccessful();

        $allocation->refresh();
        $this->assertEquals('released', $allocation->status);
        $this->assertNotNull($allocation->released_at);

        $app->refresh();
        $this->assertEquals('offer_lapsed', $app->selection_status);
    }

    public function test_clean_expired_tokens_command(): void
    {
        $this->artisan('bcmt:clean-expired-tokens')
            ->assertSuccessful();
    }

    public function test_backup_database_command_with_restore_test(): void
    {
        $this->artisan('bcmt:backup-database', ['--test-restore' => true])
            ->assertSuccessful();
    }
}

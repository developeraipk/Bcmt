<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SeatAllocationDeleteTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_delete_seat_allocation_without_truncation_error(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::first();
        $sp = SessionProgram::first();

        $user = User::create([
            'name' => 'Candidate Test',
            'email' => 'cand_del_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);

        $app = Application::create([
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'APP-DEL-' . uniqid(),
            'current_state' => 'verified',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'exam_attempt_status' => 'completed',
            'selection_status' => 'seat_offered',
            'normalized_cnic' => '11101' . rand(10000000, 99999999),
        ]);

        $allocation = SeatAllocation::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_id' => $app->id,
            'seat_number' => 99,
            'status' => 'released',
            'allocated_by_user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->delete("/admin/seat-allocation/{$allocation->id}");
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseMissing('seat_allocations', ['id' => $allocation->id]);

        $app->refresh();
        $this->assertEquals('unprocessed', $app->selection_status);
    }

    public function test_admin_can_unrelease_seat_allocation_back_to_reserved(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::first();
        $sp = SessionProgram::first();

        $user = User::create([
            'name' => 'Candidate Unrelease Test',
            'email' => 'cand_unrel_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);

        $app = Application::create([
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'APP-UNREL-' . uniqid(),
            'current_state' => 'verified',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'exam_attempt_status' => 'completed',
            'selection_status' => 'offer_lapsed',
            'normalized_cnic' => '11101' . rand(10000000, 99999999),
        ]);

        $allocation = SeatAllocation::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_id' => $app->id,
            'seat_number' => 88,
            'status' => 'released',
            'released_at' => now(),
            'release_reason' => 'Candidate delay',
            'allocated_by_user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post("/admin/seat-allocation/unrelease/{$allocation->id}");
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $allocation->refresh();
        $this->assertEquals('reserved', $allocation->status);
        $this->assertNull($allocation->released_at);
        $this->assertNull($allocation->release_reason);
        $this->assertNotNull($allocation->reservation_expires_at);

        $app->refresh();
        $this->assertEquals('seat_offered', $app->selection_status);
    }
}

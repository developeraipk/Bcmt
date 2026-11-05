<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdmissionSessionManagementTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_access_create_session_page(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $response = $this->actingAs($admin)->get('/admin/sessions/create');
        $response->assertOk();
    }

    public function test_admin_can_create_new_admission_session(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $programs = Program::where('is_active', true)->get();
        $seats = [];
        foreach ($programs as $p) {
            $seats[$p->id] = 25;
        }

        $code = 'TEST-' . uniqid();
        $response = $this->actingAs($admin)->post('/admin/sessions', [
            'name' => 'Session ' . $code,
            'code' => $code,
            'start_date' => now()->toDateString(),
            'closing_date' => now()->addMonths(2)->toDateString(),
            'is_active' => false,
            'admission_instructions' => 'Welcome to BCMT Test Session',
            'program_seats' => $seats,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/admin/sessions');

        $this->assertDatabaseHas('admission_sessions', ['code' => $code]);
    }

    public function test_admin_can_reuse_code_of_deleted_admission_session(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $reusedCode = 'REUSE-' . rand(100, 999);

        // Create initial session
        $session = AdmissionSession::create([
            'name' => 'Original Session ' . $reusedCode,
            'code' => $reusedCode,
            'start_date' => now()->toDateString(),
            'closing_date' => now()->addMonths(2)->toDateString(),
            'status' => 'draft',
            'is_active' => false,
        ]);

        // Delete the session
        $this->actingAs($admin)->delete("/admin/sessions/{$session->id}");
        $this->assertSoftDeleted('admission_sessions', ['id' => $session->id]);

        // Now attempt to create a new session using the exact same code
        $response = $this->actingAs($admin)->post('/admin/sessions', [
            'name' => 'New Recreated Session ' . $reusedCode,
            'code' => $reusedCode,
            'start_date' => now()->toDateString(),
            'closing_date' => now()->addMonths(3)->toDateString(),
            'is_active' => false,
            'admission_instructions' => 'Recreated session instructions',
            'program_seats' => [],
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/admin/sessions');

        // Verify active (non-deleted) record exists with this code
        $this->assertDatabaseHas('admission_sessions', [
            'code' => $reusedCode,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_can_toggle_admission_session_open_and_closed(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::create([
            'name' => 'Toggle Test Session',
            'code' => 'TOGGLE-' . rand(100, 999),
            'start_date' => now()->subDays(2)->toDateString(),
            'closing_date' => now()->addDays(10)->toDateString(),
            'closing_time' => '23:59',
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->assertTrue($session->isOpen());

        // 1. Toggle to Close
        $res = $this->actingAs($admin)->post("/admin/sessions/{$session->id}/toggle-status");
        $res->assertSessionHasNoErrors();
        $session->refresh();
        $this->assertEquals('closed', $session->status);
        $this->assertFalse($session->isOpen());

        // 2. Toggle to Open
        $res2 = $this->actingAs($admin)->post("/admin/sessions/{$session->id}/toggle-status");
        $res2->assertSessionHasNoErrors();
        $session->refresh();
        $this->assertEquals('open', $session->status);
        $this->assertTrue($session->isOpen());
    }

    public function test_admin_can_set_exact_deadline_date_and_time(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::create([
            'name' => 'Deadline Test Session',
            'code' => 'DEADLINE-' . rand(100, 999),
            'start_date' => now()->subDays(2)->toDateString(),
            'closing_date' => now()->addDays(5)->toDateString(),
            'closing_time' => '17:00',
            'status' => 'open',
            'is_active' => true,
        ]);

        $newDate = now()->addDays(14)->toDateString();
        $newTime = '18:30';

        $res = $this->actingAs($admin)->post("/admin/sessions/{$session->id}/deadline", [
            'closing_date' => $newDate,
            'closing_time' => $newTime,
        ]);

        $res->assertSessionHasNoErrors();
        $session->refresh();
        $this->assertEquals($newDate, $session->closing_date->format('Y-m-d'));
        $this->assertEquals($newTime, $session->closing_time);
    }

    public function test_candidate_cannot_apply_when_deadline_date_and_time_has_expired(): void
    {
        // Deactivate other active sessions
        AdmissionSession::where('is_active', true)->update(['is_active' => false]);

        // Create an expired session (closing was 2 hours ago today)
        $expiredSession = AdmissionSession::create([
            'name' => 'Expired Session',
            'code' => 'EXP-' . rand(100, 999),
            'start_date' => now()->subDays(5)->toDateString(),
            'closing_date' => now()->subDay()->toDateString(),
            'closing_time' => '12:00',
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->assertTrue($expiredSession->isExpired());
        $this->assertFalse($expiredSession->isOpen());

        // Candidate visits /apply -> gets redirected or shown Closed view
        $response = $this->get('/apply');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Public/Apply/Closed'));

        // Candidate attempts POST /apply -> validation error
        $postResponse = $this->post('/apply', [
            'full_name' => 'Test Student',
            'email' => 'test@student.com',
        ]);
        $postResponse->assertSessionHasErrors(['session']);
    }

    public function test_candidate_cannot_apply_when_admissions_are_manually_closed(): void
    {
        // Deactivate other active sessions
        AdmissionSession::where('is_active', true)->update(['is_active' => false]);

        // Create a manually closed session (future deadline, but admin closed it)
        $closedSession = AdmissionSession::create([
            'name' => 'Manually Closed Session',
            'code' => 'CLOSED-' . rand(100, 999),
            'start_date' => now()->subDays(2)->toDateString(),
            'closing_date' => now()->addDays(20)->toDateString(),
            'closing_time' => '23:59',
            'status' => 'closed',
            'is_active' => true,
        ]);

        $this->assertFalse($closedSession->isOpen());

        // Visiting /apply shows Closed view
        $response = $this->get('/apply');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Public/Apply/Closed'));
    }
}

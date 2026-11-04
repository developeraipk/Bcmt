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
}

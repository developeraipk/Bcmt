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
}

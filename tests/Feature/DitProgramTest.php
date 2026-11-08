<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\Program;
use App\Models\SessionProgram;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DitProgramTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        AdmissionSession::where('is_active', true)->update([
            'closing_date' => now()->addDays(30)->toDateString(),
            'closing_time' => '23:59',
            'status' => 'open',
        ]);
    }

    public function test_dit_program_exists_with_accurate_specifications()
    {
        $dit = Program::where('code', 'DIT')->first();

        $this->assertNotNull($dit, 'DIT program must exist in database.');
        $this->assertEquals('Diploma in Information Technology (DIT)', $dit->name);
        $this->assertEquals('technical_diploma', $dit->category);
        $this->assertEquals(1, $dit->duration_years);
        $this->assertStringContainsString('Matric', $dit->qualification_required);
        $this->assertStringContainsString('KP-BTE', $dit->affiliation);
        $this->assertTrue($dit->is_active);
    }

    public function test_dit_is_attached_to_active_admission_session()
    {
        $session = AdmissionSession::getActive();
        $this->assertNotNull($session, 'Active admission session must exist.');

        $dit = Program::where('code', 'DIT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $dit->id)
            ->first();

        $this->assertNotNull($sp, 'DIT must be attached to the active session.');
        $this->assertEquals(0.00, (float) $sp->application_fee, 'DIT tuition/application fee must be 0.00 (100% Free).');
        $this->assertTrue((bool) $sp->is_open);
    }

    public function test_public_can_view_dit_program_and_aliases()
    {
        $response = $this->get(route('programs.show', 'DIT'));
        $response->assertStatus(200);

        // Alias support
        $aliasResponse = $this->get(route('programs.show', 'BTE-DIT'));
        $aliasResponse->assertStatus(200);
    }

    public function test_candidate_with_only_matric_can_apply_for_dit()
    {
        Storage::fake('private');

        $session = AdmissionSession::getActive();
        $dit = Program::where('code', 'DIT')->first();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $dit->id)
            ->first();

        $payload = [
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Usman Ali DIT Candidate',
            'father_name' => 'Sher Ali Khan',
            'cnic' => '11101-7788990-3',
            'dob' => '2007-06-20',
            'gender' => 'male',
            'mobile_number' => '03339900112',
            'whatsapp_number' => '03339900112',
            'email' => 'usman.dit.test@bcmt.edu.pk',
            'permanent_address' => 'Bannu City, Khyber Pakhtunkhwa',
            'current_address' => 'Bannu City, Khyber Pakhtunkhwa',
            'domicile_district' => 'Bannu',
            'password' => 'Pass@DIT2026',
            'password_confirmation' => 'Pass@DIT2026',
            // Matric credentials only (No Inter provided)
            'matric_board' => 'BISE Bannu',
            'matric_roll_number' => '654321',
            'matric_year' => 2024,
            'matric_total' => 1100,
            'matric_obtained' => 880,
            'inter_board' => null,
            'inter_roll_number' => null,
            'inter_year' => null,
            'inter_total' => null,
            'inter_obtained' => null,
            'doc_photo' => UploadedFile::fake()->image('photo.jpg', 300, 300),
            'doc_cnic_front' => UploadedFile::fake()->create('cnic_front.jpg', 500, 'image/jpeg'),
            'doc_matric_dmc' => UploadedFile::fake()->create('matric_dmc.pdf', 800, 'application/pdf'),
            'doc_domicile' => UploadedFile::fake()->create('domicile.pdf', 600, 'application/pdf'),
        ];

        $response = $this->post(route('apply.submit'), $payload);
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('applications', [
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'normalized_cnic' => '1110177889903',
        ]);
    }
}

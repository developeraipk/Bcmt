<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\MeritList;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\ApplicationNumberService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionController extends Controller
{
    public function home(): Response
    {
        $activeSession = AdmissionSession::getActive();

        $programs = Program::where('is_active', true)
            ->with(['sessionPrograms' => function ($q) use ($activeSession) {
                if ($activeSession) {
                    $q->where('admission_session_id', $activeSession->id);
                }
            }])
            ->get()
            ->map(fn (Program $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'category' => $p->category,
                'duration_years' => $p->duration_years,
                'qualification_required' => $p->qualification_required,
                'affiliation' => $p->affiliation,
                'description' => $p->description,
                'seats' => $p->sessionPrograms->first()?->total_seats ?? $p->seats ?? 0,
                'is_open' => $p->sessionPrograms->first()?->is_open ?? false,
            ]);

        $settings = [
            'admission_open_status' => (bool) SystemSetting::get('admission_open_status', true),
            'admission_closed_notice' => SystemSetting::get('admission_closed_notice'),
        ];

        $activeSessionData = null;
        if ($activeSession) {
            $activeSessionData = array_merge($activeSession->toArray(), [
                'is_open' => $activeSession->isOpen(),
                'is_expired' => $activeSession->isExpired(),
                'closing_datetime_formatted' => $activeSession->closing_datetime->format('d M, Y \a\t h:i A'),
                'time_remaining' => $activeSession->time_remaining,
            ]);
        }

        return Inertia::render('Public/Home', [
            'activeSession' => $activeSessionData,
            'programs' => $programs,
            'settings' => $settings,
        ]);
    }

    public function programs(): Response
    {
        $activeSession = AdmissionSession::getActive();

        $programs = Program::where('is_active', true)
            ->with(['sessionPrograms' => function ($q) use ($activeSession) {
                if ($activeSession) {
                    $q->where('admission_session_id', $activeSession->id);
                }
            }])
            ->get()
            ->map(fn (Program $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'category' => $p->category,
                'duration_years' => $p->duration_years,
                'qualification_required' => $p->qualification_required,
                'affiliation' => $p->affiliation,
                'description' => $p->description,
                'seats' => $p->sessionPrograms->first()?->total_seats ?? $p->seats ?? 0,
                'is_open' => $p->sessionPrograms->first()?->is_open ?? true,
            ]);

        return Inertia::render('Public/Programs/Index', [
            'programs' => $programs,
        ]);
    }

    public function programDetail(string $code): Response
    {
        $normalizedCode = strtoupper(trim($code));
        $aliasMap = [
            'PHARMB' => 'PCB',
            'PHARM-B' => 'PCB',
            'CATEGORY-B' => 'PCB',
            'CATEGORYB' => 'PCB',
            'DIP-HEALTH' => 'HT',
            'HEALTH' => 'HT',
            'HEALTH-TECH' => 'HT',
            'DIP-PATH' => 'PATH',
            'PATHOLOGY' => 'PATH',
            'PATH-TECH' => 'PATH',
            'DIP-SURG' => 'SURG',
            'SURGICAL' => 'SURG',
            'DIP-ANES' => 'ANES',
            'ANAESTHESIA' => 'ANES',
            'DIP-RADIO' => 'RADIO',
            'RADIOLOGY' => 'RADIO',
            'DIP-PHARM' => 'PHARMA',
        ];
        $actualCode = $aliasMap[$normalizedCode] ?? $normalizedCode;

        $program = Program::where('code', $actualCode)
            ->orWhere('code', $normalizedCode)
            ->orWhere('code', $code)
            ->firstOrFail();

        $activeSession = AdmissionSession::getActive();
        $sessionProgram = $activeSession ? SessionProgram::where('admission_session_id', $activeSession->id)->where('program_id', $program->id)->first() : null;

        return Inertia::render('Public/Programs/Show', [
            'program' => $program,
            'sessionProgram' => $sessionProgram,
        ]);
    }

    public function eligibility(): Response
    {
        return Inertia::render('Public/Eligibility');
    }

    public function admissionProcess(): Response
    {
        return Inertia::render('Public/AdmissionProcess');
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }

    public function showApply(): Response
    {
        $activeSession = AdmissionSession::getActive();
        if (!$activeSession || !$activeSession->isOpen()) {
            $reason = 'The online application portal is currently closed for new submissions.';
            if ($activeSession && $activeSession->isExpired()) {
                $reason = "The official application submission deadline for {$activeSession->name} ended on {$activeSession->closing_datetime->format('d M, Y \a\t h:i A')}. Candidate registrations are no longer accepted.";
            } elseif ($activeSession && $activeSession->status !== 'open') {
                $reason = "Admissions for {$activeSession->name} have been closed by the college administration.";
            }

            return Inertia::render('Public/Apply/Closed', [
                'notice' => $reason,
                'activeSession' => $activeSession ? [
                    'name' => $activeSession->name,
                    'code' => $activeSession->code,
                    'is_expired' => $activeSession->isExpired(),
                    'closing_datetime_formatted' => $activeSession->closing_datetime->format('d M, Y \a\t h:i A'),
                ] : null,
            ]);
        }

        $sessionPrograms = SessionProgram::where('admission_session_id', $activeSession->id)
            ->where('is_open', true)
            ->with('program')
            ->get()
            ->map(fn ($sp) => [
                'id' => $sp->id,
                'program_id' => $sp->program_id,
                'name' => $sp->program->name,
                'code' => $sp->program->code,
                'category' => $sp->program->category,
                'duration_years' => $sp->program->duration_years,
                'qualification_required' => $sp->program->qualification_required,
                'affiliation' => $sp->program->affiliation,
                'total_seats' => $sp->total_seats,
                'application_fee' => (float) $sp->application_fee,
            ]);

        return Inertia::render('Public/Apply/Wizard', [
            'activeSession' => $activeSession,
            'sessionPrograms' => $sessionPrograms,
        ]);
    }

    public function submitApply(Request $request)
    {
        $activeSession = AdmissionSession::getActive();
        if (!$activeSession || !$activeSession->isOpen()) {
            $deadlineInfo = $activeSession ? ' (Deadline: ' . $activeSession->closing_datetime->format('d M, Y \a\t h:i A') . ')' : '';
            throw ValidationException::withMessages([
                'session' => 'Admissions are closed for this session' . $deadlineInfo . '. Online applications cannot be submitted after the deadline.'
            ]);
        }

        // Validate 5-Step Admission Data
        $validated = $request->validate([
            // Step 1: Program
            'session_program_id' => ['required', 'exists:session_programs,id'],
            
            // Step 2: Personal Information
            'full_name' => ['required', 'string', 'max:150'],
            'father_name' => ['required', 'string', 'max:150'],
            'dob' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female'],
            'cnic' => ['required', 'string', 'max:20'],
            'mobile_number' => ['required', 'string', 'max:25'],
            'whatsapp_number' => ['required', 'string', 'max:25'],
            'email' => ['required', 'email', 'max:150'],
            'domicile_district' => ['required', 'string', 'max:100'],
            'permanent_address' => ['required', 'string', 'max:500'],
            'current_address' => ['required', 'string', 'max:500'],
            
            // Account Password for Student Onboarding (Mandatory Correction 8)
            'password' => ['required', 'string', 'min:8', 'confirmed'],

            // Step 3: Academic Information
            'matric_board' => ['required', 'string', 'max:150'],
            'matric_roll_number' => ['required', 'string', 'max:50'],
            'matric_year' => ['required', 'integer', 'between:1990,2030'],
            'matric_total' => ['required', 'numeric', 'min:1'],
            'matric_obtained' => ['required', 'numeric', 'min:0', 'lte:matric_total'],

            'inter_board' => ['nullable', 'string', 'max:150'],
            'inter_roll_number' => ['nullable', 'string', 'max:50'],
            'inter_year' => ['nullable', 'integer', 'between:1990,2030'],
            'inter_total' => ['nullable', 'numeric', 'min:1'],
            'inter_obtained' => ['nullable', 'numeric', 'min:0'],

            // Step 4: Documents (Max 2MB each, valid mimes)
            'doc_photo' => ['required', 'file', 'mimes:jpeg,png,jpg', 'max:2048'],
            'doc_cnic_front' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'],
            'doc_cnic_back' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'],
            'doc_matric_dmc' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'],
            'doc_inter_dmc' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'],
            'doc_domicile' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'],
        ]);

        $sessionProgram = SessionProgram::where('id', $validated['session_program_id'])
            ->where('admission_session_id', $activeSession->id)
            ->with('program')
            ->firstOrFail();

        // Check Minimum Eligibility Requirement
        if ($sessionProgram->program->category === 'bs_degree') {
            if (empty($validated['inter_board']) || empty($validated['inter_obtained']) || empty($validated['inter_total'])) {
                throw ValidationException::withMessages([
                    'inter_total' => 'Intermediate (HSSC) details are mandatory for BS Degree program admissions.',
                ]);
            }
        }

        // Normalize Pakistani CNIC (13 digits)
        $normalizedCnic = preg_replace('/[^0-9]/', '', $validated['cnic']);
        if (strlen($normalizedCnic) !== 13) {
            throw ValidationException::withMessages([
                'cnic' => 'Please enter a valid 13-digit Pakistani CNIC or B-Form number.',
            ]);
        }

        // Identify existing student account if logged in or registered by email/CNIC
        $existingUser = Auth::user() ?: User::where('email', $validated['email'])->orWhere('cnic', $normalizedCnic)->first();

        // Critical Business Rule: One student can submit only ONE application per admission session!
        $existingSessionApp = Application::where('admission_session_id', $activeSession->id)
            ->where(function ($query) use ($normalizedCnic, $existingUser) {
                $query->where('normalized_cnic', $normalizedCnic);
                if ($existingUser) {
                    $query->orWhere('user_id', $existingUser->id);
                }
            })
            ->first();

        if ($existingSessionApp) {
            $field = ($existingSessionApp->normalized_cnic === $normalizedCnic) ? 'cnic' : 'email';
            throw ValidationException::withMessages([
                $field => "An application (#{$existingSessionApp->application_number}) has already been submitted for Session {$activeSession->code} with this " . ($field === 'cnic' ? 'CNIC' : 'email account') . ". Each candidate may submit only ONE application per session. Please sign in to your student dashboard to track your application or print your slip.",
            ]);
        }

        // Prevent linking one student's CNIC with another student's existing email account
        if ($existingUser && $existingUser->cnic && $existingUser->cnic !== $normalizedCnic && !Auth::check()) {
            throw ValidationException::withMessages([
                'email' => "This email address is already registered to a candidate account with a different CNIC ({$existingUser->cnic}). Please log in with your original account or use your own distinct email address.",
            ]);
        }

        // Secondary Identity Fingerprint for Administrative Duplicate-Risk Detection (Mandatory Correction 3)
        $identityHash = hash('sha256', strtolower(trim($validated['full_name'] . $validated['father_name'] . $validated['dob'])));
        $potentialDuplicate = Application::where('admission_session_id', $activeSession->id)
            ->where('identity_hash', $identityHash)
            ->exists();

        try {
            return DB::transaction(function () use ($validated, $sessionProgram, $activeSession, $normalizedCnic, $identityHash, $potentialDuplicate, $request, $existingUser) {
                $year = (int) substr($activeSession->code, 0, 4);

                // 1. Create or Find Student Account
                $user = $existingUser ?: User::where('email', $validated['email'])
                    ->orWhere('cnic', $normalizedCnic)
                    ->first();

                if (!$user) {
                    $user = User::create([
                        'name' => $validated['full_name'],
                        'email' => $validated['email'],
                        'cnic' => $normalizedCnic,
                        'phone' => $validated['mobile_number'],
                        'password' => Hash::make($validated['password']),
                        'is_active' => true,
                        'must_change_password' => false,
                    ]);
                    $user->assignRole('student');
                }

            // 2. Generate Concurrency-Safe Application Number (e.g. BCMT-2026-000001)
            $appNumber = ApplicationNumberService::generate($year);

            // 3. Create Application Record
            $application = Application::create([
                'application_number' => $appNumber,
                'user_id' => $user->id,
                'admission_session_id' => $activeSession->id,
                'session_program_id' => $sessionProgram->id,
                'normalized_cnic' => $normalizedCnic,
                'identity_hash' => $identityHash,
                'potential_duplicate_detected' => $potentialDuplicate,
                'duplicate_risk_notes' => $potentialDuplicate ? 'Identity fingerprint matches another record with differing CNIC digits.' : null,
                'status' => 'submitted',
                'verification_status' => 'pending',
                'exam_eligibility_status' => 'locked',
                'exam_attempt_status' => 'not_started',
                'result_status' => 'pending',
                'merit_status' => 'pending',
                'selection_status' => 'unprocessed',
                'submitted_at' => now(),
            ]);

            // 4. Create Applicant Profile
            $application->applicantProfile()->create([
                'full_name' => $validated['full_name'],
                'father_name' => $validated['father_name'],
                'dob' => $validated['dob'],
                'gender' => $validated['gender'],
                'cnic' => $validated['cnic'],
                'mobile_number' => $validated['mobile_number'],
                'whatsapp_number' => $validated['whatsapp_number'],
                'email' => $validated['email'],
                'domicile_district' => $validated['domicile_district'],
                'permanent_address' => $validated['permanent_address'],
                'current_address' => $validated['current_address'],
            ]);

            // 5. Create Academic Records
            $matricPct = round(((float)$validated['matric_obtained'] / (float)$validated['matric_total']) * 100, 2);
            $application->academicRecords()->create([
                'level' => 'matric',
                'qualification_name' => 'Matriculation (SSC)',
                'board_university' => $validated['matric_board'],
                'roll_number' => $validated['matric_roll_number'],
                'passing_year' => $validated['matric_year'],
                'total_marks' => $validated['matric_total'],
                'obtained_marks' => $validated['matric_obtained'],
                'percentage' => $matricPct,
            ]);

            if (!empty($validated['inter_total']) && !empty($validated['inter_obtained'])) {
                $interPct = round(((float)$validated['inter_obtained'] / (float)$validated['inter_total']) * 100, 2);
                $application->academicRecords()->create([
                    'level' => 'intermediate',
                    'qualification_name' => 'Intermediate (HSSC)',
                    'board_university' => $validated['inter_board'] ?? 'BISE Bannu',
                    'roll_number' => $validated['inter_roll_number'] ?? 'N/A',
                    'passing_year' => $validated['inter_year'] ?? 2024,
                    'total_marks' => $validated['inter_total'],
                    'obtained_marks' => $validated['inter_obtained'],
                    'percentage' => $interPct,
                ]);
            }

            // 6. Securely Store Uploaded Private Documents
            $docTypes = [
                'doc_photo' => 'photo',
                'doc_cnic_front' => 'cnic_front',
                'doc_cnic_back' => 'cnic_back',
                'doc_matric_dmc' => 'matric_dmc',
                'doc_inter_dmc' => 'inter_dmc',
                'doc_domicile' => 'domicile',
            ];

            foreach ($docTypes as $inputKey => $docType) {
                if ($request->hasFile($inputKey)) {
                    $file = $request->file($inputKey);
                    $path = $file->store("private_documents/applications/{$application->id}", 'local');

                    $application->documents()->create([
                        'document_type' => $docType,
                        'file_path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'verification_status' => 'pending',
                    ]);
                }
            }

            // Log submission in history
            $application->statusHistories()->create([
                'user_id' => $user->id,
                'workflow_stage' => 'lifecycle',
                'from_status' => 'none',
                'to_status' => 'submitted',
                'reason' => 'Online application submitted successfully',
            ]);

            // Auto-login the student
            Auth::login($user);

            // Redirect to WhatsApp confirmation page
            return redirect()->route('apply.success', ['app' => $application->application_number]);
        });
    } catch (UniqueConstraintViolationException $e) {
        throw ValidationException::withMessages([
            'cnic' => "An application has already been submitted for this admission session under this account or CNIC. Each applicant may only apply once per session.",
        ]);
    }
}

    public function success(string $app): Response
    {
        $application = Application::where('application_number', $app)
            ->with(['applicantProfile', 'sessionProgram.program', 'admissionSession'])
            ->firstOrFail();

        $supportPhone = SystemSetting::get('whatsapp_support_phone', '923340580180');
        $supportMsg = urlencode("Hello BCMT Admission Support, my application number is {$application->application_number} for {$application->sessionProgram->program->name}.");
        $whatsappSupportLink = "https://wa.me/{$supportPhone}?text={$supportMsg}";

        return Inertia::render('Public/Apply/Success', [
            'application' => [
                'application_number' => $application->application_number,
                'student_name' => $application->applicantProfile->full_name,
                'program_name' => $application->sessionProgram->program->name,
                'session_name' => $application->admissionSession->name,
                'submitted_at' => $application->submitted_at?->format('F d, Y h:i A'),
            ],
            'whatsapp' => [
                'community_enabled' => (bool) SystemSetting::get('whatsapp_community_enabled', true),
                'community_url' => SystemSetting::get('whatsapp_community_url', 'https://chat.whatsapp.com/invite/BCMT2026'),
                'support_enabled' => (bool) SystemSetting::get('whatsapp_support_enabled', true),
                'support_link' => $whatsappSupportLink,
                'support_phone' => $supportPhone,
            ],
        ]);
    }

    public function verifySlip(Request $request): Response
    {
        $roll = $request->query('roll');
        $hash = $request->query('hash');

        $application = Application::where('roll_number', $roll)
            ->with(['applicantProfile', 'sessionProgram.program', 'admissionSession', 'examinationAttendance'])
            ->first();

        $isValid = false;
        if ($application) {
            $expectedHash = substr(sha1($application->id . $application->normalized_cnic . config('app.key')), 0, 16);
            $isValid = hash_equals($expectedHash, (string) $hash);
        }

        return Inertia::render('Public/VerifySlip', [
            'isValid' => $isValid,
            'application' => $isValid ? [
                'roll_number' => $application->roll_number,
                'student_name' => $application->applicantProfile->full_name,
                'father_name' => $application->applicantProfile->father_name,
                'program_name' => $application->sessionProgram->program->name,
                'session_code' => $application->admissionSession->code,
                'eligibility' => $application->exam_eligibility_status,
                'attendance' => $application->examinationAttendance?->attendance_status ?? 'Not Verified',
            ] : null,
        ]);
    }

    public function meritLists(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $sessionId = $request->query('session_id', $activeSession?->id);

        $meritLists = MeritList::where('status', 'published_locked')
            ->when($sessionId, fn ($q) => $q->where('admission_session_id', $sessionId))
            ->with([
                'sessionProgram.program',
                'admissionSession',
                'items' => fn ($q) => $q->orderBy('rank'),
                'items.application.applicantProfile',
            ])
            ->latest('published_at')
            ->get();

        $sessions = AdmissionSession::orderByDesc('id')->get(['id', 'name', 'code']);

        return Inertia::render('Public/MeritLists', [
            'meritLists' => $meritLists,
            'sessions' => $sessions,
            'selectedSessionId' => (int) $sessionId,
        ]);
    }

    public function showMeritList(int $id): Response
    {
        $meritList = MeritList::where('status', 'published_locked')
            ->with([
                'sessionProgram.program',
                'admissionSession',
                'meritFormula.components',
                'items.application.applicantProfile',
                'approvedBy',
            ])->findOrFail($id);

        return Inertia::render('Hod/Merit/Print', [
            'meritList' => $meritList,
        ]);
    }
}

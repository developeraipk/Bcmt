<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicRecord;
use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\ApplicationStatusHistory;
use App\Models\AttemptAnswer;
use App\Models\AuditLog;
use App\Models\ExaminationAccessToken;
use App\Models\ExaminationAttendance;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\MeritListItem;
use App\Models\Program;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use App\Models\User;
use App\Services\ApplicationNumberService;
use App\Services\RollNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only([
            'search', 'session_id', 'program_id', 'gender',
            'verification_status', 'exam_eligibility_status', 'selection_status'
        ]);

        $activeSession = AdmissionSession::getActive();
        if (!isset($filters['session_id']) && $activeSession) {
            $filters['session_id'] = $activeSession->id;
        }

        $applications = Application::filter($filters)
            ->with([
                'applicantProfile',
                'sessionProgram.program',
                'admissionSession',
                'academicRecords',
                'documents',
                'examinationAttendance',
                'seatAllocation',
            ])
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($app) {
                $photo = $app->documents->firstWhere('document_type', 'photo');
                $matric = $app->academicRecords->where('level', 'matric')->first();
                $inter = $app->academicRecords->where('level', 'intermediate')->first();
                return [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'roll_number' => $app->roll_number,
                    'admission_session_id' => $app->admission_session_id,
                    'session_program_id' => $app->session_program_id,
                    'verification_status' => $app->verification_status,
                    'exam_eligibility_status' => $app->exam_eligibility_status,
                    'exam_attempt_status' => $app->exam_attempt_status,
                    'selection_status' => $app->selection_status,
                    'created_at' => $app->created_at?->format('d M, Y') ?? 'N/A',
                    'photo_url' => $photo ? "/documents/{$photo->id}/stream?v=" . ($photo->updated_at?->timestamp ?? time()) : null,
                    'applicant_profile' => $app->applicantProfile,
                    'session_program' => $app->sessionProgram,
                    'admission_session' => $app->admissionSession,
                    'matric' => $matric,
                    'intermediate' => $inter,
                    'seat_status' => $app->seatAllocation?->status,
                    'documents' => $app->documents,
                ];
            });

        $sessions = AdmissionSession::orderByDesc('id')->get(['id', 'name', 'code']);
        $programs = Program::where('is_active', true)->get(['id', 'name', 'code']);
        $sessionPrograms = SessionProgram::with(['program', 'admissionSession'])
            ->where('is_open', true)
            ->get();

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
            'filters' => $filters,
            'sessions' => $sessions,
            'programs' => $programs,
            'sessionPrograms' => $sessionPrograms,
        ]);
    }

    public function show(int $id): Response
    {
        $application = Application::with([
            'applicantProfile',
            'admissionSession',
            'sessionProgram.program',
            'academicRecords',
            'documents',
            'statusHistories.user',
            'examinationAttempt.result',
            'examinationAttendance',
            'seatAllocation',
        ])->findOrFail($id);

        return Inertia::render('Admin/Applications/Show', [
            'application' => $application,
        ]);
    }

    public function verifyDocument(Request $request, int $documentId)
    {
        $request->validate([
            'status' => ['required', 'in:approved,rejected,reupload_required,pending'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $doc = ApplicationDocument::findOrFail($documentId);

        $doc->update([
            'verification_status' => $request->input('status'),
            'rejection_reason' => $request->input('remarks'),
            'verified_by_user_id' => $user->id,
            'verified_at' => now(),
        ]);

        $doc->application?->touch();

        AuditLog::log('document_verified', 'ApplicationDocument', $doc->id, null, [
            'status' => $request->input('status'),
            'remarks' => $request->input('remarks'),
        ]);

        return back()->with('success', "{$doc->getDocumentName()} verification status updated to {$request->input('status')}.");
    }

    public function approveAllDocuments(Request $request, int $id)
    {
        $application = Application::with('documents')->findOrFail($id);
        $user = $request->user();

        $count = 0;
        foreach ($application->documents as $doc) {
            $doc->update([
                'verification_status' => 'approved',
                'rejection_reason' => null,
                'verified_by_user_id' => $user->id,
                'verified_at' => now(),
            ]);
            $count++;
        }

        $application->touch();

        AuditLog::log('all_documents_approved', 'Application', $application->id, null, [
            'approved_count' => $count,
        ]);

        return back()->with('success', "All {$count} uploaded candidate document(s) have been verified and approved successfully.");
    }

    public function updateVerificationStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => ['required', 'in:verified,rejected,correction_required,under_review'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $app = Application::findOrFail($id);

        DB::transaction(function () use ($app, $request, $user) {
            $toStatus = $request->input('status');
            $remarks = $request->input('remarks');

            $app->update([
                'verification_status' => $toStatus,
                'verified_at' => ($toStatus === 'verified') ? now() : null,
                'verified_by_user_id' => ($toStatus === 'verified') ? $user->id : null,
                'internal_remarks' => $remarks,
            ]);

            // If verified, automatically mark test eligible and assign roll number
            if ($toStatus === 'verified') {
                $app->transitionState('eligibility', 'eligible', $user->id, 'Eligible upon document verification');
                RollNumberService::assignRollNumber($app);
            } elseif ($toStatus === 'rejected') {
                $app->transitionState('eligibility', 'not_eligible', $user->id, 'Application rejected');
            }

            $app->statusHistories()->create([
                'user_id' => $user->id,
                'workflow_stage' => 'verification',
                'from_status' => $app->verification_status,
                'to_status' => $toStatus,
                'reason' => $remarks,
            ]);

            AuditLog::log('application_verification_updated', 'Application', $app->id, null, [
                'status' => $toStatus,
                'remarks' => $remarks,
            ]);
        });

        return back()->with('success', "Application #{$app->application_number} verification status updated to {$request->input('status')}.");
    }

    public function printSummary(int $id): Response
    {
        $application = Application::with([
            'applicantProfile',
            'admissionSession',
            'sessionProgram.program',
            'academicRecords',
            'documents',
        ])->findOrFail($id);

        return Inertia::render('Admin/Applications/Print', [
            'application' => $application,
        ]);
    }

    public function exportCsv(Request $request)
    {
        $filters = $request->only([
            'search', 'session_id', 'program_id', 'gender',
            'verification_status', 'exam_eligibility_status', 'selection_status'
        ]);

        $query = Application::filter($filters)
            ->with(['applicantProfile', 'sessionProgram.program', 'admissionSession', 'seatAllocation'])
            ->orderBy('id');

        $applications = $query->get();
        $filename = 'bcmt_applications_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($applications) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'Application Number',
                'Roll Number',
                'Candidate Full Name',
                'Father Name',
                'CNIC / Form-B',
                'Gender',
                'Domicile District',
                'Mobile Number',
                'Applied Program',
                'Session',
                'Scrutiny Status',
                'Exam Eligibility',
                'Admission Seat Status',
                'Submission Date',
            ]);

            foreach ($applications as $app) {
                $profile = $app->applicantProfile;
                $prog = $app->sessionProgram?->program;
                fputcsv($handle, [
                    $app->application_number,
                    $app->roll_number ?? 'N/A',
                    $profile?->full_name ?? 'N/A',
                    $profile?->father_name ?? 'N/A',
                    $profile?->cnic ?? 'N/A',
                    ucfirst($profile?->gender ?? 'N/A'),
                    $profile?->domicile_district ?? 'N/A',
                    $profile?->mobile_number ?? $profile?->whatsapp_number ?? 'N/A',
                    $prog?->name ?? 'N/A',
                    $app->admissionSession?->name ?? 'N/A',
                    strtoupper($app->verification_status),
                    strtoupper($app->exam_eligibility_status),
                    $app->seatAllocation ? strtoupper($app->seatAllocation->status) : 'UNASSIGNED',
                    $app->created_at ? $app->created_at->format('Y-m-d H:i') : 'N/A',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function printRoster(Request $request): Response
    {
        $filters = $request->only([
            'search', 'session_id', 'program_id', 'gender',
            'verification_status', 'exam_eligibility_status', 'selection_status'
        ]);

        $query = Application::filter($filters)
            ->with(['applicantProfile', 'sessionProgram.program', 'admissionSession', 'seatAllocation', 'examinationAttendance'])
            ->orderBy('id');

        $applications = $query->get();

        $session = !empty($filters['session_id'])
            ? AdmissionSession::find($filters['session_id'])
            : AdmissionSession::getActive();

        $program = !empty($filters['program_id'])
            ? Program::find($filters['program_id'])
            : null;

        return Inertia::render('Admin/Applications/PrintRoster', [
            'applications' => $applications,
            'session' => $session,
            'program' => $program,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'admission_session_id' => ['required', 'exists:admission_sessions,id'],
            'session_program_id' => ['required', 'exists:session_programs,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'father_name' => ['required', 'string', 'max:150'],
            'dob' => ['required', 'date'],
            'gender' => ['required', 'in:male,female'],
            'cnic' => ['required', 'string', 'max:25'],
            'mobile_number' => ['required', 'string', 'max:25'],
            'whatsapp_number' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:150'],
            'password' => ['nullable', 'string', 'min:6', 'max:100'],
            'domicile_district' => ['nullable', 'string', 'max:100'],
            'current_address' => ['nullable', 'string', 'max:300'],
            'permanent_address' => ['nullable', 'string', 'max:300'],
            'verification_status' => ['nullable', 'in:pending,verified,under_review,correction_required,rejected'],
            'matric_board' => ['nullable', 'string', 'max:100'],
            'matric_total_marks' => ['nullable', 'numeric', 'min:0'],
            'matric_obtained_marks' => ['nullable', 'numeric', 'min:0'],
            'inter_board' => ['nullable', 'string', 'max:100'],
            'inter_total_marks' => ['nullable', 'numeric', 'min:0'],
            'inter_obtained_marks' => ['nullable', 'numeric', 'min:0'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
            'doc_photo' => ['nullable', 'file', 'image', 'max:5120'],
            'doc_matric_dmc' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'doc_inter_dmc' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'doc_cnic_front' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'doc_domicile' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
        ]);

        $normalizedCnic = preg_replace('/[^0-9]/', '', (string) $request->input('cnic'));
        if (strlen($normalizedCnic) < 10) {
            return back()->with('error', 'CNIC / B-Form must contain valid national identification numbers.');
        }

        $session = AdmissionSession::findOrFail($request->input('admission_session_id'));

        // Check duplicate within the same session
        $existing = Application::where('admission_session_id', $session->id)
            ->where('normalized_cnic', $normalizedCnic)
            ->first();
        if ($existing) {
            return back()->with('error', "An application (#{$existing->application_number}) is already registered for CNIC {$request->input('cnic')} in session {$session->name}.");
        }

        $user = $request->user();

        $newApplication = DB::transaction(function () use ($request, $session, $normalizedCnic, $user, &$createdCredentials) {
            $plainPassword = $request->filled('password')
                ? (string) $request->input('password')
                : ('Bcmt@' . substr($normalizedCnic, -4));

            $email = $request->input('email');
            $candidateUser = null;
            if ($email) {
                $candidateUser = User::where('email', $email)->first();
            }
            if (!$candidateUser) {
                $defaultEmail = $email ?: "student_{$normalizedCnic}@bcmt.edu.pk";
                $candidateUser = User::firstOrCreate(
                    ['email' => $defaultEmail],
                    [
                        'name' => $request->input('full_name'),
                        'password' => Hash::make($plainPassword),
                    ]
                );
                if (!$candidateUser->hasRole('applicant')) {
                    $candidateUser->assignRole('applicant');
                }
            } else {
                if ($request->filled('password')) {
                    $candidateUser->update([
                        'password' => Hash::make($plainPassword),
                    ]);
                }
            }

            $createdCredentials = [
                'email' => $candidateUser->email,
                'password' => $plainPassword,
            ];

            $year = (int) substr($session->code, 0, 4) ?: (int) date('Y');
            $appNumber = ApplicationNumberService::generate($year);
            $vStatus = $request->input('verification_status', 'pending');

            $application = Application::create([
                'application_number' => $appNumber,
                'user_id' => $candidateUser->id,
                'admission_session_id' => $session->id,
                'session_program_id' => $request->input('session_program_id'),
                'normalized_cnic' => $normalizedCnic,
                'status' => 'submitted',
                'verification_status' => $vStatus,
                'submitted_at' => now(),
                'verified_at' => ($vStatus === 'verified') ? now() : null,
                'verified_by_user_id' => ($vStatus === 'verified') ? $user->id : null,
                'exam_eligibility_status' => ($vStatus === 'verified') ? 'eligible' : 'locked',
            ]);

            if ($vStatus === 'verified') {
                RollNumberService::assignRollNumber($application);
            }

            ApplicantProfile::create([
                'application_id' => $application->id,
                'full_name' => $request->input('full_name'),
                'father_name' => $request->input('father_name'),
                'dob' => $request->input('dob'),
                'gender' => $request->input('gender'),
                'cnic' => $request->input('cnic'),
                'mobile_number' => $request->input('mobile_number'),
                'whatsapp_number' => $request->input('whatsapp_number') ?: $request->input('mobile_number'),
                'email' => $candidateUser->email,
                'domicile_district' => $request->input('domicile_district') ?: 'Bannu',
                'current_address' => $request->input('current_address') ?: 'Bannu, KPK',
                'permanent_address' => $request->input('permanent_address') ?: 'Bannu, KPK',
            ]);

            // Matric Record
            if ($request->filled('matric_obtained_marks') && $request->filled('matric_total_marks')) {
                $total = (float) $request->input('matric_total_marks');
                $obt = (float) $request->input('matric_obtained_marks');
                $pct = $total > 0 ? round(($obt / $total) * 100, 2) : 0;
                AcademicRecord::create([
                    'application_id' => $application->id,
                    'level' => 'matric',
                    'qualification_name' => 'Matric Science',
                    'board_university' => $request->input('matric_board') ?: 'BISE Bannu',
                    'roll_number' => 'N/A',
                    'passing_year' => (int) date('Y') - 2,
                    'total_marks' => $total,
                    'obtained_marks' => $obt,
                    'percentage' => $pct,
                ]);
            }

            // Intermediate Record
            if ($request->filled('inter_obtained_marks') && $request->filled('inter_total_marks')) {
                $total = (float) $request->input('inter_total_marks');
                $obt = (float) $request->input('inter_obtained_marks');
                $pct = $total > 0 ? round(($obt / $total) * 100, 2) : 0;
                AcademicRecord::create([
                    'application_id' => $application->id,
                    'level' => 'intermediate',
                    'qualification_name' => 'F.Sc Pre-Medical',
                    'board_university' => $request->input('inter_board') ?: 'BISE Bannu',
                    'roll_number' => 'N/A',
                    'passing_year' => (int) date('Y'),
                    'total_marks' => $total,
                    'obtained_marks' => $obt,
                    'percentage' => $pct,
                ]);
            }

            // Multi-Document uploads matching Public Application Wizard
            $docTypes = [
                'photo' => 'photo',
                'doc_photo' => 'photo',
                'doc_matric_dmc' => 'matric_dmc',
                'doc_inter_dmc' => 'inter_dmc',
                'doc_cnic_front' => 'cnic_front',
                'doc_cnic_back' => 'cnic_back',
                'doc_domicile' => 'domicile',
            ];

            foreach ($docTypes as $inputKey => $docType) {
                if ($request->hasFile($inputKey)) {
                    $file = $request->file($inputKey);
                    $path = $file->store("private_documents/applications/{$application->id}", 'local');
                    ApplicationDocument::create([
                        'application_id' => $application->id,
                        'document_type' => $docType,
                        'file_path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'verification_status' => ($vStatus === 'verified') ? 'approved' : 'pending',
                        'verified_by_user_id' => ($vStatus === 'verified') ? $user->id : null,
                        'verified_at' => ($vStatus === 'verified') ? now() : null,
                    ]);
                }
            }

            AuditLog::log('application_created_manually', 'Application', $application->id, null, [
                'application_number' => $application->application_number,
                'created_by' => $user->name,
            ]);

            return $application;
        });

        $credText = !empty($createdCredentials)
            ? " | Login: {$createdCredentials['email']} / {$createdCredentials['password']}"
            : '';

        return back()->with('success', "Candidate Application #{$newApplication->application_number} added successfully.{$credText}");
    }

    public function update(Request $request, int $id)
    {
        $application = Application::with(['applicantProfile', 'academicRecords', 'documents', 'user'])->findOrFail($id);

        $request->validate([
            'session_program_id' => ['required', 'exists:session_programs,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'father_name' => ['required', 'string', 'max:150'],
            'dob' => ['required', 'date'],
            'gender' => ['required', 'in:male,female'],
            'cnic' => ['required', 'string', 'max:25'],
            'mobile_number' => ['required', 'string', 'max:25'],
            'whatsapp_number' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:150'],
            'password' => ['nullable', 'string', 'min:6', 'max:100'],
            'domicile_district' => ['nullable', 'string', 'max:100'],
            'current_address' => ['nullable', 'string', 'max:300'],
            'permanent_address' => ['nullable', 'string', 'max:300'],
            'verification_status' => ['required', 'in:pending,verified,under_review,correction_required,rejected'],
            'roll_number' => ['nullable', 'string', 'max:50'],
            'matric_board' => ['nullable', 'string', 'max:100'],
            'matric_total_marks' => ['nullable', 'numeric', 'min:0'],
            'matric_obtained_marks' => ['nullable', 'numeric', 'min:0'],
            'inter_board' => ['nullable', 'string', 'max:100'],
            'inter_total_marks' => ['nullable', 'numeric', 'min:0'],
            'inter_obtained_marks' => ['nullable', 'numeric', 'min:0'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
            'doc_photo' => ['nullable', 'file', 'image', 'max:5120'],
            'doc_matric_dmc' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'doc_inter_dmc' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'doc_cnic_front' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
            'doc_domicile' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
        ]);

        $normalizedCnic = preg_replace('/[^0-9]/', '', (string) $request->input('cnic'));
        $user = $request->user();

        DB::transaction(function () use ($request, $application, $normalizedCnic, $user) {
            $vStatus = $request->input('verification_status');
            $prevStatus = $application->verification_status;

            $updateData = [
                'session_program_id' => $request->input('session_program_id'),
                'normalized_cnic' => $normalizedCnic,
                'verification_status' => $vStatus,
            ];

            if ($request->filled('roll_number')) {
                $updateData['roll_number'] = $request->input('roll_number');
            }

            if ($vStatus === 'verified') {
                $updateData['exam_eligibility_status'] = 'eligible';
                if ($prevStatus !== 'verified') {
                    $updateData['verified_at'] = now();
                    $updateData['verified_by_user_id'] = $user->id;
                }
            } elseif ($vStatus === 'rejected') {
                $updateData['exam_eligibility_status'] = 'not_eligible';
            }

            $application->update($updateData);

            if ($vStatus === 'verified' && empty($application->roll_number)) {
                RollNumberService::assignRollNumber($application);
            }

            // Update Profile
            if ($application->applicantProfile) {
                $application->applicantProfile->update([
                    'full_name' => $request->input('full_name'),
                    'father_name' => $request->input('father_name'),
                    'dob' => $request->input('dob'),
                    'gender' => $request->input('gender'),
                    'cnic' => $request->input('cnic'),
                    'mobile_number' => $request->input('mobile_number'),
                    'whatsapp_number' => $request->input('whatsapp_number') ?: $request->input('mobile_number'),
                    'email' => $request->input('email') ?: $application->applicantProfile->email,
                    'domicile_district' => $request->input('domicile_district') ?: $application->applicantProfile->domicile_district,
                    'current_address' => $request->input('current_address') ?: $application->applicantProfile->current_address,
                    'permanent_address' => $request->input('permanent_address') ?: $application->applicantProfile->permanent_address,
                ]);
            }

            // Sync user name
            if ($application->user) {
                $application->user->update(['name' => $request->input('full_name')]);
            }

            // Sync Matric Record
            if ($request->filled('matric_obtained_marks') && $request->filled('matric_total_marks')) {
                $total = (float) $request->input('matric_total_marks');
                $obt = (float) $request->input('matric_obtained_marks');
                $pct = $total > 0 ? round(($obt / $total) * 100, 2) : 0;
                $matric = $application->academicRecords->where('level', 'matric')->first();
                if ($matric) {
                    $matric->update([
                        'board_university' => $request->input('matric_board') ?: $matric->board_university,
                        'total_marks' => $total,
                        'obtained_marks' => $obt,
                        'percentage' => $pct,
                    ]);
                } else {
                    AcademicRecord::create([
                        'application_id' => $application->id,
                        'level' => 'matric',
                        'qualification_name' => 'Matric Science',
                        'board_university' => $request->input('matric_board') ?: 'BISE Bannu',
                        'roll_number' => 'N/A',
                        'passing_year' => (int) date('Y') - 2,
                        'total_marks' => $total,
                        'obtained_marks' => $obt,
                        'percentage' => $pct,
                    ]);
                }
            }

            // Sync Intermediate Record
            if ($request->filled('inter_obtained_marks') && $request->filled('inter_total_marks')) {
                $total = (float) $request->input('inter_total_marks');
                $obt = (float) $request->input('inter_obtained_marks');
                $pct = $total > 0 ? round(($obt / $total) * 100, 2) : 0;
                $inter = $application->academicRecords->where('level', 'intermediate')->first();
                if ($inter) {
                    $inter->update([
                        'board_university' => $request->input('inter_board') ?: $inter->board_university,
                        'total_marks' => $total,
                        'obtained_marks' => $obt,
                        'percentage' => $pct,
                    ]);
                } else {
                    AcademicRecord::create([
                        'application_id' => $application->id,
                        'level' => 'intermediate',
                        'qualification_name' => 'F.Sc Pre-Medical',
                        'board_university' => $request->input('inter_board') ?: 'BISE Bannu',
                        'roll_number' => 'N/A',
                        'passing_year' => (int) date('Y'),
                        'total_marks' => $total,
                        'obtained_marks' => $obt,
                        'percentage' => $pct,
                    ]);
                }
            }

            // Multi-Document uploads matching Public Application Wizard
            $docTypes = [
                'photo' => 'photo',
                'doc_photo' => 'photo',
                'doc_matric_dmc' => 'matric_dmc',
                'doc_inter_dmc' => 'inter_dmc',
                'doc_cnic_front' => 'cnic_front',
                'doc_cnic_back' => 'cnic_back',
                'doc_domicile' => 'domicile',
            ];

            foreach ($docTypes as $inputKey => $docType) {
                if ($request->hasFile($inputKey)) {
                    $file = $request->file($inputKey);
                    $path = $file->store("private_documents/applications/{$application->id}", 'local');
                    $existingDoc = $application->documents->firstWhere('document_type', $docType);
                    if ($existingDoc) {
                        $existingDoc->update([
                            'file_path' => $path,
                            'original_filename' => $file->getClientOriginalName(),
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                            'verification_status' => ($vStatus === 'verified') ? 'approved' : 'pending',
                        ]);
                    } else {
                        ApplicationDocument::create([
                            'application_id' => $application->id,
                            'document_type' => $docType,
                            'file_path' => $path,
                            'original_filename' => $file->getClientOriginalName(),
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                            'verification_status' => ($vStatus === 'verified') ? 'approved' : 'pending',
                        ]);
                    }
                }
            }

            // Update candidate account login password if provided
            if ($request->filled('password') && $application->user) {
                $application->user->update([
                    'password' => Hash::make($request->input('password')),
                ]);
            }

            AuditLog::log('application_updated_manually', 'Application', $application->id, null, [
                'updated_by' => $user->name,
                'application_number' => $application->application_number,
            ]);
        });

        return back()->with('success', "Application #{$application->application_number} updated successfully across all portals.");
    }

    public function destroy(int $id)
    {
        $application = Application::with([
            'examinationAttempt.answers',
            'examinationAttempt.result',
            'documents',
            'academicRecords',
            'statusHistories',
            'examinationAttendance',
            'seatAllocation',
            'meritListItem',
            'applicantProfile',
            'user',
        ])->findOrFail($id);

        $appNumber = $application->application_number;
        $candidateName = $application->applicantProfile?->full_name ?? 'Candidate';

        DB::transaction(function () use ($application, $id, $appNumber, $candidateName) {
            // 1. Delete Seat Allocations
            SeatAllocation::where('application_id', $id)->delete();

            // 2. Delete Merit List Items
            MeritListItem::where('application_id', $id)->delete();

            // 3. Delete Exam Access Tokens
            ExaminationAccessToken::where('application_id', $id)->delete();

            // 4. Delete Examination Results
            ExaminationResult::where('application_id', $id)->delete();

            // 5. Delete Examination Attempt and Answers
            if ($application->examinationAttempt) {
                AttemptAnswer::where('examination_attempt_id', $application->examinationAttempt->id)->delete();
                $application->examinationAttempt->delete();
            }

            // 6. Delete Examination Attendance
            ExaminationAttendance::where('application_id', $id)->delete();

            // 7. Delete Uploaded Documents from Disk & DB
            foreach ($application->documents as $doc) {
                if ($doc->file_path && Storage::disk('local')->exists($doc->file_path)) {
                    Storage::disk('local')->delete($doc->file_path);
                }
                $doc->delete();
            }

            // 8. Delete Academic Records
            AcademicRecord::where('application_id', $id)->delete();

            // 9. Delete Status Histories
            ApplicationStatusHistory::where('application_id', $id)->delete();

            // 10. Delete Applicant Profile
            ApplicantProfile::where('application_id', $id)->delete();

            // 11. Delete the Application (force delete)
            $userId = $application->user_id;
            $application->forceDelete();

            // 12. If student user has no other applications, delete applicant user
            if ($userId) {
                $otherApps = Application::where('user_id', $userId)->exists();
                $studentUser = User::find($userId);
                if (!$otherApps && $studentUser && $studentUser->hasRole('applicant')) {
                    $studentUser->delete();
                }
            }

            AuditLog::log('application_permanently_deleted', 'Application', $id, null, [
                'application_number' => $appNumber,
                'candidate_name' => $candidateName,
            ]);
        });

        return back()->with('success', "Application #{$appNumber} and all its test, results, attendance, and merit data permanently deleted.");
    }
}

<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\Examination;
use App\Models\SystemSetting;
use App\Services\RollNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $application = Application::where('user_id', $user->id)
            ->with([
                'applicantProfile',
                'admissionSession',
                'sessionProgram.program',
                'academicRecords',
                'documents',
                'statusHistories' => fn ($q) => $q->latest()->take(10),
                'examinationAttempt.result',
                'examinationAttendance',
                'meritListItem.meritList',
                'seatAllocation',
            ])
            ->latest()
            ->first();

        $assignedExam = null;
        if ($application) {
            $assignedExam = Examination::where('session_program_id', $application->session_program_id)
                ->where('admission_session_id', $application->admission_session_id)
                ->latest()
                ->first();
        }

        // WhatsApp support dynamic link
        $supportPhone = SystemSetting::get('whatsapp_support_phone', '923340580180');
        $supportMsg = urlencode("Hello BCMT Admission Support, my name is {$user->name} (Application: " . ($application?->application_number ?? 'N/A') . ").");
        $whatsappSupportLink = "https://wa.me/{$supportPhone}?text={$supportMsg}";

        return Inertia::render('Student/Dashboard', [
            'application' => $application,
            'assignedExam' => $assignedExam ? [
                'id' => $assignedExam->id,
                'title' => $assignedExam->title,
                'duration_minutes' => $assignedExam->duration_minutes,
                'total_questions' => $assignedExam->total_questions,
                'total_marks' => $assignedExam->total_marks,
                'passing_percentage' => (float) ($assignedExam->passing_percentage ?? 50.0),
                'passing_marks' => (float) ($assignedExam->passing_marks ?? ($assignedExam->total_marks * ($assignedExam->passing_percentage ?? 50.0) / 100)),
                'status' => $assignedExam->status,
                'requires_attendance' => $assignedExam->requires_attendance,
            ] : null,
            'whatsapp' => [
                'support_link' => $whatsappSupportLink,
                'community_url' => SystemSetting::get('whatsapp_community_url', 'https://chat.whatsapp.com/invite/BCMT2026'),
            ],
        ]);
    }

    public function rollNumberSlip(Request $request): Response
    {
        $user = $request->user();
        $application = Application::where('user_id', $user->id)
            ->with([
                'applicantProfile',
                'admissionSession',
                'sessionProgram.program',
                'examinationAttendance.examination',
                'documents',
            ])
            ->latest()
            ->firstOrFail();

        $photoDoc = $application->documents->where('document_type', 'photo')->first();
        $photoUrl = $photoDoc ? route('documents.stream', $photoDoc->id) : null;

        $isEligible = ($application->exam_eligibility_status === 'eligible');

        if (!$isEligible) {
            return Inertia::render('Student/RollNumberSlip', [
                'application' => $application,
                'isEligible' => false,
                'photoUrl' => $photoUrl,
                'qrPayload' => '',
                'instructions' => SystemSetting::get('exam_instructions'),
            ]);
        }

        // Ensure roll number is assigned
        if (!$application->roll_number) {
            RollNumberService::assignRollNumber($application);
            $application->refresh();
        }

        $qrPayload = RollNumberService::getVerificationQrPayload($application);

        $attendance = $application->examinationAttendance;
        $assignedExam = $attendance?->examination;

        return Inertia::render('Student/RollNumberSlip', [
            'application' => $application,
            'isEligible' => true,
            'qrPayload' => $qrPayload,
            'photoUrl' => $photoUrl,
            'attendance' => $attendance,
            'assignedExam' => $assignedExam,
            'instructions' => SystemSetting::get('exam_instructions'),
        ]);
    }

    public function reuploadDocument(Request $request, int $documentId)
    {
        $request->validate([
            'document' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:2048'],
        ]);

        $user = $request->user();
        $document = ApplicationDocument::where('id', $documentId)
            ->whereHas('application', fn ($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $file = $request->file('document');
        $path = $file->store("private_documents/applications/{$document->application_id}", 'local');

        $document->update([
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'verification_status' => 'pending',
            'rejection_reason' => null,
        ]);

        $document->application->transitionState('verification', 'under_review', $user->id, "Student re-uploaded {$document->getDocumentName()}");

        return back()->with('success', "{$document->getDocumentName()} was re-uploaded successfully and is queued for verification.");
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $application = Application::where('user_id', $user->id)
            ->with('applicantProfile')
            ->latest()
            ->firstOrFail();

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'father_name' => ['required', 'string', 'max:150'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'dob' => ['nullable', 'date'],
            'gender' => ['required', 'in:male,female,other'],
            'domicile_district' => ['nullable', 'string', 'max:100'],
            'current_address' => ['required', 'string', 'max:255'],
            'permanent_address' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'file', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        $profile = $application->applicantProfile;
        if ($profile) {
            $profile->update([
                'full_name' => $validated['full_name'],
                'father_name' => $validated['father_name'],
                'mobile_number' => $validated['mobile_number'],
                'dob' => $validated['dob'] ?? $profile->dob,
                'gender' => $validated['gender'],
                'domicile_district' => $validated['domicile_district'] ?? $profile->domicile_district,
                'current_address' => $validated['current_address'],
                'permanent_address' => $validated['permanent_address'] ?? $profile->permanent_address,
            ]);
        }

        // Update user record
        $user->update([
            'name' => $validated['full_name'],
            'phone' => $validated['mobile_number'],
        ]);

        // Upload and sync profile photo if provided
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $path = $file->store("private_documents/applications/{$application->id}", 'local');

            $photoDoc = ApplicationDocument::where('application_id', $application->id)
                ->where('document_type', 'photo')
                ->first();

            if ($photoDoc) {
                $photoDoc->update([
                    'file_path' => $path,
                    'original_filename' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            } else {
                ApplicationDocument::create([
                    'application_id' => $application->id,
                    'document_type' => 'photo',
                    'file_path' => $path,
                    'original_filename' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'verification_status' => 'pending',
                ]);
            }
        }

        \App\Models\AuditLog::log('student_profile_updated', 'ApplicantProfile', $profile?->id);

        return back()->with('success', 'Profile information and photo updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        \App\Models\AuditLog::log('student_password_updated', 'User', $user->id);

        return back()->with('success', 'Your password has been updated securely.');
    }
}

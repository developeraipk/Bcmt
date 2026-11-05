<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentStreamController;
use App\Http\Controllers\Public\AdmissionController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SessionController as AdminSessionController;
use App\Http\Controllers\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Admin\RollNumberController as AdminRollNumberController;
use App\Http\Controllers\Admin\SeatAllocationController as AdminSeatAllocationController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Hod\DashboardController as HodDashboardController;
use App\Http\Controllers\Hod\ExamController as HodExamController;
use App\Http\Controllers\Hod\QuestionBankController as HodQuestionBankController;
use App\Http\Controllers\Hod\MeritController as HodMeritController;
use App\Http\Controllers\Invigilator\AttendanceController as InvigilatorAttendanceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Admission Portal Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [AdmissionController::class, 'home'])->name('home');
Route::get('/programs', [AdmissionController::class, 'programs'])->name('programs.index');
Route::get('/programs/{code}', [AdmissionController::class, 'programDetail'])->name('programs.show');
Route::get('/eligibility', [AdmissionController::class, 'eligibility'])->name('eligibility');
Route::get('/admission-process', [AdmissionController::class, 'admissionProcess'])->name('admission.process');
Route::get('/contact', [AdmissionController::class, 'contact'])->name('contact');

Route::get('/apply', [AdmissionController::class, 'showApply'])->name('apply.index');
Route::post('/apply', [AdmissionController::class, 'submitApply'])->name('apply.submit');
Route::get('/apply/success/{app}', [AdmissionController::class, 'success'])->name('apply.success');

Route::get('/verify-slip', [AdmissionController::class, 'verifySlip'])->name('public.verify.slip');
Route::get('/merit-lists', [AdmissionController::class, 'meritLists'])->name('public.merit-lists');
Route::get('/merit-lists/{id}', [AdmissionController::class, 'showMeritList'])->name('public.merit-lists.show');
Route::redirect('/merit-list', '/merit-lists');
Route::redirect('/meritlist', '/merit-lists');
Route::redirect('/merits', '/merit-lists');
Route::redirect('/merit', '/merit-lists');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'resetPassword'])->name('password.reset');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/change-password', [AuthController::class, 'showChangePassword'])->name('auth.password.change');
    Route::post('/change-password', [AuthController::class, 'updatePassword'])->name('auth.password.update');
    
    // Secure Private Document Streaming
    Route::get('/documents/{id}/stream', [DocumentStreamController::class, 'stream'])->name('documents.stream');
});

/*
|--------------------------------------------------------------------------
| Student Portal Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:student,super_admin'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    Route::post('/profile', [StudentDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::post('/password/update', [StudentDashboardController::class, 'updatePassword'])->name('password.update');
    Route::get('/roll-number-slip', [StudentDashboardController::class, 'rollNumberSlip'])->name('roll.slip');
    Route::post('/documents/{id}/reupload', [StudentDashboardController::class, 'reuploadDocument'])->name('document.reupload');
    
    // Two-Phase Online Examination
    Route::get('/exam/gate', [StudentExamController::class, 'showGate'])->name('exam.gate');
    Route::post('/exam/verify-pin', [StudentExamController::class, 'verifyPin'])->name('exam.verify-pin');
    Route::get('/exam/waiting', [StudentExamController::class, 'waitingRoom'])->name('exam.waiting');
    Route::post('/exam/start', [StudentExamController::class, 'startAttempt'])->name('exam.start');
    Route::get('/exam/active', [StudentExamController::class, 'activeTest'])->name('exam.active');
    Route::post('/exam/save-answer', [StudentExamController::class, 'saveAnswer'])->name('exam.save-answer');
    Route::post('/exam/submit', [StudentExamController::class, 'submitTest'])->name('exam.submit');
    Route::get('/result', [StudentExamController::class, 'showResult'])->name('result.show');
});

/*
|--------------------------------------------------------------------------
| Administrative Portal Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:super_admin,management,admission_officer,document_verifier,hod'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Session Management
    Route::get('/sessions', [AdminSessionController::class, 'index'])->name('sessions.index');
    Route::get('/sessions/create', [AdminSessionController::class, 'create'])->name('sessions.create');
    Route::post('/sessions', [AdminSessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{id}/edit', [AdminSessionController::class, 'edit'])->name('sessions.edit');
    Route::put('/sessions/{id}', [AdminSessionController::class, 'update'])->name('sessions.update');
    Route::post('/sessions/{id}/toggle-status', [AdminSessionController::class, 'toggleStatus'])->name('sessions.toggle-status');
    Route::post('/sessions/{id}/deadline', [AdminSessionController::class, 'setDeadline'])->name('sessions.deadline');
    Route::delete('/sessions/{id}', [AdminSessionController::class, 'destroy'])->name('sessions.destroy');

    // Applications & Verification
    Route::get('/applications', [AdminApplicationController::class, 'index'])->name('applications.index');
    Route::post('/applications', [AdminApplicationController::class, 'store'])->name('applications.store');
    Route::get('/applications/export', [AdminApplicationController::class, 'exportCsv'])->name('applications.export');
    Route::get('/applications/print-roster', [AdminApplicationController::class, 'printRoster'])->name('applications.print-roster');
    Route::get('/applications/{id}', [AdminApplicationController::class, 'show'])->name('applications.show');
    Route::put('/applications/{id}', [AdminApplicationController::class, 'update'])->name('applications.update');
    Route::post('/applications/{id}/update', [AdminApplicationController::class, 'update'])->name('applications.post-update');
    Route::delete('/applications/{id}', [AdminApplicationController::class, 'destroy'])->name('applications.destroy');
    Route::get('/applications/{id}/print', [AdminApplicationController::class, 'printSummary'])->name('applications.print');
    Route::post('/applications/{id}/verify', [AdminApplicationController::class, 'updateVerificationStatus'])->name('applications.verify');
    Route::post('/applications/{id}/approve-all-documents', [AdminApplicationController::class, 'approveAllDocuments'])->name('applications.approve-all-documents');
    Route::post('/applications/bulk-approve-and-eligible', [AdminApplicationController::class, 'bulkApproveAndMakeEligible'])->name('applications.bulk-approve-and-eligible');
    Route::post('/documents/{id}/verify', [AdminApplicationController::class, 'verifyDocument'])->name('documents.verify');

    // Roll Number & Examination Seating Management
    Route::get('/roll-numbers', [AdminRollNumberController::class, 'index'])->name('roll-numbers.index');
    Route::get('/roll-numbers/{id}/slip', [AdminRollNumberController::class, 'viewSlip'])->name('roll-numbers.slip');
    Route::post('/roll-numbers/assign/{id}', [AdminRollNumberController::class, 'assignSingle'])->name('roll-numbers.assign-single');
    Route::post('/roll-numbers/assign-bulk', [AdminRollNumberController::class, 'assignBulk'])->name('roll-numbers.assign-bulk');
    Route::post('/roll-numbers/assign-seating', [AdminRollNumberController::class, 'assignSeating'])->name('roll-numbers.assign-seating');
    Route::post('/roll-numbers/assign-schedule', [AdminRollNumberController::class, 'assignSchedule'])->name('roll-numbers.assign-schedule');
    Route::post('/roll-numbers/unassign-schedule/{id}', [AdminRollNumberController::class, 'unassignSchedule'])->name('roll-numbers.unassign-schedule');

    // Seat Allocation State Machine
    Route::get('/seat-allocation', [AdminSeatAllocationController::class, 'index'])->name('seat-allocation.index');
    Route::post('/seat-allocation/reserve-candidate', [AdminSeatAllocationController::class, 'reserveCandidate'])->name('seat-allocation.reserve-candidate');
    Route::post('/seat-allocation/reserve/{id}', [AdminSeatAllocationController::class, 'reserve'])->name('seat-allocation.reserve');
    Route::post('/seat-allocation/confirm/{id}', [AdminSeatAllocationController::class, 'confirm'])->name('seat-allocation.confirm');
    Route::post('/seat-allocation/release/{id}', [AdminSeatAllocationController::class, 'release'])->name('seat-allocation.release');
    Route::post('/seat-allocation/unrelease/{id}', [AdminSeatAllocationController::class, 'unrelease'])->name('seat-allocation.unrelease');
    Route::delete('/seat-allocation/{id}', [AdminSeatAllocationController::class, 'destroy'])->name('seat-allocation.destroy');

    // Entrance Test Results Access for Super Admin
    Route::get('/results', [\App\Http\Controllers\Hod\ResultController::class, 'index'])->name('results.index');
    Route::get('/results/export', [\App\Http\Controllers\Hod\ResultController::class, 'export'])->name('results.export');
    Route::get('/results/print', [\App\Http\Controllers\Hod\ResultController::class, 'printGazette'])->name('results.print');

    // Settings & Logs
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    Route::post('/password/update-own', [AdminSettingsController::class, 'updateOwnPassword'])->name('password.update-own');
    Route::post('/users/{id}/password', [AdminSettingsController::class, 'updateUserPassword'])->name('users.password.update');
    Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
    Route::delete('/audit-logs/clear', [AdminAuditLogController::class, 'clearAll'])->name('audit-logs.clear');
    Route::delete('/audit-logs/{id}', [AdminAuditLogController::class, 'destroy'])->name('audit-logs.destroy');
    Route::post('/audit-logs/{id}/revoke-actor', [AdminAuditLogController::class, 'revokeActor'])->name('audit-logs.revoke-actor');
});

/*
|--------------------------------------------------------------------------
| HOD & Examination Management Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:super_admin,management,hod,exam_manager'])->prefix('hod')->name('hod.')->group(function () {
    Route::get('/dashboard', [HodDashboardController::class, 'index'])->name('dashboard');
    
    // Examination Setup & PIN Rotation
    Route::get('/exams', [HodExamController::class, 'index'])->name('exams.index');
    Route::post('/exams', [HodExamController::class, 'store'])->name('exams.store');
    Route::put('/exams/{id}', [HodExamController::class, 'update'])->name('exams.update');
    Route::delete('/exams/{id}', [HodExamController::class, 'destroy'])->name('exams.destroy');
    Route::post('/exams/{id}/pin', [HodExamController::class, 'generatePin'])->name('exams.pin');
    Route::post('/exams/{id}/status', [HodExamController::class, 'toggleStatus'])->name('exams.status');

    // Per-Test Questions Manager
    Route::get('/exams/{id}/questions', [HodExamController::class, 'questions'])->name('exams.questions');
    Route::post('/exams/{id}/questions', [HodExamController::class, 'storeQuestion'])->name('exams.questions.store');
    Route::put('/exams/{id}/questions/{questionId}', [HodExamController::class, 'updateQuestion'])->name('exams.questions.update');
    Route::delete('/exams/{id}/questions/{questionId}', [HodExamController::class, 'deleteQuestion'])->name('exams.questions.destroy');

    // Question Bank
    Route::get('/question-bank', [HodQuestionBankController::class, 'index'])->name('question-bank.index');
    Route::post('/question-bank', [HodQuestionBankController::class, 'store'])->name('question-bank.store');

    // Test Results Management & Administrative Actions
    Route::get('/results', [\App\Http\Controllers\Hod\ResultController::class, 'index'])->name('results.index');
    Route::get('/results/export', [\App\Http\Controllers\Hod\ResultController::class, 'export'])->name('results.export');
    Route::get('/results/print', [\App\Http\Controllers\Hod\ResultController::class, 'printGazette'])->name('results.print');
    Route::post('/results/{id}/adjust', [\App\Http\Controllers\Hod\ResultController::class, 'adjustScore'])->name('results.adjust');
    Route::post('/results/{id}/reset', [\App\Http\Controllers\Hod\ResultController::class, 'resetAttempt'])->name('results.reset');
    Route::post('/results/{id}/void', [\App\Http\Controllers\Hod\ResultController::class, 'voidAttempt'])->name('results.void');
    Route::delete('/results/{id}', [\App\Http\Controllers\Hod\ResultController::class, 'destroy'])->name('results.destroy');

    // Dynamic Merit Engine
    Route::get('/merit', [HodMeritController::class, 'index'])->name('merit.index');
    Route::post('/merit/formula', [HodMeritController::class, 'storeFormula'])->name('merit.formula');
    Route::post('/merit/formula/reset', [HodMeritController::class, 'resetFormula'])->name('merit.formula.reset');
    Route::post('/merit/compile', [HodMeritController::class, 'compile'])->name('merit.compile');
    Route::post('/merit/{id}/publish', [HodMeritController::class, 'publish'])->name('merit.publish');
    Route::get('/merit/{id}/print', [HodMeritController::class, 'printList'])->name('merit.print');
    Route::delete('/merit/{id}', [HodMeritController::class, 'destroy'])->name('merit.destroy');
});

/*
|--------------------------------------------------------------------------
| Campus Invigilator Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:super_admin,management,hod,invigilator'])->prefix('invigilator')->name('invigilator.')->group(function () {
    Route::get('/dashboard', [InvigilatorAttendanceController::class, 'index'])->name('dashboard');
    Route::post('/attendance/mark', [InvigilatorAttendanceController::class, 'markAttendance'])->name('attendance.mark');
    Route::post('/attendance/quick-mark', [InvigilatorAttendanceController::class, 'quickMark'])->name('attendance.quick-mark');
    Route::post('/attendance/mark-all-present', [InvigilatorAttendanceController::class, 'markAllPresent'])->name('attendance.mark-all-present');
});

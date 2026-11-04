<?php

namespace App\Http\Controllers\Hod;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\MeritList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $sessionId = $request->query('session_id', $activeSession?->id);

        $eligibleCandidates = Application::where('exam_eligibility_status', 'eligible')
            ->when($sessionId, fn ($q) => $q->where('admission_session_id', $sessionId))
            ->count();
        $activeExams = Examination::where('status', 'active')->count();
        $pendingResults = ExaminationAttempt::where('status', 'submitted')
            ->whereDoesntHave('result', fn ($q) => $q->where('status', 'published'))
            ->count();
        $publishedMeritLists = MeritList::where('status', 'published_locked')->count();

        $examinations = Examination::with(['sessionProgram.program', 'activePin'])
            ->when($sessionId, fn ($q) => $q->where('admission_session_id', $sessionId))
            ->get();

        return Inertia::render('Hod/Dashboard', [
            'stats' => [
                'eligible_candidates' => $eligibleCandidates,
                'active_exams' => $activeExams,
                'pending_results' => $pendingResults,
                'published_merit_lists' => $publishedMeritLists,
            ],
            'examinations' => $examinations,
        ]);
    }
}

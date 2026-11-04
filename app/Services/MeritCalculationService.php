<?php

namespace App\Services;

use App\Models\Application;
use App\Models\MeritFormula;
use App\Models\MeritList;
use App\Models\MeritListItem;
use App\Models\SessionProgram;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MeritCalculationService
{
    /**
     * Compile dynamic merit list based on configured formula components
     */
    public static function compile(SessionProgram $sessionProgram, MeritFormula $formula, ?string $title = null): MeritList
    {
        if (!$formula->validateTotalWeight()) {
            throw ValidationException::withMessages(['formula' => 'Formula weights do not sum up to exactly 100.00%.']);
        }

        return DB::transaction(function () use ($sessionProgram, $formula, $title) {
            $session = $sessionProgram->admissionSession;
            $program = $sessionProgram->program;

            $version = MeritList::where('session_program_id', $sessionProgram->id)->max('version') + 1;

            $meritList = MeritList::create([
                'admission_session_id' => $session->id,
                'session_program_id' => $sessionProgram->id,
                'merit_formula_id' => $formula->id,
                'title' => $title ?? "{$program->name} Merit List ({$session->code}) - Version {$version}",
                'version' => $version,
                'status' => 'draft',
            ]);

            // Retrieve all verified applications with completed exam results for this program & session
            $applications = Application::where('session_program_id', $sessionProgram->id)
                ->where('admission_session_id', $session->id)
                ->where('verification_status', 'verified')
                ->with(['applicantProfile', 'academicRecords', 'examinationAttempt.result'])
                ->get();

            $components = $formula->components;
            $testWeight = $components->where('component_type', 'admission_test')->sum('weight_percentage');
            $requiresTest = $testWeight > 0;
            $candidates = [];

            foreach ($applications as $app) {
                $matric = $app->academicRecords->where('level', 'matric')->first();
                $inter = $app->academicRecords->where('level', 'intermediate')->first();
                $result = $app->examinationAttempt?->result;

                $matricPct = $matric ? (float) $matric->percentage : 0.00;
                $interPct = $inter ? (float) $inter->percentage : 0.00;
                $testPct = $result ? (float) $result->percentage : 0.00;
                $testMarks = $result ? (float) $result->obtained_marks : 0.00;

                $aggregate = 0.00;

                foreach ($components as $comp) {
                    $weight = (float) $comp->weight_percentage / 100.00;
                    $score = match ($comp->component_type) {
                        'matric' => $matricPct,
                        'intermediate' => $interPct,
                        'admission_test' => $testPct,
                        default => 0.00,
                    };
                    $aggregate += ($score * $weight);
                }

                // If candidate has 0% aggregate (e.g. test was reset/deleted or no credentials) or is disqualified, exclude from merit ranking
                if ($aggregate <= 0.00 || ($result && $result->status === 'disqualified')) {
                    continue;
                }

                $dob = $app->applicantProfile?->dob ? $app->applicantProfile->dob->timestamp : 0;

                $candidates[] = [
                    'application' => $app,
                    'matric_percentage' => $matricPct,
                    'inter_percentage' => $interPct,
                    'test_percentage' => $testPct,
                    'test_marks' => $testMarks,
                    'aggregate_percentage' => round($aggregate, 2),
                    'dob_timestamp' => $dob,
                ];
            }

            // Combined Ranking: Male & Female candidates compete together
            // Sort by: 1. Aggregate Descending -> 2. Test Marks Descending -> 3. Inter Pct Descending -> 4. Matric Pct Descending -> 5. Older DOB
            usort($candidates, function ($a, $b) {
                if ($b['aggregate_percentage'] != $a['aggregate_percentage']) {
                    return $b['aggregate_percentage'] <=> $a['aggregate_percentage'];
                }
                if ($b['test_marks'] != $a['test_marks']) {
                    return $b['test_marks'] <=> $a['test_marks'];
                }
                if ($b['inter_percentage'] != $a['inter_percentage']) {
                    return $b['inter_percentage'] <=> $a['inter_percentage'];
                }
                if ($b['matric_percentage'] != $a['matric_percentage']) {
                    return $b['matric_percentage'] <=> $a['matric_percentage'];
                }
                return $a['dob_timestamp'] <=> $b['dob_timestamp']; // Seniority tie-breaker
            });

            $rank = 1;
            $totalSeats = $sessionProgram->total_seats;

            foreach ($candidates as $cand) {
                $status = ($rank <= $totalSeats) ? 'selected' : 'waiting_list';

                MeritListItem::create([
                    'merit_list_id' => $meritList->id,
                    'application_id' => $cand['application']->id,
                    'rank' => $rank++,
                    'matric_percentage' => $cand['matric_percentage'],
                    'inter_percentage' => $cand['inter_percentage'],
                    'test_percentage' => $cand['test_percentage'],
                    'aggregate_percentage' => $cand['aggregate_percentage'],
                    'status' => $status,
                ]);

                // Update application merit status
                $cand['application']->transitionState('merit', 'compiled');
                $cand['application']->transitionState('selection', $status);
            }

            return $meritList;
        });
    }

    /**
     * Approve and Publish Merit List with Cryptographic Integrity Hash (Mandatory Correction 6)
     */
    public static function publish(MeritList $meritList, int $userId): void
    {
        DB::transaction(function () use ($meritList, $userId) {
            $itemsData = $meritList->items->map(fn ($item) => "{$item->rank}:{$item->application_id}:{$item->aggregate_percentage}")->join('|');
            $integrityHash = hash('sha256', "{$meritList->id}:{$meritList->merit_formula_id}:{$itemsData}");

            $meritList->update([
                'status' => 'published_locked',
                'published_at' => now(),
                'approved_by_user_id' => $userId,
                'published_by_user_id' => $userId,
                'integrity_hash' => $integrityHash,
            ]);

            foreach ($meritList->items as $item) {
                $item->application->transitionState('merit', 'published', $userId, 'Merit list published');
                // Automatically reserve a seat for top selected candidates
                if ($item->status === 'selected') {
                    try {
                        \App\Services\SeatAllocationService::reserveSeat($item->application, $userId);
                    } catch (\Throwable $e) {
                        // Ignore if all program seats are already occupied
                    }
                }
            }
        });
    }

    public static function getRankedCandidatesForSessionProgram(SessionProgram $sessionProgram): array
    {
        $formula = MeritFormula::where('session_program_id', $sessionProgram->id)
            ->where('is_active', true)
            ->with('components')
            ->first();

        $applications = Application::where('session_program_id', $sessionProgram->id)
            ->where('admission_session_id', $sessionProgram->admission_session_id)
            ->where('verification_status', 'verified')
            ->with(['applicantProfile', 'academicRecords', 'examinationAttempt.result', 'seatAllocation'])
            ->get();

        $components = $formula?->components ?? collect();
        $testWeight = $components->where('component_type', 'admission_test')->sum('weight_percentage');
        $requiresTest = $testWeight > 0;
        $candidates = [];

        foreach ($applications as $app) {
            $matric = $app->academicRecords->where('level', 'matric')->first();
            $inter = $app->academicRecords->where('level', 'intermediate')->first();
            $result = $app->examinationAttempt?->result;

            $matricPct = $matric ? (float) $matric->percentage : 0.00;
            $interPct = $inter ? (float) $inter->percentage : 0.00;
            $testPct = $result ? (float) $result->percentage : 0.00;
            $testMarks = $result ? (float) $result->obtained_marks : 0.00;

            $aggregate = 0.00;

            if ($components->isNotEmpty()) {
                foreach ($components as $comp) {
                    $weight = (float) $comp->weight_percentage / 100.00;
                    $score = match ($comp->component_type) {
                        'matric' => $matricPct,
                        'intermediate' => $interPct,
                        'admission_test' => $testPct,
                        default => 0.00,
                    };
                    $aggregate += ($score * $weight);
                }
            } else {
                $aggregate = $testPct > 0 ? $testPct : $matricPct;
            }

            // If candidate has 0% aggregate (e.g. test was reset/deleted or no credentials) or is disqualified, exclude from rankings
            if ($aggregate <= 0.00 || ($result && $result->status === 'disqualified')) {
                continue;
            }

            $dob = $app->applicantProfile?->dob ? $app->applicantProfile->dob->timestamp : 0;

            $candidates[] = [
                'application_id' => $app->id,
                'application_number' => $app->application_number,
                'roll_number' => $app->roll_number,
                'student_name' => $app->applicantProfile?->full_name ?? 'Candidate',
                'gender' => $app->applicantProfile?->gender ?? 'N/A',
                'domicile' => $app->applicantProfile?->domicile_district ?? 'KPK',
                'matric_percentage' => $matricPct,
                'inter_percentage' => $interPct,
                'test_percentage' => $testPct,
                'test_marks' => $testMarks,
                'aggregate_percentage' => round($aggregate, 2),
                'dob_timestamp' => $dob,
                'exam_status' => $app->exam_attempt_status,
                'selection_status' => $app->selection_status,
                'seat_allocation' => $app->seatAllocation ? [
                    'id' => $app->seatAllocation->id,
                    'seat_number' => $app->seatAllocation->seat_number,
                    'status' => $app->seatAllocation->status,
                    'reservation_expires_at' => $app->seatAllocation->reservation_expires_at?->format('Y-m-d H:i'),
                    'confirmed_at' => $app->seatAllocation->confirmed_at?->format('Y-m-d'),
                ] : null,
            ];
        }

        usort($candidates, function ($a, $b) {
            if ($b['aggregate_percentage'] != $a['aggregate_percentage']) {
                return $b['aggregate_percentage'] <=> $a['aggregate_percentage'];
            }
            if ($b['test_marks'] != $a['test_marks']) {
                return $b['test_marks'] <=> $a['test_marks'];
            }
            if ($b['inter_percentage'] != $a['inter_percentage']) {
                return $b['inter_percentage'] <=> $a['inter_percentage'];
            }
            if ($b['matric_percentage'] != $a['matric_percentage']) {
                return $b['matric_percentage'] <=> $a['matric_percentage'];
            }
            return $a['dob_timestamp'] <=> $b['dob_timestamp'];
        });

        $rank = 1;
        foreach ($candidates as &$c) {
            $c['rank'] = $rank++;
        }

        return $candidates;
    }
}

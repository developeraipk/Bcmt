<?php

namespace App\Http\Controllers\Hod;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\MeritFormula;
use App\Models\MeritList;
use App\Models\SessionProgram;
use App\Services\MeritCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MeritController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $sessionId = $request->query('session_id', $activeSession?->id);

        $sessionPrograms = SessionProgram::where('admission_session_id', $sessionId)
            ->with(['program', 'meritFormulas.components'])
            ->get();

        $meritLists = MeritList::where('admission_session_id', $sessionId)
            ->with(['sessionProgram.program', 'meritFormula', 'items'])
            ->orderByDesc('id')
            ->get();

        $sessions = AdmissionSession::orderByDesc('id')->get(['id', 'name', 'code']);

        return Inertia::render('Hod/Merit/Index', [
            'sessionPrograms' => $sessionPrograms,
            'meritLists' => $meritLists,
            'sessions' => $sessions,
            'selectedSessionId' => (int) $sessionId,
        ]);
    }

    public function storeFormula(Request $request)
    {
        $validated = $request->validate([
            'session_program_id' => ['required', 'exists:session_programs,id'],
            'title' => ['required', 'string', 'max:150'],
            'components' => ['required', 'array', 'min:1'],
            'components.*.component_type' => ['required', 'in:matric,intermediate,admission_test,interview,custom'],
            'components.*.component_name' => ['required', 'string', 'max:100'],
            'components.*.weight_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $totalWeight = array_sum(array_column($validated['components'], 'weight_percentage'));
        if (abs($totalWeight - 100.00) > 0.01) {
            return back()->with('error', "Formula components must sum to exactly 100%. Current sum: {$totalWeight}%");
        }

        $sessionProgram = SessionProgram::findOrFail($validated['session_program_id']);

        DB::transaction(function () use ($validated, $sessionProgram, $request) {
            // Deactivate previous formulas for this program
            MeritFormula::where('session_program_id', $sessionProgram->id)->update(['is_active' => false]);

            $formula = MeritFormula::create([
                'admission_session_id' => $sessionProgram->admission_session_id,
                'session_program_id' => $sessionProgram->id,
                'title' => $validated['title'],
                'total_weight' => 100.00,
                'tie_breaker_rules' => ['test_marks', 'inter_percentage', 'matric_percentage', 'dob_seniority'],
                'is_active' => true,
                'created_by_user_id' => $request->user()->id,
            ]);

            foreach ($validated['components'] as $comp) {
                $formula->components()->create([
                    'component_type' => $comp['component_type'],
                    'component_name' => $comp['component_name'],
                    'weight_percentage' => $comp['weight_percentage'],
                ]);
            }
        });

        return back()->with('success', 'Dynamic merit formula created and activated.');
    }

    public function resetFormula(Request $request)
    {
        $validated = $request->validate([
            'session_program_id' => ['required', 'exists:session_programs,id'],
        ]);

        MeritFormula::where('session_program_id', $validated['session_program_id'])
            ->update(['is_active' => false]);

        return back()->with('success', 'Merit formula reset to 0% successfully.');
    }

    public function compile(Request $request)
    {
        $request->validate([
            'session_program_id' => ['required', 'exists:session_programs,id'],
            'merit_formula_id' => ['nullable', 'exists:merit_formulas,id'],
            'title' => ['nullable', 'string', 'max:150'],
        ]);

        $sessionProgram = SessionProgram::with('program')->findOrFail($request->input('session_program_id'));
        $formula = $request->input('merit_formula_id')
            ? MeritFormula::find($request->input('merit_formula_id'))
            : MeritFormula::where('session_program_id', $sessionProgram->id)->where('is_active', true)->first();

        if (!$formula) {
            return back()->with('error', "No active formula configured for '{$sessionProgram->program->name}'. Please click 'Edit Formula' to set 100% component weights first.");
        }

        $meritList = MeritCalculationService::compile($sessionProgram, $formula, $request->input('title'));

        return back()->with('success', "Compiled merit list with {$meritList->items()->count()} candidates.");
    }

    public function publish(Request $request, int $id)
    {
        $meritList = MeritList::findOrFail($id);
        MeritCalculationService::publish($meritList, $request->user()->id);

        return back()->with('success', "Merit list '{$meritList->title}' approved and published.");
    }

    public function printList(int $id): Response
    {
        $meritList = MeritList::with([
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

    public function destroy(int $id)
    {
        $meritList = MeritList::findOrFail($id);

        DB::transaction(function () use ($meritList) {
            $meritList->items()->delete();
            $meritList->delete();
        });

        return back()->with('success', 'Merit list deleted successfully.');
    }
}

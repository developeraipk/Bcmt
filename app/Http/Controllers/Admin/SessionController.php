<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\AuditLog;
use App\Models\Program;
use App\Models\SessionProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function index(): Response
    {
        $sessions = AdmissionSession::withCount(['applications', 'sessionPrograms'])
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Admin/Sessions/Index', [
            'sessions' => $sessions,
        ]);
    }

    public function create(): Response
    {
        $programs = Program::where('is_active', true)->orderBy('name')->get();
        if ($programs->isEmpty()) {
            $programs = Program::orderBy('name')->get();
        }

        return Inertia::render('Admin/Sessions/Create', [
            'programs' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $requestedCode = trim((string) $request->input('code', ''));

        // If a soft-deleted session exists with this exact code, release its code so the admin can freely recreate/reuse it
        if ($requestedCode !== '') {
            AdmissionSession::onlyTrashed()
                ->where('code', $requestedCode)
                ->get()
                ->each(function ($trashed) {
                    $prefix = substr($trashed->code, 0, 12);
                    $trashed->update(['code' => $prefix . '_d_' . $trashed->id]);
                });
        }

        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('admission_sessions', 'code')->whereNull('deleted_at'),
            ],
            'start_date' => ['required', 'date'],
            'closing_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['nullable', 'boolean'],
            'admission_instructions' => ['nullable', 'string'],
            'program_seats' => ['nullable', 'array'],
            'program_seats.*' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($request) {
            if ($request->boolean('is_active')) {
                AdmissionSession::where('is_active', true)->update(['is_active' => false]);
            }

            $session = AdmissionSession::create([
                'name' => $request->input('name'),
                'code' => $request->input('code'),
                'start_date' => $request->input('start_date'),
                'closing_date' => $request->input('closing_date'),
                'status' => 'open',
                'is_active' => $request->boolean('is_active'),
                'admission_instructions' => $request->input('admission_instructions'),
            ]);

            $activePrograms = Program::where('is_active', true)->get();
            $seatsInput = $request->input('program_seats', []);

            foreach ($activePrograms as $prog) {
                $seatCount = isset($seatsInput[$prog->id]) ? (int) $seatsInput[$prog->id] : 10;
                SessionProgram::create([
                    'admission_session_id' => $session->id,
                    'program_id' => $prog->id,
                    'total_seats' => max(0, $seatCount),
                    'seats_allocated' => 0,
                    'is_open' => true,
                    'test_required' => true,
                ]);
            }

            AuditLog::log('session_created', 'AdmissionSession', $session->id);
        });

        return redirect()->route('admin.sessions.index')->with('success', 'Admission session created successfully.');
    }

    public function edit(int $id): Response
    {
        $session = AdmissionSession::with(['sessionPrograms.program'])->findOrFail($id);
        $programs = Program::where('is_active', true)->get();

        return Inertia::render('Admin/Sessions/Edit', [
            'session' => $session,
            'programs' => $programs,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $session = AdmissionSession::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:draft,open,closed,archived'],
            'start_date' => ['required', 'date'],
            'closing_date' => ['required', 'date', 'after:start_date'],
            'is_active' => ['boolean'],
            'admission_instructions' => ['nullable', 'string'],
            'program_seats' => ['nullable', 'array'],
            'program_seats.*' => ['integer', 'min:0'],
        ]);

        DB::transaction(function () use ($request, $session) {
            $becameActive = $request->boolean('is_active');
            if ($becameActive) {
                AdmissionSession::where('id', '!=', $session->id)->update(['is_active' => false]);
            }

            $session->update([
                'name' => $request->input('name'),
                'status' => $request->input('status'),
                'start_date' => $request->input('start_date'),
                'closing_date' => $request->input('closing_date'),
                'is_active' => $becameActive,
                'admission_instructions' => $request->input('admission_instructions'),
            ]);

            if ($request->has('program_seats')) {
                foreach ($request->input('program_seats') as $key => $seats) {
                    $seatCount = (int) $seats;

                    // Match either by session_programs.id or by program_id
                    $sp = SessionProgram::where('admission_session_id', $session->id)
                        ->where(function ($query) use ($key) {
                            $query->where('id', $key)
                                  ->orWhere('program_id', $key);
                        })->first();

                    if ($sp) {
                        $sp->update(['total_seats' => $seatCount]);
                    } else {
                        // Create SessionProgram record if program exists but was not attached to this session
                        $program = Program::find($key);
                        if ($program) {
                            SessionProgram::create([
                                'admission_session_id' => $session->id,
                                'program_id' => $program->id,
                                'total_seats' => $seatCount,
                                'seats_allocated' => 0,
                                'is_open' => true,
                                'test_required' => true,
                            ]);
                        }
                    }
                }
            }

            AuditLog::log('session_updated', 'AdmissionSession', $session->id);
        });

        return redirect()->route('admin.sessions.index')->with('success', 'Admission session updated successfully.');
    }

    public function destroy(int $id)
    {
        $session = AdmissionSession::findOrFail($id);

        $appCount = $session->applications()->count();
        if ($appCount > 0 && !request()->boolean('force')) {
            return back()->with('error', "Cannot delete this session because {$appCount} student application(s) are registered under it.");
        }

        DB::transaction(function () use ($session, $id) {
            if ($session->is_active) {
                $session->update(['is_active' => false]);
                $fallback = AdmissionSession::where('id', '!=', $id)->orderByDesc('id')->first();
                if ($fallback) {
                    $fallback->update(['is_active' => true]);
                }
            }

            AuditLog::log('session_deleted', 'AdmissionSession', $session->id, $session->toArray(), null);
            $session->delete();
        });

        return redirect()->route('admin.sessions.index')->with('success', 'Admission session deleted successfully.');
    }
}

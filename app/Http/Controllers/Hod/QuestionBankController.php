<?php

namespace App\Http\Controllers\Hod;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Program;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuestionBankController extends Controller
{
    public function index(Request $request): Response
    {
        $subject = $request->query('subject');
        $difficulty = $request->query('difficulty');
        $search = $request->query('search');

        $questions = Question::with('options')
            ->when($subject, fn ($q) => $q->where('subject', $subject))
            ->when($difficulty, fn ($q) => $q->where('difficulty', $difficulty))
            ->when($search, fn ($q) => $q->where('question_text', 'like', "%{$search}%"))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $subjects = Question::distinct()->pluck('subject');
        $programs = Program::where('is_active', true)->get(['id', 'name', 'code']);
        $examinations = \App\Models\Examination::with(['sessionProgram.program'])
            ->withCount('examinationQuestions')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Hod/QuestionBank/Index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'programs' => $programs,
            'examinations' => $examinations,
            'filters' => [
                'subject' => $subject,
                'difficulty' => $difficulty,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => ['nullable', 'exists:programs,id'],
            'subject' => ['required', 'string', 'max:100'],
            'topic' => ['nullable', 'string', 'max:100'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            'marks' => ['required', 'numeric', 'min:0.5', 'max:10'],
            'question_text' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
            'options' => ['required', 'array', 'size:4'],
            'options.*.label' => ['required', 'string', 'max:5'],
            'options.*.text' => ['required', 'string'],
            'options.*.is_correct' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $question = Question::create([
                'program_id' => $validated['program_id'] ?? null,
                'subject' => $validated['subject'],
                'topic' => $validated['topic'] ?? null,
                'difficulty' => $validated['difficulty'],
                'marks' => $validated['marks'],
                'question_text' => $validated['question_text'],
                'explanation' => $validated['explanation'] ?? null,
                'is_active' => true,
                'created_by_user_id' => $request->user()->id,
            ]);

            foreach ($validated['options'] as $opt) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_label' => $opt['label'],
                    'option_text' => $opt['text'],
                    'is_correct' => (bool) $opt['is_correct'],
                ]);
            }

            AuditLog::log('question_created', 'Question', $question->id);
        });

        return back()->with('success', 'Question added to question bank.');
    }
}

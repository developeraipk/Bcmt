import React, { useState } from 'react';
import HodLayout from '@/Layouts/HodLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';

interface Option {
  id?: number;
  label: string;
  option_text?: string;
  text?: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  subject: string;
  topic?: string;
  difficulty: string;
  marks: number;
  question_text: string;
  explanation?: string;
  options: Option[];
}

interface Props {
  questions: {
    data: Question[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
  };
  subjects: string[];
  programs: any[];
  examinations?: any[];
  filters: {
    subject?: string;
    difficulty?: string;
    search?: string;
  };
}

export default function QuestionBankIndex({ questions, subjects, programs, examinations = [], filters }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [subject, setSubject] = useState(filters.subject || '');
  const [difficulty, setDifficulty] = useState(filters.difficulty || '');

  // Form for adding an authentic MCQ
  const createForm = useForm({
    program_id: '',
    subject: subjects[0] || 'Medical Science',
    topic: '',
    difficulty: 'medium',
    marks: 1.0,
    question_text: '',
    explanation: '',
    options: [
      { label: 'A', text: '', is_correct: true },
      { label: 'B', text: '', is_correct: false },
      { label: 'C', text: '', is_correct: false },
      { label: 'D', text: '', is_correct: false },
    ],
  });

  const handleFilter = () => {
    router.get('/hod/question-bank', {
      search: search || undefined,
      subject: subject || undefined,
      difficulty: difficulty || undefined,
    }, { preserveState: true });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/hod/question-bank', {
      onSuccess: () => {
        setShowAddModal(false);
        createForm.reset();
      },
    });
  };

  const setCorrectOption = (selectedIndex: number) => {
    const updated = createForm.data.options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === selectedIndex,
    }));
    createForm.setData('options', updated);
  };

  const setOptionText = (index: number, text: string) => {
    const updated = [...createForm.data.options];
    updated[index].text = text;
    createForm.setData('options', updated);
  };

  return (
    <HodLayout>
      <Head title="Question Bank & MCQs - BCMT HOD" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-rose-300 bg-rose-950 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-800">
            Curriculum & Assessment Bank
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Vetted Medical Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Author and inspect official examination questions, correct answer keys, and difficulty ratings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#FFB606]" /> Add Medical MCQ
        </button>
      </div>

      {/* Manage by Entrance Test Protocol */}
      {examinations && examinations.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Per-Test Question Management</span>
              <h3 className="text-base font-serif font-bold text-slate-900 mt-0.5">
                Active Entrance Tests & Question Rosters
              </h3>
            </div>
            <Link
              href="/hod/exams"
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Manage All Tests →
            </Link>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Select an entrance test below to view, add, or edit its examination multiple-choice questions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examinations.map((exam: any) => (
              <div key={exam.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {exam.exam_code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1.5">{exam.title}</h4>
                  <p className="text-[11px] text-slate-500">{exam.session_program?.program?.name || 'Medical Program'}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">{exam.examination_questions_count || 0} Questions</span>
                  <Link
                    href={`/hod/exams/${exam.id}/questions`}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs"
                  >
                    Manage MCQs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search question text or concept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#800000]"
          />
        </div>

        <div>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Filter by Subject"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#800000]"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub, i) => (
              <option key={i} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Filter by Difficulty Level"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#800000]"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <button
            onClick={handleFilter}
            className="w-full py-2 bg-[#800000] hover:bg-[#660000] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4 mb-6">
        {questions.data.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:border-stone-300 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#800000] bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                  #{q.id}
                </span>
                <span className="font-bold text-stone-800">{q.subject}</span>
                {q.topic && <span className="text-stone-400">• {q.topic}</span>}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  q.difficulty === 'hard'
                    ? 'bg-rose-100 text-rose-800'
                    : q.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {q.difficulty}
                </span>
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-semibold">
                  {q.marks} Mark{q.marks > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-stone-900 leading-relaxed mb-4">
              {q.question_text}
            </p>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {q.options?.map((opt) => (
                <div
                  key={opt.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    opt.is_correct
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      opt.is_correct ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="flex-1">{opt.option_text || opt.text}</span>
                  {opt.is_correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>

            {q.explanation && (
              <p className="text-[11px] text-stone-500 mt-3 pt-3 border-t border-stone-100 italic">
                Rationale: {q.explanation}
              </p>
            )}
          </div>
        ))}
        {questions.data.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-xs">
            No MCQs match the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {questions.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {questions.links.map((link, idx) => (
            <button
              key={idx}
              disabled={!link.url}
              onClick={() => router.get(link.url, {}, { preserveState: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                link.active
                  ? 'bg-[#800000] text-white'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
              } disabled:opacity-40`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}

      {/* Add MCQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="pb-4 mb-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#800000] uppercase tracking-wider">
                  Assessment Authoring
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
                  Add Authentic Medical MCQ
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Subject / Discipline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pathology, Anatomy"
                    value={createForm.data.subject}
                    onChange={(e) => createForm.setData('subject', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#800000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Topic / Concept
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiovascular"
                    value={createForm.data.topic}
                    onChange={(e) => createForm.setData('topic', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#800000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={createForm.data.difficulty}
                    onChange={(e) => createForm.setData('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#800000]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Question Text (Stem)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the complete question stem..."
                  value={createForm.data.question_text}
                  onChange={(e) => createForm.setData('question_text', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#800000]"
                />
              </div>

              {/* 4 Options Configuration */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  MCQ Options (Select the Radio for Correct Key)
                </label>
                <div className="space-y-2">
                  {createForm.data.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={opt.is_correct}
                        onChange={() => setCorrectOption(i)}
                        className="w-4 h-4 text-[#800000] focus:ring-[#800000]"
                      />
                      <span className="w-6 font-bold font-mono text-stone-700 text-xs">{opt.label}:</span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${opt.label} text...`}
                        value={opt.text}
                        onChange={(e) => setOptionText(i, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#800000]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Scientific Rationale / Explanation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Explain why the selected option is correct..."
                  value={createForm.data.explanation}
                  onChange={(e) => createForm.setData('explanation', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#800000]"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.processing}
                  className="px-6 py-2 bg-[#800000] hover:bg-[#660000] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {createForm.processing ? 'Saving...' : 'Save to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HodLayout>
  );
}


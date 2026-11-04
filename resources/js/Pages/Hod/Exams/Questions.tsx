import React, { useState } from 'react';
import HodLayout from '@/Layouts/HodLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Award,
  BookOpen,
  Sparkles,
  Save,
  X,
} from 'lucide-react';

interface QuestionOption {
  id: number;
  option_label: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question_text: string;
  marks: number;
  is_active: boolean;
  options: QuestionOption[];
}

interface ExamQuestionItem {
  id: number;
  examination_id: number;
  question_id: number;
  sort_order: number;
  question: Question;
}

interface Props {
  examination: {
    id: number;
    title: string;
    exam_code: string;
    duration_minutes: number;
    total_questions: number;
    total_marks: number;
    shift: string;
    session_program?: {
      program?: {
        name: string;
        code: string;
      };
    };
    admission_session?: {
      name: string;
    };
  };
  examQuestions: ExamQuestionItem[];
}

export default function ExamQuestions({ examination, examQuestions }: Props) {
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // Form for Adding / Editing a Question
  const form = useForm({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1,
    is_active: true,
  });

  const handleEditClick = (item: ExamQuestionItem) => {
    const q = item.question;
    setEditingQuestionId(q.id);

    const optA = q.options?.find((o) => o.option_label === 'A')?.option_text || '';
    const optB = q.options?.find((o) => o.option_label === 'B')?.option_text || '';
    const optC = q.options?.find((o) => o.option_label === 'C')?.option_text || '';
    const optD = q.options?.find((o) => o.option_label === 'D')?.option_text || '';
    const correct = q.options?.find((o) => o.is_correct)?.option_label || 'A';

    form.setData({
      question_text: q.question_text,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_option: correct,
      marks: Number(q.marks) || 1,
      is_active: Boolean(q.is_active),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    form.setData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      marks: 1,
      is_active: true,
    });
    form.reset();
  };

  const handleClearForm = () => {
    setEditingQuestionId(null);
    form.setData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      marks: 1,
      is_active: true,
    });
    form.reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingQuestionId) {
      // Update existing question
      form.put(`/hod/exams/${examination.id}/questions/${editingQuestionId}`, {
        preserveScroll: true,
        onSuccess: () => {
          setEditingQuestionId(null);
          form.setData({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            marks: 1,
            is_active: true,
          });
          form.reset();
        },
      });
    } else {
      // Add new question
      form.post(`/hod/exams/${examination.id}/questions`, {
        preserveScroll: true,
        onSuccess: () => {
          form.setData({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            marks: 1,
            is_active: true,
          });
          form.reset();
        },
      });
    }
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Delete this MCQ from the examination?')) {
      router.delete(`/hod/exams/${examination.id}/questions/${questionId}`);
    }
  };

  return (
    <HodLayout>
      <Head title={`Questions - ${examination.title} - BCMT HOD`} />

      {/* Top Header & Back Link */}
      <div className="mb-6">
        <Link
          href="/hod/exams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admission Tests
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {examination.exam_code}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {examination.session_program?.program?.name} • Shift: {examination.shift}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-1">
              Examination Questions: {examination.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total MCQs</span>
              <span className="text-lg font-black text-blue-600">{examQuestions.length} Qs</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Marks</span>
              <span className="text-lg font-black text-[#07294D]">{examination.total_marks} Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Layout (Matching Image 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add / Edit Question Form (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sticky top-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              {editingQuestionId ? 'Edit Question' : 'Add Question'}
            </h2>
            {editingQuestionId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Question Text <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter the question here..."
                value={form.data.question_text}
                onChange={(e) => form.setData('question_text', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              {form.errors.question_text && (
                <p className="text-rose-600 text-xs mt-1">{form.errors.question_text}</p>
              )}
            </div>

            {/* Option A */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Option A <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Option A"
                value={form.data.option_a}
                onChange={(e) => form.setData('option_a', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Option B */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Option B <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Option B"
                value={form.data.option_b}
                onChange={(e) => form.setData('option_b', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Option C */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Option C <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Option C"
                value={form.data.option_c}
                onChange={(e) => form.setData('option_c', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Option D */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Option D <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Option D"
                value={form.data.option_d}
                onChange={(e) => form.setData('option_d', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Correct Option, Marks, Status Grid */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Correct Option <span className="text-rose-600">*</span>
                </label>
                <select
                  value={form.data.correct_option}
                  onChange={(e) => form.setData('correct_option', e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Marks <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="20"
                  value={form.data.marks}
                  onChange={(e) => form.setData('marks', parseFloat(e.target.value) || 1)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={form.data.is_active ? '1' : '0'}
                  onChange={(e) => form.setData('is_active', e.target.value === '1')}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>

            {/* Submit & Reset Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={form.processing}
                className="flex-1 py-2.5 px-4 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {editingQuestionId ? (
                  <>
                    <Save className="w-4 h-4 text-[#FFB606]" /> Save Question Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#FFB606]" /> Add Question
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Questions List (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-800">
              Questions in this Entrance Test ({examQuestions.length})
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Randomized shuffled delivery to candidates
            </span>
          </div>

          {examQuestions.map((item, index) => {
            const q = item.question;
            const optA = q.options?.find((o) => o.option_label === 'A');
            const optB = q.options?.find((o) => o.option_label === 'B');
            const optC = q.options?.find((o) => o.option_label === 'C');
            const optD = q.options?.find((o) => o.option_label === 'D');

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#07294D]/30 transition"
              >
                {/* Header: Q Number + Question Text + Marks Badge + Actions */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#07294D] text-[#FFB606] font-black text-xs shrink-0 font-mono shadow-2xs">
                      Q{index + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {q.question_text}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono">
                      +{Number(q.marks).toFixed(2)} Marks
                    </span>

                    <button
                      onClick={() => handleEditClick(item)}
                      title="Edit this question"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#07294D] transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Delete question"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4 Options Grid (2x2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium">
                  {[
                    { label: 'A', opt: optA },
                    { label: 'B', opt: optB },
                    { label: 'C', opt: optC },
                    { label: 'D', opt: optD },
                  ].map(({ label, opt }) => {
                    const isCorrect = opt?.is_correct;
                    return (
                      <div
                        key={label}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {label}
                          </span>
                          <span className="truncate">{opt?.option_text || '—'}</span>
                        </div>
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {examQuestions.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Questions Added Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the "Add Question" form on the left to add your first multiple choice question to this examination.
              </p>
            </div>
          )}
        </div>
      </div>
    </HodLayout>
  );
}

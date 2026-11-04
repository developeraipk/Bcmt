import React, { useState } from 'react';
import HodLayout from '@/Layouts/HodLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Eye,
  FileText,
  User,
  ArrowLeft,
  X,
  Save,
  Trash2,
} from 'lucide-react';

interface ResultItem {
  id: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  is_passed: boolean;
  status?: string;
  created_at: string;
  application?: {
    id: number;
    application_number: string;
    roll_number?: string;
    applicant_profile?: {
      full_name: string;
      cnic: string;
    };
  };
  examination?: {
    id: number;
    title: string;
    exam_code: string;
    shift?: string;
    session_program?: {
      program?: {
        name: string;
        code: string;
      };
    };
  };
  attempt?: {
    id: number;
    start_time?: string;
    end_time?: string;
    answers?: Array<{
      id: number;
      is_correct: boolean;
      marks_awarded: number;
      question?: {
        question_text: string;
        marks: number;
        options?: Array<{
          option_label: string;
          option_text: string;
          is_correct: boolean;
        }>;
      };
      selected_option?: {
        option_label: string;
        option_text: string;
      };
    }>;
  };
}

interface Props {
  results: {
    data: ResultItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
  };
  examinations: Array<{
    id: number;
    title: string;
    exam_code: string;
    total_marks: number;
  }>;
  filters: {
    examination_id?: number | string;
    search?: string;
    status?: string;
  };
  stats: {
    total_candidates: number;
    passed: number;
    failed: number;
    average_score: number;
  };
}

export default function ResultsIndex({ results, examinations, filters, stats }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedExamId, setSelectedExamId] = useState(filters.examination_id || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

  const [inspectResult, setInspectResult] = useState<ResultItem | null>(null);
  const [adjustResult, setAdjustResult] = useState<ResultItem | null>(null);
  const [newScoreInput, setNewScoreInput] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const handleFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.get(
      '/hod/results',
      {
        examination_id: selectedExamId || undefined,
        search: search || undefined,
        status: selectedStatus || undefined,
      },
      { preserveState: true }
    );
  };

  const handleOpenAdjust = (res: ResultItem) => {
    setAdjustResult(res);
    setNewScoreInput(String(res.obtained_marks));
    setAdjustReason('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustResult) return;

    router.post(
      `/hod/results/${adjustResult.id}/adjust`,
      {
        new_marks: parseFloat(newScoreInput),
        reason: adjustReason || 'Administrative Mark Review',
      },
      {
        onSuccess: () => setAdjustResult(null),
      }
    );
  };

  const handleResetAttempt = (res: ResultItem) => {
    const candidateName = res.application?.applicant_profile?.full_name || 'Candidate';
    if (
      confirm(
        `Reset attempt for '${candidateName}'? This clears their test submission so they can re-enter the test with PIN. Use only in case of verified technical issues.`
      )
    ) {
      router.post(`/hod/results/${res.id}/reset`);
    }
  };

  const handleDeleteResult = (res: ResultItem) => {
    const candidateName = res.application?.applicant_profile?.full_name || 'Candidate';
    if (
      confirm(
        `Are you sure you want to permanently delete the entrance test attempt and result for '${candidateName}' (${res.application?.roll_number || 'N/A'})? This will remove their scorecard and answers.`
      )
    ) {
      router.delete(`/hod/results/${res.id}`);
    }
  };

  return (
    <HodLayout>
      <Head title="Entrance Test Results - BCMT HOD" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Candidate Test Performance & Auditing
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Entrance Examination Results & Actions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review applicant scores, examine detailed answer scripts, and apply formal score adjustments.
          </p>
        </div>

        <Link
          href="/hod/exams"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Manage Tests & PINs
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tested Candidates</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">{stats.total_candidates}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Passed Candidates</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">{stats.passed}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Failed Candidates</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-1 block">{stats.failed}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Average Score</span>
          <span className="text-2xl font-black font-mono text-blue-700 mt-1 block">{stats.average_score} Marks</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, roll number, or application number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Entrance Tests</option>
              {examinations.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.exam_code})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-36">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Results</option>
              <option value="pass">Passed Only</option>
              <option value="fail">Failed Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-4">Candidate & Roll #</th>
                <th className="p-4">Entrance Test</th>
                <th className="p-4 text-center">Breakdown</th>
                <th className="p-4 text-center">Score / Total</th>
                <th className="p-4 text-center">Percentage</th>
                <th className="p-4 text-center">Outcome</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {results.data.map((res) => {
                const profile = res.application?.applicant_profile;
                const isDisqualified = res.status === 'disqualified';

                return (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition">
                    {/* Candidate */}
                    <td className="p-4 font-sans">
                      <div className="font-bold text-slate-900 text-sm">{profile?.full_name || 'Anonymous Student'}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5 font-mono">
                        <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {res.application?.roll_number || 'No Roll #'}
                        </span>
                        <span>•</span>
                        <span>{res.application?.application_number}</span>
                      </div>
                    </td>

                    {/* Examination */}
                    <td className="p-4 font-sans">
                      <div className="font-bold text-slate-900">{res.examination?.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {res.examination?.session_program?.program?.name} • Shift: {res.examination?.shift || 'Morning'}
                      </div>
                    </td>

                    {/* Breakdown */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold">
                        <span className="text-emerald-700" title="Correct Answers">
                          ✓ {res.correct_answers}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-rose-600" title="Incorrect Answers">
                          ✗ {res.incorrect_answers}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400" title="Unanswered">
                          — {res.unanswered}
                        </span>
                      </div>
                    </td>

                    {/* Score / Total */}
                    <td className="p-4 text-center font-bold text-sm">
                      <span className={res.is_passed ? 'text-emerald-700' : 'text-rose-700'}>
                        {res.obtained_marks}
                      </span>
                      <span className="text-slate-400 text-xs"> / {res.total_marks}</span>
                    </td>

                    {/* Percentage */}
                    <td className="p-4 text-center font-bold">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                        {res.percentage}%
                      </span>
                    </td>

                    {/* Outcome */}
                    <td className="p-4 text-center font-sans">
                      {isDisqualified ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                          Disqualified
                        </span>
                      ) : res.is_passed ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PASSED
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                          FAILED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right font-sans">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* View Answer Sheet */}
                        <button
                          onClick={() => setInspectResult(res)}
                          title="Inspect full candidate answer script"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Answers</span>
                        </button>

                        {/* Adjust Score */}
                        <button
                          onClick={() => handleOpenAdjust(res)}
                          title="Adjust score with audit reason"
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </button>

                        {/* Reset Attempt */}
                        <button
                          onClick={() => handleResetAttempt(res)}
                          title="Reset student attempt (allow re-test)"
                          className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Attempt / Result (Replaced the old cross icon) */}
                        <button
                          onClick={() => handleDeleteResult(res)}
                          title="Permanently delete test result and attempt"
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {results.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-sans">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No entrance test attempts recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Candidate results will appear here in real-time as tests are taken and submitted.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Full Candidate Answer Script */}
      {inspectResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Candidate Examination Script</span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-0.5">
                  {inspectResult.application?.applicant_profile?.full_name} ({inspectResult.application?.roll_number})
                </h3>
              </div>
              <button onClick={() => setInspectResult(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Answers List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {inspectResult.attempt?.answers && inspectResult.attempt.answers.length > 0 ? (
                inspectResult.attempt.answers.map((ans, idx) => (
                  <div key={ans.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-900">
                        Q{idx + 1}. {ans.question?.question_text}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          ans.is_correct
                            ? 'bg-emerald-100 text-emerald-800'
                            : ans.selected_option
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ans.is_correct ? 'Correct (+1)' : ans.selected_option ? 'Wrong (0)' : 'Unanswered'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Candidate Selected:</span>
                        <span className={`font-bold ${ans.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {ans.selected_option
                            ? `${ans.selected_option.option_label}) ${ans.selected_option.option_text}`
                            : 'None (Skipped)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Official Correct Key:</span>
                        <span className="font-bold text-emerald-700">
                          {ans.question?.options?.find((o) => o.is_correct)
                            ? `${ans.question.options.find((o) => o.is_correct)?.option_label}) ${
                                ans.question.options.find((o) => o.is_correct)?.option_text
                              }`
                            : 'A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p className="font-bold">No individual question attempt answers logged for this result.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setInspectResult(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Close Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Score Adjustment */}
      {adjustResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" /> Adjust Candidate Score
              </h3>
              <button onClick={() => setAdjustResult(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs">
              <span className="text-slate-400 uppercase text-[10px] block">Candidate</span>
              <strong className="text-slate-900 block font-bold text-sm">
                {adjustResult.application?.applicant_profile?.full_name}
              </strong>
              <span className="text-slate-500 text-[11px]">
                Current Score: {adjustResult.obtained_marks} / {adjustResult.total_marks} Marks ({adjustResult.percentage}%)
              </span>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Obtained Marks (0 - {adjustResult.total_marks})
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max={adjustResult.total_marks}
                  required
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Adjustment <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrutiny recheck, grace mark or invigilator report"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustResult(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HodLayout>
  );
}

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
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
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
      father_name?: string;
      gender?: string;
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
        id: number;
        name: string;
        code: string;
      };
    };
  };
  attempt?: {
    id: number;
    status?: string;
    start_time?: string;
    end_time?: string;
    server_deadline?: string;
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
    from: number;
    to: number;
    total: number;
    links: any[];
  };
  examinations: Array<{
    id: number;
    title: string;
    exam_code: string;
    total_marks: number;
  }>;
  programs: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  filters: {
    examination_id?: number | string;
    program_id?: number | string;
    search?: string;
    status?: string;
    gender?: string;
  };
  stats: {
    total_candidates: number;
    passed: number;
    failed: number;
    average_score: number;
  };
}

export default function ResultsIndex({
  results,
  examinations = [],
  programs = [],
  filters,
  stats,
}: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedExamId, setSelectedExamId] = useState(filters.examination_id || '');
  const [selectedProgramId, setSelectedProgramId] = useState(filters.program_id || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [selectedGender, setSelectedGender] = useState(filters.gender || '');

  const [inspectResult, setInspectResult] = useState<ResultItem | null>(null);
  const [adjustResult, setAdjustResult] = useState<ResultItem | null>(null);
  const [newScoreInput, setNewScoreInput] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Build active query string for downloads and pagination
  const buildQuery = (overridePage?: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedProgramId) params.set('program_id', String(selectedProgramId));
    if (selectedExamId) params.set('examination_id', String(selectedExamId));
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedGender) params.set('gender', selectedGender);
    if (overridePage && overridePage > 1) params.set('page', String(overridePage));
    return params.toString();
  };

  const activeQueryString = buildQuery();

  const handleFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.get(
      '/hod/results',
      {
        search: search || undefined,
        program_id: selectedProgramId || undefined,
        examination_id: selectedExamId || undefined,
        status: selectedStatus || undefined,
        gender: selectedGender || undefined,
      },
      { preserveState: true }
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedProgramId('');
    setSelectedExamId('');
    setSelectedStatus('');
    setSelectedGender('');
    router.get('/hod/results', {}, { preserveState: false });
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

  // Generate pagination page numbers (around current page)
  const renderPageNumbers = () => {
    const totalPages = results.last_page || 1;
    const current = results.current_page || 1;
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages.map((p) => {
      const isCurrent = p === current;
      const url = `/hod/results?${buildQuery(p)}`;

      return isCurrent ? (
        <span
          key={p}
          className="relative inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 border border-blue-600 z-10"
        >
          {p}
        </span>
      ) : (
        <Link
          key={p}
          href={url}
          preserveState
          className="relative inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
        >
          {p}
        </Link>
      );
    });
  };

  return (
    <HodLayout>
      <Head title="Entrance Test Results - BCMT HOD" />

      {/* Header & Export Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Candidate Test Performance &amp; Auditing
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Entrance Examination Results &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review applicant scores, examine detailed answer scripts, and export verified merit gazettes.
          </p>
        </div>

        {/* Professional Export & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export CSV */}
          <a
            href={`/hod/results/export?format=csv&${activeQueryString}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            title="Download full candidate test results in CSV format"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Export CSV</span>
          </a>

          {/* Export Excel */}
          <a
            href={`/hod/results/export?format=excel&${activeQueryString}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            title="Download results in Excel-compatible spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <span>Export Excel</span>
          </a>

          {/* Print Gazette / PDF */}
          <a
            href={`/hod/results/print?${activeQueryString}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            title="Print or save official institutional results gazette as PDF"
          >
            <Printer className="w-4 h-4 text-[#FFB606]" />
            <span>Print / PDF Gazette</span>
          </a>

          <Link
            href="/hod/exams"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Manage Tests
          </Link>
        </div>
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

      {/* Advanced Filter Bar matching requirements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
        <form onSubmit={handleFilter} className="flex flex-col gap-3">
          {/* Top Row: Search input + Program Selector + Entrance Test Selector */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by candidate name, roll number, or application number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Program Dropdown (All Programs / Programwise) */}
            <div className="w-full md:w-56">
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
              >
                <option value="">All Academic Programs</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name} ({prog.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Entrance Test Dropdown */}
            <div className="w-full md:w-56">
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
              >
                <option value="">All Entrance Tests</option>
                {examinations.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.exam_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Status Dropdown + Gender Dropdown + Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Status Dropdown: All Status, Submitted, Started, Expired, Passed, Failed */}
            <div className="w-full sm:w-52">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted (Completed)</option>
                <option value="started">Started (In Progress)</option>
                <option value="expired">Expired (Timed Out)</option>
                <option value="pass">Passed Only</option>
                <option value="fail">Failed Only</option>
                <option value="disqualified">Disqualified Only</option>
              </select>
            </div>

            {/* Gender Dropdown: All Genders, Male, Female */}
            <div className="w-full sm:w-40">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-semibold"
              >
                <option value="">All Genders</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>

            {/* Buttons: Filter & Reset */}
            <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {(search || selectedProgramId || selectedExamId || selectedStatus || selectedGender) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center justify-center gap-1"
                  title="Clear all active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Results Table (Recent 20 candidates per page) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-4">Candidate &amp; Roll #</th>
                <th className="p-4">Program &amp; Test</th>
                <th className="p-4 text-center">Attempt Status</th>
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
                const attemptStatus = res.attempt?.status || 'submitted';
                const isInProgress = attemptStatus === 'in_progress';
                const isTimedOut = attemptStatus === 'timed_out';

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
                        {profile?.gender && (
                          <>
                            <span>•</span>
                            <span className="capitalize font-sans font-semibold text-slate-600">{profile.gender}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Program & Examination */}
                    <td className="p-4 font-sans">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {res.examination?.session_program?.program?.name || 'Academic Program'}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="font-mono text-[10px] font-bold text-[#07294D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {res.examination?.exam_code || 'TEST'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 capitalize">
                          {res.examination?.shift ? `${res.examination.shift} Shift` : 'Morning Shift'}
                        </span>
                      </div>
                    </td>

                    {/* Attempt Status Badge */}
                    <td className="p-4 text-center font-sans">
                      {isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Started</span>
                        </span>
                      ) : isTimedOut ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Expired</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Submitted</span>
                        </span>
                      )}
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
                        {Number(res.obtained_marks).toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-xs"> / {Number(res.total_marks).toFixed(2)}</span>
                    </td>

                    {/* Percentage */}
                    <td className="p-4 text-center font-bold">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                        {Number(res.percentage).toFixed(2)}%
                      </span>
                    </td>

                    {/* Outcome */}
                    <td className="p-4 text-center font-sans">
                      {isDisqualified ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                          Disqualified
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                          In Progress
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

                        {/* Delete Attempt / Result */}
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
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-sans">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No entrance test attempts recorded matching the filters.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Candidate results will appear here as tests are started, submitted, or filtered.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination matching Picture 2 */}
        {results.total > 0 && (
          <div className="bg-white px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Showing 1 to 20 of 83 test results (Page 1 of 5) */}
            <div className="text-xs text-slate-600">
              Showing <strong className="font-bold text-slate-900">{results.from || 0}</strong> to{' '}
              <strong className="font-bold text-slate-900">{results.to || 0}</strong> of{' '}
              <strong className="font-bold text-slate-900">{results.total}</strong> test results (Page{' '}
              <strong className="font-bold text-slate-900">{results.current_page}</strong> of{' '}
              <strong className="font-bold text-slate-900">{results.last_page}</strong>)
            </div>

            {/* Right: « First  Prev  1 2 3 4 5  Next  Last » */}
            <div className="inline-flex rounded-lg shadow-2xs border border-slate-300 overflow-hidden divide-x divide-slate-300">
              {/* First Page button */}
              {results.current_page > 1 ? (
                <Link
                  href={`/hod/results?${buildQuery(1)}`}
                  preserveState
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  « First
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 cursor-not-allowed">
                  « First
                </span>
              )}

              {/* Prev button */}
              {results.current_page > 1 ? (
                <Link
                  href={`/hod/results?${buildQuery(results.current_page - 1)}`}
                  preserveState
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Prev
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 cursor-not-allowed">
                  Prev
                </span>
              )}

              {/* Page numbers */}
              {renderPageNumbers()}

              {/* Next button */}
              {results.current_page < results.last_page ? (
                <Link
                  href={`/hod/results?${buildQuery(results.current_page + 1)}`}
                  preserveState
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Next
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 cursor-not-allowed">
                  Next
                </span>
              )}

              {/* Last Page button */}
              {results.current_page < results.last_page ? (
                <Link
                  href={`/hod/results?${buildQuery(results.last_page)}`}
                  preserveState
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Last »
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 cursor-not-allowed">
                  Last »
                </span>
              )}
            </div>
          </div>
        )}
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
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
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
              <button onClick={() => setAdjustResult(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustResult(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
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

import React, { useState, useEffect } from 'react';
import HodLayout from '@/Layouts/HodLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
  BookOpen,
  KeyRound,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  MessageSquare,
  ListOrdered,
  Users,
  Award,
  Share2,
  Calendar,
  Lock,
  Unlock,
  X,
  Save,
  UserCheck,
  FileText,
} from 'lucide-react';

interface Examination {
  id: number;
  title: string;
  exam_code: string;
  shift: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_marks: number;
  passing_percentage: number;
  negative_marks_per_wrong: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'closed';
  instructions?: string;
  created_at: string;
  attempts_count: number;
  examination_questions_count: number;
  session_program?: {
    id: number;
    program?: {
      id: number;
      name: string;
      code: string;
      category: string;
    };
  };
  admission_session?: {
    id: number;
    name: string;
    code: string;
  };
  active_pin?: {
    id: number;
    display_pin?: string;
    is_active: boolean;
    activated_at?: string;
  };
}

interface Props {
  examinations: Examination[];
  sessionPrograms: any[];
  sessions: any[];
  selectedSessionId: string | number;
  stats: {
    total_tests: number;
    active_tests: number;
    total_questions?: number;
    eligible_candidates?: number;
    student_attempts: number;
  };
}

const formatSessionShort = (sessionNameOrCode?: string) => {
  if (!sessionNameOrCode) return '26-27';
  const match = sessionNameOrCode.match(/20(\d{2})[-/–]20(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  const shortMatch = sessionNameOrCode.match(/(\d{2})[-/–](\d{2})/);
  if (shortMatch) {
    return `${shortMatch[1]}-${shortMatch[2]}`;
  }
  const singleYear = sessionNameOrCode.match(/20(\d{2})/);
  if (singleYear) {
    return singleYear[1];
  }
  return sessionNameOrCode;
};

export default function ExamsIndex({
  examinations,
  sessionPrograms,
  sessions,
  selectedSessionId,
  stats,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);
  const [pinModalExam, setPinModalExam] = useState<Examination | null>(null);
  const [customPinInput, setCustomPinInput] = useState('');
  const [copiedPinId, setCopiedPinId] = useState<number | null>(null);

  // Real-Time Background Synchronization (Live updates for tests, attempts & PINs without manual page refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showCreateModal && !editingExam && !pinModalExam) {
        router.reload({
          only: ['examinations', 'stats'],
          preserveScroll: true,
        });
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [showCreateModal, editingExam, pinModalExam]);

  // Create Exam Form
  const createForm = useForm({
    admission_session_id: (selectedSessionId && selectedSessionId !== 'all') ? selectedSessionId : (sessions[0]?.id ?? ''),
    session_program_id: sessionPrograms[0]?.id || '',
    title: '',
    exam_code: '',
    shift: 'Morning',
    duration_minutes: 60,
    passing_percentage: 50,
    negative_marks_per_wrong: 0.0,
    randomize_questions: true,
    randomize_options: true,
    requires_attendance: true,
    instructions: 'Please follow invigilator guidelines. The examination timer begins upon confirmation.',
  });

  // Edit Exam Form
  const editForm = useForm({
    title: '',
    shift: 'Morning',
    duration_minutes: 60,
    passing_percentage: 50,
    negative_marks_per_wrong: 0.0,
    status: 'draft',
    instructions: '',
  });

  const handleOpenEdit = (exam: Examination) => {
    setEditingExam(exam);
    editForm.setData({
      title: exam.title,
      shift: exam.shift || 'Morning',
      duration_minutes: exam.duration_minutes,
      passing_percentage: exam.passing_percentage,
      negative_marks_per_wrong: exam.negative_marks_per_wrong,
      status: exam.status,
      instructions: exam.instructions || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;
    editForm.put(`/hod/exams/${editingExam.id}`, {
      onSuccess: () => {
        setEditingExam(null);
      },
    });
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/hod/exams', {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  const handleToggleStatus = (exam: Examination) => {
    const nextStatus = exam.status === 'active' ? 'draft' : 'active';
    router.post(`/hod/exams/${exam.id}/status`, { status: nextStatus });
  };

  const handleDeleteExam = (exam: Examination) => {
    if (confirm(`Are you sure you want to delete entrance test '${exam.title}'? This action cannot be undone.`)) {
      router.delete(`/hod/exams/${exam.id}`);
    }
  };

  const handleCopyPin = (exam: Examination) => {
    const pin = exam.active_pin?.display_pin;
    if (!pin) {
      alert('No active PIN generated yet for this exam. Please click the PIN edit button to generate one.');
      return;
    }
    navigator.clipboard.writeText(pin);
    setCopiedPinId(exam.id);
    setTimeout(() => setCopiedPinId(null), 2500);
  };

  const handleRotateOrSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalExam) return;
    router.post(
      `/hod/exams/${pinModalExam.id}/pin`,
      {
        custom_pin: customPinInput || undefined,
        reason: customPinInput ? 'Custom PIN assigned by Admin' : 'Rotated by Administrator',
      },
      {
        onSuccess: () => {
          setPinModalExam(null);
          setCustomPinInput('');
        },
      }
    );
  };

  const handleShareWhatsApp = (exam: Examination) => {
    const pin = exam.active_pin?.display_pin || 'Pending';
    const text = encodeURIComponent(
      `*BCMT Entrance Examination Announcement*\n` +
      `Test: ${exam.title}\n` +
      `Program: ${exam.session_program?.program?.name || 'Allied Health'}\n` +
      `Shift: ${exam.shift || 'Morning'}\n` +
      `Duration: ${exam.duration_minutes} Minutes\n` +
      `Exam Hall PIN: *${pin}*\n\n` +
      `Candidates must report to campus examination hall with verification documents.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <HodLayout>
      <Head title="Admission Entrance Tests - BCMT HOD" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Admission Entrance Tests
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Manage Admission Entrance Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, configure, and monitor applicant entrance examinations.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Session Filter Switcher */}
          <div className="relative">
            <select
              value={String(selectedSessionId || 'all')}
              onChange={(e) => {
                router.get(
                  '/hod/exams',
                  { session_id: e.target.value },
                  { preserveState: true }
                );
              }}
              className="px-3.5 py-2.5 bg-white border border-slate-300 hover:border-[#07294D] text-slate-800 rounded-xl text-xs font-bold shadow-2xs focus:ring-2 focus:ring-[#07294D] focus:outline-none transition cursor-pointer"
            >
              <option value="all">All Admission Sessions ({stats.total_tests} Tests)</option>
              {sessions.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} ({s.code}) {s.is_active ? '• Active' : ''}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/hod/results"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <Award className="w-4 h-4 text-[#07294D]" /> Test Results
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFB606]" /> Create New Entrance Test
          </button>
        </div>
      </div>

      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Tests */}
        <div className="bg-gradient-to-br from-[#07294D] to-[#041D3C] text-white rounded-2xl p-5 shadow-sm border-b-4 border-[#FFB606] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB606] block">Total Tests</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono mt-1 block">{stats.total_tests}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <ListOrdered className="w-8 h-8 text-[#FFB606]" />
          </div>
        </div>

        {/* Card 2: Active Tests */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border-b-4 border-emerald-400 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">Active Tests</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono mt-1 block">{stats.active_tests}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Card 3: Eligible Examinees */}
        <div className="bg-gradient-to-br from-[#0A3663] to-[#07294D] text-white rounded-2xl p-5 shadow-sm border-b-4 border-[#FFB606] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB606] block">Eligible Examinees</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono mt-1 block">{stats.eligible_candidates ?? stats.total_questions ?? 0}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <UserCheck className="w-8 h-8 text-[#FFB606]" />
          </div>
        </div>

        {/* Card 4: Student Attempts */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl p-5 shadow-sm border-b-4 border-amber-400 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">Student Attempts</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono mt-1 block">{stats.student_attempts}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Entrance Tests Table (Matching Image 3 & 4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="p-4">Test Title</th>
                <th className="p-4">Course & Batch</th>
                <th className="p-4">Shift</th>
                <th className="p-4 text-center">Assessment Paper</th>
                <th className="p-4">Duration / Pass</th>
                <th className="p-4">Exam Hall PIN</th>
                <th className="p-4 text-center">Live Status</th>
                <th className="p-4 text-center">Attempts</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {examinations.map((exam) => {
                const pin = exam.active_pin?.display_pin;
                const questionsCount = exam.examination_questions_count ?? exam.total_questions;
                const isLive = exam.status === 'active';

                return (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition">
                    {/* Test Title */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{exam.title}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(exam.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {exam.exam_code}
                        </span>
                      </div>
                    </td>

                    {/* Course & Batch */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {exam.session_program?.program?.name || 'General Program'}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 mt-1">
                        <span>{formatSessionShort(exam.admission_session?.name || exam.admission_session?.code)}</span>
                      </div>
                    </td>

                    {/* Shift */}
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#07294D]/10 text-[#07294D] border border-[#07294D]/20">
                        {exam.shift || 'Morning'}
                      </span>
                    </td>

                    {/* Assessment Paper */}
                    <td className="p-4 text-center">
                      <Link
                        href={`/hod/exams/${exam.id}/questions`}
                        title="Click to view and configure examination paper"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Manage Paper</span>
                      </Link>
                    </td>

                    {/* Duration / Pass */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exam.duration_minutes} mins</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Pass: <strong className="text-slate-800">{exam.passing_percentage}%</strong>
                        {Number(exam.negative_marks_per_wrong) > 0 && (
                          <span className="text-rose-600 ml-1">(-{exam.negative_marks_per_wrong})</span>
                        )}
                      </div>
                    </td>

                    {/* Exam Hall PIN */}
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 bg-slate-900 text-amber-400 px-3 py-1.5 rounded-xl border border-slate-800 shadow-2xs font-mono font-bold text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span className="tracking-wider">{pin || 'NOT SET'}</span>

                        {pin && (
                          <button
                            onClick={() => handleCopyPin(exam)}
                            title="Copy PIN to clipboard"
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition ml-0.5 cursor-pointer"
                          >
                            {copiedPinId === exam.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setPinModalExam(exam);
                            setCustomPinInput('');
                          }}
                          title="Generate or edit PIN"
                          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Live Status + Start/Pause Toggle (Locked label removed, professional buttons) */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {isLive ? (
                          <>
                            <button
                              onClick={() => handleToggleStatus(exam)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer"
                            >
                              <Pause className="w-3.5 h-3.5" /> Pause Test
                            </button>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Live
                            </span>
                          </>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(exam)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-[#07294D] hover:bg-[#041D3C] text-white shadow-sm cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 text-[#FFB606]" /> Start Test
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Attempts */}
                    <td className="p-4 text-center">
                      <Link
                        href={`/hod/results?examination_id=${exam.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 transition"
                      >
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>{exam.attempts_count ?? 0} results</span>
                      </Link>
                    </td>

                    {/* Actions (WhatsApp Share removed) */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Questions Button */}
                        <Link
                          href={`/hod/exams/${exam.id}/questions`}
                          title="Manage Questions for this test"
                          className="px-3 py-1.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-[#FFB606]" />
                          <span>Questions</span>
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(exam)}
                          title="Edit Test Settings"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          title="Delete Entrance Test"
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {examinations.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500 font-sans">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No entrance examinations configured yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "+ Create New Entrance Test" above to configure tests.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Entrance Test */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">New Examination Protocol</span>
                <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">Create Entrance Examination</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Session</label>
                  <select
                    value={createForm.data.admission_session_id}
                    onChange={(e) => createForm.setData('admission_session_id', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Academic Program</label>
                  <select
                    value={createForm.data.session_program_id}
                    onChange={(e) => createForm.setData('session_program_id', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {sessionPrograms.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.program?.name} ({sp.program?.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Test Title (e.g. Pharmacy Category B)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BS ECT Entrance Test or Pharmacy Category B"
                    value={createForm.data.title}
                    onChange={(e) => createForm.setData('title', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shift</label>
                  <select
                    value={createForm.data.shift}
                    onChange={(e) => createForm.setData('shift', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={createForm.data.duration_minutes}
                    onChange={(e) => createForm.setData('duration_minutes', parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Passing Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={createForm.data.passing_percentage}
                    onChange={(e) => createForm.setData('passing_percentage', parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Negative Marking / Wrong</label>
                  <input
                    type="number"
                    step="0.05"
                    min={0}
                    max={2}
                    value={createForm.data.negative_marks_per_wrong}
                    onChange={(e) => createForm.setData('negative_marks_per_wrong', parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={createForm.data.instructions}
                  onChange={(e) => createForm.setData('instructions', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.processing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {createForm.processing ? 'Creating...' : 'Create Entrance Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Entrance Test */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#07294D] uppercase tracking-wider">Test Configuration</span>
                <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">Edit {editingExam.title}</h3>
              </div>
              <button onClick={() => setEditingExam(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  value={editForm.data.title}
                  onChange={(e) => editForm.setData('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shift</label>
                  <select
                    value={editForm.data.shift}
                    onChange={(e) => editForm.setData('shift', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={editForm.data.duration_minutes}
                    onChange={(e) => editForm.setData('duration_minutes', parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pass Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editForm.data.passing_percentage}
                    onChange={(e) => editForm.setData('passing_percentage', parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Negative Marking / Wrong</label>
                  <input
                    type="number"
                    step="0.05"
                    min={0}
                    max={2}
                    value={editForm.data.negative_marks_per_wrong}
                    onChange={(e) => editForm.setData('negative_marks_per_wrong', parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={editForm.data.status}
                  onChange={(e) => editForm.setData('status', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="draft">Draft (Locked)</option>
                  <option value="active">Active (Open for attempts)</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions</label>
                <textarea
                  rows={2}
                  value={editForm.data.instructions}
                  onChange={(e) => editForm.setData('instructions', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.processing}
                  className="px-6 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {editForm.processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Exam Hall PIN Generator / Custom PIN */}
      {pinModalExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Configure Exam Hall PIN</h3>
              </div>
              <button onClick={() => setPinModalExam(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-slate-900 text-white rounded-2xl text-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Current Active PIN</span>
              <div className="text-3xl font-black font-mono text-amber-400 mt-1">
                {pinModalExam.active_pin?.display_pin || 'NOT GENERATED'}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Encrypted with Argon2id + Campus Secret Key
              </span>
            </div>

            <form onSubmit={handleRotateOrSetPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign Custom PIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate random 4-digit PIN"
                  value={customPinInput}
                  onChange={(e) => setCustomPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If empty, a secure 4-digit PIN will be automatically generated.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalExam(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {customPinInput ? 'Set Custom PIN' : 'Generate New PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HodLayout>
  );
}

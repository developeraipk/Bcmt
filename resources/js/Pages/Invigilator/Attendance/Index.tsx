import React, { useState, useEffect } from 'react';
import InvigilatorLayout from '@/Layouts/InvigilatorLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  Search,
  Building,
  ShieldCheck,
  Users,
  CheckCheck
} from 'lucide-react';

interface Candidate {
  id: number;
  application_number: string;
  roll_number: string;
  student_name: string;
  father_name: string;
  cnic: string;
  gender: string;
  attendance_status: string;
  room_number: string | null;
  seat_number: string | null;
  verified_at: string | null;
}

interface Props {
  activeExams: any[];
  selectedExam: any;
  candidates: Candidate[];
}

export default function AttendanceIndex({ activeExams, selectedExam, candidates }: Props) {
  const [search, setSearch] = useState('');
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [candidateList, setCandidateList] = useState<Candidate[]>(candidates || []);

  useEffect(() => {
    setCandidateList(candidates || []);
  }, [candidates]);

  // Form for marking physical candidate attendance
  const markForm = useForm({
    examination_id: selectedExam?.id || '',
    application_id: '',
    status: 'present',
    room_number: 'Hall 1',
    seat_number: '',
    remarks: '',
  });

  const filteredCandidates = candidateList.filter(
    (c) =>
      c.student_name.toLowerCase().includes(search.toLowerCase()) ||
      c.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.cnic?.includes(search)
  );

  const presentCount = candidateList.filter((c) => c.attendance_status === 'present').length;
  const absentCount = candidateList.filter((c) => c.attendance_status === 'absent').length;
  const unmarkedCount = candidateList.filter((c) => c.attendance_status === 'unmarked').length;

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.get('/invigilator/dashboard', { examination_id: e.target.value }, { preserveState: true });
  };

  const handleOpenMarkModal = (candidate: Candidate) => {
    setActiveCandidate(candidate);
    markForm.setData({
      examination_id: selectedExam?.id || '',
      application_id: String(candidate.id),
      status: candidate.attendance_status === 'unmarked' ? 'present' : candidate.attendance_status,
      room_number: candidate.room_number || 'Hall 1',
      seat_number: candidate.seat_number || '',
      remarks: '',
    });
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const cId = Number(markForm.data.application_id);
    const status = markForm.data.status;

    // Optimistic instantaneous UI update
    setCandidateList(prev => prev.map(c => c.id === cId ? {
      ...c,
      attendance_status: status,
      room_number: markForm.data.room_number,
      seat_number: markForm.data.seat_number,
      verified_at: 'Just now'
    } : c));
    setActiveCandidate(null);

    markForm.post('/invigilator/attendance/mark', {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const handleMarkAllPresent = () => {
    if (!selectedExam) return;
    const progTitle = selectedExam.session_program?.program?.name || selectedExam.title;
    if (!confirm(`Are you sure you want to mark ALL candidates present for ${progTitle}?`)) {
      return;
    }

    // Optimistic instantaneous UI update for entire room
    setCandidateList(prev => prev.map(c => ({
      ...c,
      attendance_status: 'present',
      verified_at: 'Just now'
    })));

    router.post('/invigilator/attendance/mark-all-present', {
      examination_id: selectedExam.id
    }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const handleQuickMark = (candidateId: number, status: 'present' | 'absent') => {
    if (!selectedExam) return;

    // Optimistic instantaneous UI update for clicked candidate
    setCandidateList(prev => prev.map(c => c.id === candidateId ? {
      ...c,
      attendance_status: status,
      verified_at: 'Just now'
    } : c));

    router.post('/invigilator/attendance/quick-mark', {
      examination_id: selectedExam.id,
      application_id: candidateId,
      status: status
    }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return (
    <InvigilatorLayout>
      <Head title="Campus Invigilation & Physical Attendance - BCMT" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-800">
            Campus Invigilation Gate
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Examination Room Attendance Verification
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Physically verify candidate admit cards and identity before test PIN entry is unlocked.
          </p>
        </div>

        {/* Exam Selector */}
        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs shrink-0">
          <select
            value={selectedExam?.id || ''}
            onChange={handleExamChange}
            aria-label="Select Examination"
            className="text-xs font-semibold text-stone-800 bg-transparent border-0 cursor-pointer"
          >
            {activeExams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.session_program?.program?.code} — {exam.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedExam ? (
        <>
          {/* Chief Invigilator PIN & Room Summary Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                  Active Examination Room
                </span>
                <span className="text-emerald-200 text-xs font-mono font-bold">
                  {selectedExam.session_program?.program?.name}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold">{selectedExam.title}</h2>
              <p className="text-xs text-emerald-200 mt-1">
                Duration: {selectedExam.duration_minutes} Mins • Total Marks: {selectedExam.total_marks}
              </p>
            </div>

            {/* Common PIN Display for Room Invigilator */}
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 text-center shrink-0">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block">
                Hall Common PIN
              </span>
              <div className="text-3xl font-mono font-black text-amber-300 tracking-widest mt-0.5">
                {selectedExam.active_pin?.display_pin || 'NO PIN'}
              </div>
              <span className="text-[10px] text-emerald-300 block mt-1">
                Announce to seated candidates
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Eligible Roster</span>
              <span className="text-2xl font-black text-stone-900">{candidates.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Present in Room</span>
              <span className="text-2xl font-black text-emerald-700">{presentCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Unmarked</span>
              <span className="text-2xl font-black text-amber-700">{unmarkedCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-rose-700 font-bold uppercase block">Absent / Disqualified</span>
              <span className="text-2xl font-black text-rose-700">{absentCount}</span>
            </div>
          </div>

          {/* Candidate Search and Bulk Room Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="bg-white p-3.5 px-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3 flex-1">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter by Candidate Name, Roll Number, or CNIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 text-xs focus:ring-0 text-stone-800 placeholder-stone-400"
              />
            </div>

            <button
              type="button"
              onClick={handleMarkAllPresent}
              disabled={candidates.length === 0 || (unmarkedCount === 0 && absentCount === 0)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-emerald-200" />
              <span>Mark All Present in this Room ({candidates.length})</span>
            </button>
          </div>

          {/* Attendance Roster Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Candidate Full Name</th>
                    <th className="p-4">CNIC / B-Form</th>
                    <th className="p-4 text-center">Gender</th>
                    <th className="p-4 text-center">Hall & Desk</th>
                    <th className="p-4 text-center">Physical Attendance</th>
                    <th className="p-4 text-right">Quick Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-mono font-black text-base text-[#07294D]">
                        {c.roll_number}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-stone-900 block">{c.student_name}</span>
                        <span className="text-stone-500 text-[11px]">S/D of {c.father_name}</span>
                      </td>
                      <td className="p-4 font-mono text-stone-700">
                        {c.cnic}
                      </td>
                      <td className="p-4 text-center capitalize font-semibold text-stone-600">
                        {c.gender}
                      </td>
                      <td className="p-4 text-center font-semibold text-stone-800">
                        {c.room_number ? (
                          <span>{c.room_number} {c.seat_number ? `(Seat ${c.seat_number})` : ''}</span>
                        ) : (
                          <span className="text-stone-400">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.attendance_status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.attendance_status === 'absent'
                            ? 'bg-rose-100 text-rose-800'
                            : c.attendance_status === 'disqualified'
                            ? 'bg-stone-900 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.attendance_status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                          {c.attendance_status === 'absent' && <XCircle className="w-3 h-3" />}
                          {c.attendance_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickMark(c.id, 'present')}
                            title="Instant Mark Present"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              c.attendance_status === 'present'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickMark(c.id, 'absent')}
                            title="Instant Mark Absent"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              c.attendance_status === 'absent'
                                ? 'bg-rose-700 text-white shadow-xs'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenMarkModal(c)}
                            title="Detailed Desk & Remarks"
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-500">
                        No candidates match the specified filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-500">
          No active examinations found for invigilation.
        </div>
      )}

      {/* Attendance Marking Modal */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Mark Room Attendance: {activeCandidate.student_name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Roll No: <strong className="font-mono text-[#07294D]">{activeCandidate.roll_number}</strong> • CNIC: {activeCandidate.cnic}
            </p>

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Attendance Status
                </label>
                <select
                  value={markForm.data.status}
                  onChange={(e) => markForm.setData('status', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
                >
                  <option value="present">Present (Physically Seated in Room)</option>
                  <option value="absent">Absent</option>
                  <option value="disqualified">Disqualified (Unfair Means / Bylaw Violation)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Room / Hall
                  </label>
                  <input
                    type="text"
                    required
                    value={markForm.data.room_number}
                    onChange={(e) => markForm.setData('room_number', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Desk / Seat #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. D-14"
                    value={markForm.data.seat_number}
                    onChange={(e) => markForm.setData('seat_number', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Invigilator Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified with original CNIC."
                  value={markForm.data.remarks}
                  onChange={(e) => markForm.setData('remarks', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCandidate(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={markForm.processing}
                  className="flex-1 py-2 bg-[#07294D] hover:bg-[#0c3966] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Confirm Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </InvigilatorLayout>
  );
}


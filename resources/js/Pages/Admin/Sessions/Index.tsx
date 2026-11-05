import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Sliders,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface SessionItem {
  id: number;
  name: string;
  code: string;
  start_date: string;
  closing_date: string;
  closing_time?: string;
  closing_datetime?: string;
  closing_datetime_formatted?: string;
  time_remaining?: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  is_active: boolean;
  is_open?: boolean;
  is_expired?: boolean;
  applications_count: number;
  session_programs_count: number;
}

interface Props {
  sessions: SessionItem[];
  activeSession?: SessionItem | null;
}

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  try {
    const cleanStr = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return cleanStr;
  } catch {
    return String(dateStr).substring(0, 10);
  }
}

export default function SessionsIndex({ sessions = [], activeSession }: Props) {
  // Deadline quick edit modal state
  const [editingDeadlineSession, setEditingDeadlineSession] = useState<SessionItem | null>(null);
  const [newCloseDate, setNewCloseDate] = useState<string>('');
  const [newCloseTime, setNewCloseTime] = useState<string>('23:59');

  const handleDelete = (session: SessionItem) => {
    if (confirm(`Are you sure you want to delete admission session "${session.name}"?`)) {
      router.delete(`/admin/sessions/${session.id}`, {
        preserveScroll: true,
      });
    }
  };

  const handleToggleStatus = (session: SessionItem) => {
    const actionLabel = session.status === 'open' ? 'CLOSE and suspend online applications' : 'OPEN for online applications';
    if (confirm(`Do you want to ${actionLabel} for "${session.name}"?`)) {
      router.post(`/admin/sessions/${session.id}/toggle-status`, {}, {
        preserveScroll: true,
      });
    }
  };

  const openDeadlineModal = (session: SessionItem) => {
    setEditingDeadlineSession(session);
    setNewCloseDate(String(session.closing_date).split('T')[0]);
    setNewCloseTime(session.closing_time ? String(session.closing_time).substring(0, 5) : '23:59');
  };

  const submitDeadlineChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeadlineSession) return;

    router.post(`/admin/sessions/${editingDeadlineSession.id}/deadline`, {
      closing_date: newCloseDate,
      closing_time: newCloseTime,
    }, {
      preserveScroll: true,
      onSuccess: () => setEditingDeadlineSession(null),
    });
  };

  return (
    <AdminLayout>
      <Head title="Admission Sessions & Application Control - BCMT Admin" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Portal Control &amp; Intake Cycles
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Academic Admission Sessions &amp; Portal Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Open or close candidate admissions instantly, configure exact deadlines, and allocate program quotas.
          </p>
        </div>

        <Link
          href={route('admin.sessions.create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#FFB606]" /> New Admission Session
        </Link>
      </div>

      {/* MASTER ADMISSIONS CONTROLLER PANEL (Exact Answer to User Request) */}
      {activeSession && (
        <div className="mb-8 bg-gradient-to-br from-[#07294D] to-[#041D3C] text-white rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-[#FFB606] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Active Session Status & Expiration Clock */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFB606] bg-white/10 px-3 py-1 rounded-full">
                  Current Active Academic Cycle
                </span>

                {/* Live Status Badge */}
                {activeSession.is_open ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ONLINE &amp; ACCEPTING APPLICATIONS
                  </span>
                ) : activeSession.is_expired ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    DEADLINE EXPIRED (PORTAL CLOSED)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-900 shadow-xs">
                    <Lock className="w-3.5 h-3.5" />
                    PORTAL MANUALLY CLOSED BY ADMIN
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
                  {activeSession.name} <span className="text-[#FFB606] font-mono text-base sm:text-lg">({activeSession.code})</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {activeSession.is_open
                    ? 'Candidates can currently access the admission form and submit applications. Registrations will automatically shut down as soon as the closing deadline clock expires.'
                    : activeSession.is_expired
                    ? `The closing deadline ended on ${activeSession.closing_datetime_formatted}. Candidates visiting the portal cannot submit new applications.`
                    : 'Admissions are temporarily suspended. Candidates visiting the website are shown that the application portal is currently closed.'}
                </p>
              </div>

              {/* Exact Deadline Info & Time Remaining */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                  <Clock className="w-4 h-4 text-[#FFB606]" />
                  <span>
                    Deadline: <strong className="text-white font-mono">{activeSession.closing_datetime_formatted}</strong>
                  </span>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
                  activeSession.is_open
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                }`}>
                  {activeSession.time_remaining}
                </div>
              </div>
            </div>

            {/* Right: Master One-Click Control Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
              {/* Primary Instant Toggle Button */}
              {activeSession.status === 'open' ? (
                <button
                  type="button"
                  onClick={() => handleToggleStatus(activeSession)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-rose-400/40"
                >
                  <Lock className="w-4 h-4" />
                  <span>Close Admissions Now (Stop Apply)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleStatus(activeSession)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-300/40"
                >
                  <Unlock className="w-4 h-4 text-[#FFB606]" />
                  <span>Open Admissions Now (Start Apply)</span>
                </button>
              )}

              {/* Quick Adjust Deadline Button */}
              <button
                type="button"
                onClick={() => openDeadlineModal(activeSession)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#FFB606]" />
                <span>Adjust Closing Date &amp; Time</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Deadline Adjustment Modal */}
      {editingDeadlineSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#07294D]" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Set Application Closing Date &amp; Time
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDeadlineSession(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Define the exact closing date and time for <strong>{editingDeadlineSession.name}</strong>. The application portal will automatically and immediately lock when this timestamp passes.
            </p>

            <form onSubmit={submitDeadlineChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Closing Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newCloseDate}
                  onChange={(e) => setNewCloseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Closing Time (Exact Deadline) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={newCloseTime}
                  onChange={(e) => setNewCloseTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewCloseTime('23:59')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      newCloseTime === '23:59'
                        ? 'bg-[#07294D] text-[#FFB606] border-[#07294D]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    11:59 PM (Midnight End)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCloseTime('17:00')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      newCloseTime === '17:00'
                        ? 'bg-[#07294D] text-[#FFB606] border-[#07294D]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    05:00 PM (Office Close)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCloseTime('12:00')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      newCloseTime === '12:00'
                        ? 'bg-[#07294D] text-[#FFB606] border-[#07294D]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    12:00 PM (Noon)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingDeadlineSession(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#FFB606]" /> Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            All Academic Cycles ({sessions.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Toggle admissions or update quotas per cycle
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-4">Session &amp; Code</th>
                <th className="p-4">Timeline &amp; Exact Deadline</th>
                <th className="p-4 text-center">Active Status</th>
                <th className="p-4 text-center">Admissions Status</th>
                <th className="p-4 text-center">Programs</th>
                <th className="p-4 text-center">Applications</th>
                <th className="p-4 text-right">Instant Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  {/* Session Name & Code */}
                  <td className="p-4">
                    <span className="font-bold text-slate-900 text-sm block">{s.name}</span>
                    <span className="font-mono text-slate-400 text-xs font-semibold">{s.code}</span>
                  </td>

                  {/* Timeline & Exact Deadline */}
                  <td className="p-4 text-xs">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 w-12">Start:</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {formatDisplayDate(s.start_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 w-12">Close:</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                        {formatDisplayDate(s.closing_date)} • {s.closing_time ? String(s.closing_time).substring(0, 5) : '23:59'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDeadlineModal(s)}
                        title="Edit deadline and closing time"
                        className="p-1 text-slate-400 hover:text-[#07294D] hover:bg-slate-200 rounded transition cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Live Expiration Tag */}
                    <div>
                      {s.is_open ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Open: {s.time_remaining}
                        </span>
                      ) : s.is_expired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Deadline Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-500" /> Portal Suspended
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Active Status */}
                  <td className="p-4 text-center">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> CURRENT ACTIVE
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Inactive</span>
                    )}
                  </td>

                  {/* Admissions Status with One-Click Toggle */}
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(s)}
                      title={s.status === 'open' ? 'Click to close admissions immediately' : 'Click to open admissions'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer border ${
                        s.status === 'open'
                          ? 'bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border-emerald-300 hover:border-rose-300'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-300 hover:border-emerald-300'
                      }`}
                    >
                      {s.status === 'open' ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Open (Click to Close)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Closed (Click to Open)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Programs */}
                  <td className="p-4 text-center font-bold text-slate-800">
                    {s.session_programs_count} Programs
                  </td>

                  {/* Applications */}
                  <td className="p-4 text-center font-bold text-[#07294D] text-sm">
                    {s.applications_count}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link
                        href={`/admin/sessions/${s.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(s)}
                        title="Delete this admission session"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-xs transition border border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

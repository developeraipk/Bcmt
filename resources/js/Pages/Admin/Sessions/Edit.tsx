import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  code: string;
  category: string;
  duration_years: number;
}

interface Props {
  session: any;
  programs?: Program[];
}

export default function SessionsEdit({ session, programs = [] }: Props) {
  // Build initial seat allocations mapping: program_id -> seats
  const initialSeats: Record<number, number> = {};
  
  // 1. From existing session programs
  if (session.session_programs && Array.isArray(session.session_programs)) {
    session.session_programs.forEach((sp: any) => {
      initialSeats[sp.program_id] = Number(sp.total_seats);
    });
  }

  // 2. From all active programs fallback
  if (programs && Array.isArray(programs)) {
    programs.forEach((p) => {
      if (initialSeats[p.id] === undefined) {
        initialSeats[p.id] = (p as any).seats || 10;
      }
    });
  }

  // Combine program list: ensure every program in session.session_programs is represented
  const allPrograms: Program[] = [...programs];
  if (session.session_programs && Array.isArray(session.session_programs)) {
    session.session_programs.forEach((sp: any) => {
      if (sp.program && !allPrograms.some((p) => p.id === sp.program.id)) {
        allPrograms.push(sp.program);
      }
    });
  }

  const { data, setData, put, processing, errors } = useForm({
    name: session.name || '',
    status: session.status || 'open',
    start_date: session.start_date ? String(session.start_date).split('T')[0] : '',
    closing_date: session.closing_date ? String(session.closing_date).split('T')[0] : '',
    is_active: Boolean(session.is_active),
    admission_instructions: session.admission_instructions || '',
    program_seats: initialSeats,
  });

  const handleSeatChange = (programId: number, val: string) => {
    const seats = Math.max(0, parseInt(val, 10) || 0);
    setData('program_seats', {
      ...data.program_seats,
      [programId]: seats,
    });
  };

  const totalSeats = Object.values(data.program_seats).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/sessions/${session.id}`);
  };

  return (
    <AdminLayout>
      <Head title={`Edit Session - ${session.name} - BCMT Admin`} />

      <div className="max-w-4xl mx-auto py-6">
        <Link
          href="/admin/sessions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admission Sessions
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold text-[#07294D] uppercase tracking-wider bg-[#07294D]/10 px-3 py-1 rounded-full">
                Session Configuration
              </span>
              <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
                Edit {session.name}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {session.code}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Cohort Intake Capacity
              </span>
              <span className="text-2xl font-black font-mono text-[#07294D]">
                {totalSeats} <span className="text-xs font-bold text-slate-500">Seats</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
                {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lifecycle Status
                </label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                >
                  <option value="draft">Draft (Preparing)</option>
                  <option value="open">Open (Accepting Applications)</option>
                  <option value="closed">Closed (Submissions Suspended)</option>
                  <option value="archived">Archived (Completed Cycle)</option>
                </select>
                {errors.status && <p className="text-rose-600 text-xs mt-1">{errors.status}</p>}
              </div>

              <div className="pt-2 sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="w-4 h-4 rounded text-[#07294D] focus:ring-[#07294D] border-slate-300"
                  />
                  <span>Designate as System Active Session</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  When active, candidate applications and live public programs catalog dynamically draw from this session's seat capacity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Portal Opening Date
                </label>
                <input
                  type="date"
                  required
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
                {errors.start_date && <p className="text-rose-600 text-xs mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Submission Closing Date
                </label>
                <input
                  type="date"
                  required
                  value={data.closing_date}
                  onChange={(e) => setData('closing_date', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
                {errors.closing_date && <p className="text-rose-600 text-xs mt-1">{errors.closing_date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Admission Instructions
              </label>
              <textarea
                rows={3}
                value={data.admission_instructions}
                onChange={(e) => setData('admission_instructions', e.target.value)}
                placeholder="Instructions displayed to applicants regarding entry criteria, fee payment or document verification."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-none"
              />
            </div>

            {/* Dynamic Program Seat Allocations Grid */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#07294D]" /> Program Seat Capacities (Dynamic Intake)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure authorized seat numbers for each program. Changes automatically update the application forms, public catalog, and seat allocation engine.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {allPrograms.map((prog) => {
                  const currentSeats = data.program_seats[prog.id] ?? 0;
                  return (
                    <div
                      key={prog.id}
                      className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#07294D] bg-[#07294D]/10 px-2 py-0.5 rounded">
                          {prog.code}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {prog.category?.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1" title={prog.name}>
                        {prog.name}
                      </h4>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-3">
                        <label
                          htmlFor={`seats-${prog.id}`}
                          className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        >
                          Authorized Seats:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id={`seats-${prog.id}`}
                            type="number"
                            min={0}
                            max={500}
                            value={currentSeats}
                            onChange={(e) => handleSeatChange(prog.id, e.target.value)}
                            className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/sessions"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#FFB606]" />
                {processing ? 'Saving...' : 'Save & Propagate Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

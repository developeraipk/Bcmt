import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Calendar, ArrowLeft, PlusCircle, CheckCircle2, AlertTriangle, Building2, Sparkles } from 'lucide-react';
import route from '@/route';

interface Program {
  id: number;
  name: string;
  code?: string;
  category?: string;
  duration_years?: number;
}

interface Props {
  programs?: Program[];
}

export default function SessionsCreate({ programs = [] }: Props) {
  const safePrograms: Program[] = Array.isArray(programs) ? programs : [];
  
  // Safe initial seat allocations matching official intake quotas
  const initialSeats: Record<number, number> = {};
  safePrograms.forEach((p) => {
    if (!p) return;
    const c = String(p.code || '').replace(/[^A-Za-z]/g, '').toUpperCase();
    if (c === 'BSECT') initialSeats[p.id] = 20;
    else if (c === 'BSMLT') initialSeats[p.id] = 30;
    else if (c === 'PCB' || c === 'PHARMB') initialSeats[p.id] = 50;
    else if (c === 'HT' || c === 'DIPHT') initialSeats[p.id] = 20;
    else if (c === 'PATH' || c === 'DIPPATH') initialSeats[p.id] = 10;
    else if (c === 'SURG' || c === 'DIPSURG') initialSeats[p.id] = 5;
    else if (c === 'ANES' || c === 'DIPANES') initialSeats[p.id] = 5;
    else if (c === 'PHARMA' || c === 'DIPPHARM') initialSeats[p.id] = 5;
    else if (c === 'RADIO' || c === 'DIPRAD') initialSeats[p.id] = 5;
    else initialSeats[p.id] = 10;
  });

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 60);

  const defaultStart = today.toISOString().split('T')[0];
  const defaultClose = futureDate.toISOString().split('T')[0];

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    code: '',
    start_date: defaultStart,
    closing_date: defaultClose,
    closing_time: '23:59',
    is_active: true,
    admission_instructions: 'Admissions are open on open merit. Candidates must submit complete matric/intermediate credentials.',
    program_seats: initialSeats,
  });

  const handleNameChange = (val: string) => {
    setData((prev) => {
      const match = val.match(/\d{4}(?:[-/]\d{2,4})?/);
      const suggestedCode = match ? match[0].replace('/', '-') : '';
      return {
        ...prev,
        name: val,
        code: prev.code ? prev.code : suggestedCode,
      };
    });
  };

  const handleSeatChange = (programId: number, val: string) => {
    const seats = parseInt(val, 10) || 0;
    setData('program_seats', {
      ...(data.program_seats || {}),
      [programId]: seats,
    });
  };

  const totalSeats = Object.values(data.program_seats || {}).reduce((sum, n) => sum + Number(n || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/sessions');
  };

  const safeErrors = errors || {};

  return (
    <AdminLayout>
      <Head title="Create Admission Session - BCMT Admin" />

      <div className="max-w-4xl mx-auto py-6">
        <Link
          href={route('admin.sessions.index')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admission Sessions
        </Link>

        {/* Global Validation Error Banner */}
        {Object.keys(safeErrors).length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs mb-6 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1 text-sm">Please resolve the following before saving:</strong>
              <ul className="list-disc pl-4 space-y-0.5">
                {Object.entries(safeErrors).map(([field, msg]) => (
                  <li key={field}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#07294D] uppercase tracking-wider bg-[#07294D]/10 px-3 py-1 rounded-full">
                New Academic Cycle
              </span>
              <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
                Configure Admission Session
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Establish an official academic term, application deadlines, and program seat quotas.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left sm:text-right shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Cohort Intake</span>
              <span className="text-2xl font-black font-mono text-[#07294D]">
                {totalSeats} <span className="text-xs font-bold text-slate-500">Seats</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Session Name (e.g. Admission Session 2027-2028) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admission Session 2027-2028"
                  value={data.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-hidden"
                />
                {safeErrors.name && <p className="text-rose-600 text-xs mt-1">{safeErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Session Code (e.g. 2027-2028) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027-2028"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-hidden font-mono"
                />
                {safeErrors.code && <p className="text-rose-600 text-xs mt-1">{safeErrors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Portal Opening Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-hidden"
                />
                {safeErrors.start_date && <p className="text-rose-600 text-xs mt-1">{safeErrors.start_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Submission Closing Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={data.closing_date}
                  onChange={(e) => setData('closing_date', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-hidden"
                />
                {safeErrors.closing_date && <p className="text-rose-600 text-xs mt-1">{safeErrors.closing_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deadline End Time (Closing Clock) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={data.closing_time}
                  onChange={(e) => setData('closing_time', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#07294D] focus:outline-hidden font-mono font-bold"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setData('closing_time', '23:59')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                      data.closing_time === '23:59'
                        ? 'bg-[#07294D] text-[#FFB606] border-[#07294D]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    11:59 PM (Midnight End)
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('closing_time', '17:00')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                      data.closing_time === '17:00'
                        ? 'bg-[#07294D] text-[#FFB606] border-[#07294D]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    05:00 PM (Office Close)
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('closing_time', '12:00')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                      data.closing_time === '12:00'
                        ? 'bg-[#07294D] text-[#FFB606] border-[#07294D]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    12:00 PM (Noon)
                  </button>
                </div>
                {safeErrors.closing_time && <p className="text-rose-600 text-xs mt-1">{safeErrors.closing_time}</p>}
                <p className="text-[11px] text-slate-500 mt-1">
                  Once this exact date and time passes, candidate registration will immediately and automatically shut down.
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="w-4 h-4 rounded text-[#07294D] focus:ring-[#07294D] border-slate-300"
                />
                <span>Set as Current Active Admission Session for Candidate Applications</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Admission Instructions (Publicly Displayed on Portal)
              </label>
              <textarea
                rows={3}
                value={data.admission_instructions}
                onChange={(e) => setData('admission_instructions', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#07294D] focus:outline-hidden"
              />
            </div>

            {/* Program Seats Allocation Grid */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Approved Program Seat Allocations</h3>
              <p className="text-xs text-slate-500 mb-4">
                Define the authorized student intake capacity for each degree and diploma program.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {safePrograms.map((prog) => (
                  <div key={prog.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 text-xs block truncate">{prog.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      {prog.code || 'CODE'} • {prog.category || 'Diploma'}
                    </span>
                    <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-semibold text-slate-600">Approved Seats:</span>
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={data.program_seats?.[prog.id] ?? 0}
                        onChange={(e) => handleSeatChange(prog.id, e.target.value)}
                        className="w-24 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#07294D] text-right font-mono"
                      />
                    </div>
                  </div>
                ))}

                {safePrograms.length === 0 && (
                  <div className="col-span-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-xs">
                    No active academic programs found. You can configure program seats after activating programs.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link
                href={route('admin.sessions.index')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#FFB606]" />
                {processing ? 'Creating Session...' : 'Save & Publish Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

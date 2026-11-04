import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
  Armchair,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Plus,
  X,
  Info,
  Trash2,
  Sparkles,
  Award,
} from 'lucide-react';

interface Allocation {
  id: number;
  seat_number: number;
  status: string;
  application_number: string;
  student_name: string;
  gender: string;
  reservation_expires_at: string | null;
  confirmed_at: string | null;
  released_at?: string | null;
  release_reason?: string | null;
}

interface RankedCandidate {
  rank: number;
  application_id: number;
  application_number: string;
  roll_number?: string;
  student_name: string;
  gender: string;
  domicile: string;
  matric_percentage: number;
  inter_percentage: number;
  test_percentage: number;
  test_marks: number;
  aggregate_percentage: number;
  exam_status: string;
  selection_status: string;
  seat_allocation: {
    id: number;
    seat_number: number;
    status: string;
    reservation_expires_at?: string;
    confirmed_at?: string;
  } | null;
}

interface SessionProgram {
  id: number;
  program_name: string;
  program_code: string;
  category: string;
  total_seats: number;
  reserved_count: number;
  confirmed_count: number;
  available_seats: number;
  allocations: Allocation[];
  ranked_candidates?: RankedCandidate[];
}

interface EligibleCandidate {
  id: number;
  application_number: string;
  roll_number?: string;
  student_name: string;
  session_program_id: number;
  program_name: string;
}

interface Props {
  sessions: any[];
  selectedSessionId: number;
  sessionPrograms: SessionProgram[];
  eligibleCandidates?: EligibleCandidate[];
}

export default function SeatAllocationIndex({
  sessions,
  selectedSessionId,
  sessionPrograms,
  eligibleCandidates = [],
}: Props) {
  const [selectedProgId, setSelectedProgId] = useState<number>(sessionPrograms[0]?.id || 0);
  const [releaseModalAlloc, setReleaseModalAlloc] = useState<Allocation | null>(null);
  const [releaseReason, setReleaseReason] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);

  const currentProgram = sessionPrograms.find((sp) => sp.id === selectedProgId) || sessionPrograms[0];

  const reserveForm = useForm({
    application_id: '',
  });

  // Filter eligible candidates for current selected program
  const candidatesForCurrentProgram = eligibleCandidates.filter(
    (c) => c.session_program_id === currentProgram?.id
  );

  const handleConfirmSeat = (allocationId: number) => {
    if (confirm('Confirm this candidate seat? This marks their admission fee and document submission as formally verified.')) {
      router.post(`/admin/seat-allocation/confirm/${allocationId}`);
    }
  };

  const handleReleaseSeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalAlloc) return;
    router.post(
      `/admin/seat-allocation/release/${releaseModalAlloc.id}`,
      {
        reason: releaseReason,
      },
      {
        onSuccess: () => {
          setReleaseModalAlloc(null);
          setReleaseReason('');
        },
      }
    );
  };

  const handleQuickReserveCandidate = (applicationId: number, name: string) => {
    if (confirm(`Extend an official 5-day admission offer and reserve seat for '${name}'?`)) {
      router.post('/admin/seat-allocation/reserve-candidate', {
        application_id: applicationId,
      });
    }
  };

  const handleDeleteAllocation = (allocationId: number, name: string) => {
    if (confirm(`Permanently delete seat allocation record for '${name}'?`)) {
      router.delete(`/admin/seat-allocation/${allocationId}`);
    }
  };

  const handleUnreleaseSeat = (allocationId: number, name: string) => {
    if (
      confirm(
        `Reinstate candidate '${name}' back to reserved status? This will give them a fresh 5-day window to confirm admission.`
      )
    ) {
      router.post(`/admin/seat-allocation/unrelease/${allocationId}`);
    }
  };

  const handleManualReserve = (e: React.FormEvent) => {
    e.preventDefault();
    reserveForm.post('/admin/seat-allocation/reserve-candidate', {
      onSuccess: () => {
        setShowReserveModal(false);
        reserveForm.reset();
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="Seat Allocation Engine - BCMT Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Admissions State Machine
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Seat Allocation Engine
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track confirmed admissions, reserved merit offers, and automatic waiting-list promotion.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Offer / Reserve Seat CTA */}
          <button
            onClick={() => setShowReserveModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFB606]" />
            <span>Offer / Reserve Seat</span>
          </button>

          {/* Session Selector */}
          <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
            <select
              value={selectedSessionId}
              onChange={(e) => router.get('/admin/seat-allocation', { session_id: e.target.value })}
              aria-label="Filter by Admission Session"
              className="text-xs font-semibold text-stone-800 bg-transparent border-0 cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Guide Banner: How Reserved vs Confirmed works */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-[#07294D]">
        <Info className="w-5 h-5 text-[#07294D] shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p className="font-bold">
            Admission Lifecycle &amp; Seating Architecture:
          </p>
          <p className="text-stone-700">
            <strong>1. Reserved (Offer Extended):</strong> When a merit list is published or manual offer is made, a seat is temporarily <strong>Reserved</strong> for 5 days.
            <br />
            <strong>2. Confirmed (Fee Paid):</strong> When the candidate submits admission fee and original DMCs, click <strong>&quot;Confirm Seat&quot;</strong> to lock their final admission.
            <br />
            <strong>3. Waiting List Promotion:</strong> If a reservation lapses or is released, the engine automatically promotes the next eligible waiting-list candidate.
          </p>
        </div>
      </div>

      {/* Program Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {sessionPrograms.map((sp) => {
          const isSelected = sp.id === currentProgram?.id;
          return (
            <button
              key={sp.id}
              onClick={() => setSelectedProgId(sp.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#07294D] text-[#FFB606] border-[#07294D] shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {sp.program_code} ({sp.confirmed_count + sp.reserved_count}/{sp.total_seats})
            </button>
          );
        })}
      </div>

      {currentProgram && (
        <>
          {/* Program Capacity Summary Banner */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-[#07294D] uppercase">{currentProgram.category}</span>
                <h2 className="text-xl font-bold text-stone-900">{currentProgram.program_name}</h2>
              </div>
              <div className="flex gap-3 text-center text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 min-w-[80px]">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Seats</span>
                  <span className="text-lg font-bold text-stone-900">{currentProgram.total_seats}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 min-w-[80px]">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Confirmed</span>
                  <span className="text-lg font-bold text-emerald-800">{currentProgram.confirmed_count}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 min-w-[80px]">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">Reserved</span>
                  <span className="text-lg font-bold text-amber-800">{currentProgram.reserved_count}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 min-w-[80px]">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Available</span>
                  <span className="text-lg font-bold text-[#07294D]">{currentProgram.available_seats}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Dynamic Merit Candidate Rankings & Direct Seat Offers */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-6">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFB606]" />
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    Dynamic Merit Rankings & Admission Offers
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Candidates ranked automatically by active academic &amp; entrance test formula. Extend 5-day reserved seat offers directly from this table.
                </p>
              </div>
              <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 shrink-0">
                Ranked Candidates: <strong className="text-[#07294D]">{currentProgram.ranked_candidates?.length || 0}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Candidate &amp; Roll #</th>
                    <th className="p-4">Academic Marks</th>
                    <th className="p-4">Test Marks</th>
                    <th className="p-4 text-center">Dynamic Merit</th>
                    <th className="p-4 text-center">Gender / Domicile</th>
                    <th className="p-4 text-center">Seat Offer Status</th>
                    <th className="p-4 text-right">Offer Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {currentProgram.ranked_candidates && currentProgram.ranked_candidates.length > 0 ? (
                    currentProgram.ranked_candidates.map((cand) => {
                      const isAllocated = !!cand.seat_allocation;
                      const allocStatus = cand.seat_allocation?.status;
                      return (
                        <tr key={cand.application_id} className="hover:bg-stone-50/50 transition">
                          <td className="p-4 text-center font-mono font-black text-sm text-[#07294D]">
                            #{cand.rank}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-stone-900 block">{cand.student_name}</span>
                            <span className="font-mono text-stone-500 text-[11px]">
                              {cand.roll_number || cand.application_number}
                            </span>
                          </td>
                          <td className="p-4 text-[11px] text-stone-600">
                            <div>SSC: <strong className="text-stone-800">{cand.matric_percentage}%</strong></div>
                            {cand.inter_percentage > 0 && (
                              <div>FSc: <strong className="text-stone-800">{cand.inter_percentage}%</strong></div>
                            )}
                          </td>
                          <td className="p-4 text-[11px]">
                            <span className="font-bold text-[#07294D]">{cand.test_percentage}%</span>
                            <span className="text-stone-400 block text-[10px]">({cand.test_marks} Marks)</span>
                          </td>
                          <td className="p-4 text-center font-mono font-black text-sm text-[#07294D]">
                            <span className="px-2.5 py-1 rounded-lg bg-[#07294D]/10 text-[#07294D] font-mono font-bold">
                              {cand.aggregate_percentage}%
                            </span>
                          </td>
                          <td className="p-4 text-center capitalize font-semibold text-stone-700">
                            {cand.gender} • <span className="text-stone-500 text-[11px]">{cand.domicile}</span>
                          </td>
                          <td className="p-4 text-center">
                            {allocStatus === 'confirmed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed (Seat #{cand.seat_allocation?.seat_number})
                              </span>
                            ) : allocStatus === 'reserved' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" /> Reserved (Seat #{cand.seat_allocation?.seat_number})
                              </span>
                            ) : allocStatus === 'released' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-300">
                                Released / Re-eligible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                                Eligible for Offer
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isAllocated || allocStatus === 'released' ? (
                                <button
                                  onClick={() => handleQuickReserveCandidate(cand.application_id, cand.student_name)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] rounded-lg text-xs font-bold transition shadow-xs cursor-pointer border border-[#FFB606]/30"
                                >
                                  <Clock className="w-3.5 h-3.5 text-[#FFB606]" /> Offer / Reserve Seat
                                </button>
                              ) : allocStatus === 'reserved' ? (
                                <>
                                  <button
                                    onClick={() => handleConfirmSeat(cand.seat_allocation!.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setReleaseModalAlloc(cand.seat_allocation as any)}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 cursor-pointer"
                                  >
                                    Release
                                  </button>
                                </>
                              ) : allocStatus === 'confirmed' ? (
                                <button
                                  onClick={() => setReleaseModalAlloc(cand.seat_allocation as any)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 cursor-pointer"
                                >
                                  Release
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500">
                        No verified applications recorded yet for this program cohort. Once candidates take the test, their merit scores will calculate here automatically.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Active & Historical Seat Allocations Roster */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-6">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  Seat Allocations Ledger &amp; Admission Log
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Confirmed students, active reservation deadlines, and released seat history.
                </p>
              </div>
              <Armchair className="w-5 h-5 text-stone-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                    <th className="p-4">Seat #</th>
                    <th className="p-4">App # &amp; Candidate</th>
                    <th className="p-4 text-center">Gender</th>
                    <th className="p-4 text-center">Admission Status</th>
                    <th className="p-4">Timeline / Confirmation</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {currentProgram.allocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-mono font-black text-lg text-[#07294D]">
                        #{alloc.seat_number}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-stone-900 block">{alloc.student_name}</span>
                        <span className="font-mono text-stone-500 text-[11px]">{alloc.application_number}</span>
                      </td>
                      <td className="p-4 text-center capitalize font-semibold text-stone-700">
                        {alloc.gender}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            alloc.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : alloc.status === 'reserved'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : alloc.status === 'released'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {alloc.status === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                            </>
                          ) : alloc.status === 'reserved' ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" /> Reserved
                            </>
                          ) : alloc.status === 'released' ? (
                            <>
                              <RotateCcw className="w-3 h-3 text-slate-500" /> Released
                            </>
                          ) : (
                            alloc.status
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-stone-600 text-[11px]">
                        {alloc.status === 'reserved' && (
                          <span>
                            Expires: <strong className="text-amber-800">{alloc.reservation_expires_at}</strong>
                          </span>
                        )}
                        {alloc.status === 'confirmed' && (
                          <span>
                            Confirmed: <strong className="text-emerald-800">{alloc.confirmed_at}</strong>
                          </span>
                        )}
                        {alloc.status === 'released' && (
                          <span className="text-stone-500">
                            Released: <strong>{alloc.released_at || 'Recorded'}</strong>
                            {alloc.release_reason ? ` (${alloc.release_reason})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {alloc.status === 'reserved' && (
                            <button
                              onClick={() => handleConfirmSeat(alloc.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Confirm Admission</span>
                            </button>
                          )}
                          {(alloc.status === 'reserved' || alloc.status === 'confirmed') && (
                            <button
                              onClick={() => setReleaseModalAlloc(alloc)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition border border-rose-200 cursor-pointer"
                            >
                              Release Seat
                            </button>
                          )}
                          {alloc.status === 'released' && (
                            <button
                              onClick={() => handleUnreleaseSeat(alloc.id, alloc.student_name)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition border border-amber-300 cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Reinstate / unrelease this candidate back to reserved status with a fresh 5-day offer"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              <span>Reinstate / Unrelease</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAllocation(alloc.id, alloc.student_name)}
                            title="Delete allocation record"
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentProgram.allocations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500">
                        No seat allocations recorded yet for this program. Click &quot;Offer / Reserve Seat&quot; above or publish a merit list.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Manual Offer / Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="text-base font-serif font-bold text-stone-900">
                Offer / Reserve Admission Seat
              </h3>
              <button
                onClick={() => setShowReserveModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Program: <strong>{currentProgram?.program_name}</strong> ({currentProgram?.available_seats} Available Seats)
            </p>

            <form onSubmit={handleManualReserve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Select Eligible Candidate
                </label>
                <select
                  required
                  value={reserveForm.data.application_id}
                  onChange={(e) => reserveForm.setData('application_id', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidatesForCurrentProgram.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.student_name} ({c.application_number} • Roll #{c.roll_number || 'N/A'})
                    </option>
                  ))}
                </select>
                {candidatesForCurrentProgram.length === 0 && (
                  <p className="text-[11px] text-amber-700 mt-1.5">
                    No verified unseated applicants available for this program cohort.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reserveForm.processing || !reserveForm.data.application_id}
                  className="flex-1 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {reserveForm.processing ? 'Reserving...' : 'Reserve Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Release Seat Confirmation Modal */}
      {releaseModalAlloc && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">
              Release Seat #{releaseModalAlloc.seat_number}?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Releasing this seat will cancel candidate <strong>{releaseModalAlloc.student_name}</strong>&apos;s allocation. Under college bylaws, an admission offer will automatically be extended to the next qualified candidate on the waiting list.
            </p>

            <form onSubmit={handleReleaseSeat} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Reason for Release
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Candidate failed to deposit fee within reservation window."
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalAlloc(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Release &amp; Promote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ShieldCheck, Lock } from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

interface Props {
  meritList: any;
}

export default function MeritPrint({ meritList }: Props) {
  const program = meritList.session_program?.program;
  const session = meritList.admission_session;
  const formula = meritList.merit_formula;
  const items = meritList.items || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 select-none">
      <Head title={`Merit List - ${meritList.title} - BCMT`} />

      {/* Action Bar (Hidden on Print) */}
      <div className="no-print max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <span className="text-xs font-semibold text-stone-600">
          Official Institutional Merit Notification
        </span>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] font-bold text-xs rounded-xl shadow-md transition cursor-pointer border border-[#FFB606]/30"
        >
          <Printer className="w-4 h-4 text-[#FFB606]" /> Print Official Merit List
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="print-sheet max-w-5xl mx-auto bg-white rounded-2xl border-2 border-stone-800 shadow-xl p-8 sm:p-10 text-stone-900 relative">
        {/* Header */}
        <div className="border-b-2 border-stone-800 pb-6 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BcmtLogo className="w-16 h-16" showText={false} />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#07294D] uppercase">
                Bannu College of Medical Technologies
              </h1>
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mt-0.5">
                Official Merit Gazette • {session?.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-[#07294D] text-[#FFB606] text-xs font-black rounded uppercase">
              Merit List #{meritList.list_number || meritList.version || '1'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono block mt-1">
              Date: {new Date(meritList.published_at || meritList.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Title & Program Bar */}
        <div className="bg-stone-50 border border-stone-300 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h2 className="text-base font-bold text-[#07294D]">{meritList.title}</h2>
            <p className="text-stone-700 font-semibold mt-0.5">
              Program: {program?.name} ({program?.code}) • Total Program Capacity: {meritList.session_program?.total_seats} Seats
            </p>
          </div>
          <div className="text-right text-[11px] text-stone-600">
            <span className="font-bold text-stone-900 block">Combined Merit Policy</span>
            <span>Male & Female candidates compete in a single open-merit pool</span>
          </div>
        </div>

        {/* Formula Weightage Breakdown */}
        <div className="bg-stone-100/70 border border-stone-200 rounded-lg p-2.5 mb-6 text-[11px] text-stone-700 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold uppercase text-[10px] text-stone-500">Evaluated Formula:</span>
          <div className="flex flex-wrap gap-3">
            {formula?.components?.map((c: any, i: number) => (
              <span key={i} className="font-semibold">
                {c.component_name}: <strong className="text-[#07294D]">{c.weight_percentage}%</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Merit Ranking Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-300">
            <thead>
              <tr className="bg-stone-100 font-bold uppercase text-[10px] border-b border-stone-300 text-stone-700">
                <th className="p-2 border-r border-stone-300 text-center w-12">Merit</th>
                <th className="p-2 border-r border-stone-300">Roll No</th>
                <th className="p-2 border-r border-stone-300">Candidate Full Name</th>
                <th className="p-2 border-r border-stone-300">Father&apos;s Name</th>
                <th className="p-2 border-r border-stone-300 text-center">Gender</th>
                <th className="p-2 border-r border-stone-300 text-right">Aggregate Score</th>
                <th className="p-2 text-center">Selection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {items.length > 0 ? (
                items.map((item: any) => {
                  const app = item.application;
                  const prof = app?.applicant_profile;
                  const aggregate = item.aggregate_percentage || item.final_aggregate_score || '0.00';
                  const status = (item.status || item.selection_status || 'eligible').toLowerCase();
                  return (
                    <tr key={item.id} className="hover:bg-stone-50 transition">
                      <td className="p-2 text-center font-bold font-mono text-sm border-r border-stone-200 text-[#07294D]">
                        #{item.rank}
                      </td>
                      <td className="p-2 font-mono font-semibold border-r border-stone-200 text-stone-900">
                        {app?.roll_number || app?.application_number || 'N/A'}
                      </td>
                      <td className="p-2 font-bold text-stone-900 border-r border-stone-200">
                        {prof?.full_name || 'Candidate'}
                      </td>
                      <td className="p-2 text-stone-700 border-r border-stone-200">
                        {prof?.father_name || 'N/A'}
                      </td>
                      <td className="p-2 text-center capitalize border-r border-stone-200 font-medium text-stone-700">
                        {prof?.gender || 'N/A'}
                      </td>
                      <td className="p-2 text-right font-mono font-black text-sm border-r border-stone-200 text-[#07294D]">
                        {aggregate}%
                      </td>
                      <td className="p-2 text-center font-bold uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${
                          status === 'selected' || status === 'admission_confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'waiting_list'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-500 italic">
                    No candidates compiled in this merit list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cryptographic Seal & Security Stamp */}
        <div className="bg-stone-50 border border-stone-300 rounded-xl p-3.5 mb-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-stone-800">
              Tamper-Evident SHA-256 Digest:
            </span>
            <span className="font-mono text-[10px] text-stone-500 truncate max-w-sm">
              {meritList.integrity_hash || meritList.sha256_hash || 'PENDING PUBLICATION LOCK'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
            Official BCMT Seal
          </span>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t-2 border-stone-800 flex justify-between items-end text-xs font-semibold text-stone-700">
          <div className="text-center">
            <div className="w-44 border-b border-stone-400 mb-1" />
            <span>Head of Department</span>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-stone-400 mb-1" />
            <span>Admission Committee Convener</span>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-stone-400 mb-1" />
            <span className="text-[#07294D] font-bold">Controller of Examinations, BCMT</span>
          </div>
        </div>
      </div>
    </div>
  );
}


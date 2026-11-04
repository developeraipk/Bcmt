import React from 'react';
import { Head } from '@inertiajs/react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  applications: any[];
  session: any;
  program?: any;
  filters?: any;
}

export default function PrintRoster({ applications, session, program }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 print:p-0 print:bg-white text-stone-900 font-sans">
      <Head title={`Candidate Roster - ${program ? program.name : 'All Programs'} - BCMT`} />

      {/* Top Action Bar (hidden on print) */}
      <div className="no-print max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Cohort Roster
        </button>
      </div>

      {/* Printable Sheet */}
      <div
        className="max-w-6xl mx-auto bg-white rounded-2xl border border-stone-300 shadow-md p-6 sm:p-8 print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full"
        style={{
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Institutional Header */}
        <div className="border-b-2 border-[#07294D] pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-50 border border-stone-300 rounded-xl p-1 flex items-center justify-center shrink-0">
                <BcmtLogo className="w-14 h-14" showText={false} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#07294D] uppercase">
                  Bannu College of Medical Technologies
                </h1>
                <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Office of the Registrar &amp; Directorate of Admissions • Bannu, Khyber Pakhtunkhwa
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 font-semibold">
                  <span>Session: <strong>{session?.name || 'Academic Session 2026-2027'}</strong></span>
                  <span>•</span>
                  <span>Program: <strong>{program ? `${program.name} (${program.code})` : 'All Programs Cohort'}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="px-3 py-1 bg-[#07294D] text-[#FFB606] font-black uppercase tracking-wider rounded text-[10px] inline-block">
                Official Applicant Roster
              </span>
              <p className="text-[10px] font-mono text-stone-500 mt-1">
                Generated: {new Date().toLocaleDateString('en-GB')} • Total: {applications.length}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 divide-y divide-stone-200">
            <thead className="bg-stone-50 text-stone-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5 border-r border-stone-200 text-center w-10">#</th>
                <th className="p-2.5 border-r border-stone-200">App #</th>
                <th className="p-2.5 border-r border-stone-200">Roll No</th>
                <th className="p-2.5 border-r border-stone-200">Candidate Name</th>
                <th className="p-2.5 border-r border-stone-200">Father Name</th>
                <th className="p-2.5 border-r border-stone-200">CNIC / Form-B</th>
                <th className="p-2.5 border-r border-stone-200">Program</th>
                <th className="p-2.5 border-r border-stone-200 text-center">Gender</th>
                <th className="p-2.5 border-r border-stone-200">District</th>
                <th className="p-2.5 border-r border-stone-200 text-center">Scrutiny</th>
                <th className="p-2.5 text-center">Seat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-[11px] text-stone-800">
              {applications.map((app: any, idx: number) => {
                const profile = app.applicant_profile || app.applicantProfile;
                const prog = app.session_program?.program || app.sessionProgram?.program;
                return (
                  <tr key={app.id} className="hover:bg-stone-50/50">
                    <td className="p-2 border-r border-stone-200 text-center font-mono text-stone-400 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-stone-200 font-mono font-bold text-stone-900">
                      {app.application_number}
                    </td>
                    <td className="p-2 border-r border-stone-200 font-mono font-black text-[#07294D]">
                      {app.roll_number || '—'}
                    </td>
                    <td className="p-2 border-r border-stone-200 font-bold uppercase text-stone-900">
                      {profile?.full_name}
                    </td>
                    <td className="p-2 border-r border-stone-200 uppercase text-stone-700">
                      {profile?.father_name}
                    </td>
                    <td className="p-2 border-r border-stone-200 font-mono text-stone-700">
                      {profile?.cnic}
                    </td>
                    <td className="p-2 border-r border-stone-200 font-semibold text-stone-800">
                      {prog?.name || '—'}
                    </td>
                    <td className="p-2 border-r border-stone-200 text-center capitalize">
                      {profile?.gender}
                    </td>
                    <td className="p-2 border-r border-stone-200">
                      {profile?.domicile_district || 'KPK'}
                    </td>
                    <td className="p-2 border-r border-stone-200 text-center font-bold uppercase text-[10px]">
                      {app.verification_status}
                    </td>
                    <td className="p-2 text-center font-bold text-[10px] uppercase">
                      {app.seat_allocation ? `#${app.seat_allocation.seat_number}` : 'Unassigned'}
                    </td>
                  </tr>
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-stone-400 italic">
                    No candidates found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Authority Signatures */}
        <div className="pt-8 mt-6 border-t border-stone-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-8 border-b border-stone-400 mb-1" />
            <span className="text-[10px] font-bold uppercase text-stone-600 block">Admission Incharge</span>
            <span className="text-[9px] text-stone-400">Scrutiny Desk</span>
          </div>
          <div>
            <div className="h-8 border-b border-stone-400 mb-1" />
            <span className="text-[10px] font-bold uppercase text-stone-600 block">Academic Coordinator</span>
            <span className="text-[9px] text-stone-400">BCMT Bannu</span>
          </div>
          <div>
            <div className="h-8 border-b border-stone-400 mb-1" />
            <span className="text-[10px] font-bold uppercase text-[#07294D] block">Director Admissions</span>
            <span className="text-[9px] text-stone-400">Bannu College of Medical Tech</span>
          </div>
        </div>
      </div>
    </div>
  );
}

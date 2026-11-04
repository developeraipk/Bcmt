import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Award, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { BcmtLogo } from '@/Components/Brand/BcmtLogo';

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
      cnic?: string;
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
    status?: string;
    start_time?: string;
    end_time?: string;
  };
}

interface Props {
  results: ResultItem[];
  selectedProgram?: { id: number; name: string; code: string } | null;
  selectedExamination?: { id: number; title: string; exam_code: string } | null;
  filterMetadata?: {
    status?: string;
    gender?: string;
    search?: string;
  };
  generatedAt: string;
}

export default function PrintGazette({
  results = [],
  selectedProgram,
  selectedExamination,
  filterMetadata,
  generatedAt,
}: Props) {
  const handlePrint = () => {
    window.print();
  };

  const totalAppeared = results.length;
  const totalPassed = results.filter((r) => r.is_passed && r.status !== 'disqualified').length;
  const totalFailed = totalAppeared - totalPassed;
  const passPercentage = totalAppeared > 0 ? ((totalPassed / totalAppeared) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 select-none print:p-0 print:bg-white print:min-h-0">
      <Head title={`Result Gazette - BCMT Official`} />

      {/* Action Bar (Hidden on print) */}
      <div className="no-print max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
        <Link
          href="/hod/results"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results Table
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Use standard A4/Legal paper &amp; enable background graphics for best output.
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#FFB606]" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Gazette Printable Sheet */}
      <div className="print-sheet max-w-6xl mx-auto bg-white rounded-2xl border-2 border-slate-800 shadow-xl p-8 sm:p-12 text-slate-900 relative print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BcmtLogo className="h-16 w-16 shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#07294D] uppercase tracking-wide leading-tight">
                  Bannu College of Medical Technologies
                </h1>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Office of the Controller of Examinations &amp; Admissions
                </p>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 mt-1 flex-wrap">
                  <span>KMU Affiliated</span>
                  <span>•</span>
                  <span>Pharmacy Council of Pakistan</span>
                  <span>•</span>
                  <span>KPK Medical Faculty</span>
                  <span>•</span>
                  <span>HERA Registered</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 border-l border-slate-200 pl-4">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded-md">
                Official Gazette
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-1">Generated: {generatedAt}</p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900">Program: </span>
              <span className="text-[#07294D] font-black uppercase">
                {selectedProgram ? `${selectedProgram.name} (${selectedProgram.code})` : 'All Academic Programs'}
              </span>
              {selectedExamination && (
                <span className="ml-3 text-slate-600">
                  • Test: <strong className="text-slate-900">{selectedExamination.title} ({selectedExamination.exam_code})</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
              {filterMetadata?.gender && (
                <span>Gender: <strong className="capitalize">{filterMetadata.gender}</strong></span>
              )}
              {filterMetadata?.status && (
                <span>Status Filter: <strong className="capitalize">{filterMetadata.status}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Statistical Summary Box */}
        <div className="grid grid-cols-4 gap-3 bg-slate-50 border border-slate-300 rounded-xl p-3 mb-6 text-xs text-center">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Candidates</span>
            <span className="text-lg font-black font-mono text-slate-900">{totalAppeared}</span>
          </div>
          <div>
            <span className="text-emerald-700 block text-[10px] uppercase font-bold">Passed</span>
            <span className="text-lg font-black font-mono text-emerald-700">{totalPassed}</span>
          </div>
          <div>
            <span className="text-rose-700 block text-[10px] uppercase font-bold">Failed</span>
            <span className="text-lg font-black font-mono text-rose-700">{totalFailed}</span>
          </div>
          <div>
            <span className="text-blue-700 block text-[10px] uppercase font-bold">Pass Rate</span>
            <span className="text-lg font-black font-mono text-blue-700">{passPercentage}%</span>
          </div>
        </div>

        {/* Gazette Result Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[9.5px] border-b-2 border-slate-400">
                <th className="p-2 border-r border-slate-300 text-center w-10">Sr #</th>
                <th className="p-2 border-r border-slate-300">Roll Number</th>
                <th className="p-2 border-r border-slate-300">Candidate Name</th>
                <th className="p-2 border-r border-slate-300">Father Name</th>
                <th className="p-2 border-r border-slate-300 text-center">Gender</th>
                <th className="p-2 border-r border-slate-300">Program</th>
                <th className="p-2 border-r border-slate-300 text-center">Correct</th>
                <th className="p-2 border-r border-slate-300 text-center">Wrong</th>
                <th className="p-2 border-r border-slate-300 text-center">Marks</th>
                <th className="p-2 border-r border-slate-300 text-center">%</th>
                <th className="p-2 text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {results.map((res, idx) => {
                const profile = res.application?.applicant_profile;
                const isDisqualified = res.status === 'disqualified';

                return (
                  <tr key={res.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                      {res.application?.roll_number || 'N/A'}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-sans font-bold text-slate-900">
                      {profile?.full_name || 'Anonymous Student'}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-sans text-slate-700">
                      {profile?.father_name || '—'}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-sans capitalize text-slate-700">
                      {profile?.gender || '—'}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-sans text-[10px]">
                      {res.examination?.session_program?.program?.name || '—'}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center text-emerald-700 font-bold">
                      {res.correct_answers}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center text-rose-700 font-bold">
                      {res.incorrect_answers}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">
                      <span className={res.is_passed ? 'text-emerald-700' : 'text-rose-700'}>
                        {Number(res.obtained_marks).toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-[9.5px]"> / {Number(res.total_marks).toFixed(2)}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-900">
                      {Number(res.percentage).toFixed(2)}%
                    </td>
                    <td className="p-2 text-center font-sans font-black text-[10px]">
                      {isDisqualified ? (
                        <span className="text-slate-600">DISQUALIFIED</span>
                      ) : res.is_passed ? (
                        <span className="text-emerald-700">PASSED</span>
                      ) : (
                        <span className="text-rose-700">FAILED</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {results.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 font-sans">
                    No examination records found matching the active criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Certification Signatures */}
        <div className="pt-8 border-t-2 border-slate-800 text-xs">
          <p className="text-[10px] text-slate-500 italic mb-10 text-center">
            This entrance test gazette is computer-generated and officially authenticated by the Examination &amp; Admissions Directorate, Bannu College of Medical Technologies. Errors and omissions excepted (E&amp;OE).
          </p>

          <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold pt-6">
            <div>
              <div className="border-t border-slate-800 pt-1.5 uppercase text-[10px] text-slate-700">
                In-Charge Examinations / Tabulator
              </div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1.5 uppercase text-[10px] text-slate-700">
                Convener Admissions Committee
              </div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1.5 uppercase text-[10px] text-slate-700">
                Controller of Examinations / Principal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

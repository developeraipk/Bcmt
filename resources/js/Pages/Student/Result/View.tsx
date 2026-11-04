import React from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

interface Props {
  application: any;
  result: any;
  isPublished: boolean;
}

export default function ViewResult({ application, result, isPublished }: Props) {
  const profile = application.applicantProfile;
  const program = application.sessionProgram?.program;

  const handlePrint = () => {
    window.print();
  };

  return (
    <StudentLayout>
      <Head title="Admission Test Result - BCMT" />

      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        {isPublished && result && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#07294D] text-white text-xs font-bold rounded-xl hover:bg-[#041D3C] transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#FFB606]" /> Print Scorecard
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        {!isPublished || !result ? (
          /* Result Pending Scrutiny Notice */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              Evaluation In Progress
            </span>

            <h1 className="text-2xl font-serif font-bold text-stone-900 mb-3">
              Official Result Under Scrutiny
            </h1>

            <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed mb-6">
              Your examination responses have been safely recorded and submitted to the BCMT Evaluation Engine. Scores are officially published after verification by the HOD and Examination Committee.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Candidate Roll No:</span>
                <span className="font-mono font-bold">{application.roll_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Program:</span>
                <span className="font-semibold">{program?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Submission State:</span>
                <span className="font-semibold text-emerald-700">Recorded on Server</span>
              </div>
            </div>
          </div>
        ) : (
          /* Official Published Scorecard */
          <div className="print-sheet bg-white rounded-3xl border-2 border-stone-800 shadow-xl p-8 sm:p-10 text-stone-900 relative">
            {/* Header */}
            <div className="border-b-2 border-stone-800 pb-6 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <BcmtLogo className="w-16 h-16" showText={false} />
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#07294D] uppercase">
                    Bannu College of Medical Technologies
                  </h1>
                  <p className="text-xs font-bold text-stone-600 uppercase tracking-widest mt-0.5">
                    Official Admission Examination Scorecard
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                    result.status === 'disqualified' || result.result_status === 'disqualified'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : (result.is_passed || result.result_status === 'pass')
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {result.status === 'disqualified' || result.result_status === 'disqualified'
                    ? 'DISQUALIFIED (VOID)'
                    : (result.is_passed || result.result_status === 'pass')
                    ? 'PASSED'
                    : 'DID NOT QUALIFY'}
                </span>
              </div>
            </div>

            {/* Disqualification Notice if applicable */}
            {(result.status === 'disqualified' || result.result_status === 'disqualified') && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <strong className="block font-bold">Examination Attempt Disqualified</strong>
                  <span>This attempt has been officially voided by the Examination Controller due to examination malpractice or rule violation.</span>
                </div>
              </div>
            )}

            {/* Candidate Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs mb-8">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Candidate Name</span>
                <span className="font-bold text-stone-900 text-sm">{profile?.full_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Roll Number</span>
                <span className="font-mono font-bold text-[#07294D] text-sm">{application.roll_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">CNIC / B-Form</span>
                <span className="font-mono font-semibold text-stone-800">{profile?.cnic}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Applied Program</span>
                <span className="font-semibold text-stone-800 truncate block">{program?.name}</span>
              </div>
            </div>

            {/* Main Score Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Final Score</span>
                <span className="text-2xl font-black text-[#07294D]">{result.score_final}</span>
                <span className="text-[10px] text-stone-400 block">Marks Obtained</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Test Percentage</span>
                <span className="text-2xl font-black text-stone-900">{result.percentage}%</span>
                <span className="text-[10px] text-stone-400 block">Min Required: {result.passing_percentage}%</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Correct MCQs</span>
                <span className="text-2xl font-black text-emerald-700">{result.correct_answers}</span>
                <span className="text-[10px] text-stone-400 block">of {result.attempted_questions} Attempted</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Penalty Deduction</span>
                <span className="text-2xl font-black text-rose-700">-{result.negative_penalty}</span>
                <span className="text-[10px] text-stone-400 block">{result.wrong_answers} Wrong Answers</span>
              </div>
            </div>

            {/* Detailed Question Statistics Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden mb-8 text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Evaluation Metric</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  <tr>
                    <td className="p-3">Total Questions in Exam</td>
                    <td className="p-3 text-right font-mono font-bold">{result.total_questions}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Candidate Questions Attempted</td>
                    <td className="p-3 text-right font-mono font-bold">{result.attempted_questions}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Unanswered Questions</td>
                    <td className="p-3 text-right font-mono">{result.unattempted_questions}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Gross Marks (Before Penalty)</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{result.score_raw}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Negative Marking Deductions</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">-{result.negative_penalty}</td>
                  </tr>
                  <tr className="bg-stone-50 font-bold">
                    <td className="p-3">Net Score Awarded</td>
                    <td className="p-3 text-right font-mono text-sm font-bold text-[#07294D]">{result.score_final}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Certification Footer */}
            <div className="pt-6 border-t-2 border-stone-800 flex justify-between items-end text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Digitally Verified & Sealed by BCMT Examination Office</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-900 block">Controller of Examinations</span>
                <span className="text-[10px] text-stone-500">Bannu College of Medical Technologies</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

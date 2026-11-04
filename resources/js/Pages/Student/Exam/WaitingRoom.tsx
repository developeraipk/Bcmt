import React from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm } from '@inertiajs/react';
import {
  ShieldCheck,
  Clock,
  FileText,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

interface Props {
  accessToken: string;
  examination: any;
  student: {
    name: string;
    application_number: string;
    roll_number: string;
  };
}

export default function WaitingRoom({ accessToken, examination, student }: Props) {
  const { data, post, processing } = useForm({
    token: accessToken,
  });

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    post('/student/exam/start');
  };

  return (
    <StudentLayout>
      <Head title="Examination Waiting Room - BCMT" />

      <div className="max-w-3xl mx-auto py-6">
        {/* Verification Success Pill */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 mb-6 flex items-center justify-between text-emerald-900 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>
              <strong>PIN Authenticated:</strong> Session access token securely granted for candidate <strong className="font-mono">{student.roll_number}</strong>.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-950 font-bold">
            READY TO COMMENCE
          </span>
        </div>

        {/* Exam Information Header */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold text-[#FFB606] bg-[#07294D] px-2.5 py-1 rounded uppercase tracking-wider">
                Official Campus Entrance Test
              </span>
              <h1 className="text-2xl font-serif font-bold text-[#07294D] mt-2">
                {examination.title}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 block">Candidate</span>
              <span className="text-sm font-bold text-stone-800">{student.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-center">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <Clock className="w-5 h-5 text-[#07294D] mx-auto mb-1" />
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Total Duration</span>
              <span className="text-lg font-bold text-stone-900">{examination.duration_minutes} Mins</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <FileText className="w-5 h-5 text-[#07294D] mx-auto mb-1" />
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Total Questions</span>
              <span className="text-lg font-bold text-stone-900">{examination.total_questions} MCQs</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Total Marks</span>
              <span className="text-lg font-bold text-stone-900">{examination.total_marks}</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Negative Marking</span>
              <span className="text-lg font-bold text-stone-900">
                {Number(examination.negative_marks_per_wrong) > 0 ? `-${examination.negative_marks_per_wrong}` : '0'}
              </span>
            </div>
          </div>

          {/* Test Rules & Instructions */}
          <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 text-xs text-stone-700 space-y-2 mb-6">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#07294D]" /> Critical Examination Instructions:
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600 leading-relaxed">
              <li>
                <strong className="text-stone-900">Server Clock Authority:</strong> Once you click <span className="font-semibold text-[#07294D]">"Start Examination Now"</span>, your official countdown timer will commence on the college server. Closing your browser or tab will <span className="font-semibold text-rose-700">NOT</span> pause the clock.
              </li>
              <li>
                <strong className="text-stone-900">Real-Time Answer Saving:</strong> Every MCQ option you select is saved instantly to the database. You can review and navigate between questions using the question palette.
              </li>
              <li>
                <strong className="text-stone-900">Automatic Submission:</strong> When your timer reaches 00:00, all answered questions are automatically submitted and sealed by the system.
              </li>
              <li>
                <strong className="text-stone-900">Anti-Cheat Watermarking:</strong> Your Roll Number and Session ID are embedded across the examination interface. Tab switching is recorded in the security audit logs.
              </li>
            </ul>
          </div>

          {/* Start Exam CTA */}
          <form onSubmit={handleStartExam} className="pt-2 text-center">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#07294D] hover:bg-[#041D3C] text-white font-bold text-base rounded-2xl shadow-lg shadow-[#07294D]/25 transition disabled:opacity-50 hover:scale-[1.01] cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-[#FFB606]" />
              {processing ? 'Initializing Exam Engine...' : 'Start Examination Now'}
            </button>
            <p className="text-[11px] text-stone-500 mt-3">
              By clicking Start, you confirm that you are physically seated in the BCMT examination hall and agree to all test bylaws.
            </p>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Send,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

interface Option {
  id: number;
  label: string;
  option_text?: string;
  text?: string;
}

interface Question {
  id: number;
  order: number;
  question_text: string;
  marks: number;
  options: Option[];
  selected_option_id: number | null;
  is_flagged: boolean;
}

interface Props {
  examPayload: {
    attempt_id: number;
    examination_title?: string;
    exam_title?: string;
    remaining_seconds: number;
    server_deadline: string;
    questions: Question[];
  };
  student: {
    name: string;
    roll_number: string;
    application_number: string;
  };
}

export default function ActiveTest({ examPayload, student }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(examPayload.questions || []);
  const [remainingSeconds, setRemainingSeconds] = useState(examPayload.remaining_seconds || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const currentQ = questions[currentIndex];

  // Countdown Timer using setInterval
  useEffect(() => {
    if (remainingSeconds <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    router.post('/student/exam/submit');
  };

  const handleManualSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    router.post('/student/exam/submit');
  };

  const handleSelectOption = (optionId: number) => {
    const updated = [...questions];
    updated[currentIndex].selected_option_id = optionId;
    setQuestions(updated);

    // Save answer asynchronously to server
    saveAnswerToServer(updated[currentIndex].id, optionId, updated[currentIndex].is_flagged);
  };

  const handleToggleFlag = () => {
    const updated = [...questions];
    updated[currentIndex].is_flagged = !updated[currentIndex].is_flagged;
    setQuestions(updated);

    saveAnswerToServer(
      updated[currentIndex].id,
      updated[currentIndex].selected_option_id,
      updated[currentIndex].is_flagged
    );
  };

  const saveAnswerToServer = async (questionId: number, optionId: number | null, isFlagged: boolean) => {
    setSavingState('saving');
    try {
      const response = await fetch('/student/exam/save-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          question_id: questionId,
          option_id: optionId,
          is_flagged: isFlagged,
          time_spent: 5,
        }),
      });

      if (response.ok) {
        setSavingState('saved');
        setTimeout(() => setSavingState('idle'), 1500);
      }
    } catch (err) {
      console.error('Error auto-saving answer', err);
      setSavingState('idle');
    }
  };

  const answeredCount = questions.filter((q) => q.selected_option_id !== null).length;
  const flaggedCount = questions.filter((q) => q.is_flagged).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col select-none relative">
      <Head title={`${examPayload.examination_title || examPayload.exam_title || 'Entrance Examination'} - Active Test`} />

      {/* Anti-cheat Transparent Security Watermark */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden opacity-[0.035]">
        <div className="transform -rotate-12 text-center">
          <p className="text-4xl font-mono font-black">{student.roll_number}</p>
          <p className="text-2xl font-mono font-bold">{student.name} • BCMT</p>
          <p className="text-sm font-mono">{examPayload.attempt_id}</p>
        </div>
      </div>

      {/* Top Fixed Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <BcmtLogo className="w-10 h-10" showText={false} />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-stone-900 truncate max-w-[200px] sm:max-w-md">
              {examPayload.examination_title || examPayload.exam_title || 'Entrance Examination'}
            </h1>
            <p className="text-[11px] font-mono text-stone-500">
              Candidate: <strong className="text-stone-800">{student.name}</strong> ({student.roll_number})
            </p>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-3">
          {/* Real-time saving status */}
          <div className="hidden sm:block text-[11px] font-medium text-stone-500">
            {savingState === 'saving' && <span className="text-amber-600">Saving answer...</span>}
            {savingState === 'saved' && <span className="text-emerald-600">Saved ✓</span>}
          </div>

          {/* Server-Synchronized Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-base border ${
              remainingSeconds < 300
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-stone-50 text-stone-900 border-stone-300'
            }`}
          >
            <Clock className="w-4 h-4 text-[#07294D]" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#FFB606]" /> Finish Test
          </button>

          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="sm:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
          >
            {showMobilePalette ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Examination Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 flex-1 flex flex-col justify-between">
            {/* Question Header */}
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#07294D] text-sm font-mono">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600 font-semibold text-[11px]">
                    {currentQ?.marks} Mark{currentQ?.marks > 1 ? 's' : ''}
                  </span>
                </div>

                <button
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                    currentQ?.is_flagged
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {currentQ?.is_flagged ? 'Flagged for Review' : 'Flag Question'}
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-stone-900 leading-relaxed mb-8">
                {currentQ?.question_text}
              </div>

              {/* MCQ Options List */}
              <div className="space-y-3">
                {currentQ?.options?.map((opt, optIndex) => {
                  const isSelected = currentQ.selected_option_id === opt.id;
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  const displayLetter = optionLetters[optIndex] ?? 'A';
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-3.5 text-xs sm:text-sm font-medium cursor-pointer ${
                        isSelected
                          ? 'border-[#07294D] bg-blue-50/50 text-[#07294D] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          isSelected
                            ? 'bg-[#07294D] text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {displayLetter}
                      </span>
                      <span className="flex-1 font-medium text-stone-900 leading-snug">
                        {opt.option_text || opt.text || ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-6 mt-8 border-t border-stone-200 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-1 sm:flex-none"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex-1 sm:flex-none shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-[#FFB606]" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex-1 sm:flex-none shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Submit Test</span>
                  </button>
                )}
              </div>

              {/* Dedicated Mobile Finish / Submit Exam Button */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="sm:hidden w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-emerald-600 mt-1"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Submit Examination ({answeredCount}/{questions.length} Answered)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Navigation Palette */}
        <div
          className={`lg:block ${
            showMobilePalette ? 'fixed inset-0 z-50 bg-stone-900/60 p-4 flex items-center justify-center' : 'hidden'
          }`}
        >
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs w-full max-w-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Question Palette</h3>
              {showMobilePalette && (
                <button onClick={() => setShowMobilePalette(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <span className="block text-base font-bold">{answeredCount}</span> Answered
              </div>
              <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                <span className="block text-base font-bold">{flaggedCount}</span> Flagged
              </div>
              <div className="p-2 bg-stone-100 text-stone-700 rounded-lg border border-stone-200">
                <span className="block text-base font-bold">{unansweredCount}</span> Remaining
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = q.selected_option_id !== null;
                const isFlagged = q.is_flagged;

                let btnClass = 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100';
                if (isAnswered) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-700';
                }
                if (isFlagged) {
                  btnClass = 'bg-amber-500 text-white border-amber-600';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-[#07294D] ring-offset-1 font-black';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowMobilePalette(false);
                    }}
                    className={`h-9 rounded-lg font-mono text-xs font-semibold border flex items-center justify-center transition cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Finish Test Button */}
            <div className="pt-5 mt-5 border-t border-stone-100">
              <button
                onClick={() => {
                  setShowMobilePalette(false);
                  setShowConfirmModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FFB606]" /> Final Submission
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 text-center mb-2">
              Submit Examination?
            </h3>
            <p className="text-xs text-stone-600 text-center leading-relaxed mb-6">
              You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions ({unansweredCount} remaining unanswered). Once submitted, you cannot re-enter or modify your responses.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Return to Test
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleManualSubmit}
                className="flex-1 py-2.5 px-4 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Building2,
  Calendar,
  UserCheck,
  Award,
  Fingerprint,
  FileCheck2,
} from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

interface Props {
  application: any;
  qrPayload?: string;
  photoUrl?: string | null;
  attendance?: any;
  assignedExam?: any;
  instructions?: string;
  isEligible?: boolean;
}

export default function RollNumberSlip({
  application,
  qrPayload,
  photoUrl,
  attendance,
  assignedExam,
  instructions,
  isEligible = true,
}: Props) {
  // Support both snake_case and camelCase serialization from Eloquent / Inertia
  const profile = application.applicant_profile || application.applicantProfile || {};
  const sessionProgram = application.session_program || application.sessionProgram || {};
  const program = sessionProgram?.program || application.program || {};
  const session = application.admission_session || application.admissionSession || {};
  const attend = attendance || application.examination_attendance || application.examinationAttendance;
  const exam = assignedExam || attend?.examination;

  const handlePrint = () => {
    window.print();
  };

  // Format CNIC with standard dashes if raw 13 digits
  const formatCnic = (cnic?: string) => {
    if (!cnic) return 'N/A';
    const cleaned = cnic.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
    }
    return cnic;
  };

  // Format Date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime())
        ? dateString
        : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // If application is still pending scrutiny / verification
  if (!isEligible || application.exam_eligibility_status !== 'eligible') {
    return (
      <StudentLayout>
        <Head title={`Roll Number Slip - Pending Scrutiny - BCMT`} />

        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Student Dashboard
          </Link>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#07294D] text-white p-6 sm:p-8 relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-white/20">
                  <BcmtLogo className="w-12 h-12" showText={false} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" /> Document Scrutiny In Progress
                  </div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold">
                    Roll Number Slip & Examination Seat
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-200 mt-1">
                    Application #{application.application_number} • {program?.name || 'Academic Program'}
                  </p>
                </div>
              </div>
            </div>

            {/* Explanation Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <strong className="font-bold text-amber-900 block text-sm">
                    Roll Number Slip unlocks upon Document Verification
                  </strong>
                  <p className="text-amber-800 leading-relaxed">
                    Dear <strong>{profile?.full_name || 'Applicant'}</strong>, your admission application has been received. The BCMT Admissions Scrutiny Committee is currently reviewing your uploaded credentials (Matric DMC, Inter DMC, CNIC / B-Form, Domicile).
                  </p>
                  <p className="text-amber-800 leading-relaxed pt-1">
                    Once your credentials are approved, your official Roll Number, Center Seating, Examination Date & Time, and Cryptographic QR Code will automatically appear here.
                  </p>
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 text-xs sm:text-sm">
                <div className="p-4 flex justify-between items-center bg-stone-50/60">
                  <span className="text-stone-500 font-medium">Candidate Name:</span>
                  <span className="font-bold text-stone-900">{profile?.full_name || 'N/A'}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Father's Name:</span>
                  <span className="font-bold text-stone-900">{profile?.father_name || 'N/A'}</span>
                </div>
                <div className="p-4 flex justify-between items-center bg-stone-50/60">
                  <span className="text-stone-500 font-medium">CNIC / B-Form:</span>
                  <span className="font-mono font-bold text-stone-900">{formatCnic(profile?.cnic)}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Applied Program:</span>
                  <span className="font-bold text-[#07294D]">
                    {program?.name || 'Program Name'}{' '}
                    {program?.category && `(${program.category.toUpperCase()})`}
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center bg-stone-50/60">
                  <span className="text-stone-500 font-medium">Scrutiny Status:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    {application.verification_status || 'Under Review'}
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Exam Eligibility:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                    Locked (Awaiting Approval)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/student/dashboard"
                  className="px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
                >
                  Return to Dashboard
                </Link>
                <a
                  href="https://wa.me/923340580180"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition inline-flex items-center gap-2"
                >
                  Contact Admission Desk on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Active verified slip
  const rollNumber = application.roll_number || 'BCMT-2026-PCB-0001';
  const applicationNumber = application.application_number || 'BCMT-2026-000001';
  const fullName = profile?.full_name || 'Muhammad Ibrar khan';
  const fatherName = profile?.father_name || 'Israr Khan';
  const cnicFormatted = formatCnic(profile?.cnic || '1110154974561');
  const gender = profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Male';
  const domicile = profile?.domicile_district || 'Bannu (KPK)';
  const dobFormatted = formatDate(profile?.dob) || profile?.date_of_birth || 'Recorded';
  const programTitle = program?.name || 'Pharmacy Category B (PCB)';
  const programCategory = program?.category ? program.category.toUpperCase() : 'DIPLOMA';
  const programDuration = program?.duration_years ? `${program.duration_years} Years` : '2 Years';
  const sessionName = session?.name || 'Admission Session 2026–2027';
  const sessionCode = session?.code || '2026-2027';

  // Examination schedule & seating
  const isScheduled = !!attend?.examination_id && (!!exam?.scheduled_start || !!attend?.examination?.scheduled_start);
  const hallRoom = isScheduled ? (attend?.room_number || 'BCMT Main Examination Center, Hall 1') : null;
  const seatNumber = attend?.seat_number ? `Seat #${attend.seat_number}` : 'Desk Allocated on Entry';
  const shiftText = isScheduled && exam?.shift
    ? `${exam.shift.charAt(0).toUpperCase() + exam.shift.slice(1)} Shift`
    : null;
  const examDateFormatted = isScheduled && exam?.scheduled_start
    ? formatDate(exam.scheduled_start)
    : null;

  return (
    <StudentLayout>
      <Head title={`Roll Number Slip - ${rollNumber} - BCMT`} />

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .admit-card-sheet {
            border: 2px solid #07294D !important;
            padding: 16px !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            border-radius: 8px !important;
          }
          .verification-grid {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
        }
      `}</style>

      {/* Action Bar (Hidden on print) */}
      <div className="no-print max-w-4xl mx-auto mb-5 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm bg-white px-3.5 py-2 rounded-lg border border-stone-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs text-stone-500 font-medium">
            Tip: Enable &quot;Background graphics&quot; in print dialog for official seal rendering
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] font-bold text-xs sm:text-sm rounded-xl shadow-md transition border border-[#FFB606]/40 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#FFB606]" /> Print Official Admit Card
          </button>
        </div>
      </div>

      {/* Printable Admit Card Document Container */}
      <div
        className="admit-card-sheet max-w-4xl mx-auto bg-white rounded-2xl border-2 border-[#07294D] shadow-2xl p-6 sm:p-8 text-stone-900 relative overflow-hidden print:p-4 print:border-2 print:border-black print:rounded-none print:shadow-none print:max-w-none print:w-full"
        style={{
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Subtle Background Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
          <BcmtLogo className="w-[450px] h-[450px]" showText={false} />
        </div>

        {/* Institutional Header Banner */}
        <div className="border-b-2 border-[#07294D] pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Titles */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-stone-50 border-2 border-[#07294D]/30 rounded-2xl p-2 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                <img
                  src="/images/logos/bcmt-logo.png"
                  alt="BCMT Emblem"
                  className="w-16 h-16 object-contain shrink-0"
                  onError={(e) => {
                    // Hide broken image if any
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[#07294D] text-[#FFB606] text-[10px] font-black uppercase tracking-widest rounded">
                    Official Admit Card
                  </span>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {sessionName}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#07294D] uppercase leading-tight">
                  Bannu College of Medical Technologies
                </h1>
                <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mt-0.5">
                  Office of the Controller of Examinations & Admissions • Bannu, Khyber Pakhtunkhwa
                </p>
                {/* Accreditation Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-bold text-stone-600">
                  <span className="px-2 py-0.5 bg-stone-100 rounded border border-stone-300">KMU Affiliated</span>
                  <span className="px-2 py-0.5 bg-stone-100 rounded border border-stone-300">Pharmacy Council of Pakistan</span>
                  <span className="px-2 py-0.5 bg-stone-100 rounded border border-stone-300">KPK Medical Faculty</span>
                  <span className="px-2 py-0.5 bg-stone-100 rounded border border-stone-300">HERA Registered</span>
                </div>
              </div>
            </div>

            {/* Document Type Badge (Desktop & Print) */}
            <div className="hidden sm:flex flex-col items-end text-right shrink-0">
              <div className="px-3.5 py-1.5 bg-[#07294D] text-[#FFB606] rounded-lg border border-[#FFB606]/30 shadow-xs text-center">
                <span className="text-[10px] font-black uppercase tracking-wider block text-stone-200">Test Entry Pass</span>
                <span className="text-xs font-black font-mono tracking-widest">ADMIT CARD</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 font-semibold mt-1.5">
                Session Code: <strong className="text-stone-800">{sessionCode}</strong>
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                Printed: {new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>

        {/* Prominent High-Visibility Roll Number & Security Strip */}
        <div className="bg-[#07294D] text-white rounded-xl p-3 sm:p-4 mb-4 shadow-sm border border-[#FFB606]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FFB606]/15 border border-[#FFB606]/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[#FFB606]" />
            </div>
            <div>
              <span className="text-[10px] text-[#FFB606] font-black uppercase tracking-wider block">
                Assigned Candidate Roll Number
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-[#FFB606]">
                {rollNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="border-l border-white/20 pl-4">
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-wider block">
                Application ID
              </span>
              <span className="text-sm font-bold font-mono text-white">
                {applicationNumber}
              </span>
            </div>

            <div className="border-l border-white/20 pl-4">
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-wider block">
                Eligibility Status
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Test Eligible
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Information Demographics Table */}
        <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/40 text-xs mb-3 shadow-2xs">
          <div className="bg-stone-100 px-3.5 py-1.5 border-b border-stone-200 flex items-center justify-between">
            <span className="font-bold text-[11px] text-[#07294D] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#07294D]" /> Candidate Demographics & Verified Credentials
            </span>
            <span className="text-[10px] font-mono text-stone-500 font-bold">
              Identity Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            {/* Column A */}
            <div className="divide-y divide-stone-200">
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Candidate Full Name:</span>
                <span className="font-black text-stone-900 text-xs sm:text-sm uppercase">{fullName}</span>
              </div>
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Father&apos;s Name:</span>
                <span className="font-bold text-stone-900 text-xs uppercase">{fatherName}</span>
              </div>
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">National CNIC / B-Form:</span>
                <span className="font-mono font-black text-stone-900 text-xs tracking-wider">{cnicFormatted}</span>
              </div>
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Gender & Domicile:</span>
                <span className="font-bold text-stone-800 text-xs">
                  {gender} • <strong className="text-[#07294D]">{domicile}</strong>
                </span>
              </div>
            </div>

            {/* Column B */}
            <div className="divide-y divide-stone-200">
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Date of Birth:</span>
                <span className="font-bold text-stone-800 text-xs">{dobFormatted}</span>
              </div>
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Contact Mobile:</span>
                <span className="font-mono font-bold text-stone-800 text-xs">
                  {profile?.mobile_number || profile?.whatsapp_number || 'N/A'}
                </span>
              </div>
              <div className="p-2 sm:p-2.5 flex justify-between items-center bg-amber-50/40">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Applied Program:</span>
                <span className="font-black text-[#07294D] text-xs text-right">
                  {programTitle}
                </span>
              </div>
              <div className="p-2 sm:p-2.5 flex justify-between items-center">
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Program Category:</span>
                <span className="font-bold text-stone-700 text-xs">
                  {programCategory} ({programDuration})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Credential Container (Student Pic on Left, QR Code on Right) */}
        <div className="verification-grid border border-stone-200 rounded-xl p-3.5 mb-4 bg-stone-50/50 flex flex-row items-center justify-between gap-4">
          {/* Left Side: Candidate Photograph */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-24 h-28 sm:w-28 sm:h-32 bg-stone-100 rounded-lg border-2 border-[#07294D] overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-2 text-center flex flex-col items-center justify-center h-full">
                  <UserCheck className="w-7 h-7 text-stone-400 mb-1" />
                  <span className="text-[8px] font-bold text-stone-500 uppercase leading-tight text-center">
                    Affix Attested Photo
                  </span>
                </div>
              )}
              {/* Corner Watermark Seal */}
              <div className="absolute bottom-0 inset-x-0 bg-[#07294D]/90 text-[#FFB606] text-[7.5px] font-black uppercase text-center py-0.5 tracking-wider">
                BCMT Verified
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase text-[#07294D] block tracking-wider">
                Official Candidate Photo
              </span>
              <span className="text-[9px] text-stone-500 font-medium block mt-0.5">
                Physical presence matched with verified CNIC
              </span>
              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-700 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attested Identity
              </span>
            </div>
          </div>

          {/* Center: Institutional Authenticity Seal & Watermark */}
          <div className="flex flex-col items-center text-center px-2">
            <span className="text-[10px] font-black uppercase text-[#07294D] tracking-wider">
              Institutional Security Verification
            </span>
            <span className="text-[9px] font-mono text-stone-500 mt-0.5">
              Office of the Controller of Examinations • BCMT
            </span>
            <div className="mt-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-bold inline-flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Biometric & Photo Identity Cleared</span>
            </div>
          </div>

          {/* Right Side: Cryptographic QR Code */}
          <div className="flex flex-col items-center text-center shrink-0">
            <div className="p-1 bg-white rounded-lg border border-stone-300 shadow-xs mb-1">
              <QRCodeSVG
                value={qrPayload || `https://bcmt.edu.pk/verify-slip/${applicationNumber}`}
                size={68}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[8px] font-mono font-bold text-stone-600 uppercase tracking-tight">
              Scan to Authenticate
            </span>
            <div className="flex items-center gap-1 text-[8px] text-emerald-800 font-bold mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Crypto Seal</span>
            </div>
          </div>
        </div>

        {/* Assigned Examination Center, Venue & Schedule Block */}
        <div className="border-2 border-[#07294D] bg-[#07294D]/5 rounded-xl p-3.5 mb-4 text-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#07294D]/20">
            <span className="font-black text-xs text-[#07294D] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#07294D]" /> Official Examination Schedule &amp; Center Allocation
            </span>
            <span className="px-2 py-0.5 bg-[#07294D] text-[#FFB606] text-[10px] font-black rounded uppercase">
              Mandatory Physical Attendance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-stone-800">
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Examination Center &amp; Hall:
              </span>
              <span className="font-black text-xs sm:text-sm text-[#07294D] block mt-0.5">
                {isScheduled ? (hallRoom || 'BCMT Main Campus, Hall 1') : 'Center Allocation Pending'}
              </span>
              <span className="text-[9.5px] text-stone-500 font-medium block mt-0.5">
                {isScheduled ? 'Circular Road near Hira School, Sokari Gate, Bannu' : 'Desk & Room will be announced upon scheduling.'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Assigned Date &amp; Shift:
              </span>
              {isScheduled && examDateFormatted ? (
                <>
                  <span className="font-bold text-xs sm:text-sm text-stone-900 block mt-0.5">
                    {examDateFormatted}
                  </span>
                  <span className="text-[10px] font-black text-[#07294D] block mt-0.5">
                    {shiftText || 'Morning Shift'}
                  </span>
                </>
              ) : (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-600" /> Schedule Pending
                  </span>
                  <span className="text-[9px] text-stone-500 font-medium block mt-1">
                    Official test date &amp; shift will be assigned by Examination Office.
                  </span>
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Candidate Entry &amp; Secure PIN Protocol:
              </span>
              <span className="font-bold text-[11px] text-stone-800 block mt-0.5">
                Report 30 mins prior with Original CNIC / B-Form.
              </span>
              <span className="text-[9.5px] text-stone-500 font-medium block mt-0.5">
                Confidential Exam PIN announced by Invigilator inside Hall.
              </span>
            </div>

            <div className="sm:col-span-3 pt-2 border-t border-[#07294D]/15 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <div>
                <strong className="text-[#07294D] font-bold">Center Address:</strong>{' '}
                <span className="text-stone-700">BCMT Main Campus, Circular Road near Hira School, Sokari Gate, Bannu, KP.</span>
              </div>
              <div className="text-[10px] text-stone-500 font-mono">
                Gate Closes Strictly 15 Minutes Prior to Shift Commencement
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Mandatory Examination Instructions */}
        <div className="border border-stone-300 rounded-xl p-3 mb-4 text-[11px] text-stone-700 bg-stone-50/50">
          <div className="flex items-center gap-1.5 font-black text-stone-900 uppercase text-[11px] mb-1.5 text-[#07294D]">
            <AlertCircle className="w-3.5 h-3.5 text-[#07294D]" /> Mandatory Instructions for Candidates:
          </div>
          <ol className="list-decimal pl-4 space-y-0.5 leading-tight text-[10.5px]">
            <li>
              <strong>Mandatory Identification:</strong> Candidates MUST bring their <strong>Original CNIC / National Smart Card / Original Form-B</strong> along with this printed Admit Card. No photocopy or digital copy will be accepted.
            </li>
            <li>
              <strong>Reporting Time:</strong> Candidates must report to the examination hall at least <strong>30 minutes prior</strong> to test start. Entry gates will close 15 minutes before test time.
            </li>
            <li>
              <strong>Strict Prohibition:</strong> Mobile phones, smartwatches, calculators, Bluetooth devices, and bags are <strong>STRICTLY PROHIBITED</strong> inside the examination hall.
            </li>
            <li>
              <strong>Biometric & Attendance:</strong> Physical invigilator verification and biometric signature on the attendance roster is mandatory before accessing the computer terminal.
            </li>
            <li>
              <strong>Test PIN & Integrity:</strong> The confidential test session PIN will be announced by the Chief Invigilator inside the hall. Any candidate caught using unfair means (UFM) or impersonation will be permanently barred from admission.
            </li>
          </ol>
        </div>

        {/* Official 3-Party Signatures Block */}
        <div className="pt-4 border-t-2 border-[#07294D] grid grid-cols-3 gap-4 items-end text-center text-xs">
          <div>
            <div className="h-10 border-b border-stone-400 mb-1" />
            <span className="text-[10px] font-bold uppercase text-stone-600 block">
              Candidate&apos;s Signature
            </span>
            <span className="text-[9px] text-stone-400">(Sign in Examination Hall)</span>
          </div>

          <div>
            <div className="h-10 border-b border-stone-400 mb-1" />
            <span className="text-[10px] font-bold uppercase text-stone-600 block">
              Duty Invigilator Verification
            </span>
            <span className="text-[9px] text-stone-400">(Stamp & Signature on Entry)</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-10 border-b border-stone-400 mb-1 w-full flex items-center justify-center">
              <span className="font-serif italic text-xs font-bold text-[#07294D] tracking-wider">
                Exam Board BCMT
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-[#07294D] block">
              Controller of Examinations
            </span>
            <span className="text-[9px] text-stone-400">Bannu College of Medical Tech</span>
          </div>
        </div>

        {/* Legal Micro-footer */}
        <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-[9px] text-stone-400 font-mono">
          <span>This is an official computer-generated admit card. Any unauthorized alteration renders it null & void.</span>
          <span>BCMT Security Serial: {application.identity_hash ? application.identity_hash.slice(0, 16) : rollNumber}</span>
        </div>
      </div>
    </StudentLayout>
  );
}

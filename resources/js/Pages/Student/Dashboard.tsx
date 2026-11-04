import React, { useState, useEffect } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
  FileText,
  KeyRound,
  FileCheck,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  MessageCircle,
  Calendar,
  User,
  ShieldCheck,
  ChevronRight,
  Armchair,
  BookOpen,
  Edit3,
  X,
  Camera,
  Image as ImageIcon,
  Printer,
  Lock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Props {
  application: any;
  assignedExam: any;
  whatsapp: {
    support_link: string;
    community_url: string;
  };
}

export default function StudentDashboard({ application, assignedExam, whatsapp }: Props) {
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCacheBust, setPhotoCacheBust] = useState<number>(Date.now());
  const [isSeatBannerDismissed, setIsSeatBannerDismissed] = useState<boolean>(false);

  // Format date-time helper for clean display
  const formatDateTime = (dtStr?: string | null) => {
    if (!dtStr) return 'N/A';
    try {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dtStr;
    }
  };

  // Document reupload form
  const { data: docData, setData: setDocData, post: postDoc, processing: docProcessing, reset: resetDoc } = useForm<{ document: File | null }>({
    document: null,
  });

  const handleReupload = (e: React.FormEvent, docId: number) => {
    e.preventDefault();
    postDoc(`/student/documents/${docId}/reupload`, {
      onSuccess: () => {
        setSelectedDocId(null);
        resetDoc();
      },
    });
  };

  // Profile data extraction with full fallbacks (handling both camelCase & snake_case)
  const profile = application?.applicantProfile || application?.applicant_profile;
  const program = application?.sessionProgram?.program || application?.session_program?.program;
  const seat = application?.seatAllocation || application?.seat_allocation;
  const session = application?.admissionSession || application?.admission_session;
  const academicRecords = application?.academicRecords || application?.academic_records || [];
  const documents = application?.documents || [];

  // Intermediate credentials only shown for BS degree candidates or if non-zero marks exist
  const isBsProgram = program?.category === 'bs_program' || 
    program?.category === 'bs_degree' ||
    (program?.name && program.name.toUpperCase().includes('BS')) ||
    (program?.code && program.code.toUpperCase().startsWith('BS'));

  const visibleAcademicRecords = academicRecords.filter((rec: any) => {
    const level = (rec.level || rec.degree_level || rec.qualification_name || '').toLowerCase();
    const isInter = level.includes('inter') || level.includes('fsc') || level.includes('hssc');
    if (isInter) {
      return isBsProgram || (Number(rec.obtained_marks) > 0);
    }
    return true;
  });

  // Photo document resolution with cache-busting for instant UI display on save
  const photoDoc = documents.find((d: any) => d.document_type === 'photo');
  const [instantAvatar, setInstantAvatar] = useState<string | null>(null);
  const photoUrl = instantAvatar || (photoDoc ? `/documents/${photoDoc.id}/stream?v=${photoCacheBust}` : null);

  // Edit Profile Form
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    passwordForm.post('/student/password/update', {
      onSuccess: () => {
        setIsPasswordModalOpen(false);
        passwordForm.reset();
      },
    });
  };

  const profileForm = useForm<{
    full_name: string;
    father_name: string;
    mobile_number: string;
    dob: string;
    gender: string;
    domicile_district: string;
    current_address: string;
    permanent_address: string;
    photo: File | null;
  }>({
    full_name: profile?.full_name || '',
    father_name: profile?.father_name || '',
    mobile_number: profile?.mobile_number || profile?.phone || '',
    dob: profile?.dob ? String(profile.dob).split('T')[0] : (profile?.date_of_birth || ''),
    gender: profile?.gender || 'male',
    domicile_district: profile?.domicile_district || '',
    current_address: profile?.current_address || profile?.postal_address || '',
    permanent_address: profile?.permanent_address || '',
    photo: null,
  });

  useEffect(() => {
    if (profile) {
      profileForm.setData({
        full_name: profile.full_name || '',
        father_name: profile.father_name || '',
        mobile_number: profile.mobile_number || profile.phone || '',
        dob: profile.dob ? String(profile.dob).split('T')[0] : (profile.date_of_birth || ''),
        gender: profile.gender || 'male',
        domicile_district: profile.domicile_district || '',
        current_address: profile.current_address || profile.postal_address || '',
        permanent_address: profile.permanent_address || '',
        photo: null,
      });
    }
  }, [profile]);

  // Real-Time Background Synchronization: dynamically sync verification status, admit card eligibility & seat allocation without page refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't interrupt if student is actively filling the edit modal
      if (!isEditModalOpen && !selectedDocId) {
        router.reload({
          only: ['application', 'assignedExam'],
          preserveScroll: true,
        });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isEditModalOpen, selectedDocId]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoPreview) {
      setInstantAvatar(photoPreview);
    }
    profileForm.post('/student/profile', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsEditModalOpen(false);
        setPhotoCacheBust(Date.now());
        // Re-fetch props instantly so latest photo and details show up with zero page refresh
        router.reload({
          only: ['application', 'auth'],
          preserveScroll: true,
        });
      },
    });
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    profileForm.setData('photo', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const getStatusBadge = (status: string, stage: string) => {
    switch (status) {
      case 'verified':
      case 'eligible':
      case 'selected':
      case 'admission_confirmed':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> {status.replace('_', ' ').toUpperCase()}
          </span>
        );
      case 'rejected':
      case 'not_eligible':
      case 'disqualified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> {status.replace('_', ' ').toUpperCase()}
          </span>
        );
      case 'reupload_required':
      case 'correction_required':
      case 'seat_offered':
      case 'waiting_list':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3" /> {status.replace('_', ' ').toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            <Clock className="w-3 h-3" /> {status.replace('_', ' ').toUpperCase()}
          </span>
        );
    }
  };

  if (!application) {
    return (
      <StudentLayout>
        <Head title="Student Portal - BCMT" />
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center max-w-lg mx-auto mt-10">
          <FileText className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-800">No Application Found</h2>
          <p className="text-stone-600 text-sm mt-2 mb-6">
            You do not currently have an active admission application submitted for the current session.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] text-white rounded-xl text-sm font-semibold hover:bg-[#041D3C] transition"
          >
            Apply for Admission Now
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Head title="Candidate Dashboard - BCMT" />

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border-b-4 border-[#FFB606]">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-[#FFB606]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={profile?.full_name || 'Student'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#FFB606] shadow-lg shrink-0 bg-slate-800"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 text-[#FFB606] border-2 border-[#FFB606] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-lg">
                {(profile?.full_name || 'S').charAt(0)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-[#FFB606] text-[#07294D] text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  {session?.name || 'Admission Session 2026-2027'}
                </span>
                <span className="text-blue-200 text-xs font-mono bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                  #{application.application_number}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-stone-100 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFB606]" />
                  <span>Verified Applicant ID</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                {profile?.full_name || 'Candidate Portal'}
              </h1>
              <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-xl">
                Applied for: <strong className="text-white font-semibold">{program?.name || 'Academic Program'}</strong> {program ? `(${program.category ? program.category.toUpperCase().replace('_', ' ') + ' • ' : ''}${program.duration_years ? program.duration_years + ' Years' : ''})` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#FFB606]" /> Edit Profile & Photo
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] rounded-xl text-xs sm:text-sm font-black shadow-md transition cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#07294D]" /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Seat Allocation Alert if Offered, Confirmed, or Released (Dismissible with X) */}
      {!isSeatBannerDismissed && seat && (
        <div className={`p-4 sm:p-5 rounded-2xl mb-8 border flex items-start justify-between gap-4 relative shadow-xs ${
          seat.status === 'confirmed'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : seat.status === 'reserved'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-stone-50 border-stone-300 text-stone-900'
        }`}>
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="p-2.5 bg-white rounded-xl shadow-xs shrink-0">
              <Armchair className={`w-5 h-5 sm:w-6 sm:h-6 ${
                seat.status === 'confirmed' ? 'text-emerald-700' : seat.status === 'reserved' ? 'text-amber-700' : 'text-stone-500'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold">
                {seat.status === 'confirmed'
                  ? `Official Admission Confirmed — Seat #${seat.seat_number}`
                  : seat.status === 'reserved'
                  ? `Admission Offer Extended — Seat #${seat.seat_number} Reserved`
                  : seat.status === 'released'
                  ? `Admission Offer Released / Re-Eligible`
                  : `Seat Status: ${seat.status.toUpperCase()}`}
              </h3>
              <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                {seat.status === 'reserved' && (
                  <>
                    Your merit reservation is active until <strong className="font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{formatDateTime(seat.reservation_expires_at)}</strong>. Please finalize your document submission and admission fee at the college campus before expiration.
                  </>
                )}
                {seat.status === 'confirmed' && (
                  <>
                    Congratulations! Your seat is formally confirmed in the <strong className="font-semibold">{program?.name}</strong> cohort. Welcome to Bannu College of Medical Technologies.
                  </>
                )}
                {seat.status === 'released' && (
                  <>
                    Your previous merit seat reservation has elapsed. You remain in consideration for subsequent waiting-list admissions or open merit calls.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setIsSeatBannerDismissed(true)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-lg transition cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Published Merit List Standing Banner */}
      {(() => {
        const meritItem = application.merit_list_item || application.meritListItem;
        const mList = meritItem?.merit_list || meritItem?.meritList;
        if (!meritItem || !mList || mList.status !== 'published_locked') return null;

        const isConfirmed = seat?.status === 'confirmed' || application.selection_status === 'admission_confirmed';
        const isReserved = seat?.status === 'reserved' || application.selection_status === 'seat_offered';
        const isReleased = seat?.status === 'released' || application.selection_status === 'offer_lapsed';
        const isRejected = application.selection_status === 'rejected';

        return (
          <div className="bg-white rounded-2xl p-5 mb-8 border-2 border-[#07294D] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#07294D] text-[#FFB606] rounded-xl shadow-xs shrink-0">
                <Award className="w-6 h-6 text-[#FFB606]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Merit List Published
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    {mList.title}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#07294D]">
                  Official Candidate Standing: Merit #{meritItem.rank}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Dynamic Aggregate Score: <strong className="text-stone-900">{meritItem.aggregate_percentage || meritItem.final_aggregate_score}%</strong></span>
                  <span>•</span>
                  <span>
                    Selection Verdict:{' '}
                    {isConfirmed ? (
                      <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                        ADMISSION CONFIRMED
                      </strong>
                    ) : isReserved ? (
                      <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                        SELECTED / ADMISSION OFFERED
                      </strong>
                    ) : isReleased ? (
                      <strong className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-300 font-bold">
                        OFFER RELEASED / RE-ELIGIBLE
                      </strong>
                    ) : isRejected ? (
                      <strong className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 font-bold">
                        NOT SELECTED
                      </strong>
                    ) : (
                      <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-bold">
                        WAITING LIST
                      </strong>
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                href={`/merit-lists/${mList.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] rounded-xl text-xs font-bold transition shadow-xs border border-[#FFB606]/30"
              >
                <Printer className="w-4 h-4 text-[#FFB606]" /> View Official Merit Gazette
              </a>
            </div>
          </div>
        );
      })()}

      {/* 4 Multi-Stage Workflow Tracking Cards (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Stage 1: Document Verification */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Step 1: Scrutiny</span>
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">Document Verification</h4>
            <div className="mt-2 sm:mt-3">
              {getStatusBadge(application.verification_status, 'verification')}
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-stone-100 truncate">
            {application.internal_remarks || 'Academic credentials & CNIC'}
          </p>
        </div>

        {/* Stage 2: Exam Eligibility & Admit Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Step 2: Admit Card</span>
              <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">Test Eligibility &amp; Roll</h4>
            <div className="mt-2 sm:mt-3">
              {getStatusBadge(application.exam_eligibility_status, 'eligibility')}
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
            <span className="truncate">{application.roll_number ? `Roll: ${application.roll_number}` : 'Awaiting approval'}</span>
            {application.exam_eligibility_status === 'eligible' && (
              <Link
                href="/student/roll-number-slip"
                className="inline-flex items-center gap-0.5 sm:gap-1 font-bold font-sans text-[10px] sm:text-xs text-[#07294D] hover:underline shrink-0"
              >
                View <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFB606]" />
              </Link>
            )}
          </div>
        </div>

        {/* Stage 3: Admission Test Attempt */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Step 3: Exam</span>
              <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">Admission Test</h4>
            <div className="mt-2 sm:mt-3">
              {getStatusBadge(application.exam_attempt_status, 'exam')}
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-stone-100 truncate">
            {assignedExam ? `${assignedExam.duration_minutes}m • ${assignedExam.total_marks} Marks` : 'Schedule in progress'}
          </p>
        </div>

        {/* Stage 4: Selection & Seat Allocation */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2">
              <span>Step 4: Admission</span>
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">Merit &amp; Seat State</h4>
            <div className="mt-2 sm:mt-3">
              {seat?.status === 'released' || application.selection_status === 'offer_lapsed' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
                  <Clock className="w-3 h-3 text-stone-500" /> RELEASED
                </span>
              ) : (
                getStatusBadge(application.selection_status, 'selection')
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-stone-100 truncate">
            {seat ? `Seat #${seat.seat_number} (${seat.status === 'released' ? 'Lapsed' : seat.status})` : 'Awaiting publication'}
          </p>
        </div>
      </div>

      {/* Main Grid: Application Details + Documents + WhatsApp Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Academic Credentials */}
        <div className="lg:col-span-2 space-y-8">
          {/* Candidate Profile Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 flex-wrap gap-2">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#07294D]" /> Candidate Profile & Details
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-[#07294D] hover:bg-amber-100 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Change Password
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#07294D]/10 hover:bg-[#07294D]/20 text-[#07294D] rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Photo
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Candidate Name</span>
                <span className="font-semibold text-stone-800 text-sm">{profile?.full_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Father's Name</span>
                <span className="font-semibold text-stone-800 text-sm">{profile?.father_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">CNIC / B-Form</span>
                <span className="font-mono font-semibold text-stone-800">{profile?.cnic || application.normalized_cnic || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Contact Phone</span>
                <span className="font-semibold text-stone-800 font-mono">{profile?.mobile_number || profile?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Date of Birth</span>
                <span className="font-semibold text-stone-800">
                  {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (profile?.date_of_birth || 'N/A')}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Gender</span>
                <span className="font-semibold text-stone-800 capitalize">{profile?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">District of Domicile</span>
                <span className="font-semibold text-stone-800">{profile?.domicile_district || 'N/A'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-stone-500 block">Postal Address</span>
                <span className="font-semibold text-stone-800">{profile?.current_address || profile?.permanent_address || profile?.postal_address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Academic Records */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#07294D]" /> Verified Academic Credentials
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase font-semibold">
                    <th className="p-3 rounded-l-lg">Degree / Level</th>
                    <th className="p-3">Board / Institute</th>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Marks</th>
                    <th className="p-3 rounded-r-lg">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {visibleAcademicRecords.map((rec: any) => (
                    <tr key={rec.id}>
                      <td className="p-3 font-semibold uppercase">{rec.level || rec.degree_level || rec.qualification_name || 'N/A'}</td>
                      <td className="p-3">{rec.board_university || rec.board_name || 'N/A'}</td>
                      <td className="p-3 font-mono">{rec.roll_number || rec.exam_roll_number || 'N/A'}</td>
                      <td className="p-3 font-medium">
                        {(rec.obtained_marks !== undefined && rec.obtained_marks !== null ? rec.obtained_marks : (rec.marks_obtained || 0))} / {rec.total_marks || 0}
                      </td>
                      <td className="p-3 font-bold text-[#07294D]">{rec.percentage}%</td>
                    </tr>
                  ))}
                  {visibleAcademicRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-stone-400">
                        No academic credentials on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents Scrutiny & Re-upload Section (Clean, Non-Squished Layout) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#07294D]" /> Uploaded Verification Documents
            </h3>
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col gap-3 text-xs transition"
                >
                  {/* Top Row: Document info + Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800 capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                        {getStatusBadge(doc.verification_status, 'doc')}
                      </div>
                      {doc.rejection_reason && (
                        <p className="text-rose-600 text-[11px] mt-1 font-medium bg-rose-50 px-2 py-1 rounded border border-rose-200">
                          Scrutiny Notice: {doc.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/documents/${doc.id}/stream`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg font-medium transition cursor-pointer"
                      >
                        View
                      </a>

                      {doc.verification_status === 'reupload_required' && (
                        <button
                          onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                          className="px-3 py-1.5 bg-[#FFB606] hover:bg-[#e6a405] text-[#07294D] rounded-lg font-bold transition shadow-xs cursor-pointer"
                        >
                          {selectedDocId === doc.id ? 'Cancel' : 'Re-upload'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clean Dropdown Form on its own separate line */}
                  {selectedDocId === doc.id && (
                    <form
                      onSubmit={(e) => handleReupload(e, doc.id)}
                      className="w-full pt-3 mt-1 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200"
                    >
                      <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDocData('document', e.target.files ? e.target.files[0] : null)}
                        className="w-full sm:w-auto flex-1 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#07294D] file:text-white file:font-semibold file:cursor-pointer"
                      />
                      <button
                        type="submit"
                        disabled={docProcessing}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#07294D] text-white rounded-lg font-bold text-xs hover:bg-[#041D3C] transition disabled:opacity-50 shrink-0 cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        {docProcessing ? 'Uploading...' : 'Submit Re-upload'}
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Exam Shortcut & Official Community Support */}
        <div className="space-y-6">
          {/* Exam Status Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-[#07294D] font-bold text-sm mb-3">
              <KeyRound className="w-5 h-5 text-[#FFB606]" /> Campus Examination
            </div>
            {assignedExam ? (
              <div className="space-y-3 text-xs text-stone-600">
                <p>
                  <strong>Test Title:</strong> {assignedExam.title}
                </p>
                <p>
                  <strong>Duration:</strong> {assignedExam.duration_minutes} Minutes
                </p>
                <p>
                  <strong>Questions:</strong> {assignedExam.total_questions} MCQs ({assignedExam.total_marks} Marks)
                </p>
                <p>
                  <strong>Passing Criteria:</strong>{' '}
                  <span className="font-semibold text-stone-900">
                    {assignedExam.passing_percentage}%
                  </span>
                </p>
                <p>
                  <strong>Campus Attendance:</strong>{' '}
                  <span className="font-semibold text-stone-800">
                    {application.examinationAttendance?.attendance_status ? (
                      <span className="text-emerald-700 capitalize">
                        {application.examinationAttendance.attendance_status} (Room {application.examinationAttendance.room_number})
                      </span>
                    ) : (
                      'Pending Invigilator Verification'
                    )}
                  </span>
                </p>

                <div className="pt-3 space-y-2">
                  {application.examination_attempt?.result || application.examination_attempt?.status === 'submitted' || application.examination_attempt?.status === 'timed_out' ? (
                    <Link
                      href="/student/result"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FFB606] hover:bg-[#e6a405] text-[#07294D] rounded-xl font-bold transition cursor-pointer shadow-xs"
                    >
                      View Entrance Test Result <ChevronRight className="w-4 h-4 text-[#07294D]" />
                    </Link>
                  ) : (
                    <Link
                      href="/student/exam/gate"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl font-bold transition cursor-pointer"
                    >
                      Enter Exam Gate <ChevronRight className="w-4 h-4 text-[#FFB606]" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                Test schedule for {program?.name || 'your program'} will appear here once finalized by the Examination Controller.
              </p>
            )}
          </div>

          {/* Official WhatsApp Support Box */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-2">
              <MessageCircle className="w-5 h-5 text-emerald-700" /> WhatsApp Admission Desk
            </div>
            <p className="text-xs text-emerald-800 mb-4">
              Need immediate assistance regarding your admission status, fee submission, or exam schedule? Connect directly with our admission officers.
            </p>
            <div className="space-y-2.5">
              <a
                href={whatsapp.support_link}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4" /> Chat with Admission Support
              </a>
              {whatsapp.community_url && (
                <a
                  href={whatsapp.community_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-xl font-semibold text-xs transition"
                >
                  Join BCMT Student Community
                </a>
              )}
            </div>
          </div>

          {/* Institution Contact Quick Reference */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 text-xs text-stone-600 space-y-2">
            <p className="font-bold text-stone-800">Bannu College of Medical Technologies</p>
            <p>Circular Road near Hira School, Sokari Gate, Bannu</p>
            <p><strong>Desk:</strong> 0928-622699 / 0334-0580180</p>
            <p><strong>Email:</strong> bcmts1122@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Profile & Photo Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#07294D]/10 text-[#07294D] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Candidate Profile & Photo</h3>
                  <p className="text-xs text-slate-500">Update your demographic details and upload an official profile portrait.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setPhotoPreview(null);
                }}
                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FFB606] shadow-sm"
                    />
                  ) : photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Current Photo"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-stone-200 text-stone-500 flex items-center justify-center border border-stone-300">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Candidate Profile Picture
                  </label>
                  <p className="text-[11px] text-stone-500 mb-2">
                    Upload a formal passport-size photo (JPEG or PNG, max 2MB).
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoFileChange}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#07294D] file:text-white file:font-semibold file:cursor-pointer"
                  />
                  {profileForm.errors.photo && (
                    <p className="text-rose-600 text-xs mt-1">{profileForm.errors.photo}</p>
                  )}
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.data.full_name}
                    onChange={(e) => profileForm.setData('full_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  {profileForm.errors.full_name && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileForm.errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.data.father_name}
                    onChange={(e) => profileForm.setData('father_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  {profileForm.errors.father_name && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileForm.errors.father_name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.data.mobile_number}
                    onChange={(e) => profileForm.setData('mobile_number', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  {profileForm.errors.mobile_number && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileForm.errors.mobile_number}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileForm.data.dob}
                    onChange={(e) => profileForm.setData('dob', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Gender *
                  </label>
                  <select
                    value={profileForm.data.gender}
                    onChange={(e) => profileForm.setData('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    District of Domicile
                  </label>
                  <input
                    type="text"
                    value={profileForm.data.domicile_district}
                    onChange={(e) => profileForm.setData('domicile_district', e.target.value)}
                    placeholder="e.g. Bannu, Lakki Marwat..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Current Postal Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.data.current_address}
                    onChange={(e) => profileForm.setData('current_address', e.target.value)}
                    placeholder="Street address, village / mohallah, city..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  {profileForm.errors.current_address && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileForm.errors.current_address}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setPhotoPreview(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-[#07294D] hover:bg-[#041D3C] text-white font-bold text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {profileForm.processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-[#07294D] to-[#0A3663] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFB606] text-[#07294D] flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-[#07294D]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Change Account Password</h3>
                  <p className="text-xs text-blue-100">Update your candidate login credentials securely</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  passwordForm.reset();
                }}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={passwordForm.data.current_password}
                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                    placeholder="Enter existing password"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.errors.current_password && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{passwordForm.errors.current_password}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwordForm.data.password}
                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.errors.password && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{passwordForm.errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwordForm.data.password_confirmation}
                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    passwordForm.reset();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-[#07294D] hover:bg-[#0A3663] text-white font-bold text-xs transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {passwordForm.processing ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

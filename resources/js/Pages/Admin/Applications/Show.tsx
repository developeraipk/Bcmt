import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
  Printer,
  History,
  Send,
  ExternalLink,
  Lock,
  CheckCheck,
} from 'lucide-react';

interface Props {
  application: any;
}

export default function ApplicationShow({ application }: Props) {
  const profile = application.applicant_profile || application.applicantProfile;
  const program = application.session_program?.program || application.sessionProgram?.program;
  const session = application.admission_session || application.admissionSession;
  const academicRecords = application.academic_records || application.academicRecords || [];
  const isBsProgram = program?.category === 'bs_program' ||
    program?.category === 'bs_degree' ||
    (program?.name && program.name.toUpperCase().includes('BS')) ||
    (program?.code && program.code.toUpperCase().startsWith('BS'));

  const visibleAcademicRecords = academicRecords.filter((rec: any) => {
    const level = (rec.level || rec.degree_level || rec.qualification_name || '').toLowerCase();
    const isInter = level.includes('inter') || level.includes('fsc') || level.includes('hssc');
    if (isInter) {
      return Boolean(isBsProgram);
    }
    return true;
  });
  const documents = application.documents || [];

  // Form for Overall Application Verification
  const appVerifyForm = useForm({
    status: application.verification_status || 'verified',
    remarks: '',
  });

  // State for Document Scrutiny Modals
  const [activeDoc, setActiveDoc] = useState<any | null>(null);
  const docVerifyForm = useForm({
    status: 'approved',
    remarks: '',
  });

  const handleAppVerify = (e: React.FormEvent) => {
    e.preventDefault();
    appVerifyForm.post(`/admin/applications/${application.id}/verify`);
  };

  const handleDocVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) return;
    docVerifyForm.post(`/admin/documents/${activeDoc.id}/verify`, {
      preserveScroll: true,
      onSuccess: () => {
        setActiveDoc(null);
        docVerifyForm.reset();
      },
      onError: (err) => {
        console.error('Doc verification error:', err);
      },
    });
  };

  const handleApproveAllDocs = () => {
    if (confirm(`Are you sure you want to approve and verify all ${documents.length} uploaded documents for this candidate?`)) {
      router.post(`/admin/applications/${application.id}/approve-all-documents`, {}, {
        preserveScroll: true,
      });
    }
  };

  return (
    <AdminLayout>
      <Head title={`Scrutiny - ${application.application_number} - BCMT Admin`} />

      <div className="max-w-6xl mx-auto py-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Application Roster
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/applications/${application.id}/print`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-4 h-4" /> Print Dossier
            </Link>
          </div>
        </div>

        {/* Candidate Banner */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-7 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Candidate Photo / Monogram */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#07294D] bg-stone-100 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
              {documents.find((d: any) => d.document_type === 'photo') ? (
                <img
                  src={`/documents/${documents.find((d: any) => d.document_type === 'photo').id}/stream`}
                  alt={profile?.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xl font-bold font-serif text-[#07294D]">
                  {profile?.full_name?.charAt(0) || 'C'}
                </div>
              )}
              {application.verification_status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-black text-[#07294D] bg-[#07294D]/10 px-2.5 py-0.5 rounded-md border border-[#07294D]/20">
                  {application.application_number}
                </span>
                <span className="text-xs text-stone-500 font-semibold">{session?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
                {profile?.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-600 font-medium">
                <span>Applied for: <strong className="text-[#07294D]">{program?.name}</strong></span>
                <span>•</span>
                <span>Father: <strong>{profile?.father_name}</strong></span>
                <span>•</span>
                <span className="font-mono">CNIC: {profile?.cnic}</span>
              </div>
            </div>
          </div>

          {/* Metric Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Scrutiny Status */}
            <div className="px-4 py-3 rounded-xl border bg-stone-50 border-stone-200 min-w-[120px]">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Scrutiny Status
              </span>
              <span className={`inline-flex items-center gap-1 font-bold text-xs uppercase mt-0.5 ${
                application.verification_status === 'verified'
                  ? 'text-emerald-700'
                  : application.verification_status === 'correction_required'
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}>
                {application.verification_status === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {application.verification_status}
              </span>
            </div>

            {/* Exam Roll No */}
            <div className="px-4 py-3 rounded-xl border bg-[#07294D]/5 border-[#07294D]/20 min-w-[150px]">
              <span className="text-[10px] text-[#07294D] font-bold uppercase tracking-wider block">
                Exam Roll No
              </span>
              <span className="font-mono font-black text-sm text-[#07294D] mt-0.5 block">
                {application.roll_number || 'Pending Scrutiny'}
              </span>
            </div>

            {/* Seat Allocation */}
            <div className="px-4 py-3 rounded-xl border bg-stone-50 border-stone-200 min-w-[120px]">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Seat Status
              </span>
              <span className={`font-bold text-xs block mt-0.5 ${
                application.seat_allocation?.status === 'confirmed'
                  ? 'text-emerald-700'
                  : application.seat_allocation?.status === 'reserved'
                  ? 'text-amber-700'
                  : 'text-stone-500'
              }`}>
                {application.seat_allocation
                  ? `Seat #${application.seat_allocation.seat_number} (${application.seat_allocation.status.toUpperCase()})`
                  : 'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left 2 Cols: Details & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Data Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                <User className="w-4 h-4 text-[#07294D]" /> Applicant Demographics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block">Father's Name</span>
                  <span className="font-semibold text-stone-800">{profile?.father_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">CNIC / B-Form</span>
                  <span className="font-mono font-semibold text-stone-800">{profile?.cnic || application.normalized_cnic || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Gender</span>
                  <span className="font-semibold text-stone-800 capitalize">{profile?.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Date of Birth</span>
                  <span className="font-semibold text-stone-800">
                    {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (profile?.date_of_birth || 'N/A')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Phone / Mobile</span>
                  <span className="font-semibold text-stone-800 font-mono">{profile?.mobile_number || profile?.phone || 'N/A'}</span>
                  {profile?.whatsapp_number && profile?.whatsapp_number !== (profile?.mobile_number || profile?.phone) && (
                    <span className="text-[10px] text-emerald-600 block">WA: {profile.whatsapp_number}</span>
                  )}
                </div>
                <div>
                  <span className="text-stone-500 block">District Domicile</span>
                  <span className="font-semibold text-stone-800">{profile?.domicile_district || 'N/A'}</span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-stone-500 block">Postal Address</span>
                  <span className="font-semibold text-stone-800">
                    {profile?.current_address || profile?.permanent_address || profile?.postal_address || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Credentials */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#07294D]" /> Academic Qualifications
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px]">
                      <th className="p-2.5">Level</th>
                      <th className="p-2.5">Board / University</th>
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Passing Year</th>
                      <th className="p-2.5">Marks</th>
                      <th className="p-2.5">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {visibleAcademicRecords.map((rec: any) => (
                      <tr key={rec.id}>
                        <td className="p-2.5 font-bold uppercase">{rec.level || rec.degree_level || rec.qualification_name || 'N/A'}</td>
                        <td className="p-2.5">{rec.board_university || rec.board_name || 'N/A'}</td>
                        <td className="p-2.5 font-mono">{rec.roll_number || rec.exam_roll_number || 'N/A'}</td>
                        <td className="p-2.5 font-mono">{rec.passing_year || '—'}</td>
                        <td className="p-2.5 font-medium">
                          {rec.obtained_marks !== undefined && rec.obtained_marks !== null ? rec.obtained_marks : (rec.marks_obtained || 0)} / {rec.total_marks}
                        </td>
                        <td className="p-2.5 font-bold text-[#07294D]">{rec.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Scrutiny Table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#07294D]" /> Uploaded Verification Documents
                </h3>

                <button
                  type="button"
                  onClick={handleApproveAllDocs}
                  disabled={documents.length === 0 || documents.every((d: any) => d.verification_status === 'approved')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-200" />
                  <span>Approve All Documents ({documents.length})</span>
                </button>
              </div>
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          doc.verification_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : doc.verification_status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : doc.verification_status === 'reupload_required'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {doc.verification_status.replace('_', ' ')}
                        </span>
                      </div>
                      {doc.rejection_reason && (
                        <p className="text-rose-600 text-[11px] mt-1 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                          Note: {doc.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/documents/${doc.id}/stream`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg font-medium transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          setActiveDoc(doc);
                          const validStatus = ['approved', 'rejected', 'reupload_required'].includes(doc.verification_status)
                            ? doc.verification_status
                            : 'approved';
                          docVerifyForm.setData({
                            status: validStatus,
                            remarks: doc.rejection_reason || '',
                          });
                        }}
                        className="px-3 py-1.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-lg font-semibold transition cursor-pointer shadow-2xs"
                      >
                        Scrutinize
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Overall Scrutiny Action & Audit Log */}
          <div className="space-y-6">
            {/* Scrutiny Decision Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#07294D]" /> Formal Scrutiny Decision
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Updating status to "Verified" will automatically grant Test Eligibility and generate a sequential Roll Number.
              </p>

              <form onSubmit={handleAppVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Verification Outcome
                  </label>
                  <select
                    value={appVerifyForm.data.status}
                    onChange={(e) => appVerifyForm.setData('status', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-1 focus:ring-[#07294D]"
                  >
                    <option value="verified">Verified (Approved for Test)</option>
                    <option value="correction_required">Correction Required</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Internal Scrutiny Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter administrative remarks or reason for correction..."
                    value={appVerifyForm.data.remarks}
                    onChange={(e) => appVerifyForm.setData('remarks', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#07294D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={appVerifyForm.processing}
                  className="w-full py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {appVerifyForm.processing ? 'Saving...' : 'Apply Verification Decision'}
                </button>
              </form>
            </div>

            {/* Audit History Timeline */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#07294D]" /> Scrutiny Trail
                </h3>
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  Recent 5
                </span>
              </div>
              <div className="space-y-3">
                {application.status_histories?.slice(0, 5).map((hist: any) => (
                  <div key={hist.id} className="text-xs border-l-2 border-[#07294D] pl-3 py-1">
                    <div className="font-semibold text-stone-800">
                      {hist.from_status} → <span className="text-[#07294D] font-bold uppercase">{hist.to_status}</span>
                    </div>
                    {hist.reason && <p className="text-stone-500 text-[11px] mt-0.5">{hist.reason}</p>}
                    <span className="text-[10px] text-stone-400 block mt-1">
                      {hist.user?.name} • {new Date(hist.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
                {(!application.status_histories || application.status_histories.length === 0) && (
                  <p className="text-xs text-stone-400 italic">No scrutiny history recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Document Scrutiny Modal */}
        {activeDoc && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900 mb-1">
                Scrutinize: {activeDoc.document_type.replace('_', ' ').toUpperCase()}
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Verify whether this credential meets institutional clarity and validity criteria.
              </p>

              <form onSubmit={handleDocVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Document Verdict
                  </label>
                  <select
                    value={docVerifyForm.data.status}
                    onChange={(e) => docVerifyForm.setData('status', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  >
                    <option value="approved">Approved</option>
                    <option value="reupload_required">Re-upload Required</option>
                    <option value="rejected">Rejected (Invalid)</option>
                  </select>
                  {docVerifyForm.errors.status && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{docVerifyForm.errors.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Reason / Instructions for Candidate
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Image blurry, please upload clear attested copy."
                    value={docVerifyForm.data.remarks}
                    onChange={(e) => docVerifyForm.setData('remarks', e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  {docVerifyForm.errors.remarks && (
                    <p className="text-rose-600 text-[11px] mt-1 font-semibold">{docVerifyForm.errors.remarks}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoc(null);
                      docVerifyForm.clearErrors();
                    }}
                    className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={docVerifyForm.processing}
                    className="flex-1 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {docVerifyForm.processing ? 'Saving...' : 'Save Verdict'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


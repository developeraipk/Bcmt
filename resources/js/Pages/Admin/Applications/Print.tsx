import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ShieldCheck } from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

interface Props {
  application: any;
}

export default function ApplicationPrint({ application }: Props) {
  const profile = application.applicant_profile;
  const program = application.session_program?.program;
  const session = application.admission_session;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 select-none">
      <Head title={`Dossier - ${application.application_number} - BCMT`} />

      {/* Action Bar (Hidden on print) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <span className="text-xs font-semibold text-stone-600">
          Official Institutional Admission Dossier
        </span>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#FFB606]" /> Print Admission Dossier
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="print-sheet max-w-4xl mx-auto bg-white rounded-2xl border-2 border-stone-800 shadow-xl p-8 sm:p-10 text-stone-900 relative">
        {/* Header */}
        <div className="border-b-2 border-stone-800 pb-6 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BcmtLogo className="w-16 h-16" showText={false} />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#07294D] uppercase">
                Bannu College of Medical Technologies
              </h1>
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mt-0.5">
                Official Admission Application Dossier • Session {session?.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-sm font-black text-[#07294D] bg-slate-100 px-3 py-1 rounded-md border border-slate-300 block">
              {application.application_number}
            </span>
            <span className="text-[10px] text-stone-500 font-bold uppercase mt-1 block">
              Submitted: {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending'}
            </span>
          </div>
        </div>

        {/* Program Box */}
        <div className="bg-stone-50 border border-stone-300 rounded-xl p-3.5 mb-6 flex justify-between items-center text-xs">
          <div>
            <span className="text-stone-500 font-bold uppercase text-[10px] block">Applied Program</span>
            <span className="text-base font-bold text-[#07294D]">{program?.name}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 font-bold uppercase text-[10px] block">Category & Duration</span>
            <span className="font-semibold text-stone-800 uppercase">{program?.category} • {program?.duration_years} Years</span>
          </div>
        </div>

        {/* Bio-data */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200 pb-1 mb-3">
            1. Applicant Demographics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Candidate Name</span>
              <span className="font-bold text-stone-900">{profile?.full_name}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Father's Name</span>
              <span className="font-bold text-stone-900">{profile?.father_name}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">CNIC / B-Form</span>
              <span className="font-mono font-bold text-stone-900">{profile?.cnic}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Gender & DOB</span>
              <span className="font-semibold text-stone-900 capitalize">
                {profile?.gender || 'N/A'} • {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (profile?.date_of_birth || 'N/A')}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Contact Phone</span>
              <span className="font-semibold text-stone-900">{profile?.mobile_number || profile?.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">District of Domicile</span>
              <span className="font-semibold text-stone-900">{profile?.domicile_district || 'N/A'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-stone-500 block text-[10px] uppercase">Postal Address</span>
              <span className="font-semibold text-stone-900">{profile?.current_address || profile?.permanent_address || profile?.postal_address || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Academic Credentials */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200 pb-1 mb-3">
            2. Educational Background
          </h3>
          <table className="w-full text-left text-xs border border-stone-300">
            <thead>
              <tr className="bg-stone-100 font-bold uppercase text-[10px] border-b border-stone-300">
                <th className="p-2 border-r border-stone-300">Degree / Certificate</th>
                <th className="p-2 border-r border-stone-300">Board / Institution</th>
                <th className="p-2 border-r border-stone-300">Roll No</th>
                <th className="p-2 border-r border-stone-300">Marks</th>
                <th className="p-2">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {application.academic_records?.map((rec: any) => (
                <tr key={rec.id}>
                  <td className="p-2 font-bold uppercase border-r border-stone-200">{rec.level || rec.degree_level || rec.qualification_name || 'N/A'}</td>
                  <td className="p-2 border-r border-stone-200">{rec.board_university || rec.board_name || 'N/A'}</td>
                  <td className="p-2 font-mono border-r border-stone-200">{rec.roll_number || rec.exam_roll_number || 'N/A'}</td>
                  <td className="p-2 font-medium border-r border-stone-200">{(rec.obtained_marks ?? rec.marks_obtained ?? 0)} / {rec.total_marks || 0}</td>
                  <td className="p-2 font-bold text-[#07294D]">{rec.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Checklist */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 border-b border-stone-200 pb-1 mb-3">
            3. Document Scrutiny & Verification Log
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {application.documents?.map((doc: any) => (
              <div key={doc.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-900 block capitalize text-[11px]">
                  {doc.document_type.replace('_', ' ')}
                </span>
                <span className={`text-[10px] font-bold uppercase ${
                  doc.verification_status === 'approved' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  Status: {doc.verification_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signatures */}
        <div className="pt-8 border-t-2 border-stone-800 flex justify-between items-end text-xs font-semibold text-stone-700">
          <div className="text-center">
            <div className="w-44 border-b border-stone-400 mb-1" />
            <span>Applicant's Signature</span>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-stone-400 mb-1" />
            <span>Admission Scrutiny Officer</span>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-stone-400 mb-1" />
            <span className="text-[#800000] font-bold">Principal / Director, BCMT</span>
          </div>
        </div>
      </div>
    </div>
  );
}


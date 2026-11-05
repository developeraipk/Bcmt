import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Award,
  Search,
  Lock,
  Printer,
  Calendar,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

interface Props {
  meritLists: any[];
  sessions: any[];
  selectedSessionId: number;
}

export default function PublicMeritLists({
  meritLists = [],
  sessions = [],
  selectedSessionId,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramCode, setSelectedProgramCode] = useState('ALL');

  const filteredLists = meritLists.filter((ml) => {
    const matchesProgram =
      selectedProgramCode === 'ALL' ||
      ml.session_program?.program?.code === selectedProgramCode;

    if (!matchesProgram) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const titleMatch = ml.title.toLowerCase().includes(q);
    const progMatch = ml.session_program?.program?.name.toLowerCase().includes(q);
    const candidateMatch = ml.items?.some((item: any) => {
      const name = item.application?.applicant_profile?.full_name?.toLowerCase() || '';
      const roll = item.application?.roll_number?.toLowerCase() || '';
      const appNum = item.application?.application_number?.toLowerCase() || '';
      return name.includes(q) || roll.includes(q) || appNum.includes(q);
    });

    return titleMatch || progMatch || candidateMatch;
  });

  return (
    <PublicLayout>
      <Head title="Official Published Merit Lists - BCMT Bannu" />

      {/* Hero Header Banner */}
      <section className="bg-gradient-to-b from-[#07294D] to-[#041D3C] text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFB606] text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#FFB606]" />
            <span>KMU Affiliated &amp; Council Recognized</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight mb-4">
            Official Published Merit Lists
          </h1>
          <p className="text-sm sm:text-base text-stone-200 max-w-2xl mx-auto leading-relaxed">
            Authentic, cryptographically locked merit notifications for Bannu College of Medical Technologies admission cohorts.
          </p>

          {/* Session Selector */}
          <div className="mt-6 inline-flex max-w-full items-center gap-2 bg-white/10 backdrop-blur-xs px-3.5 sm:px-4 py-2 rounded-2xl border border-white/20">
            <Calendar className="w-4 h-4 text-[#FFB606] shrink-0" />
            <span className="text-xs text-stone-300 font-semibold shrink-0">Active Session:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => {
                router.get(route('public.merit-lists'), {
                  session_id: e.target.value,
                });
              }}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer truncate max-w-[180px] sm:max-w-none"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} className="text-stone-900">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Candidate Name, Roll #, or Program..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#07294D]"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-600 whitespace-nowrap shrink-0">Program:</span>
            <select
              value={selectedProgramCode}
              onChange={(e) => setSelectedProgramCode(e.target.value)}
              className="w-full sm:w-auto flex-1 sm:flex-initial px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#07294D] cursor-pointer"
            >
              <option value="ALL">All Programs</option>
              <option value="PCB">Pharmacy Category B (PCB)</option>
              <option value="BSECT">Emergency Care Technology (BSECT)</option>
              <option value="BSMLT">Medical Laboratory Technology (BSMLT)</option>
              <option value="HT">Health Technology (HT)</option>
              <option value="PATH">Pathology (PATH)</option>
              <option value="SURG">Surgical (SURG)</option>
              <option value="ANES">Anesthesia (ANES)</option>
              <option value="RADIO">Radiology (RADIO)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Published Lists Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {filteredLists.length > 0 ? (
          <div className="space-y-6">
            {filteredLists.map((ml) => (
              <div
                key={ml.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Official Published
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        Published on {new Date(ml.published_at || ml.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-serif text-[#07294D]">
                      {ml.title}
                    </h3>
                    <p className="text-xs font-semibold text-stone-600 mt-1">
                      Program: <strong className="text-stone-900">{ml.session_program?.program?.name}</strong> • Total Capacity: {ml.session_program?.total_seats} Seats
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={route('public.merit-lists.show', ml.id)}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] rounded-xl text-xs font-bold transition shadow-xs border border-[#FFB606]/30"
                    >
                      <Printer className="w-4 h-4 text-[#FFB606]" /> View Official Gazette
                    </Link>
                  </div>
                </div>

                {/* Candidate Highlight Table Preview */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                        <th className="p-3 text-center w-14">Rank</th>
                        <th className="p-3">Roll No</th>
                        <th className="p-3">Candidate Full Name</th>
                        <th className="p-3">Father&apos;s Name</th>
                        <th className="p-3 text-center">Gender</th>
                        <th className="p-3 text-right">Aggregate Score</th>
                        <th className="p-3 text-center">Admission Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-800">
                      {ml.items && ml.items.slice(0, 10).map((item: any) => {
                        const app = item.application;
                        const prof = app?.applicant_profile;
                        const aggregate = item.aggregate_percentage || item.final_aggregate_score || '0.00';
                        const status = (item.status || item.selection_status || 'eligible').toLowerCase();
                        return (
                          <tr key={item.id} className="hover:bg-stone-50/50 transition">
                            <td className="p-3 text-center font-mono font-black text-sm text-[#07294D]">
                              #{item.rank}
                            </td>
                            <td className="p-3 font-mono font-semibold text-stone-900">
                              {app?.roll_number || app?.application_number || 'N/A'}
                            </td>
                            <td className="p-3 font-bold text-stone-900">
                              {prof?.full_name || 'Candidate'}
                            </td>
                            <td className="p-3 text-stone-600">
                              {prof?.father_name || 'N/A'}
                            </td>
                            <td className="p-3 text-center capitalize font-medium text-stone-700">
                              {prof?.gender || 'N/A'}
                            </td>
                            <td className="p-3 text-right font-mono font-black text-[#07294D]">
                              {aggregate}%
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                      })}
                    </tbody>
                  </table>
                </div>

                {ml.items && ml.items.length > 10 && (
                  <div className="pt-3 text-center text-xs text-stone-500 font-semibold border-t border-stone-100 mt-2">
                    Showing top 10 candidates. <Link href={route('public.merit-lists.show', ml.id)} target="_blank" className="text-[#07294D] hover:underline font-bold">Open Official Gazette</Link> to view all {ml.items.length} candidates.
                  </div>
                )}

                {/* Cryptographic Seal Verification Strip */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 gap-2">
                  <div className="flex items-center gap-1.5 font-mono truncate max-w-lg">
                    <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>SHA-256 Digest: <strong className="text-stone-800">{ml.integrity_hash || ml.sha256_hash}</strong></span>
                  </div>
                  <span className="text-emerald-700 font-bold uppercase text-[10px]">
                    Tamper-Evident Institutional Record
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#07294D]/5 border border-[#07294D]/15 flex items-center justify-center mx-auto mb-4 text-[#07294D]">
              <Award className="w-8 h-8 text-[#FFB606]" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3">
              Official Merit Notification — In Compilation & Review
            </span>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2">
              Official Merit Lists In Preparation
            </h3>
            
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 max-w-lg mx-auto">
              The official merit lists for <strong className="text-stone-900 font-semibold">{sessions.find(s => s.id === selectedSessionId)?.name || 'Current Session'}</strong> are currently undergoing dynamic aggregate ranking and verification by the BCMT Institutional Admissions Committee.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left mb-6 max-w-lg mx-auto text-xs space-y-2">
              <div className="flex items-center gap-2 text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Candidate entrance test marks and academic metrics are being compiled.</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Published lists will be locked with tamper-evident cryptographic SHA-256 seals.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#07294D] hover:bg-[#0A3663] text-white font-bold text-xs transition shadow-xs"
              >
                <span>Check Personal Candidate Status</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB606]" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
              >
                <span>Contact Admissions Office</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

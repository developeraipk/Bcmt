import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Plus, CheckCircle2, Clock, Users, BookOpen, Edit, Trash2 } from 'lucide-react';

interface Props {
  sessions: any[];
}

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  try {
    const cleanStr = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return cleanStr;
  } catch {
    return String(dateStr).substring(0, 10);
  }
}

export default function SessionsIndex({ sessions }: Props) {
  const handleDelete = (session: any) => {
    if (confirm(`Are you sure you want to delete admission session "${session.name}"?`)) {
      router.delete(`/admin/sessions/${session.id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <AdminLayout>
      <Head title="Admission Sessions - BCMT Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Cohort Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Academic Admission Sessions
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure application windows, program seat capacities, and session statuses.
          </p>
        </div>

        <Link
          href={route('admin.sessions.create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FFB606]" /> New Admission Session
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                <th className="p-4">Session Name & Code</th>
                <th className="p-4">Timeline</th>
                <th className="p-4 text-center">Active Status</th>
                <th className="p-4 text-center">Lifecycle Status</th>
                <th className="p-4 text-center">Programs Offered</th>
                <th className="p-4 text-center">Applications</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-4">
                    <span className="font-bold text-stone-900 text-sm block">{s.name}</span>
                    <span className="font-mono text-stone-400 text-xs">{s.code}</span>
                  </td>
                  <td className="p-4 text-stone-600 text-xs">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 w-11">Start:</span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {formatDisplayDate(s.start_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 w-11">Close:</span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {formatDisplayDate(s.closing_date)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> CURRENT ACTIVE
                      </span>
                    ) : (
                      <span className="text-stone-400 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 capitalize">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-stone-800">
                    {s.session_programs_count} Programs
                  </td>
                  <td className="p-4 text-center font-bold text-[#07294D]">
                    {s.applications_count}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link
                        href={`/admin/sessions/${s.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(s)}
                        title="Delete this admission session"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold transition border border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}


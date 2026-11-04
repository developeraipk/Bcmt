import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Shield, Clock, User, Eye, Search, Trash2, LogOut, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface Props {
  logs: {
    data: any[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
  };
  filters?: {
    search?: string;
    event?: string;
  };
  distinctEvents?: string[];
}

function formatActionName(actionName?: string) {
  if (!actionName) return 'System Event';
  return actionName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionBadgeClass(actionName?: string) {
  const act = (actionName || '').toLowerCase();
  if (act.includes('login') || act.includes('auth')) {
    return 'bg-sky-50 text-sky-800 border-sky-200';
  }
  if (act.includes('clear') || act.includes('delete') || act.includes('revoke') || act.includes('reject')) {
    return 'bg-rose-50 text-rose-800 border-rose-200';
  }
  if (act.includes('pin') || act.includes('lock') || act.includes('warning')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (act.includes('verified') || act.includes('approved') || act.includes('created') || act.includes('attendance')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  return 'bg-[#07294D]/10 text-[#07294D] border-[#07294D]/20';
}

export default function AuditLogsIndex({ logs, filters = {}, distinctEvents = [] }: Props) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [selectedEvent, setSelectedEvent] = useState(filters.event || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      '/admin/audit-logs',
      { search: search || undefined, event: selectedEvent || undefined },
      { preserveState: true }
    );
  };

  const handleClearAll = () => {
    router.delete('/admin/audit-logs/clear', {
      onSuccess: () => setShowClearConfirm(false),
    });
  };

  const handleRevokeActor = (logId: number, userName: string) => {
    if (confirm(`Revoke active sessions and force logout '${userName}'? Any in-progress exam attempt will also be safely terminated.`)) {
      router.post(`/admin/audit-logs/${logId}/revoke-actor`);
    }
  };

  const handleDeleteLog = (logId: number) => {
    if (confirm('Delete this single audit log entry?')) {
      router.delete(`/admin/audit-logs/${logId}`);
    }
  };

  return (
    <AdminLayout>
      <Head title="Security & Audit Logs - BCMT Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Cybersecurity & Integrity Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Institutional Audit & Security Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking of administrative decisions, logins, PIN rotations, and exam access events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-200">
            <span className="text-xs text-slate-400 block font-medium">Total Audited Events</span>
            <span className="text-xl font-bold font-mono text-[#07294D]">{logs.total}</span>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear All Logs
          </button>
        </div>
      </div>

      {/* Search & Event Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor name, email, IP, or event action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                router.get(
                  '/admin/audit-logs',
                  { search: search || undefined, event: e.target.value || undefined },
                  { preserveState: true }
                );
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
            >
              <option value="">All Audited Events</option>
              {distinctEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {formatActionName(evt)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Filter Logs
          </button>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event / Action</th>
                <th className="p-4">Actor / User</th>
                <th className="p-4">Entity</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {logs.data.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border font-mono ${getActionBadgeClass(log.action || log.event)}`}>
                      {formatActionName(log.action || log.event)}
                    </span>
                  </td>
                  <td className="p-4 font-sans">
                    <span className="font-bold text-slate-900 block">{log.user?.name || 'System Action'}</span>
                    <span className="text-[11px] text-slate-400">{log.user?.email || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-slate-600 font-sans text-xs">
                    {log.entity_type ? (
                      <span className="font-medium text-slate-800">
                        {String(log.entity_type).replace(/^App\\Models\\/, '')} {log.entity_id ? <span className="font-mono text-slate-500">#{log.entity_id}</span> : ''}
                      </span>
                    ) : log.auditable_type ? (
                      <span className="font-medium text-slate-800">
                        {String(log.auditable_type).replace(/^App\\Models\\/, '')} {log.auditable_id ? <span className="font-mono text-slate-500">#{log.auditable_id}</span> : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">General System</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="p-4 text-right font-sans">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setSelectedLog(log)}
                        title="View log payload details"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        View
                      </button>

                      {log.user_id && (
                        <button
                          onClick={() => handleRevokeActor(log.id, log.user?.name || 'User')}
                          title="Revoke active sessions and force logout this user"
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" /> Revoke
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        title="Delete single log record"
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 font-sans">
                    <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No security audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {logs.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {logs.links.map((link, idx) => (
            <button
              key={idx}
              disabled={!link.url}
              onClick={() => router.get(link.url, {}, { preserveState: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                link.active
                  ? 'bg-[#07294D] text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              } disabled:opacity-40 cursor-pointer`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#07294D]" />
                Event: {selectedLog.event}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Logged at {new Date(selectedLog.created_at).toLocaleString()} by {selectedLog.user?.name || 'System Action'} ({selectedLog.ip_address || '127.0.0.1'})
            </p>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-60 mb-5">
              <pre>{JSON.stringify(selectedLog.new_values || selectedLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end gap-2">
              {selectedLog.user_id && (
                <button
                  onClick={() => {
                    const user = selectedLog.user?.name || 'User';
                    setSelectedLog(null);
                    handleRevokeActor(selectedLog.id, user);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Revoke Actor Session
                </button>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear All Logs */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clear All Security Logs?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to permanently clear all {logs.total} audit trail logs? This action is immediate and cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Yes, Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

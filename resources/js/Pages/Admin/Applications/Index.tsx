import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Download,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Upload,
  User,
  BookOpen,
  Award,
  KeyRound,
  EyeOff
} from 'lucide-react';

interface Props {
  applications: {
    data: any[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
  };
  filters: any;
  sessions: any[];
  programs: any[];
  sessionPrograms?: any[];
}

export default function ApplicationsIndex({
  applications,
  filters,
  sessions,
  programs,
  sessionPrograms = [],
}: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedSession, setSelectedSession] = useState(filters.session_id || '');
  const [selectedProgram, setSelectedProgram] = useState(filters.program_id || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.verification_status || '');
  const [selectedGender, setSelectedGender] = useState(filters.gender || '');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<any | null>(null);
  const [addPhotoPreview, setAddPhotoPreview] = useState<string | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Real-Time Background Synchronization (Node.js style live polling without manual page refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showAddModal && !editingApp && !deleteConfirmApp) {
        router.reload({
          only: ['applications'],
          preserveScroll: true,
        });
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [showAddModal, editingApp, deleteConfirmApp]);

  const applyFilters = () => {
    router.get(
      '/admin/applications',
      {
        search: search || undefined,
        session_id: selectedSession || undefined,
        program_id: selectedProgram || undefined,
        verification_status: selectedStatus || undefined,
        gender: selectedGender || undefined,
      },
      { preserveState: true }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase border border-emerald-300">Verified</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase border border-rose-300">Rejected</span>;
      case 'correction_required':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase border border-amber-300">Correction</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 uppercase border border-stone-300">Pending</span>;
    }
  };

  // Add Application Form
  const addForm = useForm({
    admission_session_id: selectedSession || (sessions[0]?.id ?? ''),
    session_program_id: sessionPrograms[0]?.id || '',
    full_name: '',
    father_name: '',
    dob: '2004-01-01',
    gender: 'male',
    cnic: '',
    mobile_number: '',
    whatsapp_number: '',
    email: '',
    password: '',
    domicile_district: 'Bannu',
    current_address: 'Circular Road near Hira School, Sokari Gate, Bannu',
    permanent_address: 'Bannu, Khyber Pakhtunkhwa',
    verification_status: 'pending',
    matric_board: 'BISE Bannu',
    matric_total_marks: 1100,
    matric_obtained_marks: 850,
    inter_board: 'BISE Bannu',
    inter_total_marks: 1100,
    inter_obtained_marks: 820,
    photo: null as File | null,
    doc_photo: null as File | null,
    doc_matric_dmc: null as File | null,
    doc_inter_dmc: null as File | null,
    doc_cnic_front: null as File | null,
    doc_domicile: null as File | null,
  });

  const currentAddProgram = sessionPrograms.find(
    (sp: any) => String(sp.id) === String(addForm.data.session_program_id)
  );
  const isAddBsProgram =
    currentAddProgram?.program?.category === 'bs_program' ||
    currentAddProgram?.program?.category === 'bs_degree' ||
    (currentAddProgram?.program?.name && currentAddProgram.program.name.toUpperCase().includes('BS')) ||
    (currentAddProgram?.program?.code && currentAddProgram.program.code.toUpperCase().startsWith('BS'));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm.post('/admin/applications', {
      forceFormData: true,
      onSuccess: () => {
        setShowAddModal(false);
        addForm.reset();
        setAddPhotoPreview(null);
      },
    });
  };

  // Edit Application Form
  const editForm = useForm({
    session_program_id: '',
    full_name: '',
    father_name: '',
    dob: '',
    gender: 'male',
    cnic: '',
    mobile_number: '',
    whatsapp_number: '',
    email: '',
    password: '',
    domicile_district: '',
    current_address: '',
    permanent_address: '',
    verification_status: 'pending',
    roll_number: '',
    matric_board: '',
    matric_total_marks: 1100,
    matric_obtained_marks: 0,
    inter_board: '',
    inter_total_marks: 1100,
    inter_obtained_marks: 0,
    photo: null as File | null,
    doc_photo: null as File | null,
    doc_matric_dmc: null as File | null,
    doc_inter_dmc: null as File | null,
    doc_cnic_front: null as File | null,
    doc_domicile: null as File | null,
  });

  const currentEditProgram = sessionPrograms.find(
    (sp: any) => String(sp.id) === String(editForm.data.session_program_id)
  );
  const isEditBsProgram =
    currentEditProgram?.program?.category === 'bs_program' ||
    currentEditProgram?.program?.category === 'bs_degree' ||
    (currentEditProgram?.program?.name && currentEditProgram.program.name.toUpperCase().includes('BS')) ||
    (currentEditProgram?.program?.code && currentEditProgram.program.code.toUpperCase().startsWith('BS'));

  const handleOpenEdit = (app: any) => {
    setEditingApp(app);
    setEditPhotoPreview(app.photo_url || null);
    editForm.setData({
      session_program_id: String(app.session_program_id || ''),
      full_name: app.applicant_profile?.full_name || '',
      father_name: app.applicant_profile?.father_name || '',
      dob: app.applicant_profile?.dob ? String(app.applicant_profile.dob).split('T')[0] : '2004-01-01',
      gender: app.applicant_profile?.gender || 'male',
      cnic: app.applicant_profile?.cnic || '',
      mobile_number: app.applicant_profile?.mobile_number || '',
      whatsapp_number: app.applicant_profile?.whatsapp_number || app.applicant_profile?.mobile_number || '',
      email: app.applicant_profile?.email || '',
      password: '',
      domicile_district: app.applicant_profile?.domicile_district || 'Bannu',
      current_address: app.applicant_profile?.current_address || '',
      permanent_address: app.applicant_profile?.permanent_address || '',
      verification_status: app.verification_status || 'pending',
      roll_number: app.roll_number || '',
      matric_board: app.matric?.board_university || 'BISE Bannu',
      matric_total_marks: app.matric?.total_marks ? Number(app.matric.total_marks) : 1100,
      matric_obtained_marks: app.matric?.obtained_marks ? Number(app.matric.obtained_marks) : 0,
      inter_board: app.intermediate?.board_university || 'BISE Bannu',
      inter_total_marks: app.intermediate?.total_marks ? Number(app.intermediate.total_marks) : 1100,
      inter_obtained_marks: app.intermediate?.obtained_marks ? Number(app.intermediate.obtained_marks) : 0,
      photo: null,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    editForm.post(`/admin/applications/${editingApp.id}/update`, {
      forceFormData: true,
      onSuccess: () => {
        setEditingApp(null);
        setEditPhotoPreview(null);
      },
    });
  };

  const handleDeleteSubmit = () => {
    if (!deleteConfirmApp) return;
    router.delete(`/admin/applications/${deleteConfirmApp.id}`, {
      onSuccess: () => setDeleteConfirmApp(null),
    });
  };

  return (
    <AdminLayout>
      <Head title="Candidate Applications & Scrutiny - BCMT Admin & HOD" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Applicant Scrutiny & Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Admission Applications
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review candidate credentials, add new applicants, update academic records, and manage scrutiny standing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border border-[#FFB606]/30"
          >
            <Plus className="w-4 h-4 text-[#FFB606]" />
            <span>New Application</span>
          </button>

          <a
            href={`/admin/applications/export?${new URLSearchParams(
              Object.fromEntries(Object.entries(filters).filter(([_, v]) => Boolean(v)) as [string, string][])
            ).toString()}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </a>

          <a
            href={`/admin/applications/print-roster?${new URLSearchParams(
              Object.fromEntries(Object.entries(filters).filter(([_, v]) => Boolean(v)) as [string, string][])
            ).toString()}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] rounded-xl text-xs font-bold transition shadow-xs border border-[#FFB606]/30"
          >
            <Printer className="w-4 h-4 text-[#FFB606]" />
            <span>Print Cohort Roster</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Name, App #, CNIC, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#07294D] focus:outline-none"
          />
        </div>

        {/* Session */}
        <div>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            aria-label="Filter by Session"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#07294D] focus:outline-none"
          >
            <option value="">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Program */}
        <div>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            aria-label="Filter by Program"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#07294D] focus:outline-none"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.code}</option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by Scrutiny Status"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#07294D] focus:outline-none"
          >
            <option value="">All Scrutiny Statuses</option>
            <option value="pending">Pending Scrutiny</option>
            <option value="verified">Verified</option>
            <option value="correction_required">Correction Required</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Apply Button */}
        <div>
          <button
            onClick={applyFilters}
            className="w-full py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Filter Records
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                <th className="p-4">App # &amp; Roll No</th>
                <th className="p-4">Applicant Name</th>
                <th className="p-4">CNIC &amp; Phone</th>
                <th className="p-4">Program</th>
                <th className="p-4 text-center">Gender</th>
                <th className="p-4 text-center">Scrutiny Status</th>
                <th className="p-4 text-center">Exam Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {applications.data.map((app) => (
                <tr key={app.id} className="hover:bg-stone-50/50 transition">
                  {/* App # & Roll */}
                  <td className="p-4">
                    <span className="font-mono font-bold text-stone-900 block">{app.application_number}</span>
                    <span className="font-mono text-[11px] text-[#07294D] font-semibold">
                      {app.roll_number ? `Roll: ${app.roll_number}` : 'No Roll Assigned'}
                    </span>
                  </td>

                  {/* Applicant Name with Photo */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {app.photo_url ? (
                        <img
                          src={app.photo_url}
                          alt={app.applicant_profile?.full_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#07294D]/30 shrink-0 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#07294D] text-[#FFB606] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {(app.applicant_profile?.full_name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                          {app.applicant_profile?.full_name}
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          S/D of {app.applicant_profile?.father_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* CNIC & Phone */}
                  <td className="p-4">
                    <span className="font-mono text-stone-800 block">{app.applicant_profile?.cnic}</span>
                    <span className="text-stone-500 text-[11px]">{app.applicant_profile?.mobile_number || app.applicant_profile?.whatsapp_number || 'N/A'}</span>
                  </td>

                  {/* Program */}
                  <td className="p-4 font-semibold text-stone-800">
                    <div>{app.session_program?.program?.name}</div>
                    <span className="text-[10px] text-stone-400 font-mono">{app.session_program?.program?.code}</span>
                  </td>

                  {/* Gender */}
                  <td className="p-4 text-center capitalize font-medium text-stone-700">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      app.applicant_profile?.gender === 'female'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {app.applicant_profile?.gender}
                    </span>
                  </td>

                  {/* Scrutiny Status */}
                  <td className="p-4 text-center">
                    {getStatusBadge(app.verification_status)}
                  </td>

                  {/* Exam Eligibility */}
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      app.exam_eligibility_status === 'eligible'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}>
                      {app.exam_eligibility_status}
                    </span>
                  </td>

                  {/* Actions: Scrutiny, Edit, Delete, Print */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        title="View Full Document Scrutiny"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-lg text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FFB606]" /> Scrutiny
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(app)}
                        title="Edit Application & Academic Credentials"
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmApp(app)}
                        title="Permanently Delete Application and Related Records"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/admin/applications/${app.id}/print`}
                        target="_blank"
                        title="Print Application Summary"
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {applications.data.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    No admission applications match the specified criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {applications.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {applications.links.map((link, idx) => (
            <button
              key={idx}
              disabled={!link.url}
              onClick={() => router.get(link.url, {}, { preserveState: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                link.active
                  ? 'bg-[#07294D] text-[#FFB606]'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
              } disabled:opacity-40`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}

      {/* Modal: Add New Application */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#07294D] text-[#FFB606] rounded-xl">
                  <User className="w-5 h-5 text-[#FFB606]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Add New Candidate Application</h3>
                  <p className="text-xs text-stone-500">Direct administrative registration for an applicant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-6">
              {/* Program & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Admission Session <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={addForm.data.admission_session_id}
                    onChange={(e) => addForm.setData('admission_session_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Applied Program <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={addForm.data.session_program_id}
                    onChange={(e) => addForm.setData('session_program_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                  >
                    {sessionPrograms.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.program?.name} ({sp.program?.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  {currentEditProgram && (
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 bg-[#07294D] text-[#FFB606] rounded">
                          {currentEditProgram.program?.code}
                        </span>
                        <span className="font-bold text-slate-800">
                          {currentEditProgram.program?.name}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        isEditBsProgram
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <GraduationCap className="w-3 h-3" />
                        <span>
                          {isEditBsProgram ? '4-Year BS Degree (Matric + Inter Required)' : '2-Year Diploma (Matric Required)'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                {currentAddProgram && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-xs px-2.5 py-1 bg-[#07294D] text-[#FFB606] rounded-md shadow-2xs">
                        {currentAddProgram.program?.code}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {currentAddProgram.program?.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {currentAddProgram.program?.category === 'bs_degree'
                            ? '4-Year Professional BS Degree'
                            : currentAddProgram.program?.category === 'pharmacy_b'
                            ? '2-Year Pharmacy Category B'
                            : '2-Year Medical Technology Diploma'} • {currentAddProgram.total_seats || 50} Seats
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                        isAddBsProgram
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>
                          {isAddBsProgram
                            ? 'Prerequisite: Intermediate (HSSC Pre-Med / Pre-Eng)'
                            : 'Prerequisite: Matriculation (Science Pass)'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#07294D]" /> Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.data.full_name}
                      onChange={(e) => addForm.setData('full_name', e.target.value)}
                      required
                      placeholder="e.g. Muhammad Ibrar"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Father's Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.data.father_name}
                      onChange={(e) => addForm.setData('father_name', e.target.value)}
                      required
                      placeholder="e.g. Israr Khan"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      CNIC / Form-B <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.data.cnic}
                      onChange={(e) => addForm.setData('cnic', e.target.value)}
                      required
                      placeholder="11101-1234567-1"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={addForm.data.dob}
                      onChange={(e) => addForm.setData('dob', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Gender <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={addForm.data.gender}
                      onChange={(e) => addForm.setData('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg capitalize"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Domicile District
                    </label>
                    <input
                      type="text"
                      value={addForm.data.domicile_district}
                      onChange={(e) => addForm.setData('domicile_district', e.target.value)}
                      placeholder="e.g. Bannu"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.data.mobile_number}
                      onChange={(e) => addForm.setData('mobile_number', e.target.value)}
                      required
                      placeholder="03326485172"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={addForm.data.whatsapp_number}
                      onChange={(e) => addForm.setData('whatsapp_number', e.target.value)}
                      placeholder="03326485172"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={addForm.data.email}
                      onChange={(e) => addForm.setData('email', e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-stone-700">
                        Portal Password (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoPass = 'Bcmt@' + Math.floor(1000 + Math.random() * 9000);
                          addForm.setData('password', autoPass);
                        }}
                        className="text-[10px] text-[#07294D] hover:underline font-bold"
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showAddPassword ? 'text' : 'password'}
                        value={addForm.data.password || ''}
                        onChange={(e) => addForm.setData('password', e.target.value)}
                        placeholder="Default: Bcmt@[Last 4 of CNIC]"
                        className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-lg font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        title={showAddPassword ? 'Hide password' : 'Show password'}
                      >
                        {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Candidate will use this password &amp; email to login.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Current Address</label>
                    <input
                      type="text"
                      value={addForm.data.current_address}
                      onChange={(e) => addForm.setData('current_address', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Permanent Address</label>
                    <input
                      type="text"
                      value={addForm.data.permanent_address}
                      onChange={(e) => addForm.setData('permanent_address', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Academic Credentials */}
              <div className="border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#07294D]" /> Academic Qualifications
                  </h4>
                  <span className="text-[11px] font-medium text-stone-500">
                    {isAddBsProgram
                      ? 'Both Matric (SSC) and Intermediate (HSSC) are required for BS degree admissions'
                      : 'Only Matric (SSC) is required for 2-Year Diploma programs'}
                  </span>
                </div>

                <div className={`grid grid-cols-1 ${isAddBsProgram ? 'sm:grid-cols-2' : ''} gap-4 text-xs`}>
                  {/* Matric */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 block text-xs">Matriculation (SSC)</span>
                      <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Mandatory</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Board Name (e.g. BISE Bannu)"
                      value={addForm.data.matric_board}
                      onChange={(e) => addForm.setData('matric_board', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Total Marks"
                        value={addForm.data.matric_total_marks}
                        onChange={(e) => addForm.setData('matric_total_marks', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Obtained Marks"
                        value={addForm.data.matric_obtained_marks}
                        onChange={(e) => addForm.setData('matric_obtained_marks', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Inter (Shown for BS Programs) */}
                  {isAddBsProgram && (
                    <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 block text-xs">Intermediate (HSSC Pre-Med / Pre-Eng)</span>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">BS Required</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Board Name (e.g. BISE Bannu)"
                        value={addForm.data.inter_board}
                        onChange={(e) => addForm.setData('inter_board', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Total Marks"
                          value={addForm.data.inter_total_marks}
                          onChange={(e) => addForm.setData('inter_total_marks', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Obtained Marks"
                          value={addForm.data.inter_obtained_marks}
                          onChange={(e) => addForm.setData('inter_obtained_marks', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Documents Upload Panel (Matching Public Application Wizard) */}
              <div className="border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#07294D]" /> Application Documents
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    Supports JPG, PNG, PDF (Up to 5MB each)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {/* Photo */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800">1. Candidate Photo</span>
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {addPhotoPreview ? (
                          <img src={addPhotoPreview} alt="Photo" className="w-10 h-10 rounded object-cover border border-[#07294D]" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white border border-dashed border-stone-300 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-stone-400" />
                          </div>
                        )}
                        <span className="text-[10px] text-stone-500 truncate">{addForm.data.photo?.name || 'Passport size'}</span>
                      </div>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Browse Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          addForm.setData('photo', file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setAddPhotoPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            setAddPhotoPreview(null);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Matric DMC */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800">2. Matric DMC / Certificate</span>
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-2 truncate">
                        {addForm.data.doc_matric_dmc?.name || 'SSC Verified Result Card'}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Browse Matric DMC</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => addForm.setData('doc_matric_dmc', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {/* Intermediate DMC (Only shown for BS Program) */}
                  {isAddBsProgram && (
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-indigo-900">3. Inter DMC / Result</span>
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">BS Required</span>
                        </div>
                        <p className="text-[10px] text-indigo-700 mb-2 truncate">
                          {addForm.data.doc_inter_dmc?.name || 'HSSC Pre-Med / Pre-Eng Card'}
                        </p>
                      </div>
                      <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-indigo-50 border border-indigo-300 rounded text-[11px] font-bold text-indigo-900">
                        <span>Browse Inter DMC</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => addForm.setData('doc_inter_dmc', e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  )}

                  {/* CNIC / B-Form */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800">4. CNIC / B-Form Card</span>
                        <span className="text-[9px] font-bold text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded">Identity</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-2 truncate">
                        {addForm.data.doc_cnic_front?.name || 'National Identity / B-Form'}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Browse CNIC / Form-B</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => addForm.setData('doc_cnic_front', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {/* Domicile */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800">5. Domicile Certificate</span>
                        <span className="text-[9px] font-bold text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded">District</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-2 truncate">
                        {addForm.data.doc_domicile?.name || 'District Domicile Document'}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Browse Domicile</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => addForm.setData('doc_domicile', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-stone-200 pt-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Initial Scrutiny Status
                  </label>
                  <select
                    value={addForm.data.verification_status}
                    onChange={(e) => addForm.setData('verification_status', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="pending">Pending Scrutiny (Review documents later)</option>
                    <option value="verified">Verified (Automatically Generates Roll # &amp; Clears for Exam)</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addForm.processing}
                  className="px-5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#FFB606]" />
                  <span>{addForm.processing ? 'Creating Application...' : 'Register Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Application */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#07294D] text-[#FFB606] rounded-xl">
                  <Edit3 className="w-5 h-5 text-[#FFB606]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Edit Application #{editingApp.application_number}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Changes reflect instantly across student portal, examinations, results, and merit lists
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-6">
              {/* Program & Roll & Scrutiny */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Applied Program <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={editForm.data.session_program_id}
                    onChange={(e) => editForm.setData('session_program_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-semibold"
                  >
                    {sessionPrograms.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.program?.name} ({sp.program?.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  {currentEditProgram && (
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 bg-[#07294D] text-[#FFB606] rounded">
                          {currentEditProgram.program?.code}
                        </span>
                        <span className="font-bold text-slate-800">
                          {currentEditProgram.program?.name}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        isEditBsProgram
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <GraduationCap className="w-3 h-3" />
                        <span>
                          {isEditBsProgram ? '4-Year BS Degree (Matric + Inter Required)' : '2-Year Diploma (Matric Required)'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Scrutiny Status <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={editForm.data.verification_status}
                    onChange={(e) => editForm.setData('verification_status', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-semibold capitalize"
                  >
                    <option value="pending">Pending Scrutiny</option>
                    <option value="verified">Verified (Eligible &amp; Assigns Roll #)</option>
                    <option value="correction_required">Correction Required</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editForm.data.roll_number}
                    onChange={(e) => editForm.setData('roll_number', e.target.value)}
                    placeholder="Auto or Manual Roll #"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#07294D]" /> Candidate Demographics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.data.full_name}
                      onChange={(e) => editForm.setData('full_name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Father's Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.data.father_name}
                      onChange={(e) => editForm.setData('father_name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      CNIC / Form-B <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.data.cnic}
                      onChange={(e) => editForm.setData('cnic', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={editForm.data.dob}
                      onChange={(e) => editForm.setData('dob', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Gender <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={editForm.data.gender}
                      onChange={(e) => editForm.setData('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg capitalize"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Domicile District
                    </label>
                    <input
                      type="text"
                      value={editForm.data.domicile_district}
                      onChange={(e) => editForm.setData('domicile_district', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.data.mobile_number}
                      onChange={(e) => editForm.setData('mobile_number', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={editForm.data.whatsapp_number}
                      onChange={(e) => editForm.setData('whatsapp_number', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.data.email}
                      onChange={(e) => editForm.setData('email', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-stone-700">
                        Reset / Set Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoPass = 'Bcmt@' + Math.floor(1000 + Math.random() * 9000);
                          editForm.setData('password', autoPass);
                        }}
                        className="text-[10px] text-[#07294D] hover:underline font-bold"
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editForm.data.password || ''}
                        onChange={(e) => editForm.setData('password', e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-lg font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        title={showEditPassword ? 'Hide password' : 'Show password'}
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Enter new password if candidate forgot or needs reset.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Current Address</label>
                    <input
                      type="text"
                      value={editForm.data.current_address}
                      onChange={(e) => editForm.setData('current_address', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Permanent Address</label>
                    <input
                      type="text"
                      value={editForm.data.permanent_address}
                      onChange={(e) => editForm.setData('permanent_address', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Academic Credentials */}
              <div className="border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#07294D]" /> Academic Qualifications
                  </h4>
                  <span className="text-[11px] font-medium text-stone-500">
                    {isEditBsProgram
                      ? 'Matric (SSC) & Intermediate (HSSC) required for BS degree'
                      : 'Matric (SSC) is the primary required qualification for Diplomas'}
                  </span>
                </div>

                <div className={`grid grid-cols-1 ${isEditBsProgram ? 'sm:grid-cols-2' : ''} gap-4 text-xs`}>
                  {/* Matric */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                    <span className="font-bold text-stone-800 block text-xs">Matriculation (SSC)</span>
                    <input
                      type="text"
                      placeholder="Board Name"
                      value={editForm.data.matric_board}
                      onChange={(e) => editForm.setData('matric_board', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 font-semibold">Total Marks</label>
                        <input
                          type="number"
                          value={editForm.data.matric_total_marks}
                          onChange={(e) => editForm.setData('matric_total_marks', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 font-semibold">Obtained Marks</label>
                        <input
                          type="number"
                          value={editForm.data.matric_obtained_marks}
                          onChange={(e) => editForm.setData('matric_obtained_marks', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inter */}
                  {isEditBsProgram && (
                    <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200 space-y-2.5">
                      <span className="font-bold text-indigo-900 block text-xs">Intermediate (HSSC Pre-Medical / Pre-Eng)</span>
                      <input
                        type="text"
                        placeholder="Board Name"
                        value={editForm.data.inter_board}
                        onChange={(e) => editForm.setData('inter_board', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-indigo-700 font-semibold">Total Marks</label>
                          <input
                            type="number"
                            value={editForm.data.inter_total_marks}
                            onChange={(e) => editForm.setData('inter_total_marks', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-indigo-700 font-semibold">Obtained Marks</label>
                          <input
                            type="number"
                            value={editForm.data.inter_obtained_marks}
                            onChange={(e) => editForm.setData('inter_obtained_marks', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Documents Upload / Replacement Panel */}
              <div className="border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#07294D]" /> Application Documents
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    Upload new files to replace existing documents
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {/* Photo */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-stone-800 block mb-2">1. Candidate Photo</span>
                      <div className="flex items-center gap-2 mb-2">
                        {editPhotoPreview ? (
                          <img src={editPhotoPreview} alt="Photo" className="w-10 h-10 rounded object-cover border border-[#07294D]" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white border border-dashed border-stone-300 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-stone-400" />
                          </div>
                        )}
                        <span className="text-[10px] text-stone-500 truncate">{editForm.data.photo?.name || 'Current Photo'}</span>
                      </div>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Replace Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          editForm.setData('photo', file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditPhotoPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Matric DMC */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-stone-800 block mb-2">2. Matric DMC</span>
                      <p className="text-[10px] text-stone-500 mb-2 truncate">
                        {editForm.data.doc_matric_dmc?.name || (editingApp.documents?.find((d: any) => d.document_type === 'matric_dmc')?.original_filename || 'No document uploaded')}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Upload Matric DMC</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => editForm.setData('doc_matric_dmc', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {/* Inter DMC (BS Only) */}
                  {isEditBsProgram && (
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-indigo-900 block mb-2">3. Inter DMC (HSSC)</span>
                        <p className="text-[10px] text-indigo-700 mb-2 truncate">
                          {editForm.data.doc_inter_dmc?.name || (editingApp.documents?.find((d: any) => d.document_type === 'inter_dmc')?.original_filename || 'No document uploaded')}
                        </p>
                      </div>
                      <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-indigo-50 border border-indigo-300 rounded text-[11px] font-bold text-indigo-900">
                        <span>Upload Inter DMC</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => editForm.setData('doc_inter_dmc', e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  )}

                  {/* CNIC / B-Form */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-stone-800 block mb-2">4. CNIC / Form-B</span>
                      <p className="text-[10px] text-stone-500 mb-2 truncate">
                        {editForm.data.doc_cnic_front?.name || (editingApp.documents?.find((d: any) => d.document_type === 'cnic_front')?.original_filename || 'No document uploaded')}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Upload CNIC</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => editForm.setData('doc_cnic_front', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {/* Domicile */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-stone-800 block mb-2">5. Domicile</span>
                      <p className="text-[10px] text-stone-500 mb-2 truncate">
                        {editForm.data.doc_domicile?.name || (editingApp.documents?.find((d: any) => d.document_type === 'domicile')?.original_filename || 'No document uploaded')}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1 py-1 px-2 bg-white hover:bg-stone-100 border border-stone-300 rounded text-[11px] font-bold text-stone-700">
                      <span>Upload Domicile</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => editForm.setData('doc_domicile', e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.processing}
                  className="px-5 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#FFB606]" />
                  <span>{editForm.processing ? 'Saving Changes...' : 'Save & Propagate Everywhere'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-900">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900">Permanently Delete Application?</h3>
                <span className="text-xs font-mono text-stone-500 font-bold">
                  #{deleteConfirmApp.application_number}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Are you sure you want to delete application for candidate <strong className="text-stone-900">{deleteConfirmApp.applicant_profile?.full_name}</strong>?
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1 mb-5">
              <span className="font-bold block">Cascading purge includes:</span>
              <p>• Candidate entrance test attempt &amp; answer sheet</p>
              <p>• Examination marks &amp; formal grading records</p>
              <p>• Examination attendance and room seat assignment</p>
              <p>• Published or draft merit list ranking</p>
              <p>• Reserved / Confirmed admission seat</p>
              <p>• Uploaded CNIC, DMCs, and photo documents</p>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmApp(null)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm &amp; Delete Forever</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
  Settings,
  Building,
  PhoneCall,
  MessageCircle,
  AlertCircle,
  Save,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
  User,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  X,
  RefreshCw,
} from 'lucide-react';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  roles?: Array<{ id: number; name: string; display_name?: string }>;
}

interface Props {
  settings: {
    college_name: string;
    college_short_name: string;
    tagline: string;
    campus_address: string;
    official_phone: string;
    official_mobile: string;
    official_email: string;
    whatsapp_community_enabled: boolean;
    whatsapp_community_url: string;
    whatsapp_support_enabled: boolean;
    whatsapp_support_phone: string;
    admission_open_status: boolean;
    admission_closed_notice: string;
    exam_instructions: string;
  };
  staffUsers?: StaffUser[];
}

export default function SettingsIndex({ settings, staffUsers = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'institutional' | 'admin_password' | 'staff_passwords'>('institutional');

  // 1. Institutional Settings Form
  const { data, setData, post, processing, errors } = useForm({
    college_name: settings.college_name || 'Bannu College of Medical Technologies',
    college_short_name: settings.college_short_name || 'BCMT',
    tagline: settings.tagline || 'The Home of Quality Education',
    campus_address: settings.campus_address || 'Circular Road near Hira School, Sokari Gate, Bannu',
    official_phone: settings.official_phone || '0928-622699',
    official_mobile: settings.official_mobile || '0334-0580180',
    official_email: settings.official_email || 'bcmts1122@gmail.com',
    whatsapp_community_enabled: Boolean(settings.whatsapp_community_enabled),
    whatsapp_community_url: settings.whatsapp_community_url || 'https://chat.whatsapp.com/invite/BCMT2026',
    whatsapp_support_enabled: Boolean(settings.whatsapp_support_enabled),
    whatsapp_support_phone: settings.whatsapp_support_phone || '923340580180',
    admission_open_status: Boolean(settings.admission_open_status),
    admission_closed_notice: settings.admission_closed_notice || 'Admissions are temporarily closed.',
    exam_instructions: settings.exam_instructions || 'Candidates must report with original CNIC and Admit Card.',
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/settings');
  };

  // 2. Admin Own Password Form
  const [showAdminCurrentPass, setShowAdminCurrentPass] = useState(false);
  const [showAdminNewPass, setShowAdminNewPass] = useState(false);
  const adminPasswordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminPasswordForm.post('/admin/password/update-own', {
      onSuccess: () => adminPasswordForm.reset(),
    });
  };

  // 3. User Password Edit Modal
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [showUserPass, setShowUserPass] = useState(false);
  const userPasswordForm = useForm({
    password: '',
    password_confirmation: '',
  });

  const handleUserPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    userPasswordForm.post(`/admin/users/${selectedUser.id}/password`, {
      onSuccess: () => {
        setSelectedUser(null);
        userPasswordForm.reset();
      },
    });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    userPasswordForm.setData({
      password: pass,
      password_confirmation: pass,
    });
    setShowUserPass(true);
  };

  return (
    <AdminLayout>
      <Head title="System Settings & Security Management - BCMT Admin" />

      <div className="max-w-5xl mx-auto py-6 px-2 sm:px-4">
        {/* Header Strip */}
        <div className="pb-6 mb-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Control & Security Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
              System Settings & Password Control
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Manage college configurations, administrator credentials, and staff passwords.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 mb-6 gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('institutional')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'institutional'
                ? 'border-[#07294D] text-[#07294D]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building className="w-4 h-4 text-[#FFB606]" />
            <span>Institutional Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin_password')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'admin_password'
                ? 'border-[#07294D] text-[#07294D]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#07294D]" />
            <span>Admin My Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff_passwords')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'staff_passwords'
                ? 'border-[#07294D] text-[#07294D]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-[#07294D]" />
            <span>Staff & User Accounts ({staffUsers.length})</span>
          </button>
        </div>

        {/* Tab 1: Institutional Settings Form */}
        {activeTab === 'institutional' && (
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            {/* Institution Branding */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#07294D]" /> College Identity & Campus Contacts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    College Official Name
                  </label>
                  <input
                    type="text"
                    value={data.college_name}
                    onChange={(e) => setData('college_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm"
                  />
                  {errors.college_name && <p className="text-rose-600 text-xs mt-1">{errors.college_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    College Short Acronym
                  </label>
                  <input
                    type="text"
                    value={data.college_short_name}
                    onChange={(e) => setData('college_short_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    College Tagline / Motto
                  </label>
                  <input
                    type="text"
                    value={data.tagline}
                    onChange={(e) => setData('tagline', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Physical Campus Address
                  </label>
                  <input
                    type="text"
                    value={data.campus_address}
                    onChange={(e) => setData('campus_address', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Official Landline
                  </label>
                  <input
                    type="text"
                    value={data.official_phone}
                    onChange={(e) => setData('official_phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Official Mobile / SMS
                  </label>
                  <input
                    type="text"
                    value={data.official_mobile}
                    onChange={(e) => setData('official_mobile', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    value={data.official_email}
                    onChange={(e) => setData('official_email', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp Integration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="wa_comm_enabled"
                    checked={data.whatsapp_community_enabled}
                    onChange={(e) => setData('whatsapp_community_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                  />
                  <label htmlFor="wa_comm_enabled" className="text-xs sm:text-sm font-semibold text-stone-800">
                    Enable WhatsApp Community Channel on Public Portal Header
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    WhatsApp Community Invitation URL
                  </label>
                  <input
                    type="url"
                    value={data.whatsapp_community_url}
                    onChange={(e) => setData('whatsapp_community_url', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="wa_supp_enabled"
                    checked={data.whatsapp_support_enabled}
                    onChange={(e) => setData('whatsapp_support_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                  />
                  <label htmlFor="wa_supp_enabled" className="text-xs sm:text-sm font-semibold text-stone-800">
                    Enable Candidate WhatsApp Helpdesk Button in Student Portal
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    WhatsApp Helpdesk Contact Phone (International format e.g. 923340580180)
                  </label>
                  <input
                    type="text"
                    value={data.whatsapp_support_phone}
                    onChange={(e) => setData('whatsapp_support_phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Exam Instructions */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#FFB606]" /> Examination Instructions & Roll Number Slip Protocol
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Candidate Exam Instructions (Printed on Roll Number Slips)
                </label>
                <textarea
                  rows={4}
                  value={data.exam_instructions}
                  onChange={(e) => setData('exam_instructions', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#07294D] hover:bg-[#0A3663] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#FFB606]" />
                {processing ? 'Saving...' : 'Save Institutional Settings'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Admin My Password Form */}
        {activeTab === 'admin_password' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs max-w-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-[#07294D] text-[#FFB606] flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Change Administrator Password</h3>
                <p className="text-xs text-stone-500">Update your super admin account credentials securely</p>
              </div>
            </div>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminCurrentPass ? 'text' : 'password'}
                    required
                    value={adminPasswordForm.data.current_password}
                    onChange={(e) => adminPasswordForm.setData('current_password', e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminCurrentPass(!showAdminCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showAdminCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminPasswordForm.errors.current_password && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{adminPasswordForm.errors.current_password}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Secure Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminNewPass ? 'text' : 'password'}
                    required
                    value={adminPasswordForm.data.password}
                    onChange={(e) => adminPasswordForm.setData('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminNewPass(!showAdminNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showAdminNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminPasswordForm.errors.password && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{adminPasswordForm.errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminNewPass ? 'text' : 'password'}
                    required
                    value={adminPasswordForm.data.password_confirmation}
                    onChange={(e) => adminPasswordForm.setData('password_confirmation', e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={adminPasswordForm.processing}
                  className="w-full py-3 bg-[#07294D] hover:bg-[#0A3663] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#FFB606]" />
                  {adminPasswordForm.processing ? 'Updating...' : 'Update Administrator Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Staff & User Accounts Password Management */}
        {activeTab === 'staff_passwords' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#07294D]" /> System Staff & Role Accounts
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Admin can reset or edit passwords for any staff user, HOD, admission officer, or invigilator.
                </p>
              </div>
              <span className="text-xs font-bold text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                Total Staff: {staffUsers.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
                    <th className="p-3.5">User Details</th>
                    <th className="p-3.5">Assigned Roles</th>
                    <th className="p-3.5">Contact Phone</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {staffUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-500">
                        No staff accounts found.
                      </td>
                    </tr>
                  ) : (
                    staffUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{u.name}</div>
                          <div className="text-[11px] text-stone-500">{u.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles && u.roles.length > 0 ? (
                              u.roles.map((r) => (
                                <span
                                  key={r.id}
                                  className="px-2 py-0.5 rounded-md bg-[#07294D]/10 text-[#07294D] font-bold text-[10px] uppercase border border-[#07294D]/20"
                                >
                                  {r.display_name || r.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-stone-400">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-stone-700">
                          {u.phone || '—'}
                        </td>
                        <td className="p-3.5">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                              <X className="w-3.5 h-3.5" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              userPasswordForm.reset();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#07294D] hover:bg-[#0A3663] text-[#FFB606] font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Change Password</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Staff User Password Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-[#07294D] to-[#0A3663] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFB606] text-[#07294D] flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-[#07294D]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Update Staff Password</h3>
                  <p className="text-xs text-blue-100">{selectedUser.name} ({selectedUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  userPasswordForm.reset();
                }}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUserPasswordSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs text-stone-500">Need a quick password?</span>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#07294D] hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#FFB606]" /> Generate Secure Password
                </button>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showUserPass ? 'text' : 'password'}
                    required
                    value={userPasswordForm.data.password}
                    onChange={(e) => userPasswordForm.setData('password', e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPass(!showUserPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showUserPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {userPasswordForm.errors.password && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{userPasswordForm.errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showUserPass ? 'text' : 'password'}
                    required
                    value={userPasswordForm.data.password_confirmation}
                    onChange={(e) => userPasswordForm.setData('password_confirmation', e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    userPasswordForm.reset();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userPasswordForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-[#07294D] hover:bg-[#0A3663] text-white font-bold text-xs transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {userPasswordForm.processing ? 'Saving...' : 'Save User Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

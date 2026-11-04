import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';
import { Lock, User, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    identifier: '',
    mobile_number: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#07294D] blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#FFB606]/10 blur-3xl opacity-50 pointer-events-none" />

      <Head title="Reset Candidate Password - BCMT" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-6">
          <BcmtLogo className="w-20 h-20" lightText={true} />
        </div>
        <h2 className="text-center font-serif text-3xl font-bold tracking-tight text-white">
          Reset Candidate Password
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Verify your identity with your registered application details to set a new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Identity Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Application Number or CNIC <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={data.identifier}
                  onChange={(e) => setData('identifier', e.target.value)}
                  placeholder="e.g. BCMT-2026-000001 or CNIC"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07294D] text-sm font-semibold"
                />
              </div>
              {errors.identifier && <p className="text-rose-600 text-xs mt-1">{errors.identifier}</p>}
            </div>

            {/* Registered Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Registered Contact Mobile <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={data.mobile_number}
                  onChange={(e) => setData('mobile_number', e.target.value)}
                  placeholder="e.g. 03326485172"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07294D] text-sm font-semibold font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Must match the phone number provided during application.</p>
              {errors.mobile_number && <p className="text-rose-600 text-xs mt-1">{errors.mobile_number}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                New Secure Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07294D] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07294D] text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={processing}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-[#07294D] bg-[#FFB606] hover:bg-[#EAA700] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#07294D] transition disabled:opacity-50"
              >
                {processing ? 'Verifying & Resetting...' : 'Reset Password & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-bold text-[#07294D] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <Link
              href="/contact"
              className="text-slate-500 hover:text-slate-800"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

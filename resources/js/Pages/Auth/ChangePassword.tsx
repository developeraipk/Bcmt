import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

export default function ChangePassword() {
  const { data, setData, post, processing, errors } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/change-password');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <Head title="Required Password Update - BCMT" />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#800000] p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-xl font-serif font-bold">Mandatory Security Update</h1>
          <p className="text-xs text-amber-200/90 mt-1">
            Please set a new secure personal password to continue.
          </p>
        </div>

        {/* Warning Alert */}
        <div className="bg-amber-50 p-4 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            For institutional data security, you must replace your temporary initial password with a strong personal password before accessing your student portal.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Current / Temporary Password
            </label>
            <input
              type="password"
              required
              value={data.current_password}
              onChange={(e) => setData('current_password', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-[#800000] focus:outline-none"
            />
            {errors.current_password && <p className="text-rose-600 text-xs mt-1">{errors.current_password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              New Password (Min 8 Characters)
            </label>
            <input
              type="password"
              required
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-[#800000] focus:outline-none"
            />
            {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-[#800000] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#800000] hover:bg-[#660000] text-white rounded-xl font-medium text-sm transition shadow-md disabled:opacity-50"
            >
              {processing ? 'Updating...' : 'Update Password & Access Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

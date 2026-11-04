import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import BcmtLogo from '@/Components/Brand/BcmtLogo';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    login: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(7,41,77,0.12),transparent_70%)] pointer-events-none" />
      <Head title="Institutional Portal Login - BCMT" />

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition">
          <ArrowLeft className="w-4 h-4" /> Back to Public Portal
        </Link>
        <span className="text-xs bg-white text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          Admissions & Exam System 2026–2027
        </span>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header - Deep Academic Navy & Golden Yellow Accent */}
          <div className="bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] p-8 text-center text-white relative border-b-4 border-[#FFB606]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,182,6,0.15),transparent_65%)] pointer-events-none" />
            
            <div className="flex justify-center mb-4 relative z-10">
              <div className="relative">
                <div className="absolute -inset-2 bg-[#FFB606]/20 rounded-full blur-md" />
                <BcmtLogo showText={false} className="w-20 h-20 relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight relative z-10 text-white">
              Institutional Portal Login
            </h1>
            <p className="text-[#FFB606] text-xs mt-1 uppercase tracking-widest font-semibold relative z-10">
              Bannu College of Medical Technologies
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Identity Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={data.login}
                  onChange={(e) => setData('login', e.target.value)}
                  placeholder="Application Number, Email, or CNIC"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07294D] focus:border-[#07294D] text-sm transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Enter your Application Number (e.g. <span className="font-mono font-medium text-[#07294D]">BCMT-2026-000001</span>) or registered CNIC.
              </p>
              {errors.login && <p className="text-rose-600 text-xs mt-1">{errors.login}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07294D] focus:border-[#07294D] text-sm transition"
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

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="w-4 h-4 rounded text-[#07294D] focus:ring-[#07294D] border-slate-300"
                />
                <span>Remember session</span>
              </label>
              <div className="flex items-center gap-3">
                <Link href="/forgot-password" className="text-[#07294D] hover:underline font-bold transition">
                  Forgot Password?
                </Link>
                <span className="text-slate-300">•</span>
                <Link href="/contact" className="hover:text-[#07294D] font-semibold transition">
                  Need Help?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {processing ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional Security Notice */}
          <div className="bg-slate-50/80 border-t border-slate-200 p-5 text-xs text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-900">Secure Institutional Access:</span> Please sign in using your registered credentials. All portal sessions and admission records are securely encrypted and protected under BCMT privacy protocols.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Bannu College of Medical Technologies (BCMT). All rights reserved.
      </div>
    </div>
  );
}

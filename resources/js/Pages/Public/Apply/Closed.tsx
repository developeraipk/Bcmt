import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, PhoneCall, Calendar } from 'lucide-react';

interface Props {
  notice?: string;
}

export default function Closed({ notice }: Props) {
  return (
    <PublicLayout>
      <Head title="Admissions Closed - Bannu College of Medical Technologies" />
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
            Admissions Notice
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-4">
            Admissions Currently Closed
          </h1>

          <p className="text-stone-600 leading-relaxed mb-8">
            {notice || 'The online application portal is currently closed for new submissions. Please stay tuned for upcoming admission sessions or contact the college admission office for further details.'}
          </p>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-left mb-8 space-y-2 text-sm text-stone-700">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#800000]" />
              <span className="font-semibold">Admission Desk:</span> 0928-622699 / 0334-0580180
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#800000]" />
              <span className="font-semibold">Email:</span> bcmts1122@gmail.com
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#800000] text-white rounded-xl hover:bg-[#660000] transition font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-6 py-3 bg-stone-100 text-stone-800 rounded-xl hover:bg-stone-200 transition font-medium text-sm"
            >
              Browse Programs
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { Phone, Mail, MapPin, MessageCircle, Clock, Globe } from 'lucide-react';

export default function Contact() {
    const { system } = usePage().props as any;

    const supportPhone = system?.whatsapp_support_phone || '923340580180';
    const whatsappLink = `https://wa.me/${supportPhone}?text=${encodeURIComponent(
        'Hello BCMT Admission Support, I have an inquiry.'
    )}`;

    return (
        <PublicLayout>
            <Head title="Contact & Admission Support - BCMT" />

            {/* Professional Eikra Deep Academic Navy Jumbotron */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] text-white py-12 lg:py-16 shadow-md border-b-4 border-[#FFB606]">
                {/* Subtle Geometric Mesh & Gold Ambient Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
                <div className="absolute -top-10 right-10 w-96 h-96 bg-[radial-gradient(ellipse,rgba(255,182,6,0.18),transparent_65%)] pointer-events-none blur-3xl"></div>
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[radial-gradient(ellipse,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFB606] bg-white/10 px-3.5 py-1.5 rounded-full border border-[#FFB606]/35 backdrop-blur-md shadow-xs">
                        Campus Office & Support
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black mt-3.5 text-white tracking-tight leading-tight">
                        Contact BCMT Administration
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-2xl leading-relaxed font-normal">
                        Our admission desk is available to assist you with applications, document verification, and examination schedules.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Phone Numbers */}
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                            <Phone className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Official Telephones</h3>
                        <div className="text-xs text-slate-600 space-y-1">
                            <p>Landline: <strong>{system?.phone || '0928-622699'}</strong></p>
                            <p>Mobile: <strong>{system?.mobile || '0334-0580180'}</strong></p>
                            <p className="text-[11px] text-slate-400">Available Monday to Saturday (8:00 AM - 4:00 PM)</p>
                        </div>
                    </div>

                    {/* WhatsApp Support */}
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">WhatsApp Helpdesk</h3>
                        <p className="text-xs text-slate-600">
                            Get immediate guidance regarding application status and test roll numbers.
                        </p>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                            <span>Chat on WhatsApp (+{supportPhone})</span>
                        </a>
                    </div>

                    {/* Campus Location */}
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Campus Address</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {system?.address || 'Circular Road near Hira School, Sokari Gate, Bannu, Khyber Pakhtunkhwa'}
                        </p>
                        <p className="text-xs text-slate-500">
                            Email: <strong>{system?.email || 'bcmts1122@gmail.com'}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BcmtLogo } from '@/Components/Brand/BcmtLogo';
import FlashNotification from '@/Components/FlashNotification';
import {
    LayoutDashboard,
    FileText,
    KeyRound,
    Award,
    CheckCircle2,
    Clock,
    FileCheck,
    MessageCircle,
    LogOut,
    Menu,
    X,
    User,
    ShieldAlert,
    ExternalLink,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export const StudentLayout: React.FC<Props> = ({ children, title }) => {
    const { auth, system, flash } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const user = auth?.user;
    const activeApp = user?.active_application;

    const navItems = [
        { label: 'Dashboard Overview', icon: LayoutDashboard, href: route('student.dashboard'), active: route().current('student.dashboard') },
        { label: 'Examination Gate & PIN', icon: KeyRound, href: route('student.exam.gate'), active: route().current('student.exam.*') },
        { label: 'Roll Number Slip', icon: FileCheck, href: route('student.roll.slip'), active: route().current('student.roll.slip') },
        { label: 'Test Results', icon: Award, href: route('student.result.show'), active: route().current('student.result.show') },
    ];

    const supportPhone = system?.whatsapp_support_phone || '923340580180';
    const supportLink = `https://wa.me/${supportPhone}?text=${encodeURIComponent(
        `Hello BCMT Support, I am student ${user?.name} (${activeApp?.application_number || 'N/A'}).`
    )}`;

    return (
        <div className="h-screen bg-slate-100 flex flex-col lg:flex-row overflow-hidden print:h-auto print:overflow-visible">
            {/* Mobile Header */}
            <div className="no-print lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shrink-0">
                <BcmtLogo className="h-10 w-10" />
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col transition-transform transform lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="p-5 border-b border-slate-800 shrink-0">
                    <Link href={route('home')} className="flex items-center">
                        <BcmtLogo className="h-12 w-12" lightText={true} showText={true} />
                    </Link>
                    <div className="mt-3 text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                        Student Admission Portal
                    </div>
                </div>

                {/* Candidate Quick Profile Card */}
                <div className="p-4 mx-3 my-4 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        {activeApp?.photo_document_id ? (
                            <img
                                src={`/documents/${activeApp.photo_document_id}/stream?v=${activeApp.photo_updated_at || Date.now()}`}
                                alt="Student Photo"
                                className="h-10 w-10 rounded-full object-cover shrink-0 border-2 border-[#FFB606]"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 border border-slate-700">
                                {user?.name?.charAt(0) || 'S'}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
                            <p className="text-[11px] font-mono text-slate-300 truncate">
                                {activeApp?.application_number || 'No Active App'}
                            </p>
                        </div>
                    </div>
                    {activeApp && (
                        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Program:</span>
                            <span className="font-semibold text-white truncate max-w-[130px]">{activeApp.program_code || activeApp.program_name}</span>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto min-h-0 sidebar-scroll">
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    item.active
                                        ? 'bg-white/10 text-white shadow-xs border-l-4 border-l-[#C5A059]'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-amber-300' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 pb-1">
                        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Official Support</p>
                    </div>

                    <a
                        href={supportLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold text-emerald-400 hover:bg-emerald-950/30 border border-emerald-900/40 transition-colors"
                    >
                        <span className="flex items-center gap-2.5">
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp Support</span>
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </a>
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-slate-800 shrink-0">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-colors border border-white/10"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible">
                {/* Desktop Topbar */}
                <header className="no-print hidden lg:flex items-center justify-between h-16 bg-white border-b border-slate-200 px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-900 border border-rose-200">
                            {system?.active_session?.name || 'Active Session 2026-2027'}
                        </span>
                        {activeApp && (
                            <span className="text-xs font-mono font-medium text-slate-500">
                                Application: <strong className="text-slate-800">{activeApp.application_number}</strong>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                            <p className="text-[11px] text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                </header>

                {/* Dynamic Auto-Dismiss Flash Notification with Cross Dismiss */}
                <FlashNotification flash={flash} autoDismissSeconds={5} />

                {/* Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">{children}</main>
            </div>
        </div>
    );
};

export default StudentLayout;

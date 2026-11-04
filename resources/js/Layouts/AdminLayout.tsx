import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BcmtLogo } from '@/Components/Brand/BcmtLogo';
import FlashNotification from '@/Components/FlashNotification';
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileCheck,
    Armchair,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
    ExternalLink,
    GraduationCap,
    Clock,
    BookOpen,
    Award,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export const AdminLayout: React.FC<Props> = ({ children, title }) => {
    const { auth, system, flash } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const user = auth?.user;

    const navItems = [
        { label: 'Executive Analytics', icon: LayoutDashboard, href: route('admin.dashboard'), active: route().current('admin.dashboard') },
        { label: 'Admission Sessions', icon: Calendar, href: route('admin.sessions.index'), active: route().current('admin.sessions.*') },
        { label: 'Applications & Verification', icon: Users, href: route('admin.applications.index'), active: route().current('admin.applications.*') },
        { label: 'Roll Numbers & Slips', icon: FileCheck, href: route('admin.roll-numbers.index'), active: route().current('admin.roll-numbers.*') },
        { label: 'Admission Tests & PINs', icon: BookOpen, href: route('hod.exams.index'), active: route().current('hod.exams.*') },
        { label: 'Entrance Test Results', icon: Award, href: route('hod.results.index'), active: route().current('*.results.*') },
        { label: 'Seat Allocation Engine', icon: Armchair, href: route('admin.seat-allocation.index'), active: route().current('admin.seat-allocation.*') },
        { label: 'System & WhatsApp Settings', icon: Settings, href: route('admin.settings.index'), active: route().current('admin.settings.*') },
        { label: 'Audit & Security Logs', icon: Shield, href: route('admin.audit-logs.index'), active: route().current('admin.audit-logs.*') },
    ];

    return (
        <div className="h-screen bg-slate-100 flex flex-col lg:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shrink-0">
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
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-200 flex flex-col transition-transform transform lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-5 border-b border-slate-800 shrink-0">
                    <Link href={route('home')} className="flex items-center">
                        <BcmtLogo className="h-12 w-12" lightText={true} showText={true} />
                    </Link>
                    <div className="mt-3 text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                        College Administration Portal
                    </div>
                </div>

                {/* Logged in Staff Badge */}
                <div className="p-4 mx-3 my-4 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 border border-slate-700">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
                            <p className="text-[11px] text-slate-300 capitalize truncate">
                                {user?.roles?.[0]?.replace('_', ' ') || 'Staff'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
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
                        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Integrated Portals</p>
                    </div>

                    <Link
                        href={route('hod.dashboard')}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
                    >
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        <span>HOD Examination Portal</span>
                    </Link>
                    <Link
                        href={route('invigilator.dashboard')}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
                    >
                        <Clock className="h-4 w-4 text-emerald-400" />
                        <span>Invigilation Portal</span>
                    </Link>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-900 shrink-0">
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

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-slate-200 px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-3 py-1 rounded-md bg-slate-900 text-white">
                            BCMT Admin
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            Central College Management System
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                        <span>Staff: <strong className="text-slate-900">{user?.name}</strong></span>
                        <Link href={route('home')} target="_blank" className="inline-flex items-center gap-1 text-rose-900 hover:underline font-semibold ml-2">
                            <span>Public Website</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </header>

                {/* Dynamic Auto-Dismiss Flash Notification with Cross Dismiss */}
                <FlashNotification flash={flash} autoDismissSeconds={5} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;

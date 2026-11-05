import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BcmtLogo } from '@/Components/Brand/BcmtLogo';
import FlashNotification from '@/Components/FlashNotification';
import {
    GraduationCap,
    BookOpen,
    HelpCircle,
    Sliders,
    Award,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    ArrowLeft,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export const HodLayout: React.FC<Props> = ({ children, title }) => {
    const { auth, flash } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const user = auth?.user;
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const isSuperAdmin = roles.includes('super_admin') || roles.includes('management');

    const navItems = [
        { label: 'HOD Overview', icon: GraduationCap, href: route('hod.dashboard'), active: route().current('hod.dashboard') },
        { label: 'Admission Tests & PINs', icon: BookOpen, href: route('hod.exams.index'), active: route().current('hod.exams.*') },
        { label: 'Test Results & Actions', icon: Award, href: route('hod.results.index'), active: route().current('hod.results.*') },
        { label: 'Dynamic Merit Formulas', icon: Sliders, href: route('hod.merit.index'), active: route().current('hod.merit.*') },
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

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-200 flex flex-col transition-transform transform lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-5 border-b border-slate-800 shrink-0">
                    <Link href={route('home')} className="flex items-center">
                        <BcmtLogo className="h-12 w-12" lightText={true} showText={true} />
                    </Link>
                    <div className="mt-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        HOD Examination & Merit Portal
                    </div>
                </div>

                {/* Profile */}
                <div className="p-4 mx-3 my-4 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 border border-slate-700">
                            {isSuperAdmin ? (user?.name?.charAt(0) || 'A') : 'H'}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
                            <p className="text-[11px] text-slate-300">
                                {isSuperAdmin ? 'System Administrator' : 'Head of Department'}
                            </p>
                        </div>
                    </div>
                </div>

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

                    {/* Return to Admin Panel: ONLY visible to System Administrator / Super Admin */}
                    {isSuperAdmin && (
                        <>
                            <div className="pt-5 pb-1">
                                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Navigation</p>
                            </div>

                            <Link
                                href={route('admin.dashboard')}
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-amber-300/90 hover:text-white hover:bg-white/10 transition-colors border border-amber-500/20 bg-amber-500/5 shadow-xs"
                            >
                                <ArrowLeft className="h-4 w-4 text-amber-300 shrink-0" />
                                <span>Return to Admin Panel</span>
                            </Link>
                        </>
                    )}
                </nav>

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

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-slate-200 px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-900">
                            Academic & Examination Panel
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            PIN Management & Dynamic Merit Engine
                        </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                        Authenticated {isSuperAdmin ? 'Administrator' : 'HOD'}: <strong className="text-slate-900">{user?.name}</strong>
                    </div>
                </header>

                {/* Dynamic Auto-Dismiss Flash Notification with Cross Dismiss */}
                <FlashNotification flash={flash} autoDismissSeconds={5} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">{children}</main>
            </div>
        </div>
    );
};

export default HodLayout;

import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BcmtLogo } from '@/Components/Brand/BcmtLogo';
import FlashNotification from '@/Components/FlashNotification';
import {
    Clock,
    UserCheck,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    ShieldCheck,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export const InvigilatorLayout: React.FC<Props> = ({ children, title }) => {
    const { auth, flash } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const user = auth?.user;

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

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-emerald-950 text-slate-100 flex flex-col transition-transform transform lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-5 border-b border-emerald-900/60 shrink-0">
                    <Link href={route('home')} className="flex items-center">
                        <BcmtLogo className="h-12 w-12" lightText={true} showText={true} />
                    </Link>
                    <div className="mt-3 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        Campus Invigilation Portal
                    </div>
                </div>

                <div className="p-4 mx-3 my-4 rounded-xl bg-emerald-900/50 border border-emerald-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
                            <p className="text-[11px] text-emerald-300">Room Invigilator</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto min-h-0 sidebar-scroll">
                    <Link
                        href={route('invigilator.dashboard')}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-800 text-white shadow-xs"
                    >
                        <UserCheck className="h-4 w-4 shrink-0 text-amber-300" />
                        <span>Candidate Attendance</span>
                    </Link>

                    {user?.roles?.includes('super_admin') && (
                        <Link
                            href={route('admin.dashboard')}
                            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-200 hover:bg-emerald-900 hover:text-white transition-colors mt-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Return to Admin Panel</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-emerald-900/60 shrink-0">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-900 hover:bg-rose-950 text-emerald-100 hover:text-white text-sm font-semibold transition-colors border border-emerald-800"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-slate-200 px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900">
                            Campus Exam Room Verification
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            Physical Roll Number Slip & Attendance Marking
                        </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                        Invigilator: <strong className="text-slate-900">{user?.name}</strong>
                    </div>
                </header>

                {/* Dynamic Auto-Dismiss Flash Notification with Cross Dismiss */}
                <FlashNotification flash={flash} autoDismissSeconds={5} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default InvigilatorLayout;

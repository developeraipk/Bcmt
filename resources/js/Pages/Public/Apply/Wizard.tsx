import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import {
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Upload,
    FileText,
    User,
    GraduationCap,
    ShieldAlert,
    Lock,
    Eye,
    EyeOff,
    MessageCircle,
    HelpCircle,
} from 'lucide-react';

interface SessionProgram {
    id: number;
    program_id: number;
    name: string;
    code: string;
    category: 'bs_degree' | 'pharmacy_b' | 'medical_diploma' | 'technical_diploma' | string;
    duration_years: number;
    qualification_required: string;
    affiliation: string;
    total_seats: number;
    application_fee: number;
}

interface Props {
    activeSession: any;
    sessionPrograms: SessionProgram[];
}

export default function Wizard({ activeSession, sessionPrograms }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [stepNotice, setStepNotice] = useState<string | null>(null);

    // Initial pre-selection from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCode = urlParams.get('program');
    const defaultProgram = sessionPrograms.find((p) => p.code === preselectedCode) || sessionPrograms[0];

    const { data, setData, post, processing, errors } = useForm({
        session_program_id: defaultProgram?.id ? String(defaultProgram.id) : '',

        // Personal info
        full_name: '',
        father_name: '',
        dob: '',
        gender: 'male',
        cnic: '',
        mobile_number: '',
        whatsapp_number: '',
        email: '',
        domicile_district: 'Bannu',
        permanent_address: '',
        current_address: '',

        // Account onboarding password
        password: '',
        password_confirmation: '',

        // Academic info
        matric_board: 'BISE Bannu',
        matric_roll_number: '',
        matric_year: 2024,
        matric_total: '1100',
        matric_obtained: '',

        inter_board: 'BISE Bannu',
        inter_roll_number: '',
        inter_year: 2026,
        inter_total: '1100',
        inter_obtained: '',

        // Documents
        doc_photo: null as File | null,
        doc_cnic_front: null as File | null,
        doc_cnic_back: null as File | null,
        doc_matric_dmc: null as File | null,
        doc_inter_dmc: null as File | null,
        doc_domicile: null as File | null,

        declaration: false,
    });

    const selectedProgram = sessionPrograms.find((p) => String(p.id) === String(data.session_program_id));
    const isBsProgram = selectedProgram?.category === 'bs_degree';

    const steps = [
        { number: 1, title: 'Program' },
        { number: 2, title: 'Personal Info' },
        { number: 3, title: 'Academics' },
        { number: 4, title: 'Documents' },
        { number: 5, title: 'Review & Submit' },
    ];

    // Helper to clear error when user modifies a field
    const updateField = (field: string, val: any) => {
        setData(field as any, val);
        if (clientErrors[field]) {
            setClientErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    // Client-side validator for each individual step
    const validateStep = (stepNumber: number): { valid: boolean; errors: Record<string, string> } => {
        const errs: Record<string, string> = {};

        if (stepNumber === 1) {
            if (!data.session_program_id) {
                errs.session_program_id = 'Please select an academic program to proceed.';
            }
        } else if (stepNumber === 2) {
            if (!data.full_name.trim() || data.full_name.trim().length < 3) {
                errs.full_name = 'Candidate full name is required (as per Matric certificate).';
            }
            if (!data.father_name.trim() || data.father_name.trim().length < 3) {
                errs.father_name = "Father's name is required.";
            }
            if (!data.dob) {
                errs.dob = 'Date of birth is required.';
            }
            if (!data.gender) {
                errs.gender = 'Please select candidate gender.';
            }
            const cnicDigits = data.cnic.replace(/\D/g, '');
            if (cnicDigits.length !== 13) {
                errs.cnic = 'CNIC or B-Form number must contain exactly 13 digits.';
            }
            const phoneDigits = data.mobile_number.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                errs.mobile_number = 'Please enter a valid mobile number (e.g. 0334-0580180).';
            }
            const waDigits = data.whatsapp_number.replace(/\D/g, '');
            if (waDigits.length < 10) {
                errs.whatsapp_number = 'Please enter an active WhatsApp number.';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
                errs.email = 'Please enter a valid email address (e.g. student@gmail.com).';
            }
            if (!data.domicile_district.trim()) {
                errs.domicile_district = 'Domicile district is required.';
            }
            if (!data.permanent_address.trim() || data.permanent_address.trim().length < 5) {
                errs.permanent_address = 'Please provide complete permanent postal address.';
            }
            if (!data.current_address.trim() || data.current_address.trim().length < 5) {
                errs.current_address = 'Please provide present residential address.';
            }
            if (!data.password || data.password.length < 8) {
                errs.password = 'Account password must be at least 8 characters long.';
            }
            if (data.password !== data.password_confirmation) {
                errs.password_confirmation = 'Password confirmation does not match.';
            }
        } else if (stepNumber === 3) {
            if (!data.matric_board.trim()) {
                errs.matric_board = 'Matric board / authority is required.';
            }
            if (!data.matric_roll_number.trim()) {
                errs.matric_roll_number = 'Matric roll number is required.';
            }
            if (!data.matric_year || data.matric_year < 1990 || data.matric_year > 2030) {
                errs.matric_year = 'Please enter a valid passing year.';
            }
            if (!data.matric_total || Number(data.matric_total) <= 0) {
                errs.matric_total = 'Matric total marks must be a positive number.';
            }
            if (data.matric_obtained === '' || data.matric_obtained === null || Number(data.matric_obtained) < 0) {
                errs.matric_obtained = 'Matric obtained marks are required.';
            } else if (Number(data.matric_obtained) > Number(data.matric_total)) {
                errs.matric_obtained = `Obtained marks cannot exceed total marks (${data.matric_total}).`;
            }

            if (isBsProgram) {
                if (!data.inter_board.trim()) {
                    errs.inter_board = 'Intermediate board is mandatory for BS Programs.';
                }
                if (!data.inter_roll_number.trim()) {
                    errs.inter_roll_number = 'Intermediate roll number is mandatory for BS Programs.';
                }
                if (!data.inter_year || data.inter_year < 1990 || data.inter_year > 2030) {
                    errs.inter_year = 'Intermediate passing year is required.';
                }
                if (!data.inter_total || Number(data.inter_total) <= 0) {
                    errs.inter_total = 'Intermediate total marks required.';
                }
                if (data.inter_obtained === '' || data.inter_obtained === null || Number(data.inter_obtained) < 0) {
                    errs.inter_obtained = 'Intermediate obtained marks are required.';
                } else if (Number(data.inter_obtained) > Number(data.inter_total)) {
                    errs.inter_obtained = `Intermediate obtained marks cannot exceed total marks (${data.inter_total}).`;
                }
            }
        } else if (stepNumber === 4) {
            if (!data.doc_photo) {
                errs.doc_photo = 'Passport-size candidate photograph is mandatory.';
            }
            if (!data.doc_cnic_front) {
                errs.doc_cnic_front = 'CNIC or B-Form front copy is mandatory.';
            }
            if (!data.doc_matric_dmc) {
                errs.doc_matric_dmc = 'Matriculation DMC / Certificate is mandatory.';
            }
            if (!data.doc_domicile) {
                errs.doc_domicile = 'Domicile certificate is mandatory.';
            }
            if (isBsProgram && !data.doc_inter_dmc) {
                errs.doc_inter_dmc = 'Intermediate (HSSC) DMC is mandatory for BS Degree admission.';
            }
        }

        return {
            valid: Object.keys(errs).length === 0,
            errors: errs,
        };
    };

    const handleNext = () => {
        const { valid, errors: newErrors } = validateStep(currentStep);

        if (!valid) {
            setClientErrors(newErrors);
            setStepNotice(`Please fill all required fields highlighted in Step ${currentStep} before proceeding.`);
            window.scrollTo({ top: 120, behavior: 'smooth' });
            return;
        }

        // Current step is valid! Clear errors and advance
        setClientErrors({});
        setStepNotice(null);
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        setClientErrors({});
        setStepNotice(null);
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
    };

    const handleStepClick = (targetStep: number) => {
        if (targetStep === currentStep) return;
        if (targetStep < currentStep) {
            setClientErrors({});
            setStepNotice(null);
            setCurrentStep(targetStep);
            window.scrollTo({ top: 120, behavior: 'smooth' });
            return;
        }

        // Validate prior steps before allowing user to skip ahead
        for (let s = 1; s < targetStep; s++) {
            const { valid, errors: newErrors } = validateStep(s);
            if (!valid) {
                setCurrentStep(s);
                setClientErrors(newErrors);
                setStepNotice(`Please complete all required fields in Step ${s} first.`);
                window.scrollTo({ top: 120, behavior: 'smooth' });
                return;
            }
        }

        setClientErrors({});
        setStepNotice(null);
        setCurrentStep(targetStep);
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate declaration on final step
        if (!data.declaration) {
            setClientErrors({ declaration: 'Please confirm the official declaration before final submission.' });
            setStepNotice('Please acknowledge the declaration checkbox below to finalize your submission.');
            return;
        }

        post(route('apply.submit'), {
            forceFormData: true,
        });
    };

    // Check if server returned a duplicate application notification
    const duplicateErrorMsg = Object.values(errors).find(
        (msg) => typeof msg === 'string' && (msg.includes('already been submitted') || msg.includes('already submitted'))
    );

    // Filter non-duplicate server errors
    const generalServerErrors = Object.entries(errors).filter(
        ([, msg]) => typeof msg === 'string' && !msg.includes('already been submitted') && !msg.includes('already submitted')
    );

    return (
        <PublicLayout>
            <Head title="Online Admission Application - BCMT" />

            <div className="bg-slate-50 py-10 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <span className="text-xs font-semibold text-slate-700 bg-white px-3.5 py-1 rounded-full border border-slate-200/80 shadow-xs">
                            {activeSession?.name || 'Session 2026-2027'}
                        </span>
                        <h1 className="font-serif text-3xl font-bold text-slate-900 mt-3">
                            Online Admission Application
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                            Institutional Regulation: Candidates may submit only one verified application per admission session.
                        </p>
                    </div>

                    {/* Stepper Indicator */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8">
                        <div className="flex items-center justify-between">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.number}>
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(s.number)}
                                        className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
                                    >
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                currentStep === s.number
                                                    ? 'bg-[#07294D] text-white ring-4 ring-[#07294D]/20'
                                                    : currentStep > s.number
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                            }`}
                                        >
                                            {currentStep > s.number ? <CheckCircle2 className="h-4 w-4" /> : s.number}
                                        </div>
                                        <span
                                            className={`hidden sm:inline text-xs font-semibold transition-colors ${
                                                currentStep === s.number
                                                    ? 'text-[#07294D] font-bold'
                                                    : 'text-slate-500 group-hover:text-slate-800'
                                            }`}
                                        >
                                            {s.title}
                                        </span>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-2 transition-colors ${
                                                currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                                            }`}
                                        ></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* SPECIAL CASE 1: Executive Duplicate Application Notice (Resolves Screenshot) */}
                    {duplicateErrorMsg && (
                        <div className="mb-8 p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs shrink-0 mt-0.5">
                                    <ShieldAlert className="h-6 w-6 text-amber-700" />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h4 className="text-base font-bold text-amber-950">
                                            Application Record Already Registered for this Session
                                        </h4>
                                        <span className="px-3 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold font-mono">
                                            Session 2026–2027
                                        </span>
                                    </div>

                                    <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                                        Institutional records show that an admission application has already been registered with this candidate CNIC or account. Under BCMT institutional policy, each student may submit only <strong>one application per admission session</strong>.
                                    </p>

                                    <div className="p-3.5 rounded-xl bg-white/90 border border-amber-200 text-xs text-amber-900 font-medium">
                                        {duplicateErrorMsg}
                                    </div>

                                    <div className="pt-2 flex flex-wrap items-center gap-3">
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#07294D] hover:bg-[#041D3C] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Sign In to Candidate Dashboard</span>
                                        </Link>
                                        <a
                                            href="https://wa.me/923340580180"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>WhatsApp Admissions Desk</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step Incomplete Warning Notice on Next click */}
                    {stepNotice && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-2xs">
                            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="flex-1 text-xs sm:text-sm">
                                <strong className="font-bold text-rose-900 block mb-0.5">
                                    Action Required: Please complete required fields
                                </strong>
                                <span className="text-rose-800">{stepNotice}</span>
                            </div>
                        </div>
                    )}

                    {/* General Server Errors Banner (Formatted Professionally) */}
                    {generalServerErrors.length > 0 && !duplicateErrorMsg && (
                        <div className="mb-6 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 shadow-xs">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="flex-1 text-xs sm:text-sm space-y-2">
                                    <h4 className="font-bold text-rose-900 text-sm">
                                        Application Scrutiny Notice
                                    </h4>
                                    <p className="text-rose-800 text-xs">
                                        Please address the following items to proceed with your application:
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {generalServerErrors.map(([field, err]) => (
                                            <span
                                                key={field}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-medium shadow-2xs"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                {err as string}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step Content Container */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
                        {/* STEP 1: Program Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Step 1: Select Academic Program</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Choose your intended healthcare qualification. Male and female applicants compete equally for combined merit seats.
                                    </p>
                                </div>

                                {clientErrors.session_program_id && (
                                    <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {clientErrors.session_program_id}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-3">
                                    {sessionPrograms.map((sp) => {
                                        const isSelected = String(data.session_program_id) === String(sp.id);
                                        return (
                                            <div
                                                key={sp.id}
                                                onClick={() => updateField('session_program_id', String(sp.id))}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                                                    isSelected
                                                        ? 'border-[#07294D] bg-[#07294D]/5 shadow-xs ring-1 ring-[#07294D]/30'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="session_program_id"
                                                        value={sp.id}
                                                        checked={isSelected}
                                                        onChange={() => updateField('session_program_id', String(sp.id))}
                                                        className="mt-1 text-[#07294D] focus:ring-[#07294D]"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                                {sp.name}
                                                            </h4>
                                                            {(sp.code === 'DIT' || sp.category === 'technical_diploma') && (
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                                                                    100% Free Tuition
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Duration: {sp.duration_years} {sp.duration_years === 1 ? 'Year' : 'Years'} • Min: {sp.qualification_required} • {sp.affiliation}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs block">
                                                        {sp.total_seats} Seats
                                                    </span>
                                                    {(sp.code === 'DIT' || sp.category === 'technical_diploma') && (
                                                        <span className="text-[10px] font-bold text-emerald-700 block mt-1">
                                                            Only Board/DMC Fee
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Personal Information & Password */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Step 2: Personal Information & Account</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Enter your official legal identity as printed on your Matric Certificate and CNIC / B-Form.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                                        <input
                                            type="text"
                                            value={data.full_name}
                                            onChange={(e) => updateField('full_name', e.target.value)}
                                            placeholder="Muhammad Ali"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.full_name || errors.full_name
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.full_name || errors.full_name) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.full_name || errors.full_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name *</label>
                                        <input
                                            type="text"
                                            value={data.father_name}
                                            onChange={(e) => updateField('father_name', e.target.value)}
                                            placeholder="Father Full Name"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.father_name || errors.father_name
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.father_name || errors.father_name) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.father_name || errors.father_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            value={data.dob}
                                            onChange={(e) => updateField('dob', e.target.value)}
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.dob || errors.dob
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.dob || errors.dob) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.dob || errors.dob}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Gender (Combined Open Merit) *</label>
                                        <select
                                            value={data.gender}
                                            onChange={(e) => updateField('gender', e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">CNIC / B-Form Number (13 Digits) *</label>
                                        <input
                                            type="text"
                                            value={data.cnic}
                                            onChange={(e) => updateField('cnic', e.target.value)}
                                            placeholder="11101-1234567-1"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors font-mono ${
                                                clientErrors.cnic || errors.cnic
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.cnic || errors.cnic) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.cnic || errors.cnic}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Domicile District *</label>
                                        <input
                                            type="text"
                                            value={data.domicile_district}
                                            onChange={(e) => updateField('domicile_district', e.target.value)}
                                            placeholder="Bannu / Lakki Marwat"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.domicile_district || errors.domicile_district
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.domicile_district || errors.domicile_district) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.domicile_district || errors.domicile_district}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                                        <input
                                            type="text"
                                            value={data.mobile_number}
                                            onChange={(e) => updateField('mobile_number', e.target.value)}
                                            placeholder="0334-0580180"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.mobile_number || errors.mobile_number
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.mobile_number || errors.mobile_number) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.mobile_number || errors.mobile_number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                                        <input
                                            type="text"
                                            value={data.whatsapp_number}
                                            onChange={(e) => updateField('whatsapp_number', e.target.value)}
                                            placeholder="0334-0580180"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.whatsapp_number || errors.whatsapp_number
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.whatsapp_number || errors.whatsapp_number) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.whatsapp_number || errors.whatsapp_number}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            placeholder="student@example.com"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.email || errors.email
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.email || errors.email) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.email || errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Postal Address *</label>
                                        <input
                                            type="text"
                                            value={data.permanent_address}
                                            onChange={(e) => updateField('permanent_address', e.target.value)}
                                            placeholder="Village, Tehsil, District"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.permanent_address || errors.permanent_address
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.permanent_address || errors.permanent_address) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.permanent_address || errors.permanent_address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Current Residential Address *</label>
                                        <input
                                            type="text"
                                            value={data.current_address}
                                            onChange={(e) => updateField('current_address', e.target.value)}
                                            placeholder="Current residential address"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.current_address || errors.current_address
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.current_address || errors.current_address) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.current_address || errors.current_address}
                                            </p>
                                        )}
                                    </div>

                                    {/* Student Portal Account Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Create Portal Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => updateField('password', e.target.value)}
                                                placeholder="Min. 8 characters"
                                                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors pr-10 ${
                                                    clientErrors.password || errors.password
                                                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                        : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {(clientErrors.password || errors.password) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.password || errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => updateField('password_confirmation', e.target.value)}
                                            placeholder="Re-type password"
                                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors ${
                                                clientErrors.password_confirmation || errors.password_confirmation
                                                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                                                    : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                                            }`}
                                        />
                                        {(clientErrors.password_confirmation || errors.password_confirmation) && (
                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {clientErrors.password_confirmation || errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Academic Records */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Step 3: Academic History</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Enter obtained marks and board details exactly as shown on your official DMC / Certificates.
                                    </p>
                                </div>

                                {/* Matric Section */}
                                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-[#07294D]" />
                                        <span>1. Matriculation (SSC) Qualification *</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Board / Authority *</label>
                                            <input
                                                type="text"
                                                value={data.matric_board}
                                                onChange={(e) => updateField('matric_board', e.target.value)}
                                                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                                    clientErrors.matric_board ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                                }`}
                                            />
                                            {clientErrors.matric_board && (
                                                <p className="text-[11px] text-rose-600 mt-1 font-semibold">{clientErrors.matric_board}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Roll Number *</label>
                                            <input
                                                type="text"
                                                value={data.matric_roll_number}
                                                onChange={(e) => updateField('matric_roll_number', e.target.value)}
                                                placeholder="e.g. 123456"
                                                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                                    clientErrors.matric_roll_number ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                                }`}
                                            />
                                            {clientErrors.matric_roll_number && (
                                                <p className="text-[11px] text-rose-600 mt-1 font-semibold">{clientErrors.matric_roll_number}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Passing Year *</label>
                                            <input
                                                type="number"
                                                value={data.matric_year}
                                                onChange={(e) => updateField('matric_year', Number(e.target.value))}
                                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Marks *</label>
                                            <input
                                                type="number"
                                                value={data.matric_total}
                                                onChange={(e) => updateField('matric_total', e.target.value)}
                                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Obtained Marks *</label>
                                            <input
                                                type="number"
                                                value={data.matric_obtained}
                                                onChange={(e) => updateField('matric_obtained', e.target.value)}
                                                placeholder="e.g. 950"
                                                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                                    clientErrors.matric_obtained ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                                }`}
                                            />
                                            {clientErrors.matric_obtained && (
                                                <p className="text-[11px] text-rose-600 mt-1 font-semibold">{clientErrors.matric_obtained}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Intermediate Section (Mandatory for BS Degree) */}
                                {isBsProgram ? (
                                    <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-[#07294D]" />
                                                <span>2. Intermediate (HSSC / FSc) Qualification *</span>
                                            </h4>
                                            <span className="text-[10px] font-semibold text-[#07294D] bg-[#07294D]/10 border border-[#07294D]/20 px-2.5 py-0.5 rounded shadow-2xs">
                                                Mandatory for BS Degree
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Board / Authority *</label>
                                                <input
                                                    type="text"
                                                    value={data.inter_board}
                                                    onChange={(e) => updateField('inter_board', e.target.value)}
                                                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                                        clientErrors.inter_board ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                                    }`}
                                                />
                                                {clientErrors.inter_board && (
                                                    <p className="text-[11px] text-rose-600 mt-1 font-semibold">{clientErrors.inter_board}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Roll Number *</label>
                                                <input
                                                    type="text"
                                                    value={data.inter_roll_number}
                                                    onChange={(e) => updateField('inter_roll_number', e.target.value)}
                                                    placeholder="e.g. 654321"
                                                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                                        clientErrors.inter_roll_number ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                                    }`}
                                                />
                                                {clientErrors.inter_roll_number && (
                                                    <p className="text-[11px] text-rose-600 mt-1 font-semibold">{clientErrors.inter_roll_number}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Passing Year *</label>
                                                <input
                                                    type="number"
                                                    value={data.inter_year}
                                                    onChange={(e) => updateField('inter_year', Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Marks *</label>
                                                <input
                                                    type="number"
                                                    value={data.inter_total}
                                                    onChange={(e) => updateField('inter_total', e.target.value)}
                                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Obtained Marks *</label>
                                                <input
                                                    type="number"
                                                    value={data.inter_obtained}
                                                    onChange={(e) => updateField('inter_obtained', e.target.value)}
                                                    placeholder="e.g. 910"
                                                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                                        clientErrors.inter_obtained ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                                                    }`}
                                                />
                                                {clientErrors.inter_obtained && (
                                                    <p className="text-[11px] text-rose-600 mt-1 font-semibold">{clientErrors.inter_obtained}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>Intermediate details are optional for 2-Year Diploma programs (Matriculation Pass is the minimum entry standard).</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: Document Uploads */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Step 4: Upload Required Credentials</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Uploaded files are encrypted in private institutional storage. Accepted formats: JPEG, PNG, or PDF (Max 2MB each).
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl border border-dashed transition-colors ${
                                        clientErrors.doc_photo ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">
                                            Candidate Passport-Size Photograph *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={(e) => updateField('doc_photo', e.target.files ? e.target.files[0] : null)}
                                            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                                        />
                                        {clientErrors.doc_photo && (
                                            <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" /> {clientErrors.doc_photo}
                                            </p>
                                        )}
                                        {data.doc_photo && (
                                            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> File Selected: {data.doc_photo.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className={`p-4 rounded-xl border border-dashed transition-colors ${
                                        clientErrors.doc_cnic_front ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">
                                            CNIC / B-Form Front *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => updateField('doc_cnic_front', e.target.files ? e.target.files[0] : null)}
                                            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                                        />
                                        {clientErrors.doc_cnic_front && (
                                            <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" /> {clientErrors.doc_cnic_front}
                                            </p>
                                        )}
                                        {data.doc_cnic_front && (
                                            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> File Selected: {data.doc_cnic_front.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className={`p-4 rounded-xl border border-dashed transition-colors ${
                                        clientErrors.doc_matric_dmc ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">
                                            Matric DMC / Certificate *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => updateField('doc_matric_dmc', e.target.files ? e.target.files[0] : null)}
                                            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                                        />
                                        {clientErrors.doc_matric_dmc && (
                                            <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" /> {clientErrors.doc_matric_dmc}
                                            </p>
                                        )}
                                        {data.doc_matric_dmc && (
                                            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> File Selected: {data.doc_matric_dmc.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className={`p-4 rounded-xl border border-dashed transition-colors ${
                                        clientErrors.doc_domicile ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                                    }`}>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">
                                            Domicile Certificate *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => updateField('doc_domicile', e.target.files ? e.target.files[0] : null)}
                                            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                                        />
                                        {clientErrors.doc_domicile && (
                                            <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" /> {clientErrors.doc_domicile}
                                            </p>
                                        )}
                                        {data.doc_domicile && (
                                            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> File Selected: {data.doc_domicile.name}
                                            </p>
                                        )}
                                    </div>

                                    {isBsProgram && (
                                        <div className={`p-4 rounded-xl border border-dashed transition-colors sm:col-span-2 ${
                                            clientErrors.doc_inter_dmc ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                                        }`}>
                                            <label className="block text-xs font-bold text-slate-800 mb-1">
                                                Intermediate (HSSC) DMC / Certificate *
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => updateField('doc_inter_dmc', e.target.files ? e.target.files[0] : null)}
                                                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                                            />
                                            {clientErrors.doc_inter_dmc && (
                                                <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                                    <AlertCircle className="h-3.5 w-3.5" /> {clientErrors.doc_inter_dmc}
                                                </p>
                                            )}
                                            {data.doc_inter_dmc && (
                                                <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> File Selected: {data.doc_inter_dmc.name}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Review & Final Submission */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Step 5: Review Application Summary</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Please thoroughly review your details before final submission. Information cannot be altered once registered.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                                    <div className="p-3.5 flex justify-between bg-slate-50/50">
                                        <span className="font-semibold text-slate-500">Selected Academic Program:</span>
                                        <strong className="text-slate-900">{selectedProgram?.name} ({selectedProgram?.code})</strong>
                                    </div>
                                    <div className="p-3.5 flex justify-between">
                                        <span className="font-semibold text-slate-500">Candidate Full Name:</span>
                                        <strong className="text-slate-900">{data.full_name}</strong>
                                    </div>
                                    <div className="p-3.5 flex justify-between bg-slate-50/50">
                                        <span className="font-semibold text-slate-500">Father's Name:</span>
                                        <strong className="text-slate-900">{data.father_name}</strong>
                                    </div>
                                    <div className="p-3.5 flex justify-between">
                                        <span className="font-semibold text-slate-500">CNIC / B-Form Number:</span>
                                        <strong className="text-slate-900 font-mono">{data.cnic}</strong>
                                    </div>
                                    <div className="p-3.5 flex justify-between bg-slate-50/50">
                                        <span className="font-semibold text-slate-500">Registered Contact Phones:</span>
                                        <strong className="text-slate-900">{data.mobile_number} / {data.whatsapp_number}</strong>
                                    </div>
                                    <div className="p-3.5 flex justify-between">
                                        <span className="font-semibold text-slate-500">Candidate Email Account:</span>
                                        <strong className="text-slate-900">{data.email}</strong>
                                    </div>
                                    <div className="p-3.5 flex justify-between bg-slate-50/50">
                                        <span className="font-semibold text-slate-500">Matric Obtained / Total Marks:</span>
                                        <strong className="text-slate-900">{data.matric_obtained} / {data.matric_total} ({data.matric_board})</strong>
                                    </div>
                                    {isBsProgram && (
                                        <div className="p-3.5 flex justify-between">
                                            <span className="font-semibold text-slate-500">Intermediate Obtained / Total Marks:</span>
                                            <strong className="text-slate-900">{data.inter_obtained} / {data.inter_total} ({data.inter_board})</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Declaration Checkbox */}
                                <div className={`p-4 rounded-xl border transition-colors ${
                                    clientErrors.declaration ? 'border-rose-400 bg-rose-50/20' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.declaration}
                                            onChange={(e) => updateField('declaration', e.target.checked)}
                                            className="mt-0.5 rounded text-[#07294D] focus:ring-[#07294D]"
                                            required
                                        />
                                        <span className="text-xs text-slate-800 leading-relaxed font-medium">
                                            I solemnly affirm that the credentials and certificates uploaded are genuine, unadulterated, and accurate.
                                            I understand that providing falsified credentials or submitting multiple applications for this session
                                            shall result in immediate disqualification under college regulations.
                                        </span>
                                    </label>
                                    {clientErrors.declaration && (
                                        <p className="text-xs text-rose-600 mt-2 font-semibold flex items-center gap-1">
                                            <AlertCircle className="h-3.5 w-3.5" /> {clientErrors.declaration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stepper Navigation Actions */}
                        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-3 sm:gap-4">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap shadow-2xs"
                                >
                                    <ArrowLeft className="h-4 w-4 shrink-0 text-slate-500" />
                                    <span>Previous<span className="hidden sm:inline"> Step</span></span>
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < 5 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-lg border border-[#D49600]/40 whitespace-nowrap shrink-0"
                                >
                                    <span><span className="hidden sm:inline">Continue to </span>Step {currentStep + 1}</span>
                                    <ArrowRight className="h-4 w-4 text-[#07294D] shrink-0" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap shrink-0"
                                >
                                    <span>{processing ? 'Submitting...' : 'Final Submit Application'}</span>
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}

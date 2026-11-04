import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AffiliationProps {
    className?: string;
    showIcons?: boolean;
}

interface AffiliationItemData {
    fullName: string;
    acronym: string;
    role: string;
    status: string;
    logo: string;
}

const AffiliationLogoItem: React.FC<{
    item: AffiliationItemData;
    showIcons: boolean;
    isLast?: boolean;
}> = ({ item, showIcons, isLast }) => {
    const [imgErr, setImgErr] = useState(false);

    return (
        <div className={`group relative flex flex-col justify-between p-3 sm:p-4 bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ${
            isLast ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''
        }`}>
            {/* Top Row: Logo & Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 p-1.5 shadow-2xs group-hover:border-slate-300 transition-colors">
                    {!imgErr ? (
                        <img
                            src={item.logo}
                            alt={item.acronym}
                            className="h-full w-full object-contain"
                            onError={() => setImgErr(true)}
                        />
                    ) : (
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
                    )}
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {item.status}
                </span>
            </div>

            {/* Entity Name & Role */}
            <div>
                <h4 className="text-[11px] sm:text-[13px] font-bold text-slate-900 group-hover:text-[#07294D] transition-colors leading-snug line-clamp-2">
                    {item.fullName}
                </h4>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-1 leading-normal line-clamp-2">
                    {item.role}
                </p>
            </div>
        </div>
    );
};

export const BcmtAffiliations: React.FC<AffiliationProps> = ({ className = '', showIcons = true }) => {
    const affiliations: AffiliationItemData[] = [
        {
            fullName: 'Khyber Medical University',
            acronym: 'KMU',
            role: 'Affiliated for 4-Year BS Degree Programs',
            status: 'Affiliated',
            logo: '/images/logos/Kmu.png',
        },
        {
            fullName: 'Pharmacy Council of Pakistan',
            acronym: 'PCP',
            role: 'Accredited for 2-Year Pharmacy Category B',
            status: 'Accredited',
            logo: '/images/logos/pcp.png',
        },
        {
            fullName: 'KPK Medical Faculty (FPAHS)',
            acronym: 'FPAHS',
            role: 'Affiliated for 2-Year Medical Technology Diplomas',
            status: 'Affiliated',
            logo: '/images/logos/fpahs.png',
        },
        {
            fullName: 'Higher Education Regulatory Authority',
            acronym: 'HERA',
            role: 'Government Registered Higher Education Institution',
            status: 'Registered',
            logo: '/images/logos/hera.png',
        },
        {
            fullName: 'Health Foundation KP',
            acronym: 'HF-KP',
            role: 'Recognized Healthcare Training & Clinical Partner',
            status: 'Recognized',
            logo: '/images/logos/health-foundation.png',
        },
    ];

    return (
        <div className={`grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5 ${className}`}>
            {affiliations.map((item, idx) => (
                <AffiliationLogoItem
                    key={idx}
                    item={item}
                    showIcons={showIcons}
                    isLast={idx === affiliations.length - 1}
                />
            ))}
        </div>
    );
};

export default BcmtAffiliations;

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
}> = ({ item, showIcons }) => {
    const [imgErr, setImgErr] = useState(false);

    return (
        <div className="group relative flex flex-col justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
            {/* Top Row: Logo & Status Badge */}
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 p-1.5 shadow-2xs group-hover:border-slate-300 transition-colors">
                    {!imgErr ? (
                        <img
                            src={item.logo}
                            alt={item.acronym}
                            className="h-full w-full object-contain"
                            onError={() => setImgErr(true)}
                        />
                    ) : (
                        <ShieldCheck className="h-6 w-6 text-slate-700" />
                    )}
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {item.status}
                </span>
            </div>

            {/* Entity Name & Role */}
            <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#07294D] transition-colors leading-snug">
                    {item.fullName}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 mt-1 leading-normal">
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
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 ${className}`}>
            {affiliations.map((item, idx) => (
                <AffiliationLogoItem key={idx} item={item} showIcons={showIcons} />
            ))}
        </div>
    );
};

export default BcmtAffiliations;

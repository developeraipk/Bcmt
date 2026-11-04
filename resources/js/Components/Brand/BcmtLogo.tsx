import React, { useState } from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    lightText?: boolean;
    src?: string;
    size?: string;
}

export const BcmtLogo: React.FC<LogoProps> = ({
    className = 'h-12 w-12',
    showText = false,
    lightText = false,
    src = '/images/logos/bcmt-logo.png',
}) => {
    const [imageError, setImageError] = useState(false);

    const logoGraphic = !imageError ? (
        <img
            src={src}
            alt="BCMT Logo"
            className={`${className} object-contain shrink-0`}
            onError={() => setImageError(true)}
        />
    ) : (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer Deep Academic Navy Border Ring */}
            <circle cx="60" cy="60" r="56" fill="#07294D" stroke="#FFB606" strokeWidth="3" />
            
            {/* Inner Gold Inset Circle */}
            <circle cx="60" cy="60" r="48" fill="#FFFFFF" stroke="#FFB606" strokeWidth="1.5" strokeDasharray="3 3" />
            
            {/* Central Shield / Medical Crest */}
            <path
                d="M60 26 C72 26 80 34 80 46 C80 66 60 84 60 84 C60 84 40 66 40 46 C40 34 48 26 60 26 Z"
                fill="#07294D"
            />
            
            {/* Caduceus / Rod of Asclepius & Crescent Star */}
            <path
                d="M60 32 L60 76 M54 44 C56 40 64 40 66 44 C66 48 54 52 54 56 C54 60 66 60 66 64"
                stroke="#FFB606"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            
            {/* Ribbon Banner */}
            <path
                d="M24 88 L60 82 L96 88 L86 98 L60 92 L34 98 Z"
                fill="#FFB606"
                stroke="#041D3C"
                strokeWidth="1.5"
            />
            
            {/* BCMT Acronym */}
            <text
                x="60"
                y="93"
                textAnchor="middle"
                fill="#07294D"
                fontSize="9"
                fontWeight="800"
                fontFamily="sans-serif"
                letterSpacing="1"
            >
                BCMT
            </text>
        </svg>
    );

    if (!showText) {
        return logoGraphic;
    }

    return (
        <div className="flex items-center gap-3">
            {logoGraphic}
            <div className="flex flex-col">
                <span
                    className={`font-serif text-lg font-bold tracking-tight leading-none ${
                        lightText ? 'text-white' : 'text-slate-900'
                    }`}
                >
                    Bannu College
                </span>
                <span
                    className={`text-xs font-semibold tracking-wider uppercase mt-1 ${
                        lightText ? 'text-[#FFB606]' : 'text-[#07294D]'
                    }`}
                >
                    of Medical Technologies
                </span>
            </div>
        </div>
    );
};

export default BcmtLogo;

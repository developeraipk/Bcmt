import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface FlashProps {
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
    };
    autoDismissSeconds?: number;
}

export const FlashNotification: React.FC<FlashProps> = ({
    flash,
    autoDismissSeconds = 5,
}) => {
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    useEffect(() => {
        if (flash?.success) {
            setCurrentMessage(flash.success);
            setMessageType('success');
            setVisible(true);
        } else if (flash?.error) {
            setCurrentMessage(flash.error);
            setMessageType('error');
            setVisible(true);
        } else if (flash?.warning) {
            setCurrentMessage(flash.warning);
            setMessageType('warning');
            setVisible(true);
        } else if (flash?.info) {
            setCurrentMessage(flash.info);
            setMessageType('info');
            setVisible(true);
        } else {
            setVisible(false);
            setCurrentMessage(null);
            return;
        }

        // Auto dismiss after specified seconds
        const timer = setTimeout(() => {
            setVisible(false);
        }, autoDismissSeconds * 1000);

        return () => clearTimeout(timer);
    }, [flash?.success, flash?.error, flash?.warning, flash?.info, autoDismissSeconds]);

    if (!visible || !currentMessage) {
        return null;
    }

    const typeStyles = {
        success: {
            bg: 'bg-emerald-600 text-white',
            border: 'border-emerald-700',
            icon: CheckCircle2,
            iconColor: 'text-emerald-100',
        },
        error: {
            bg: 'bg-rose-600 text-white',
            border: 'border-rose-700',
            icon: XCircle,
            iconColor: 'text-rose-100',
        },
        warning: {
            bg: 'bg-amber-600 text-white',
            border: 'border-amber-700',
            icon: AlertTriangle,
            iconColor: 'text-amber-100',
        },
        info: {
            bg: 'bg-[#07294D] text-white',
            border: 'border-blue-900',
            icon: Info,
            iconColor: 'text-[#FFB606]',
        },
    };

    const currentStyle = typeStyles[messageType];
    const IconComponent = currentStyle.icon;

    return (
        <div
            role="alert"
            className={`${currentStyle.bg} py-2.5 px-4 sm:px-6 text-xs sm:text-sm font-semibold shrink-0 shadow-sm transition-all duration-300 flex items-center justify-between gap-3`}
        >
            <div className="flex items-center gap-2.5 overflow-hidden">
                <IconComponent className={`w-4 h-4 shrink-0 ${currentStyle.iconColor}`} />
                <span className="truncate">{currentMessage}</span>
            </div>

            <button
                type="button"
                onClick={() => setVisible(false)}
                title="Dismiss message"
                className="p-1 hover:bg-black/15 active:bg-black/25 rounded-md transition cursor-pointer shrink-0 text-white/90 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default FlashNotification;

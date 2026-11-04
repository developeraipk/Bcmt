import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Maximize2 } from 'lucide-react';

interface Props {
    whatsappLink: string;
}

export function DraggableFloatingWhatsApp({ whatsappLink }: Props) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const dragRef = useRef<HTMLDivElement | null>(null);
    const startPosRef = useRef<{ x: number; y: number; mouseX: number; mouseY: number }>({
        x: 0,
        y: 0,
        mouseX: 0,
        mouseY: 0,
    });
    const hasMovedRef = useRef<boolean>(false);

    // Set initial position at bottom-right corner once window is loaded
    useEffect(() => {
        const setInitial = () => {
            if (position === null) {
                const rightOffset = 24;
                const bottomOffset = 24;
                const width = isCollapsed ? 56 : 280;
                const height = 56;
                setPosition({
                    x: Math.max(16, window.innerWidth - width - rightOffset),
                    y: Math.max(16, window.innerHeight - height - bottomOffset),
                });
            }
        };

        setInitial();
        window.addEventListener('resize', setInitial);
        return () => window.removeEventListener('resize', setInitial);
    }, [isCollapsed, position]);

    // Handle mouse drag start
    const handleMouseDown = (e: React.MouseEvent) => {
        // If clicking the cross button, do not start drag
        if ((e.target as HTMLElement).closest('.collapse-toggle-btn')) {
            return;
        }

        e.preventDefault();
        setIsDragging(true);
        hasMovedRef.current = false;

        const currentX = position ? position.x : window.innerWidth - (isCollapsed ? 56 : 280) - 24;
        const currentY = position ? position.y : window.innerHeight - 80;

        startPosRef.current = {
            x: currentX,
            y: currentY,
            mouseX: e.clientX,
            mouseY: e.clientY,
        };

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startPosRef.current.mouseX;
            const dy = moveEvent.clientY - startPosRef.current.mouseY;

            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                hasMovedRef.current = true;
            }

            const elementWidth = dragRef.current ? dragRef.current.offsetWidth : 56;
            const elementHeight = dragRef.current ? dragRef.current.offsetHeight : 56;

            const maxX = window.innerWidth - elementWidth - 10;
            const maxY = window.innerHeight - elementHeight - 10;

            const newX = Math.max(10, Math.min(maxX, startPosRef.current.x + dx));
            const newY = Math.max(10, Math.min(maxY, startPosRef.current.y + dy));

            setPosition({ x: newX, y: newY });
        };

        const onMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Handle touch drag for mobile/tablet devices
    const handleTouchStart = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.collapse-toggle-btn')) {
            return;
        }

        const touch = e.touches[0];
        setIsDragging(true);
        hasMovedRef.current = false;

        const currentX = position ? position.x : window.innerWidth - (isCollapsed ? 56 : 280) - 24;
        const currentY = position ? position.y : window.innerHeight - 80;

        startPosRef.current = {
            x: currentX,
            y: currentY,
            mouseX: touch.clientX,
            mouseY: touch.clientY,
        };

        const onTouchMove = (moveEvent: TouchEvent) => {
            const currentTouch = moveEvent.touches[0];
            const dx = currentTouch.clientX - startPosRef.current.mouseX;
            const dy = currentTouch.clientY - startPosRef.current.mouseY;

            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                hasMovedRef.current = true;
            }

            const elementWidth = dragRef.current ? dragRef.current.offsetWidth : 56;
            const elementHeight = dragRef.current ? dragRef.current.offsetHeight : 56;

            const maxX = window.innerWidth - elementWidth - 10;
            const maxY = window.innerHeight - elementHeight - 10;

            const newX = Math.max(10, Math.min(maxX, startPosRef.current.x + dx));
            const newY = Math.max(10, Math.min(maxY, startPosRef.current.y + dy));

            setPosition({ x: newX, y: newY });
        };

        const onTouchEnd = () => {
            setIsDragging(false);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };

        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd);
    };

    // If user clicked without dragging, open link
    const handleLinkClick = (e: React.MouseEvent) => {
        if (hasMovedRef.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    if (!position) {
        return null;
    }

    return (
        <div
            ref={dragRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 9999,
                touchAction: 'none',
                userSelect: 'none',
            }}
            className={`transition-shadow ${
                isDragging ? 'cursor-grabbing scale-105 shadow-2xl opacity-90' : 'cursor-grab'
            }`}
        >
            {isCollapsed ? (
                // Collapsed Compact Circular Button (Only Icon as requested by user)
                <div className="relative group">
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleLinkClick}
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl hover:shadow-emerald-600/40 border-2 border-white transition-all transform hover:scale-105 active:scale-95"
                        title="Chat with BCMT Admission Support (Drag to move)"
                    >
                        <MessageCircle className="h-7 w-7 fill-current" />
                    </a>

                    {/* Expand icon pill on hover */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCollapsed(false);
                        }}
                        className="collapse-toggle-btn absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-emerald-800 border border-emerald-300 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50"
                        title="Expand button"
                    >
                        <Maximize2 className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                // Full Pill with Cross Button (X)
                <div className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl border-2 border-white/80 backdrop-blur-md transition-all group overflow-hidden">
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2.5 pl-4 pr-2 py-3 font-bold text-sm"
                        title="Click to chat, drag anywhere to move"
                    >
                        <MessageCircle className="h-5 w-5 fill-current shrink-0 animate-bounce" />
                        <span className="whitespace-nowrap pr-1 text-xs sm:text-sm font-semibold tracking-wide">
                            Admission WhatsApp Support
                        </span>
                    </a>

                    {/* Cross Button (X) to collapse into only icon */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCollapsed(true);
                        }}
                        className="collapse-toggle-btn flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-emerald-700/80 hover:bg-emerald-800 text-white/90 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Collapse to icon only"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

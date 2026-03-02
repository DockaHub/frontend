
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactElement;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'right', className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = 0;
            let left = 0;

            switch (side) {
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + 8; // 8px margin
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - 8;
                    break;
                case 'top':
                    top = rect.top - 8;
                    left = rect.left + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 8;
                    left = rect.left + rect.width / 2;
                    break;
            }
            setCoords({ top, left });
        }
    };

    const handleMouseEnter = () => {
        updatePosition();
        setIsVisible(true);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="relative flex items-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                // Portal to body to avoid overflow clipping
                <PortalTooltip
                    content={content}
                    coords={coords}
                    side={side}
                    className={className}
                />
            )}
        </>
    );
};

const PortalTooltip: React.FC<{ content: string, coords: { top: number, left: number }, side: 'top' | 'right' | 'bottom' | 'left', className?: string }> = ({ content, coords, side, className }) => {
    const style: React.CSSProperties = {
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: 9999,
        // Centering logic based on side
        transform: side === 'left' || side === 'right' ? 'translateY(-50%)' : 'translateX(-50%)',
    };

    // We need to render this into the body
    // Since we are in a browser environment, we can use createPortal
    // defaulting to returning null if document is not defined (SSR safety)
    if (typeof document === 'undefined') return null;

    const tooltipEl = (
        <div
            style={style}
            className={`px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none ${className}`}
        >
            {content}
        </div>
    );

    // React 18+ usually has createPortal in react-dom
    // Using standard import assumed available or accessible via window if not imported. 
    // Ideally we import { createPortal } from 'react-dom';

    return createPortal(tooltipEl, document.body);
};

export default Tooltip;

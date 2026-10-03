import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Drawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    width = '520px'
}) {
    const drawerRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="drawer-backdrop" onClick={onClose} role="presentation">
            <div
                className="drawer-panel"
                style={{ width: `min(${width}, 100vw)` }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
                ref={drawerRef}
            >
                <div className="drawer-head">
                    <div>
                        <h3 id="drawer-title" style={{ fontSize: 18, fontWeight: 700 }}>
                            {title}
                        </h3>
                        {subtitle && (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost"
                        style={{ border: 'none', padding: 6, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex' }}
                        aria-label="Close drawer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="drawer-body">
                    {children}
                </div>

                {footer && (
                    <div className="drawer-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

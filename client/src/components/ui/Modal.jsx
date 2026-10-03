import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export function Modal({ isOpen, onClose, title, children, maxWidth = '480px' }) {
    const modalRef = useRef(null);

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
        <div className="modal-backdrop" onClick={onClose} role="presentation">
            <div
                className="modal-card"
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                ref={modalRef}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 id="modal-title">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost"
                        style={{ border: 'none', padding: 6, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex' }}
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm action', message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                {message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
}

export default Modal;

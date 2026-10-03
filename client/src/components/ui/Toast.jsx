import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

function ToastItem({ toast, onDismiss }) {
    const { id, message, type, duration = 4000 } = toast;
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const remainingTimeRef = useRef(duration);

    useEffect(() => {
        if (isPaused) {
            clearTimeout(timerRef.current);
            remainingTimeRef.current -= Date.now() - startTimeRef.current;
        } else {
            startTimeRef.current = Date.now();
            timerRef.current = setTimeout(() => {
                onDismiss(id);
            }, remainingTimeRef.current);
        }

        return () => clearTimeout(timerRef.current);
    }, [id, isPaused, onDismiss]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={18} className="toast-icon" />;
            case 'error':
                return <AlertCircle size={18} className="toast-icon" />;
            case 'warning':
                return <AlertTriangle size={18} className="toast-icon" />;
            case 'info':
            default:
                return <Info size={18} className="toast-icon" />;
        }
    };

    return (
        <div
            className={`toast toast-${type}`}
            role="status"
            aria-live="polite"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {getIcon()}
            <div className="toast-content">{message}</div>
            <button
                type="button"
                className="toast-close"
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
            >
                <X size={15} />
            </button>
            <div
                className="toast-progress"
                style={{
                    animationDuration: `${duration}ms`,
                    animationPlayState: isPaused ? 'paused' : 'running'
                }}
            />
        </div>
    );
}

export default function ToastContainer({ toasts, onDismiss }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-container" aria-label="Notifications">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

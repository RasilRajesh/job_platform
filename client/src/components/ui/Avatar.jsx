import React from 'react';

const GRADIENTS = [
    'linear-gradient(135deg, #4f46e5, #06b6d4)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #6366f1, #d946ef)',
    'linear-gradient(135deg, #0ea5e9, #10b981)'
];

function getGradientIndex(str = '') {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % GRADIENTS.length;
}

function getInitials(name = '') {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Avatar({ name = '', src = '', size = 44, borderRadius = 'var(--radius-md)', className = '' }) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={className}
                style={{
                    width: size,
                    height: size,
                    borderRadius,
                    objectFit: 'cover'
                }}
            />
        );
    }

    const gradient = GRADIENTS[getGradientIndex(name)];
    const initials = getInitials(name);

    return (
        <div
            className={`job-company-avatar ${className}`.trim()}
            style={{
                width: size,
                height: size,
                borderRadius,
                background: gradient,
                fontSize: size >= 40 ? '15px' : '12px'
            }}
            aria-label={name}
        >
            {initials}
        </div>
    );
}

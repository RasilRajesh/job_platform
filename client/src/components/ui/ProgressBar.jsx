import React from 'react';

export default function ProgressBar({ value = 0, max = 100, height = 8, showLabel = false, className = '' }) {
    const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

    return (
        <div className={className} style={{ width: '100%' }}>
            {showLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Completion</span>
                    <span style={{ color: 'var(--primary)' }}>{percentage}%</span>
                </div>
            )}
            <div
                className="progress-bar-wrap"
                style={{ height }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

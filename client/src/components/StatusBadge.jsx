import React from 'react';

const LABELS = {
    applied: 'Applied',
    reviewing: 'Reviewing',
    interview: 'Interview',
    offer: 'Offer Made',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
    hired: 'Hired'
};

function StatusBadge({ status, stage }) {
    const raw = stage || status || 'applied';
    const normalized = raw.toLowerCase();
    const label = LABELS[normalized] || raw;

    return (
        <span className={`status-badge status-${normalized}`}>
            {label}
        </span>
    );
}

export default StatusBadge;

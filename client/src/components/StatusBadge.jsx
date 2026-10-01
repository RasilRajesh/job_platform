const LABELS = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
    hired: 'Hired'
};

function StatusBadge({ status }) {
    const value = status || 'applied';
    return <span className={`status-badge status-${value}`}>{LABELS[value] || value}</span>;
}

export default StatusBadge;

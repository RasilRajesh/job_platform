export const formatSalary = (salary) => {
    if (salary === undefined || salary === null) return 'Not specified';
    return `₹${Number(salary).toLocaleString('en-IN')}`;
};

export const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatTimeAgo = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return formatDate(value);
};

export const recruiterIdFromJob = (job) => {
    if (!job?.recruiter) return '';
    return typeof job.recruiter === 'object' ? job.recruiter._id : job.recruiter;
};

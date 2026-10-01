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

export const recruiterIdFromJob = (job) => {
    if (!job?.recruiter) return '';
    return typeof job.recruiter === 'object' ? job.recruiter._id : job.recruiter;
};

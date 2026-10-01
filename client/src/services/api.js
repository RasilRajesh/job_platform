const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

export async function request(path, options = {}) {
    const {
        method = 'GET',
        body,
        auth = false,
        params
    } = options;

    let url = `${API_URL}${path}`;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        });
        const query = searchParams.toString();
        if (query) {
            url += `?${query}`;
        }
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (auth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        const error = new Error('Cannot connect to the server. Make sure the backend is running.');
        error.status = 0;
        throw error;
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && auth) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
    }

    if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const registerUser = (payload) =>
    request('/api/auth/register', { method: 'POST', body: payload });

export const loginUser = (payload) =>
    request('/api/auth/login', { method: 'POST', body: payload });

export const getJobs = (params) =>
    request('/api/jobs', { params });

export const getJobById = (id) =>
    request(`/api/jobs/${id}`);

export const createJob = (payload) =>
    request('/api/jobs', { method: 'POST', body: payload, auth: true });

export const updateJob = (id, payload) =>
    request(`/api/jobs/${id}`, { method: 'PUT', body: payload, auth: true });

export const deleteJob = (id) =>
    request(`/api/jobs/${id}`, { method: 'DELETE', auth: true });

export const applyForJob = (jobId, payload) =>
    request(`/api/applications/${jobId}`, { method: 'POST', body: payload, auth: true });

export const getMyApplications = () =>
    request('/api/applications/my-applications', { auth: true });

export const getJobApplications = (jobId) =>
    request(`/api/applications/job/${jobId}`, { auth: true });

export const updateApplicationStatus = (id, status) =>
    request(`/api/applications/${id}/status`, { method: 'PUT', body: { status }, auth: true });

export const getSavedJobs = () =>
    request('/api/saved-jobs', { auth: true });

export const saveJob = (jobId) =>
    request(`/api/saved-jobs/${jobId}`, { method: 'POST', auth: true });

export const removeSavedJob = (jobId) =>
    request(`/api/saved-jobs/${jobId}`, { method: 'DELETE', auth: true });

export const checkSavedJob = (jobId) =>
    request(`/api/saved-jobs/check/${jobId}`, { auth: true });

export const getJobseekerDashboard = () =>
    request('/api/dashboard/jobseeker', { auth: true });

export const getRecruiterDashboard = () =>
    request('/api/dashboard/recruiter', { auth: true });

export const getMyProfile = () =>
    request('/api/profile/me', { auth: true });

export const updateProfile = (payload) =>
    request('/api/profile/me', { method: 'PUT', body: payload, auth: true });

export const getProfileCompletion = () =>
    request('/api/profile/me/completion', { auth: true });

export const updateSkills = (skills) =>
    request('/api/profile/me/skills', { method: 'PUT', body: { skills }, auth: true });

export const updateResume = (resumeUrl) =>
    request('/api/profile/me/resume', { method: 'PUT', body: { resumeUrl }, auth: true });

export const addEducation = (payload) =>
    request('/api/profile/me/education', { method: 'POST', body: payload, auth: true });

export const updateEducation = (id, payload) =>
    request(`/api/profile/me/education/${id}`, { method: 'PUT', body: payload, auth: true });

export const deleteEducation = (id) =>
    request(`/api/profile/me/education/${id}`, { method: 'DELETE', auth: true });

export const addExperience = (payload) =>
    request('/api/profile/me/experience', { method: 'POST', body: payload, auth: true });

export const updateExperience = (id, payload) =>
    request(`/api/profile/me/experience/${id}`, { method: 'PUT', body: payload, auth: true });

export const deleteExperience = (id) =>
    request(`/api/profile/me/experience/${id}`, { method: 'DELETE', auth: true });

export const getJobseekerProfile = (userId) =>
    request(`/api/profile/jobseeker/${userId}`, { auth: true });

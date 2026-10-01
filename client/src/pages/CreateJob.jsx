import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getJobById, updateJob } from '../services/api';

const emptyForm = {
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    skills: '',
    jobType: 'full-time'
};

function JobFormPage({ mode }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = mode === 'edit';
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        const load = async () => {
            try {
                const data = await getJobById(id);
                const job = data.job;
                setForm({
                    title: job.title || '',
                    description: job.description || '',
                    company: job.company || '',
                    location: job.location || '',
                    salary: job.salary ?? '',
                    skills: (job.skills || []).join(', '),
                    jobType: job.jobType || 'full-time'
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!form.title.trim() || !form.description.trim() || !form.company.trim() || !form.location.trim()) {
            setError('Title, description, company, and location are required.');
            return;
        }

        const salary = Number(form.salary);
        if (Number.isNaN(salary) || salary < 0) {
            setError('Salary must be a valid positive number.');
            return;
        }

        const skills = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
        if (skills.length === 0) {
            setError('Please add at least one skill.');
            return;
        }

        if (!form.jobType) {
            setError('Job type is required.');
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            company: form.company.trim(),
            location: form.location.trim(),
            salary,
            skills,
            jobType: form.jobType
        };

        setSaving(true);
        try {
            if (isEdit) {
                await updateJob(id, payload);
            } else {
                await createJob(payload);
            }
            navigate('/my-jobs');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container section"><p>Loading job...</p></div>;

    return (
        <div className="container section">
            <form className="form-card" onSubmit={handleSubmit}>
                <h1>{isEdit ? 'Edit job' : 'Post a job'}</h1>
                <p className="muted">The recruiter ID is taken from your JWT. Do not send it in this form.</p>
                {error && <div className="alert alert-error">{error}</div>}
                <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
                <label>Company<input name="company" value={form.company} onChange={handleChange} required /></label>
                <label>Location<input name="location" value={form.location} onChange={handleChange} required /></label>
                <label>Salary<input name="salary" type="number" min="0" value={form.salary} onChange={handleChange} required /></label>
                <label>
                    Job type
                    <select name="jobType" value={form.jobType} onChange={handleChange} required>
                        <option value="full-time">full-time</option>
                        <option value="part-time">part-time</option>
                        <option value="internship">internship</option>
                        <option value="contract">contract</option>
                    </select>
                </label>
                <label>Skills (comma separated)<input name="skills" value={form.skills} onChange={handleChange} required /></label>
                <label>Description<textarea name="description" rows="6" value={form.description} onChange={handleChange} required /></label>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : isEdit ? 'Update job' : 'Create job'}
                </button>
            </form>
        </div>
    );
}

export function CreateJob() {
    return <JobFormPage mode="create" />;
}

export function EditJob() {
    return <JobFormPage mode="edit" />;
}

export default CreateJob;

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { checkSavedJob, deleteJob, getJobById, removeSavedJob, saveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatSalary, recruiterIdFromJob } from '../utils/format';

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [message, setMessage] = useState('');

    const isOwner = user?.role === 'recruiter' && job && String(recruiterIdFromJob(job)) === String(user.id);

    const loadJob = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobById(id);
            setJob(data.job);
            if (isAuthenticated && user?.role === 'jobseeker') {
                const check = await checkSavedJob(id);
                setSaved(check.saved);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJob();
    }, [id, isAuthenticated, user?.role]);

    const handleSave = async () => {
        setMessage('');
        try {
            if (saved) {
                await removeSavedJob(id);
                setSaved(false);
            } else {
                await saveJob(id);
                setSaved(true);
            }
        } catch (err) {
            setMessage(err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this job? This cannot be undone.')) return;
        try {
            await deleteJob(id);
            navigate('/my-jobs');
        } catch (err) {
            setMessage(err.message);
        }
    };

    if (loading) return <div className="container section"><Loading message="Loading job..." /></div>;
    if (error) return <div className="container section"><ErrorMessage message={error} onRetry={loadJob} /></div>;
    if (!job) return null;

    return (
        <div className="container section job-details">
            <p className="muted">{job.company} · {job.location}</p>
            <h1>{job.title}</h1>
            <div className="meta-row">
                <span>{formatSalary(job.salary)}</span>
                {job.jobType && <span className="chip">{job.jobType}</span>}
                <span className="muted">Posted {formatDate(job.createdAt)}</span>
            </div>
            <div className="skill-row">
                {(job.skills || []).map((skill) => (
                    <span key={skill} className="chip chip-soft">{skill}</span>
                ))}
            </div>
            <h2>Description</h2>
            <p className="description">{job.description}</p>
            {message && <div className="alert alert-error">{message}</div>}
            <div className="card-actions">
                {user?.role === 'jobseeker' && (
                    <>
                        <Link to={`/jobs/${job._id}/apply`} className="btn btn-primary">Apply</Link>
                        <button type="button" className="btn btn-ghost" onClick={handleSave}>
                            {saved ? '♥ Saved' : '♡ Save job'}
                        </button>
                    </>
                )}
                {!isAuthenticated && (
                    <Link to="/login" className="btn btn-primary">Login to apply</Link>
                )}
                {isOwner && (
                    <>
                        <Link to={`/edit-job/${job._id}`} className="btn btn-secondary">Edit</Link>
                        <Link to={`/jobs/${job._id}/applicants`} className="btn btn-primary">View applicants</Link>
                        <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default JobDetails;

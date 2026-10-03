import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Bookmark, Trash2, Edit3, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { checkSavedJob, deleteJob, getJobById, removeSavedJob, saveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import Avatar from '../components/ui/Avatar';
import MatchBadge from '../components/jobs/MatchBadge';
import { ConfirmModal } from '../components/ui/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatSalary, formatTimeAgo, recruiterIdFromJob } from '../utils/format';

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { success, error: toastError } = useToast();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isOwner = user?.role === 'recruiter' && job && String(recruiterIdFromJob(job)) === String(user.id);

    const loadJob = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobById(id);
            setJob(data.job);
            if (isAuthenticated && user?.role === 'jobseeker') {
                const check = await checkSavedJob(id);
                setSaved(Boolean(check.saved));
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
        const nextState = !saved;
        setSaved(nextState); // optimistic
        try {
            if (saved) {
                await removeSavedJob(id);
                success('Removed from saved jobs');
            } else {
                await saveJob(id);
                success('Job saved to your bookmarks');
            }
        } catch (err) {
            setSaved(!nextState); // rollback
            toastError(err.message || 'Could not update bookmark');
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteJob(id);
            success('Job listing deleted successfully');
            navigate('/my-jobs');
        } catch (err) {
            toastError(err.message || 'Failed to delete job');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="container section" style={{ maxWidth: 840 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                    <Skeleton width="64px" height="64px" borderRadius="var(--radius-lg)" />
                    <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                        <Skeleton width="50%" height="28px" />
                        <Skeleton width="30%" height="16px" />
                    </div>
                </div>
                <Skeleton width="100%" height="240px" borderRadius="var(--radius-lg)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container section" style={{ maxWidth: 840 }}>
                <ErrorMessage message={error} onRetry={loadJob} />
            </div>
        );
    }

    if (!job) return null;

    const isRemote = job.location?.toLowerCase().includes('remote') ||
                     job.description?.toLowerCase().includes('remote');

    return (
        <div className="container section" style={{ maxWidth: 880 }}>
            {/* Breadcrumb navigation */}
            <div style={{ marginBottom: 20 }}>
                <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <ArrowLeft size={14} /> Back to all jobs
                </Link>
            </div>

            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '36px',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: 32
                }}
            >
                {/* Header Profile */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <Avatar name={job.company} size={64} borderRadius="var(--radius-lg)" />
                        <div>
                            <h1 style={{ fontSize: 26, marginBottom: 4 }}>{job.title}</h1>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-muted)' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{job.company}</span>
                                <span>•</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={14} /> {job.location}
                                </span>
                                <span>•</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={14} /> {formatTimeAgo(job.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MatchBadge candidateSkills={user?.skills} jobSkills={job.skills} size="lg" />
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28, padding: '16px 20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Compensation</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>{formatSalary(job.salary)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employment Type</div>
                        <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize', marginTop: 2 }}>{job.jobType || 'Full-time'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workplace</div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{isRemote ? 'Remote Friendly' : 'On-site'}</div>
                    </div>
                </div>

                {/* Skills Section */}
                <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>Desired Skills & Tech Stack</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(job.skills || []).map((skill) => (
                            <span key={skill} className="badge chip-soft" style={{ fontSize: 13, padding: '6px 12px' }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Job Description */}
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>About the Role</h3>
                    <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                        {job.description}
                    </div>
                </div>

                {/* Action Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                    {user?.role === 'jobseeker' && (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <Link to={`/jobs/${job._id}/apply`} className="btn btn-primary btn-lg">
                                <span>Apply for this position</span>
                            </Link>
                            <button
                                type="button"
                                className={`btn ${saved ? 'btn-secondary' : 'btn-ghost'} btn-lg`}
                                onClick={handleSave}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                            >
                                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                                <span>{saved ? 'Saved' : 'Save for later'}</span>
                            </button>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Sign in to apply
                            </Link>
                            <Link to="/register" className="btn btn-ghost btn-lg">
                                Create an account
                            </Link>
                        </div>
                    )}

                    {isOwner && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Link to={`/jobs/${job._id}/applicants`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Users size={16} />
                                <span>Review Pipeline</span>
                            </Link>
                            <Link to={`/edit-job/${job._id}`} className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Edit3 size={15} />
                                <span>Edit</span>
                            </Link>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => setShowDeleteModal(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                <Trash2 size={15} />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Accessible Confirmation Modal replacing window.confirm */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Job Posting?"
                message={`Are you sure you want to permanently delete "${job.title}"? All existing applicants and tracking data will be removed.`}
                confirmText="Delete listing"
                confirmVariant="danger"
                loading={isDeleting}
            />
        </div>
    );
}

export default JobDetails;

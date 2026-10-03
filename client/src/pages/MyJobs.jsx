import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Users, Trash2, MapPin, Briefcase } from 'lucide-react';
import { deleteJob, getJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { ConfirmModal } from '../components/ui/Modal';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatSalary, recruiterIdFromJob, formatTimeAgo } from '../utils/format';

function MyJobs() {
    const { user } = useAuth();
    const { success, error: toastError } = useToast();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [jobToDelete, setJobToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobs({ limit: 100, page: 1, sort: 'latest' });
            const mine = (data.jobs || []).filter((job) => String(recruiterIdFromJob(job)) === String(user.id));
            setJobs(mine);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [user?.id]);

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return;
        setIsDeleting(true);
        try {
            await deleteJob(jobToDelete._id);
            setJobs((current) => current.filter((job) => job._id !== jobToDelete._id));
            success(`Deleted "${jobToDelete.title}" successfully`);
            setJobToDelete(null);
        } catch (err) {
            toastError(err.message || 'Could not delete job');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container section">
            <div className="section-head">
                <div>
                    <h1>Manage Job Listings</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>
                        Track and edit your published positions and view candidate pipelines.
                    </p>
                </div>
                <Link to="/create-job" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <PlusCircle size={16} />
                    <span>Post New Role</span>
                </Link>
            </div>

            {error && <ErrorMessage message={error} onRetry={load} />}

            {!loading && !error && jobs.length === 0 && (
                <EmptyState
                    title="No jobs posted yet"
                    message="Publish an opening to start receiving top-tier applicants."
                    action={
                        <Link to="/create-job" className="btn btn-primary">
                            Create First Listing
                        </Link>
                    }
                />
            )}

            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Position & Company</th>
                            <th>Location</th>
                            <th>Compensation</th>
                            <th>Posted</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <>
                                <TableRowSkeleton cols={5} />
                                <TableRowSkeleton cols={5} />
                                <TableRowSkeleton cols={5} />
                            </>
                        )}

                        {!loading && jobs.map((job) => (
                            <tr key={job._id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>
                                        <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        {job.company}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                                        <MapPin size={13} />
                                        {job.location}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>
                                        {formatSalary(job.salary)}
                                    </span>
                                </td>
                                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    {formatTimeAgo(job.createdAt)}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                                        <Link
                                            to={`/jobs/${job._id}/applicants`}
                                            className="btn btn-primary btn-sm"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                        >
                                            <Users size={13} />
                                            <span>Pipeline</span>
                                        </Link>
                                        <Link
                                            to={`/edit-job/${job._id}`}
                                            className="btn btn-ghost btn-sm"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                        >
                                            <Edit3 size={13} />
                                            <span>Edit</span>
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            style={{ color: 'var(--danger)', padding: '6px 8px' }}
                                            onClick={() => setJobToDelete(job)}
                                            title="Delete job"
                                            aria-label="Delete job"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={Boolean(jobToDelete)}
                onClose={() => setJobToDelete(null)}
                onConfirm={confirmDeleteJob}
                title="Delete Job Listing?"
                message={`Are you sure you want to permanently delete "${jobToDelete?.title}"? All applicants will be removed.`}
                confirmText="Delete listing"
                confirmVariant="danger"
                loading={isDeleting}
            />
        </div>
    );
}

export default MyJobs;

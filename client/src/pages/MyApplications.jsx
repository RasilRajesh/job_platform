import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../services/api';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTimeAgo } from '../utils/format';
import { MapPin, ArrowRight } from 'lucide-react';

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyApplications();
            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="container section">
            <div className="section-head">
                <div>
                    <h1>My Applications</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>
                        Live progression milestones for all your submitted applications.
                    </p>
                </div>
                <Link to="/jobs" className="btn btn-ghost btn-sm">
                    Browse More Jobs
                </Link>
            </div>

            {error && <ErrorMessage message={error} onRetry={load} />}

            {!loading && !error && applications.length === 0 && (
                <EmptyState
                    title="No applications submitted yet"
                    message="Explore curated openings, check your skill match %, and apply directly."
                    action={<Link to="/jobs" className="btn btn-primary">Find Jobs</Link>}
                />
            )}

            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Company</th>
                            <th>Location</th>
                            <th>Applied</th>
                            <th>Stage / Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <>
                                <TableRowSkeleton cols={6} />
                                <TableRowSkeleton cols={6} />
                                <TableRowSkeleton cols={6} />
                            </>
                        )}
                        {!loading && applications.map((application) => (
                            <tr key={application._id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                                        {application.job?._id ? (
                                            <Link to={`/jobs/${application.job._id}`}>
                                                {application.job.title}
                                            </Link>
                                        ) : (
                                            application.job?.title || 'Listing Archived'
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600 }}>{application.job?.company || 'Company'}</span>
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                                        <MapPin size={13} />
                                        {application.job?.location || 'Remote'}
                                    </span>
                                </td>
                                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    {formatTimeAgo(application.createdAt)}
                                </td>
                                <td>
                                    <StatusBadge stage={application.stage} status={application.status} />
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {application.job?._id && (
                                        <Link to={`/jobs/${application.job._id}`} className="btn btn-ghost btn-sm">
                                            <span>View</span>
                                            <ArrowRight size={13} />
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MyApplications;

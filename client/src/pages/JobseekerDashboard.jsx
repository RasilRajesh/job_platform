import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobseekerDashboard } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/format';

function JobseekerDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setData(await getJobseekerDashboard());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) return <div className="container section"><Loading message="Loading dashboard..." /></div>;
    if (error) return <div className="container section"><ErrorMessage message={error} onRetry={load} /></div>;

    const stats = data?.statistics || {};

    return (
        <div className="container section">
            <h1>Welcome, {data?.user?.name}</h1>
            <p className="muted">These numbers come from the dashboard API, not from React calculations.</p>
            <div className="stat-grid">
                <div className="stat-card"><span>Total applications</span><strong>{stats.totalApplications}</strong></div>
                <div className="stat-card"><span>Applied</span><strong>{stats.applied}</strong></div>
                <div className="stat-card"><span>Shortlisted</span><strong>{stats.shortlisted}</strong></div>
                <div className="stat-card"><span>Rejected</span><strong>{stats.rejected}</strong></div>
                <div className="stat-card"><span>Hired</span><strong>{stats.hired}</strong></div>
            </div>
            <div className="quick-links">
                <Link to="/jobs">Find jobs</Link>
                <Link to="/my-applications">My applications</Link>
                <Link to="/saved-jobs">Saved jobs</Link>
                <Link to="/profile">My profile</Link>
            </div>
            <h2>Recent applications</h2>
            {(data?.recentApplications || []).length === 0 && <p className="muted">No applications yet.</p>}
            <div className="list-stack">
                {(data?.recentApplications || []).map((item, index) => (
                    <article key={index} className="list-card">
                        <div>
                            <h3>{item.job?.title || 'Job'}</h3>
                            <p className="muted">{item.job?.company} · {item.job?.location}</p>
                            <p className="muted small">{formatDate(item.appliedAt)}</p>
                        </div>
                        <StatusBadge status={item.status} />
                    </article>
                ))}
            </div>
        </div>
    );
}

export default JobseekerDashboard;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterDashboard } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/format';

function RecruiterDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setData(await getRecruiterDashboard());
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
            <p className="muted">Recruiter stats are calculated on the server from your jobs and applicants.</p>
            <div className="stat-grid">
                <div className="stat-card"><span>Total jobs</span><strong>{stats.totalJobs}</strong></div>
                <div className="stat-card"><span>Total applications</span><strong>{stats.totalApplications}</strong></div>
                <div className="stat-card"><span>Applied</span><strong>{stats.applied}</strong></div>
                <div className="stat-card"><span>Shortlisted</span><strong>{stats.shortlisted}</strong></div>
                <div className="stat-card"><span>Rejected</span><strong>{stats.rejected}</strong></div>
                <div className="stat-card"><span>Hired</span><strong>{stats.hired}</strong></div>
            </div>
            <div className="quick-links">
                <Link to="/create-job">Post a job</Link>
                <Link to="/my-jobs">My jobs</Link>
                <Link to="/my-jobs">Manage applicants</Link>
                <Link to="/profile">Profile</Link>
            </div>
            <div className="two-col">
                <section>
                    <h2>Recent jobs</h2>
                    {(data?.recentJobs || []).length === 0 && <p className="muted">No jobs posted yet.</p>}
                    {(data?.recentJobs || []).map((job) => (
                        <article key={job._id} className="list-card">
                            <div>
                                <h3>{job.title}</h3>
                                <p className="muted">{job.company} · {job.location}</p>
                            </div>
                            <Link to={`/jobs/${job._id}/applicants`}>Applicants</Link>
                        </article>
                    ))}
                </section>
                <section>
                    <h2>Recent applicants</h2>
                    {(data?.recentApplicants || []).length === 0 && <p className="muted">No applicants yet.</p>}
                    {(data?.recentApplicants || []).map((item, index) => (
                        <article key={index} className="list-card">
                            <div>
                                <h3>{item.applicant?.name}</h3>
                                <p className="muted">{item.job?.title}</p>
                                <p className="muted small">{formatDate(item.appliedAt)}</p>
                            </div>
                            <StatusBadge status={item.status} />
                        </article>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default RecruiterDashboard;

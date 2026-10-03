import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bookmark, CheckCircle2, AlertCircle, FileText, ArrowRight, UserCheck } from 'lucide-react';
import { getJobseekerDashboard, getProfileCompletion } from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import ProgressBar from '../components/ui/ProgressBar';
import { BentoTileSkeleton } from '../components/ui/Skeleton';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatTimeAgo } from '../utils/format';

function JobseekerDashboard() {
    const [data, setData] = useState(null);
    const [completion, setCompletion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [dashData, compData] = await Promise.all([
                getJobseekerDashboard(),
                getProfileCompletion().catch(() => null)
            ]);
            setData(dashData);
            setCompletion(compData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const stats = data?.statistics || {};
    const percent = completion?.percentage || (data?.user?.skills?.length ? 75 : 40);
    const missing = completion?.missingFields || [];

    return (
        <div className="container section">
            {/* Header Greeting */}
            <div style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 4 }}>
                        Welcome back, {data?.user?.name || 'Candidate'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                        Here is your real-time career pipeline and active application telemetry.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link to="/jobs" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span>Search Jobs</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {error && <ErrorMessage message={error} onRetry={load} />}

            {/* Bento Grid Metrics */}
            <div className="bento-grid">
                {loading ? (
                    <>
                        <BentoTileSkeleton />
                        <BentoTileSkeleton />
                        <BentoTileSkeleton />
                        <BentoTileSkeleton />
                    </>
                ) : (
                    <>
                        <MetricCard
                            label="Total Applications"
                            value={stats.totalApplications || 0}
                            trendPercent={18}
                            trendDirection="up"
                            icon={Send}
                            color="var(--primary)"
                        />
                        <MetricCard
                            label="Under Review"
                            value={stats.applied || 0}
                            trendPercent={8}
                            trendDirection="up"
                            icon={FileText}
                            color="#f59e0b"
                        />
                        <MetricCard
                            label="Interviews / Shortlisted"
                            value={stats.shortlisted || 0}
                            trendPercent={25}
                            trendDirection="up"
                            icon={UserCheck}
                            color="#8b5cf6"
                        />
                        <MetricCard
                            label="Offers & Hires"
                            value={stats.hired || 0}
                            trendPercent={100}
                            trendDirection="up"
                            icon={CheckCircle2}
                            color="var(--success)"
                        />
                    </>
                )}

                {/* Profile Completion Tile (Spans 2 cols) */}
                <div className="bento-tile span-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>Profile Strength</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{percent}% Complete</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                            A complete profile significantly boosts your automated match percentage with top recruiters.
                        </p>
                        <ProgressBar value={percent} height={10} />
                    </div>

                    {missing.length > 0 && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                                Suggested improvements:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {missing.map((item) => (
                                    <span key={item} className="badge chip-soft" style={{ fontSize: 11 }}>
                                        + Add {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to="/profile" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span>Update Profile</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Quick Navigation Tile (Spans 2 cols) */}
                <div className="bento-tile span-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: 16, display: 'block', marginBottom: 4 }}>
                            Candidate Hub
                        </span>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            Fast shortcuts to manage bookmarks, track responses, and enhance your portfolio.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '16px 0' }}>
                        <Link to="/saved-jobs" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: 8 }}>
                            <Bookmark size={15} style={{ color: 'var(--primary)' }} />
                            <span>Saved Bookmarks</span>
                        </Link>
                        <Link to="/my-applications" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: 8 }}>
                            <FileText size={15} style={{ color: '#f59e0b' }} />
                            <span>Application Stages</span>
                        </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Status: Active Job Seeker</span>
                        <span className="badge" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                            Ready to Interview
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div style={{ marginTop: 36 }}>
                <div className="section-head">
                    <div>
                        <h2>Recent Applications</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track live updates on your submitted applications</p>
                    </div>
                    <Link to="/my-applications" className="btn btn-ghost btn-sm">
                        View All Applications
                    </Link>
                </div>

                {(data?.recentApplications || []).length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You have not submitted any applications yet.</p>
                        <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                            Explore Open Positions
                        </Link>
                    </div>
                )}

                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Role & Company</th>
                                <th>Location</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.recentApplications || []).map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                                            {item.job?.title || 'Job Opening'}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {item.job?.company}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        {item.job?.location || 'Remote'}
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        {formatTimeAgo(item.appliedAt)}
                                    </td>
                                    <td>
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {item.job?._id && (
                                            <Link to={`/jobs/${item.job._id}`} className="btn btn-ghost btn-sm">
                                                View Role
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default JobseekerDashboard;

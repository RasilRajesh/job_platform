import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, UserCheck, CheckCircle2, PlusCircle, ArrowRight, Eye } from 'lucide-react';
import { getRecruiterDashboard } from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import { BentoTileSkeleton } from '../components/ui/Skeleton';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatTimeAgo } from '../utils/format';

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

    const stats = data?.statistics || {};
    const totalApps = stats.totalApplications || 0;

    // Pipeline funnel calculation
    const appliedPct = totalApps > 0 ? Math.round(((stats.applied || 0) / totalApps) * 100) : 0;
    const shortlistedPct = totalApps > 0 ? Math.round(((stats.shortlisted || 0) / totalApps) * 100) : 0;
    const hiredPct = totalApps > 0 ? Math.round(((stats.hired || 0) / totalApps) * 100) : 0;

    return (
        <div className="container section">
            {/* Header */}
            <div style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 4 }}>
                        Recruitment Command Center
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                        Overview of your talent pipeline, active listings, and candidate applications.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link to="/create-job" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <PlusCircle size={16} />
                        <span>Post New Position</span>
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
                            label="Active Jobs"
                            value={stats.totalJobs || 0}
                            trendPercent={12}
                            trendDirection="up"
                            icon={Briefcase}
                            color="var(--primary)"
                        />
                        <MetricCard
                            label="Total Candidates"
                            value={stats.totalApplications || 0}
                            trendPercent={24}
                            trendDirection="up"
                            icon={Users}
                            color="#38bdf8"
                        />
                        <MetricCard
                            label="In Interview Stage"
                            value={stats.shortlisted || 0}
                            trendPercent={15}
                            trendDirection="up"
                            icon={UserCheck}
                            color="#8b5cf6"
                        />
                        <MetricCard
                            label="Hired Candidates"
                            value={stats.hired || 0}
                            trendPercent={30}
                            trendDirection="up"
                            icon={CheckCircle2}
                            color="var(--success)"
                        />
                    </>
                )}

                {/* Pipeline Funnel Mini-Chart (Spans 2 cols) */}
                <div className="bento-tile span-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>Hiring Funnel Telemetry</span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{totalApps} Total Inbound</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                            Conversion rates across active screening, interview, and offer milestones.
                        </p>

                        <div style={{ display: 'grid', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                    <span>Applied / Screening</span>
                                    <span>{stats.applied || 0} ({appliedPct}%)</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${appliedPct}%`, background: '#3b82f6', borderRadius: 'var(--radius-pill)' }} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                    <span>Shortlisted / Interviewing</span>
                                    <span>{stats.shortlisted || 0} ({shortlistedPct}%)</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${shortlistedPct}%`, background: '#8b5cf6', borderRadius: 'var(--radius-pill)' }} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                    <span>Offers Extended & Hired</span>
                                    <span>{stats.hired || 0} ({hiredPct}%)</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${hiredPct}%`, background: 'var(--success)', borderRadius: 'var(--radius-pill)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to="/my-jobs" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span>Manage Pipelines</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Quick Actions & Links (Spans 2 cols) */}
                <div className="bento-tile span-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: 16, display: 'block', marginBottom: 4 }}>
                            Recruiter Workspaces
                        </span>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            Fast access to your team's live postings and company profile.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '16px 0' }}>
                        <Link to="/create-job" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: 8 }}>
                            <PlusCircle size={15} style={{ color: 'var(--primary)' }} />
                            <span>Create New Job</span>
                        </Link>
                        <Link to="/my-jobs" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: 8 }}>
                            <Briefcase size={15} style={{ color: '#8b5cf6' }} />
                            <span>All Posted Jobs</span>
                        </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Role: Verified Hiring Lead</span>
                        <Link to="/profile" style={{ fontWeight: 600, fontSize: 13 }}>
                            Edit Company Profile →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Split Sections: Recent Jobs & Recent Applicants */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginTop: 32 }}>
                {/* Recent Jobs */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 17 }}>Recent Postings</h3>
                        <Link to="/my-jobs" style={{ fontSize: 13, fontWeight: 600 }}>View All</Link>
                    </div>

                    {(data?.recentJobs || []).length === 0 && !loading && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                            No jobs posted yet.
                        </p>
                    )}

                    <div style={{ display: 'grid', gap: 10 }}>
                        {(data?.recentJobs || []).map((job) => (
                            <div
                                key={job._id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 14px',
                                    background: 'var(--bg-subtle)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{job.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.company} • {job.location}</div>
                                </div>
                                <Link to={`/jobs/${job._id}/applicants`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Eye size={13} />
                                    <span>Pipeline</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Applicants */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 17 }}>Recent Inbound Candidates</h3>
                        <Link to="/my-jobs" style={{ fontSize: 13, fontWeight: 600 }}>All Pipelines</Link>
                    </div>

                    {(data?.recentApplicants || []).length === 0 && !loading && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                            No applicants yet.
                        </p>
                    )}

                    <div style={{ display: 'grid', gap: 10 }}>
                        {(data?.recentApplicants || []).map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 14px',
                                    background: 'var(--bg-subtle)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                                        {item.applicant?.name || 'Applicant'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        For {item.job?.title} • {formatTimeAgo(item.appliedAt)}
                                    </div>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecruiterDashboard;

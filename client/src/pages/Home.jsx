import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, MapPin, Check, Briefcase, Building2, Users,
    ArrowRight, TrendingUp, Shield, Zap, Star
} from 'lucide-react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import { useSavedMap } from '../hooks/useSavedMap';
import { useAuth } from '../context/AuthContext';

const QUICK_FILTERS = [
    { id: 'remote', label: '🌍 Remote', param: 'remote', value: 'true' },
    { id: '100k', label: '💰 $100k+', param: 'salaryTier', value: '100k+' },
    { id: 'full-time', label: '⏱ Full-time', param: 'jobType', value: 'full-time' },
    { id: 'tech', label: '💻 Tech & Engineering', param: 'search', value: 'developer' },
    { id: 'design', label: '🎨 Product & Design', param: 'search', value: 'designer' }
];

const CATEGORIES = [
    { label: 'Engineering', search: 'developer', icon: '💻', count: '1,200+ roles' },
    { label: 'Product & Design', search: 'designer', icon: '🎨', count: '430+ roles' },
    { label: 'Marketing', search: 'marketing', icon: '📈', count: '680+ roles' },
    { label: 'Data & AI', search: 'data', icon: '🤖', count: '520+ roles' }
];

const FEATURES = [
    {
        icon: <Zap size={22} />,
        title: '1-Click Apply',
        desc: 'Apply instantly with your saved profile — no repetitive forms.',
        color: '#f59e0b'
    },
    {
        icon: <Star size={22} />,
        title: 'AI Match Score',
        desc: 'See how well your skills match each role before you apply.',
        color: '#4f46e5'
    },
    {
        icon: <TrendingUp size={22} />,
        title: 'Real-time Tracking',
        desc: 'Follow every stage of your application in a live timeline.',
        color: '#10b981'
    },
    {
        icon: <Shield size={22} />,
        title: 'Verified Recruiters',
        desc: 'Every recruiter is vetted so your time is never wasted.',
        color: '#f43f5e'
    }
];

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [activePills, setActivePills] = useState(new Set());
    const [jobs, setJobs] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { savedMap, toggleSave, canSave } = useSavedMap(jobs);

    const loadJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobs({ sort: 'latest', limit: 6, page: 1 });
            setJobs(data.jobs || []);
            setTotalCount(data.total || (data.jobs ? data.jobs.length : 0));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const togglePill = (filter) => {
        setActivePills((prev) => {
            const next = new Set(prev);
            if (next.has(filter.id)) {
                next.delete(filter.id);
            } else {
                next.add(filter.id);
            }
            return next;
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (location.trim()) params.set('location', location.trim());
        activePills.forEach((pillId) => {
            const pill = QUICK_FILTERS.find((p) => p.id === pillId);
            if (pill) params.set(pill.param, pill.value);
        });
        navigate(`/jobs?${params.toString()}`);
    };

    return (
        <div>
            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-bg-orb hero-orb-1" />
                <div className="hero-bg-orb hero-orb-2" />
                <div className="container hero-inner">
                    <h1>
                        Find your next{' '}
                        <span className="highlight">breakthrough role</span>
                    </h1>
                    <p className="hero-copy">
                        Discover curated tech jobs, 1-click apply with instant match analysis,
                        and track every stage in real-time.
                    </p>

                    {/* Search Bar */}
                    <div className="hero-search-wrap">
                        <form className="hero-search-form" onSubmit={handleSearch}>
                            <div className="hero-search-input-group">
                                <Search size={18} style={{ color: '#64748b', flexShrink: 0 }} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Title, skill, or company..."
                                    aria-label="Job title or keyword"
                                />
                            </div>
                            <div className="hero-search-divider" />
                            <div className="hero-search-input-group">
                                <MapPin size={18} style={{ color: '#64748b', flexShrink: 0 }} />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City or Remote"
                                    aria-label="Location"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-md"
                                style={{ borderRadius: 'var(--radius-pill)', padding: '10px 28px', flexShrink: 0 }}
                            >
                                Search Jobs
                            </button>
                        </form>
                    </div>

                    {/* Quick Filter Pills */}
                    <div className="quick-pills">
                        {QUICK_FILTERS.map((pill) => {
                            const isActive = activePills.has(pill.id);
                            return (
                                <button
                                    key={pill.id}
                                    type="button"
                                    className={`quick-pill-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => togglePill(pill)}
                                >
                                    {isActive && <Check size={13} />}
                                    <span>{pill.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Stats Strip */}
                    <div className="social-proof-strip">
                        <div className="social-proof-item">
                            <Briefcase size={16} style={{ color: 'var(--primary)' }} />
                            <span><strong>{totalCount > 0 ? `${totalCount}+` : '100+'}</strong> Active Roles</span>
                        </div>
                        <div className="social-proof-sep" />
                        <div className="social-proof-item">
                            <Building2 size={16} style={{ color: 'var(--primary)' }} />
                            <span><strong>Top Tier</strong> Companies</span>
                        </div>
                        <div className="social-proof-sep" />
                        <div className="social-proof-item">
                            <Users size={16} style={{ color: 'var(--primary)' }} />
                            <span><strong>Direct</strong> Recruiter Access</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="section home-features-section">
                <div className="container">
                    <div className="section-head" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <h2 style={{ color: '#000000' }}>Everything you need to land the job</h2>
                        <p style={{ color: '#475569', fontSize: 15, marginTop: 8, maxWidth: 520 }}>
                            Powerful tools built specifically for modern job seekers.
                        </p>
                    </div>
                    <div className="home-features-grid">
                        {FEATURES.map((feat) => (
                            <div key={feat.title} className="home-feature-card">
                                <div
                                    className="home-feature-icon"
                                    style={{ background: `${feat.color}18`, color: feat.color }}
                                >
                                    {feat.icon}
                                </div>
                                <h3 style={{ fontSize: 17, marginBottom: 8, color: '#000000' }}>{feat.title}</h3>
                                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Popular Categories ── */}
            <section className="section" style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 style={{ color: '#000000' }}>Popular disciplines</h2>
                            <p style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>Explore opportunities across top industry tracks</p>
                        </div>
                        <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span>All categories</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="home-categories-grid">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category.label}
                                to={`/jobs?search=${category.search}`}
                                className="home-category-card"
                            >
                                <div className="home-category-icon">{category.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: '#000000', fontSize: 15 }}>{category.label}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{category.count}</div>
                                </div>
                                <ArrowRight size={16} style={{ color: '#94a3b8' }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Jobs ── */}
            <section className="section">
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2 style={{ color: '#000000' }}>Featured opportunities</h2>
                            <p style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>Recently published listings from verified teams</p>
                        </div>
                        <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span>View all jobs</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading && (
                        <div className="job-grid">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <JobCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {error && <ErrorMessage message={error} onRetry={loadJobs} />}

                    {!loading && !error && jobs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <p style={{ color: '#64748b' }}>No jobs found at this time.</p>
                        </div>
                    )}

                    {!loading && !error && jobs.length > 0 && (
                        <div className="job-grid">
                            {jobs.map((job) => (
                                <JobCard
                                    key={job._id}
                                    job={job}
                                    showSave={canSave}
                                    saved={savedMap[job._id]}
                                    onToggleSave={toggleSave}
                                    candidateSkills={user?.skills}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="home-cta-section">
                <div className="home-cta-glow" />
                <div className="container home-cta-inner">
                    <h2 style={{ color: '#000000', marginBottom: 12 }}>Accelerate your career journey</h2>
                    <p style={{ color: '#475569', fontSize: 16, marginBottom: 32, maxWidth: 480 }}>
                        Join thousands of developers and designers landing their dream roles
                        at leading tech companies.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create your account
                        </Link>
                        <Link to="/jobs" className="btn btn-ghost btn-lg">
                            Explore openings
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useSavedMap } from '../hooks/useSavedMap';

const CATEGORIES = [
    { label: 'Developer', search: 'developer' },
    { label: 'React', search: 'React' },
    { label: 'Internship', search: 'internship' },
    { label: 'Designer', search: 'designer' }
];

function Home() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { savedMap, toggleSave, canSave } = useSavedMap(jobs);

    const loadJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobs({ sort: 'latest', limit: 6, page: 1 });
            setJobs(data.jobs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        navigate(`/jobs?${params.toString()}`);
    };

    return (
        <div>
            <section className="hero">
                <div className="container hero-inner">
                    <p className="eyebrow">MERN Job Portal</p>
                    <h1>Find your next opportunity</h1>
                    <p className="hero-copy">
                        Search live jobs from recruiters, apply with one cover letter, and track every application.
                    </p>
                    <form className="hero-search" onSubmit={handleSearch}>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Job title, skill, or company"
                        />
                        <button type="submit" className="btn btn-primary">Search jobs</button>
                    </form>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2>Popular searches</h2>
                    <div className="category-row">
                        {CATEGORIES.map((category) => (
                            <Link key={category.label} className="category-chip" to={`/jobs?search=${category.search}`}>
                                {category.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="section-head">
                        <h2>Latest jobs</h2>
                        <Link to="/jobs">View all</Link>
                    </div>
                    {loading && <Loading message="Loading jobs..." />}
                    {error && <ErrorMessage message={error} onRetry={loadJobs} />}
                    {!loading && !error && jobs.length === 0 && (
                        <p className="muted">No jobs have been posted yet.</p>
                    )}
                    <div className="job-grid">
                        {jobs.map((job) => (
                            <JobCard
                                key={job._id}
                                job={job}
                                showSave={canSave}
                                saved={savedMap[job._id]}
                                onToggleSave={toggleSave}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta-banner">
                <div className="container">
                    <h2>Ready to hire or get hired?</h2>
                    <p>Create a free account and start using the live backend APIs.</p>
                    <Link to="/register" className="btn btn-primary">Get started</Link>
                </div>
            </section>
        </div>
    );
}

export default Home;

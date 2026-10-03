import { useEffect, useState, useRef } from 'react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import JobFilter from '../components/JobFilter';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import { useSavedMap } from '../hooks/useSavedMap';
import { useJobFilters } from '../hooks/useJobFilters';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

function Jobs() {
    const { user } = useAuth();
    const { filters, setFilter, clearAll, activeFilterChips, apiParams } = useJobFilters();
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { savedMap, toggleSave, canSave } = useSavedMap(jobs);
    const abortControllerRef = useRef(null);

    const loadJobs = async () => {
        // Cancel previous pending request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError('');

        try {
            const data = await getJobs(apiParams);
            setJobs(data.jobs || []);
            setPagination(data.pagination || null);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [JSON.stringify(apiParams)]);

    const goToPage = (nextPage) => {
        setFilter('page', nextPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="container section">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ marginBottom: 6 }}>Explore opportunities</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
                    Find the role that fits your ambitions. Live synced and filtered across verified openings.
                </p>
            </div>

            <JobFilter
                filters={filters}
                onFilterChange={setFilter}
                onReset={clearAll}
                activeChips={activeFilterChips}
            />

            {/* Results count strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
                    {loading ? (
                        'Searching open roles...'
                    ) : (
                        `Showing ${jobs.length} of ${pagination?.totalJobs || jobs.length} positions`
                    )}
                </span>
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
                <div
                    style={{
                        textAlign: 'center',
                        padding: '64px 20px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)'
                    }}
                >
                    <Briefcase size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <h3 style={{ marginBottom: 6 }}>No matching positions found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                        Try broadening your keywords or clearing selected filters.
                    </p>
                    <button type="button" className="btn btn-secondary" onClick={clearAll}>
                        Reset all filters
                    </button>
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

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40 }}>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => goToPage(pagination.currentPage - 1)}
                    >
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={!pagination.hasNextPage}
                        onClick={() => goToPage(pagination.currentPage + 1)}
                    >
                        <span>Next</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default Jobs;

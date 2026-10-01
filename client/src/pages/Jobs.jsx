import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import JobFilter from '../components/JobFilter';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useSavedMap } from '../hooks/useSavedMap';

const emptyFilters = {
    search: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    skills: '',
    jobType: '',
    sort: 'latest'
};

function Jobs() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        ...emptyFilters,
        search: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        minSalary: searchParams.get('minSalary') || '',
        maxSalary: searchParams.get('maxSalary') || '',
        skills: searchParams.get('skills') || '',
        jobType: searchParams.get('jobType') || '',
        sort: searchParams.get('sort') || 'latest'
    });
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const page = Number(searchParams.get('page') || 1);
    const { savedMap, toggleSave, canSave } = useSavedMap(jobs);

    const query = useMemo(() => ({
        search: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        minSalary: searchParams.get('minSalary') || '',
        maxSalary: searchParams.get('maxSalary') || '',
        skills: searchParams.get('skills') || '',
        jobType: searchParams.get('jobType') || '',
        sort: searchParams.get('sort') || 'latest',
        page,
        limit: 6
    }), [searchParams, page]);

    const loadJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobs(query);
            setJobs(data.jobs || []);
            setPagination(data.pagination || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [searchParams]);

    const applyFilters = (event) => {
        event.preventDefault();
        const next = { ...filters, page: 1 };
        Object.keys(next).forEach((key) => {
            if (!next[key]) delete next[key];
        });
        setSearchParams(next);
    };

    const resetFilters = () => {
        setFilters(emptyFilters);
        setSearchParams({});
    };

    const goToPage = (nextPage) => {
        const next = Object.fromEntries(searchParams.entries());
        next.page = String(nextPage);
        setSearchParams(next);
    };

    return (
        <div className="container section">
            <h1>Find jobs</h1>
            <p className="muted">Search, filter, sort, and paginate using the backend jobs API.</p>
            <JobFilter
                filters={filters}
                onChange={setFilters}
                onSubmit={applyFilters}
                onReset={resetFilters}
            />
            {loading && <Loading message="Loading jobs..." />}
            {error && <ErrorMessage message={error} onRetry={loadJobs} />}
            {!loading && !error && jobs.length === 0 && (
                <EmptyState
                    title="No jobs found"
                    message="Try changing your search filters."
                />
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
            {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!pagination.hasPreviousPage}
                        onClick={() => goToPage(pagination.currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!pagination.hasNextPage}
                        onClick={() => goToPage(pagination.currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default Jobs;

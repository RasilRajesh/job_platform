import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedJobs, removeSavedJob } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';

function SavedJobs() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSavedJobs();
            setItems(data.savedJobs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleRemove = async (jobId) => {
        try {
            await removeSavedJob(jobId);
            setItems((current) => current.filter((item) => item.job?._id !== jobId));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container section">
            <h1>Saved jobs</h1>
            {loading && <Loading message="Loading saved jobs..." />}
            {error && <ErrorMessage message={error} onRetry={load} />}
            {!loading && !error && items.length === 0 && (
                <EmptyState
                    title="No saved jobs yet"
                    message="Browse openings and tap Save to come back later."
                    action={<Link to="/jobs" className="btn btn-primary">Find jobs</Link>}
                />
            )}
            <div className="job-grid">
                {items.map((item) => item.job && (
                    <JobCard
                        key={item.job._id}
                        job={item.job}
                        actions={(
                            <button type="button" className="btn btn-secondary" onClick={() => handleRemove(item.job._id)}>
                                Remove
                            </button>
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export default SavedJobs;

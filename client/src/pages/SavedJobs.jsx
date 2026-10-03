import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { getSavedJobs, removeSavedJob } from '../services/api';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

function SavedJobs() {
    const { user } = useAuth();
    const { success, error: toastError } = useToast();
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
            success('Removed from bookmarks');
        } catch (err) {
            toastError(err.message || 'Failed to remove job');
        }
    };

    return (
        <div className="container section">
            <div className="section-head">
                <div>
                    <h1>Saved Bookmarks</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>
                        Keep track of roles you're interested in and apply when you're ready.
                    </p>
                </div>
                <Link to="/jobs" className="btn btn-ghost btn-sm">
                    Browse More Jobs
                </Link>
            </div>

            {loading && (
                <div className="job-grid">
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                </div>
            )}

            {error && <ErrorMessage message={error} onRetry={load} />}

            {!loading && !error && items.length === 0 && (
                <EmptyState
                    title="No saved jobs yet"
                    message="Browse openings and tap the bookmark button to save them here."
                    action={
                        <Link to="/jobs" className="btn btn-primary">
                            Explore Openings
                        </Link>
                    }
                />
            )}

            <div className="job-grid">
                {items.map((item) => item.job && (
                    <JobCard
                        key={item.job._id}
                        job={item.job}
                        showSave={false}
                        candidateSkills={user?.skills}
                        actions={(
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleRemove(item.job._id)}
                                style={{ color: 'var(--danger)' }}
                            >
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

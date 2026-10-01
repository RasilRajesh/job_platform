import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteJob, getJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatSalary, recruiterIdFromJob } from '../utils/format';

function MyJobs() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobs({ limit: 100, page: 1, sort: 'latest' });
            const mine = (data.jobs || []).filter((job) => String(recruiterIdFromJob(job)) === String(user.id));
            setJobs(mine);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [user?.id]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job?')) return;
        try {
            await deleteJob(id);
            setJobs((current) => current.filter((job) => job._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container section">
            <div className="section-head">
                <h1>My jobs</h1>
                <Link to="/create-job" className="btn btn-primary">Post a job</Link>
            </div>
            {loading && <Loading message="Loading your jobs..." />}
            {error && <ErrorMessage message={error} onRetry={load} />}
            {!loading && !error && jobs.length === 0 && (
                <EmptyState
                    title="You have not posted any jobs"
                    message="Create a listing to start receiving applications."
                    action={<Link to="/create-job" className="btn btn-primary">Create job</Link>}
                />
            )}
            <div className="table-wrap">
                {jobs.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Salary</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job._id}>
                                    <td>{job.title}</td>
                                    <td>{job.location}</td>
                                    <td>{formatSalary(job.salary)}</td>
                                    <td className="actions-cell">
                                        <Link to={`/edit-job/${job._id}`}>Edit</Link>
                                        <Link to={`/jobs/${job._id}/applicants`}>Applicants</Link>
                                        <button type="button" className="link-button" onClick={() => handleDelete(job._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default MyJobs;

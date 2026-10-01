import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/format';

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyApplications();
            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="container section">
            <h1>My applications</h1>
            {loading && <Loading message="Loading applications..." />}
            {error && <ErrorMessage message={error} onRetry={load} />}
            {!loading && !error && applications.length === 0 && (
                <EmptyState
                    title="You have not applied yet"
                    message="Find a role and submit a cover letter."
                    action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>}
                />
            )}
            <div className="table-wrap">
                {applications.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Job</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Applied</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((application) => (
                                <tr key={application._id}>
                                    <td>
                                        {application.job?._id
                                            ? <Link to={`/jobs/${application.job._id}`}>{application.job.title}</Link>
                                            : application.job?.title || 'Job removed'}
                                    </td>
                                    <td>{application.job?.company || '-'}</td>
                                    <td>{application.job?.location || '-'}</td>
                                    <td>{formatDate(application.createdAt)}</td>
                                    <td><StatusBadge status={application.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default MyApplications;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobApplications, getJobseekerProfile, updateApplicationStatus } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/format';

const STATUSES = ['applied', 'shortlisted', 'rejected', 'hired'];

function Applicants() {
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [profileError, setProfileError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getJobApplications(jobId);
            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [jobId]);

    const handleStatus = async (id, status) => {
        try {
            await updateApplicationStatus(id, status);
            setApplications((current) => current.map((item) => (
                item._id === id ? { ...item, status } : item
            )));
        } catch (err) {
            setError(err.message);
        }
    };

    const viewProfile = async (userId) => {
        setProfileError('');
        try {
            const data = await getJobseekerProfile(userId);
            setProfile(data.profile);
        } catch (err) {
            setProfileError(err.message);
        }
    };

    return (
        <div className="container section">
            <h1>Applicants</h1>
            {loading && <Loading message="Loading applicants..." />}
            {error && <ErrorMessage message={error} onRetry={load} />}
            {!loading && !error && applications.length === 0 && (
                <EmptyState title="No applications yet" message="Share this job so seekers can apply." />
            )}
            {profileError && <ErrorMessage message={profileError} />}
            {profile && (
                <aside className="profile-preview">
                    <h2>{profile.name}</h2>
                    <p>{profile.email} · {profile.phone} · {profile.location}</p>
                    <p>{profile.bio}</p>
                    <p><strong>Skills:</strong> {(profile.skills || []).join(', ')}</p>
                    {profile.resumeUrl && <p><a href={profile.resumeUrl} target="_blank" rel="noreferrer">View resume</a></p>}
                    <button type="button" className="btn btn-secondary" onClick={() => setProfile(null)}>Close</button>
                </aside>
            )}
            <div className="list-stack">
                {applications.map((application) => {
                    const applicant = application.applicant || {};
                    return (
                        <article key={application._id} className="applicant-card">
                            <div className="section-head">
                                <div>
                                    <h3>{applicant.name}</h3>
                                    <p className="muted">{applicant.email} {applicant.phone ? `· ${applicant.phone}` : ''}</p>
                                    <p className="muted small">Applied {formatDate(application.createdAt)}</p>
                                </div>
                                <StatusBadge status={application.status} />
                            </div>
                            {applicant.location && <p><strong>Location:</strong> {applicant.location}</p>}
                            {applicant.bio && <p>{applicant.bio}</p>}
                            {(applicant.skills || []).length > 0 && (
                                <p><strong>Skills:</strong> {applicant.skills.join(', ')}</p>
                            )}
                            {(applicant.education || []).length > 0 && (
                                <p><strong>Education:</strong> {applicant.education.map((item) => `${item.degree}, ${item.institution}`).join(' · ')}</p>
                            )}
                            {(applicant.experience || []).length > 0 && (
                                <p><strong>Experience:</strong> {applicant.experience.map((item) => `${item.position} at ${item.company}`).join(' · ')}</p>
                            )}
                            {applicant.resumeUrl && <p><a href={applicant.resumeUrl} target="_blank" rel="noreferrer">Resume</a></p>}
                            <p><strong>Cover letter:</strong> {application.coverLetter}</p>
                            <div className="card-actions">
                                <select value={application.status} onChange={(event) => handleStatus(application._id, event.target.value)}>
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                {applicant._id && (
                                    <button type="button" className="btn btn-secondary" onClick={() => viewProfile(applicant._id)}>
                                        Full profile
                                    </button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

export default Applicants;

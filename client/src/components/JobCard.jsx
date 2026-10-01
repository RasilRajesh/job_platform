import { Link } from 'react-router-dom';
import { formatDate, formatSalary } from '../utils/format';

function JobCard({ job, saved, onToggleSave, showSave, actions }) {
    return (
        <article className="job-card">
            <div className="job-card-top">
                <div>
                    <h3>{job.title}</h3>
                    <p className="muted">{job.company} · {job.location}</p>
                </div>
                {job.jobType && <span className="chip">{job.jobType}</span>}
            </div>
            <p className="salary">{formatSalary(job.salary)}</p>
            <div className="skill-row">
                {(job.skills || []).slice(0, 5).map((skill) => (
                    <span key={skill} className="chip chip-soft">{skill}</span>
                ))}
            </div>
            <p className="muted small">Posted {formatDate(job.createdAt)}</p>
            <div className="card-actions">
                <Link to={`/jobs/${job._id}`} className="btn btn-primary">View details</Link>
                {showSave && (
                    <button type="button" className="btn btn-ghost" onClick={() => onToggleSave(job._id)}>
                        {saved ? '♥ Saved' : '♡ Save'}
                    </button>
                )}
                {actions}
            </div>
        </article>
    );
}

export default JobCard;

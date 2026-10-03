import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Bookmark, ArrowUpRight } from 'lucide-react';
import { formatSalary, formatTimeAgo } from '../utils/format';
import Avatar from './ui/Avatar';
import MatchBadge from './jobs/MatchBadge';

function JobCard({ job, saved, onToggleSave, showSave = true, actions, candidateSkills }) {
    if (!job) return null;

    const isRemote = job.location?.toLowerCase().includes('remote') ||
                     job.description?.toLowerCase().includes('remote');

    const visibleSkills = (job.skills || []).slice(0, 4);
    const extraSkillsCount = Math.max(0, (job.skills || []).length - 4);

    return (
        <article className="job-card">
            <div className="job-card-header">
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                    <Avatar name={job.company} size={46} />
                    <div className="job-meta-top">
                        <h3>
                            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                        </h3>
                        <div className="job-subtext">
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{job.company}</span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                                {job.location}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <MatchBadge candidateSkills={candidateSkills} jobSkills={job.skills} />
                    {isRemote && (
                        <span className="badge" style={{ background: 'var(--success-soft)', color: 'var(--success)', fontSize: 11 }}>
                            Remote
                        </span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 12px' }}>
                <span className="job-salary-pill">
                    {formatSalary(job.salary)}
                </span>
                {job.jobType && (
                    <span className="badge chip-soft" style={{ textTransform: 'capitalize' }}>
                        {job.jobType}
                    </span>
                )}
            </div>

            <div className="job-skills">
                {visibleSkills.map((skill) => (
                    <span key={skill} className="badge chip-soft">
                        {skill}
                    </span>
                ))}
                {extraSkillsCount > 0 && (
                    <span className="badge chip-soft" title={`${extraSkillsCount} more skills`}>
                        +{extraSkillsCount}
                    </span>
                )}
            </div>

            <div className="job-card-footer">
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} />
                    {formatTimeAgo(job.createdAt)}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {showSave && onToggleSave && (
                        <button
                            type="button"
                            className={`bookmark-btn ${saved ? 'saved' : ''}`}
                            onClick={() => onToggleSave(job._id)}
                            aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
                            title={saved ? 'Remove from saved jobs' : 'Save job'}
                        >
                            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                        </button>
                    )}

                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                    </Link>

                    {actions}
                </div>
            </div>
        </article>
    );
}

export default JobCard;

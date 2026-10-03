import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { calculateSkillMatch } from '../../utils/skillMatch';
import { useAuth } from '../../context/AuthContext';

export default function MatchBadge({ candidateSkills = [], jobSkills = [], size = 'sm', showPopover = true }) {
    const { isAuthenticated, user } = useAuth();
    const [open, setOpen] = useState(false);

    // If candidateSkills isn't directly passed, try to use user's profile skills if job seeker
    const actualCandidateSkills = candidateSkills && candidateSkills.length > 0
        ? candidateSkills
        : (user?.skills || []);

    if (!jobSkills || jobSkills.length === 0) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <Link
                to="/login"
                className="match-badge match-low"
                title="Sign in to calculate your skill match"
                style={{ fontSize: size === 'lg' ? 14 : 11 }}
            >
                <Sparkles size={size === 'lg' ? 14 : 12} />
                <span>Sign in for match %</span>
            </Link>
        );
    }

    const { percent, matched, missing } = calculateSkillMatch(actualCandidateSkills, jobSkills);

    let tierClass = 'match-low';
    if (percent >= 80) tierClass = 'match-high';
    else if (percent >= 50) tierClass = 'match-mid';

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => showPopover && setOpen(true)}
            onMouseLeave={() => showPopover && setOpen(false)}
        >
            <button
                type="button"
                className={`match-badge ${tierClass}`}
                onClick={() => showPopover && setOpen(!open)}
                style={{
                    cursor: showPopover ? 'pointer' : 'default',
                    border: '1px solid',
                    fontSize: size === 'lg' ? 14 : 12,
                    padding: size === 'lg' ? '6px 12px' : '3px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                }}
                aria-label={`${percent}% skill match. Click to inspect.`}
            >
                <Sparkles size={size === 'lg' ? 14 : 12} />
                <span>{percent}% Match</span>
            </button>

            {showPopover && open && (
                <div className="match-popover" role="tooltip">
                    <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Skill Analysis</span>
                        <span style={{ color: percent >= 80 ? 'var(--success)' : percent >= 50 ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {percent}%
                        </span>
                    </div>

                    {matched.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={12} /> Matched Skills ({matched.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {matched.map((skill) => (
                                    <span key={skill} className="badge" style={{ background: 'var(--success-soft)', color: 'var(--success)', fontSize: 11, padding: '2px 6px' }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {missing.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <X size={12} /> Missing Skills ({missing.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {missing.map((skill) => (
                                    <span key={skill} className="badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: 11, padding: '2px 6px' }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            {user?.role === 'jobseeker' && (
                                <Link
                                    to="/profile"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 8, fontWeight: 600 }}
                                >
                                    Add to profile <ArrowRight size={11} />
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

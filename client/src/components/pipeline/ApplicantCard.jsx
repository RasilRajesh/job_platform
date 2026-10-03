import React, { useState } from 'react';
import { MoreVertical, Calendar, ChevronRight, User } from 'lucide-react';
import Avatar from '../ui/Avatar';
import MatchBadge from '../jobs/MatchBadge';
import { formatTimeAgo } from '../../utils/format';

const STAGES = [
    { id: 'applied', label: 'Applied' },
    { id: 'reviewing', label: 'Reviewing' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'rejected', label: 'Rejected' }
];

export default function ApplicantCard({ application, jobSkills = [], onSelect, onMoveStage }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const applicant = application.applicant || {};
    const currentStage = application.stage || 'applied';

    const handleDragStart = (e) => {
        e.dataTransfer.setData('applicationId', application._id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    return (
        <div
            className="kanban-card"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(application)}
            tabIndex={0}
            role="button"
            aria-label={`Applicant ${applicant.name}. Press to view details.`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(application);
                }
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                    <Avatar name={applicant.name || 'Candidate'} size={36} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {applicant.name || 'Anonymous Applicant'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {applicant.location || applicant.email || 'Candidate'}
                        </div>
                    </div>
                </div>

                {/* Move to Menu for Keyboard / Touch accessibility */}
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className="btn-ghost"
                        style={{ border: 'none', padding: 4, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex' }}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Move stage menu"
                        aria-expanded={menuOpen}
                    >
                        <MoreVertical size={16} />
                    </button>

                    {menuOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                zIndex: 30,
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: 6,
                                boxShadow: 'var(--shadow-md)',
                                minWidth: 150,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px' }}>
                                Move to stage:
                            </span>
                            {STAGES.map((stage) => (
                                <button
                                    key={stage.id}
                                    type="button"
                                    className="tab-btn"
                                    style={{
                                        textAlign: 'left',
                                        padding: '6px 8px',
                                        fontSize: 12,
                                        borderRadius: 'var(--radius-xs)',
                                        background: stage.id === currentStage ? 'var(--primary-soft)' : 'transparent',
                                        color: stage.id === currentStage ? 'var(--primary)' : 'var(--text)'
                                    }}
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onMoveStage(application._id, stage.id);
                                    }}
                                >
                                    {stage.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Match pill and date */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 8 }}>
                <MatchBadge candidateSkills={applicant.skills} jobSkills={jobSkills} showPopover={false} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={11} />
                    {formatTimeAgo(application.createdAt)}
                </span>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Download, Send, Trash2, Clock, Check, X, ArrowRight, UserCheck } from 'lucide-react';
import Drawer from '../ui/Drawer';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { calculateSkillMatch } from '../../utils/skillMatch';
import { formatDate, formatTimeAgo } from '../../utils/format';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'resume', label: 'Resume' },
    { id: 'cover', label: 'Cover Letter' },
    { id: 'notes', label: 'Recruiter Notes' },
    { id: 'activity', label: 'Activity' }
];

const STAGE_ORDER = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];

export default function ApplicantDrawer({
    application,
    jobSkills = [],
    isOpen,
    onClose,
    onMoveStage,
    onAddNote,
    onDeleteNote
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [noteText, setNoteText] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    if (!application) return null;

    const applicant = application.applicant || {};
    const currentStage = application.stage || 'applied';

    const { percent, matched, missing } = calculateSkillMatch(applicant.skills || [], jobSkills);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setIsSubmittingNote(true);
        try {
            await onAddNote(application._id, noteText);
            setNoteText('');
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const advanceStage = () => {
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        if (currentIndex < STAGE_ORDER.length - 2) {
            // Can advance to next stage up to offer
            onMoveStage(application._id, STAGE_ORDER[currentIndex + 1]);
        }
    };

    const rejectStage = () => {
        onMoveStage(application._id, 'rejected');
    };

    const footer = (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Stage:</span>
                <select
                    value={currentStage}
                    onChange={(e) => onMoveStage(application._id, e.target.value)}
                    style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                    aria-label="Change candidate stage"
                >
                    <option value="applied">Applied</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer Made</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                {currentStage !== 'rejected' && (
                    <Button variant="danger" size="sm" onClick={rejectStage}>
                        Reject
                    </Button>
                )}
                {currentStage !== 'offer' && currentStage !== 'rejected' && (
                    <Button variant="primary" size="sm" onClick={advanceStage}>
                        <span>Advance Stage</span>
                        <ArrowRight size={14} />
                    </Button>
                )}
            </div>
        </>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={applicant.name || 'Applicant Profile'}
            subtitle={applicant.location || applicant.email}
            footer={footer}
            width="540px"
        >
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <Avatar name={applicant.name} size={54} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>
                        {applicant.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {applicant.email && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Mail size={13} /> {applicant.email}
                            </span>
                        )}
                        {applicant.phone && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Phone size={13} /> {applicant.phone}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-nav">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Match Score Card */}
                    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Skill Match Score</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: percent >= 80 ? 'var(--success)' : percent >= 50 ? 'var(--primary)' : 'var(--text-muted)' }}>
                                {percent}%
                            </span>
                        </div>

                        {matched.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Check size={13} /> Matched Skills ({matched.length})
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {matched.map((skill) => (
                                        <span key={skill} className="badge" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {missing.length > 0 && (
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <X size={13} /> Missing Skills from Job ({missing.length})
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {missing.map((skill) => (
                                        <span key={skill} className="badge" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {applicant.bio && (
                        <div>
                            <h4 style={{ marginBottom: 6 }}>Professional Bio</h4>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{applicant.bio}</p>
                        </div>
                    )}

                    {applicant.experience && applicant.experience.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: 10 }}>Experience</h4>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {applicant.experience.map((exp, idx) => (
                                    <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{exp.position}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exp.company}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Resume */}
            {activeTab === 'resume' && (
                <div>
                    {applicant.resumeUrl || application.resume ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>Resume Document</span>
                                <a
                                    href={applicant.resumeUrl || application.resume}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                >
                                    <Download size={14} /> Download PDF
                                </a>
                            </div>

                            <div style={{ height: '420px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <iframe
                                    src={applicant.resumeUrl || application.resume}
                                    title="Candidate Resume"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                            No resume link was uploaded for this application.
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Cover Letter */}
            {activeTab === 'cover' && (
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                    <h4 style={{ marginBottom: 12 }}>Cover Letter</h4>
                    <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                        {application.coverLetter || 'No cover letter provided.'}
                    </div>
                </div>
            )}

            {/* Tab 4: Recruiter Notes */}
            {activeTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add internal evaluation note (visible only to recruiters)..."
                            rows={3}
                            aria-label="Internal note"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" size="sm" loading={isSubmittingNote} disabled={!noteText.trim()}>
                                <Send size={13} />
                                <span>Save Note</span>
                            </Button>
                        </div>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(!application.notes || application.notes.length === 0) ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                                No recruiter notes added yet.
                            </p>
                        ) : (
                            application.notes.map((note) => (
                                <div
                                    key={note._id}
                                    style={{
                                        background: 'var(--bg-subtle)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '12px 14px',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>
                                            {note.author || 'Recruiter'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {formatTimeAgo(note.createdAt)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteNote(application._id, note._id)}
                                                className="btn-ghost"
                                                style={{ border: 'none', padding: 2, cursor: 'pointer', color: 'var(--danger)' }}
                                                title="Delete note"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                                        {note.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Tab 5: Activity Timeline */}
            {activeTab === 'activity' && (
                <div>
                    <h4 style={{ marginBottom: 14 }}>Stage Transition History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 8 }}>
                        {(!application.stageHistory || application.stageHistory.length === 0) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                                <Clock size={15} />
                                <span>Applied on {formatDate(application.createdAt)}</span>
                            </div>
                        ) : (
                            application.stageHistory.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                                    <UserCheck size={16} style={{ color: 'var(--primary)', marginTop: 2 }} />
                                    <div>
                                        <div>
                                            Stage changed to <strong style={{ textTransform: 'capitalize' }}>{item.stage}</strong>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            By {item.changedBy || 'Recruiter'} • {formatTimeAgo(item.changedAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </Drawer>
    );
}

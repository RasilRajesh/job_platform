import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
    getJobApplications,
    getJobById,
    updateApplicationStage,
    addApplicationNote,
    deleteApplicationNote
} from '../services/api';
import KanbanBoard from '../components/pipeline/KanbanBoard';
import ApplicantDrawer from '../components/pipeline/ApplicantDrawer';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import MatchBadge from '../components/jobs/MatchBadge';
import { useToast } from '../context/ToastContext';
import { calculateSkillMatch } from '../utils/skillMatch';
import { formatDate, formatTimeAgo } from '../utils/format';
import { LayoutGrid, List, Search, ArrowLeft, ArrowUpDown } from 'lucide-react';

function Applicants() {
    const { jobId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { success, error: toastError } = useToast();

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // View toggle persisted in localStorage
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('hirehub_applicants_view') || 'board';
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('match'); // 'match' or 'date'

    const selectedApplicantId = searchParams.get('applicant');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [jobRes, appsRes] = await Promise.all([
                getJobById(jobId),
                getJobApplications(jobId)
            ]);
            setJob(jobRes.job);
            setApplications(appsRes.applications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [jobId]);

    const handleViewToggle = (mode) => {
        setViewMode(mode);
        localStorage.setItem('hirehub_applicants_view', mode);
    };

    const handleSelectApplicant = (app) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('applicant', app._id);
            return next;
        });
    };

    const handleCloseDrawer = () => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('applicant');
            return next;
        });
    };

    // Optimistic stage transition with rollback
    const handleMoveStage = async (applicationId, newStage) => {
        const targetApp = applications.find((a) => a._id === applicationId);
        if (!targetApp || targetApp.stage === newStage) return;

        const previousStage = targetApp.stage || 'applied';

        // 1. Optimistic UI update
        setApplications((prev) =>
            prev.map((app) => (app._id === applicationId ? { ...app, stage: newStage } : app))
        );

        try {
            await updateApplicationStage(applicationId, newStage);
            success(`Candidate moved to "${newStage}" stage`);
        } catch (err) {
            // 2. Rollback on failure
            setApplications((prev) =>
                prev.map((app) => (app._id === applicationId ? { ...app, stage: previousStage } : app))
            );
            toastError(err.message || 'Failed to update candidate stage');
        }
    };

    const handleAddNote = async (applicationId, text) => {
        try {
            const res = await addApplicationNote(applicationId, text);
            setApplications((prev) =>
                prev.map((app) => (app._id === applicationId ? { ...app, notes: res.notes } : app))
            );
            success('Recruiter note saved');
        } catch (err) {
            toastError(err.message || 'Could not save note');
            throw err;
        }
    };

    const handleDeleteNote = async (applicationId, noteId) => {
        try {
            const res = await deleteApplicationNote(applicationId, noteId);
            setApplications((prev) =>
                prev.map((app) => (app._id === applicationId ? { ...app, notes: res.notes } : app))
            );
            success('Note deleted');
        } catch (err) {
            toastError(err.message || 'Could not delete note');
        }
    };

    // Filter and Sort applicants
    const filteredApplications = useMemo(() => {
        let result = [...applications];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter((app) => {
                const name = app.applicant?.name?.toLowerCase() || '';
                const skills = (app.applicant?.skills || []).map((s) => s.toLowerCase()).join(' ');
                return name.includes(term) || skills.includes(term);
            });
        }

        if (sortBy === 'match') {
            result.sort((a, b) => {
                const matchA = calculateSkillMatch(a.applicant?.skills || [], job?.skills || []).percent;
                const matchB = calculateSkillMatch(b.applicant?.skills || [], job?.skills || []).percent;
                return matchB - matchA;
            });
        } else {
            // Date applied
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [applications, searchTerm, sortBy, job?.skills]);

    const activeDrawerApp = useMemo(() => {
        if (!selectedApplicantId) return null;
        return applications.find((a) => a._id === selectedApplicantId) || null;
    }, [applications, selectedApplicantId]);

    return (
        <div className="container section">
            {/* Breadcrumb & Header */}
            <div style={{ marginBottom: 20 }}>
                <Link to="/my-jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <ArrowLeft size={14} /> Back to My Jobs
                </Link>
            </div>

            <div className="section-head" style={{ alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 26, marginBottom: 4 }}>
                        {job ? `${job.title} — Applicant Pipeline` : 'Hiring Pipeline'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        {applications.length} candidates applied • Drag cards across columns or click to inspect details
                    </p>
                </div>

                {/* View toggles & Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 3 }}>
                        <button
                            type="button"
                            className={`btn-ghost btn-sm ${viewMode === 'board' ? 'btn-primary' : ''}`}
                            onClick={() => handleViewToggle('board')}
                            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
                            title="Kanban Board view"
                            aria-label="Kanban Board view"
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button
                            type="button"
                            className={`btn-ghost btn-sm ${viewMode === 'list' ? 'btn-primary' : ''}`}
                            onClick={() => handleViewToggle('list')}
                            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
                            title="Table List view"
                            aria-label="Table List view"
                        >
                            <List size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 24,
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)'
                }}
            >
                <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        style={{ paddingLeft: 36, paddingRight: 12, fontSize: 13 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search candidate by name or skill..."
                        aria-label="Search applicants"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sort by:</span>
                    <select
                        style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort applicants"
                    >
                        <option value="match">Match % (Highest first)</option>
                        <option value="date">Date Applied (Newest)</option>
                    </select>
                </div>
            </div>

            {error && <ErrorMessage message={error} onRetry={loadData} />}

            {!loading && !error && applications.length === 0 && (
                <EmptyState
                    title="No candidates have applied yet"
                    message="Share your job post on career channels to attract qualified candidates."
                />
            )}

            {/* Kanban Board View */}
            {viewMode === 'board' && !loading && (
                <KanbanBoard
                    applications={filteredApplications}
                    jobSkills={job?.skills || []}
                    onSelectApplicant={handleSelectApplicant}
                    onMoveStage={handleMoveStage}
                />
            )}

            {/* List / Table View */}
            {viewMode === 'list' && (
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Skill Match</th>
                                <th>Current Stage</th>
                                <th>Applied Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <>
                                    <TableRowSkeleton cols={5} />
                                    <TableRowSkeleton cols={5} />
                                    <TableRowSkeleton cols={5} />
                                </>
                            )}
                            {!loading && filteredApplications.map((app) => (
                                <tr key={app._id} onClick={() => handleSelectApplicant(app)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                                            {app.applicant?.name || 'Candidate'}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {app.applicant?.email}
                                        </div>
                                    </td>
                                    <td>
                                        <MatchBadge
                                            candidateSkills={app.applicant?.skills}
                                            jobSkills={job?.skills}
                                        />
                                    </td>
                                    <td>
                                        <StatusBadge stage={app.stage} status={app.status} />
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        {formatDate(app.createdAt)}
                                    </td>
                                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleSelectApplicant(app)}
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Slide-out Applicant Drawer */}
            <ApplicantDrawer
                application={activeDrawerApp}
                jobSkills={job?.skills || []}
                isOpen={Boolean(activeDrawerApp)}
                onClose={handleCloseDrawer}
                onMoveStage={handleMoveStage}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
            />
        </div>
    );
}

export default Applicants;

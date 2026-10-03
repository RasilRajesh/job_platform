import React from 'react';
import ApplicantCard from './ApplicantCard';

const COLUMNS = [
    { id: 'applied', label: 'Applied', color: '#3b82f6' },
    { id: 'reviewing', label: 'Reviewing', color: '#f59e0b' },
    { id: 'interview', label: 'Interview', color: '#8b5cf6' },
    { id: 'offer', label: 'Offer Made', color: '#10b981' },
    { id: 'rejected', label: 'Rejected', color: '#f43f5e' }
];

export default function KanbanBoard({ applications = [], jobSkills = [], onSelectApplicant, onMoveStage }) {
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetStage) => {
        e.preventDefault();
        const applicationId = e.dataTransfer.getData('applicationId');
        if (applicationId) {
            onMoveStage(applicationId, targetStage);
        }
    };

    return (
        <div className="kanban-container" role="region" aria-label="Applicant Kanban Pipeline">
            {COLUMNS.map((col) => {
                const columnApps = applications.filter((app) => (app.stage || 'applied') === col.id);

                return (
                    <div
                        key={col.id}
                        className="kanban-col"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        <div className="kanban-col-head">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                                <span>{col.label}</span>
                            </div>
                            <span className="kanban-col-count">{columnApps.length}</span>
                        </div>

                        <div className="kanban-col-body">
                            {columnApps.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    Drop candidates here
                                </div>
                            ) : (
                                columnApps.map((app) => (
                                    <ApplicantCard
                                        key={app._id}
                                        application={app}
                                        jobSkills={jobSkills}
                                        onSelect={onSelectApplicant}
                                        onMoveStage={onMoveStage}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { applyForJob } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

function ApplyJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!coverLetter.trim()) {
            toastError('Please write a brief cover letter before submitting.');
            return;
        }

        setLoading(true);
        try {
            await applyForJob(id, { coverLetter: coverLetter.trim() });
            success('Application submitted successfully! Tracking stage: Applied.');
            navigate('/my-applications');
        } catch (err) {
            toastError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section" style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 20 }}>
                <Link to={`/jobs/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <ArrowLeft size={14} /> Back to Job Details
                </Link>
            </div>

            <form className="form-card" onSubmit={handleSubmit} style={{ width: '100%' }}>
                <h1 style={{ fontSize: 24, marginBottom: 6 }}>Submit Application</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                    Your registered profile information, skills, and resume link will automatically be attached.
                </p>

                <label>
                    <span>Cover Letter & Personal Pitch *</span>
                    <textarea
                        rows="8"
                        value={coverLetter}
                        onChange={(event) => setCoverLetter(event.target.value)}
                        placeholder="Explain why you're a standout fit for this role, key projects, and your expected contribution..."
                        required
                    />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                    <Link to={`/jobs/${id}`} className="btn btn-ghost">
                        Cancel
                    </Link>
                    <Button type="submit" loading={loading} icon={Send}>
                        Submit Application
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ApplyJob;

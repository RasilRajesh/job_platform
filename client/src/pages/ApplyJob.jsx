import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applyForJob } from '../services/api';

function ApplyJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [coverLetter, setCoverLetter] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!coverLetter.trim()) {
            setError('Cover letter is required.');
            return;
        }

        setLoading(true);
        try {
            await applyForJob(id, { coverLetter: coverLetter.trim() });
            setSuccess('Application submitted successfully.');
            setTimeout(() => navigate('/my-applications'), 900);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section">
            <form className="form-card" onSubmit={handleSubmit}>
                <h1>Apply for this job</h1>
                <p className="muted">The backend will attach your user ID from the JWT. Do not send an applicant ID.</p>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <label>
                    Cover letter
                    <textarea
                        rows="8"
                        value={coverLetter}
                        onChange={(event) => setCoverLetter(event.target.value)}
                        placeholder="Why are you a good fit?"
                        required
                    />
                </label>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Apply'}
                </button>
            </form>
        </div>
    );
}

export default ApplyJob;

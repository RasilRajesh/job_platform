import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'jobseeker'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.role) {
            setError('Name, email, password, and role are required.');
            return;
        }

        if (form.password.length < 6) {
            setError('Password should be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const user = await register(form);
            navigate(user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Create account</h1>
                <p className="muted">Register as a job seeker or recruiter.</p>
                {error && <div className="alert alert-error">{error}</div>}
                <label>
                    Name
                    <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" value={form.password} onChange={handleChange} required />
                </label>
                <label>
                    Role
                    <select name="role" value={form.role} onChange={handleChange} required>
                        <option value="jobseeker">Job Seeker</option>
                        <option value="recruiter">Recruiter</option>
                    </select>
                </label>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </button>
                <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
}

export default Register;

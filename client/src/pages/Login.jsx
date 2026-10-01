import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!form.email.trim() || !form.password) {
            setError('Email and password are required.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(form);
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
                <h1>Login</h1>
                <p className="muted">Use your existing HireHub account.</p>
                {error && <div className="alert alert-error">{error}</div>}
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" value={form.password} onChange={handleChange} required />
                </label>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login'}
                </button>
                <p className="muted">No account? <Link to="/register">Register</Link></p>
            </form>
        </div>
    );
}

export default Login;

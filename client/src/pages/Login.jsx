import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { LogIn } from 'lucide-react';

function Login() {
    const { login } = useAuth();
    const { success, error: toastError } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.email.trim() || !form.password) {
            toastError('Email and password are required.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(form);
            success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker');
        } catch (err) {
            toastError(err.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1 style={{ fontSize: 26, marginBottom: 6 }}>Welcome back</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                    Sign in to your HireHub account to access your dashboard.
                </p>

                <label>
                    <span>Email address</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        required
                    />
                </label>

                <label>
                    <span>Password</span>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </label>

                <Button
                    type="submit"
                    loading={loading}
                    icon={LogIn}
                    style={{ width: '100%', marginTop: 8 }}
                >
                    Sign in to account
                </Button>

                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginTop: 20 }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;

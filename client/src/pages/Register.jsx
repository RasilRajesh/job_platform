import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { UserPlus } from 'lucide-react';

function Register() {
    const { register } = useAuth();
    const { success, error: toastError } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'jobseeker'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.role) {
            toastError('Please fill out all required fields.');
            return;
        }

        if (form.password.length < 6) {
            toastError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const user = await register(form);
            success(`Account created successfully! Welcome, ${user.name}`);
            navigate(user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker');
        } catch (err) {
            toastError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1 style={{ fontSize: 26, marginBottom: 6 }}>Create an account</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                    Join HireHub to discover opportunities or recruit stellar talent.
                </p>

                <label>
                    <span>Full name</span>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Alex Morgan"
                        required
                    />
                </label>

                <label>
                    <span>Email address</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="alex@example.com"
                        required
                    />
                </label>

                <label>
                    <span>Password (min. 6 characters)</span>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
                </label>

                <label>
                    <span>I am joining as</span>
                    <select name="role" value={form.role} onChange={handleChange} required>
                        <option value="jobseeker">Job Seeker (Looking for opportunities)</option>
                        <option value="recruiter">Recruiter (Hiring for my company)</option>
                    </select>
                </label>

                <Button
                    type="submit"
                    loading={loading}
                    icon={UserPlus}
                    style={{ width: '100%', marginTop: 8 }}
                >
                    Create Account
                </Button>

                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginTop: 20 }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;

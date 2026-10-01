import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/');
    };

    const close = () => setOpen(false);

    return (
        <header className="navbar">
            <div className="container nav-inner">
                <Link to="/" className="logo" onClick={close}>HireHub</Link>
                <button
                    type="button"
                    className="nav-toggle"
                    aria-label="Toggle menu"
                    onClick={() => setOpen((value) => !value)}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <nav className={open ? 'nav-links open' : 'nav-links'}>
                    <NavLink to="/" end onClick={close}>Home</NavLink>
                    <NavLink to="/jobs" onClick={close}>Jobs</NavLink>

                    {!isAuthenticated && (
                        <>
                            <NavLink to="/login" onClick={close}>Login</NavLink>
                            <Link to="/register" className="btn btn-primary nav-cta" onClick={close}>Register</Link>
                        </>
                    )}

                    {isAuthenticated && user?.role === 'jobseeker' && (
                        <>
                            <NavLink to="/saved-jobs" onClick={close}>Saved Jobs</NavLink>
                            <NavLink to="/my-applications" onClick={close}>My Applications</NavLink>
                            <NavLink to="/dashboard/jobseeker" onClick={close}>Dashboard</NavLink>
                            <NavLink to="/profile" onClick={close}>Profile</NavLink>
                            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                        </>
                    )}

                    {isAuthenticated && user?.role === 'recruiter' && (
                        <>
                            <NavLink to="/my-jobs" onClick={close}>My Jobs</NavLink>
                            <NavLink to="/create-job" onClick={close}>Post Job</NavLink>
                            <NavLink to="/dashboard/recruiter" onClick={close}>Dashboard</NavLink>
                            <NavLink to="/profile" onClick={close}>Profile</NavLink>
                            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;

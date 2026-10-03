import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, LogOut, User as UserIcon, PlusCircle, Bookmark, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const { info } = useToast();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setOpen(false);
        info('Signed out successfully');
        navigate('/');
    };

    const close = () => setOpen(false);

    return (
        <header className="navbar">
            <div className="container nav-inner">
                <Link to="/" className="logo" onClick={close}>
                    <div className="logo-badge">
                        <Briefcase size={18} />
                    </div>
                    <span>HireHub</span>
                </Link>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    onClick={() => setOpen((value) => !value)}
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>

                <nav className={open ? 'nav-links open' : 'nav-links'}>
                    <NavLink to="/" end onClick={close}>Home</NavLink>
                    <NavLink to="/jobs" onClick={close}>Explore Jobs</NavLink>

                    {!isAuthenticated && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6 }}>
                            <NavLink to="/login" onClick={close}>Log in</NavLink>
                            <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                                Sign up
                            </Link>
                        </div>
                    )}

                    {isAuthenticated && user?.role === 'jobseeker' && (
                        <>
                            <NavLink to="/dashboard/jobseeker" onClick={close}>Dashboard</NavLink>
                            <NavLink to="/my-applications" onClick={close}>
                                <FileText size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Applications
                            </NavLink>
                            <NavLink to="/saved-jobs" onClick={close}>
                                <Bookmark size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Saved
                            </NavLink>
                            <NavLink to="/profile" onClick={close}>
                                <UserIcon size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Profile
                            </NavLink>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={handleLogout}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </>
                    )}

                    {isAuthenticated && user?.role === 'recruiter' && (
                        <>
                            <NavLink to="/dashboard/recruiter" onClick={close}>Dashboard</NavLink>
                            <NavLink to="/my-jobs" onClick={close}>Manage Jobs</NavLink>
                            <NavLink to="/create-job" className="btn btn-secondary btn-sm" onClick={close} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <PlusCircle size={15} />
                                <span>Post Job</span>
                            </NavLink>
                            <NavLink to="/profile" onClick={close}>Company Profile</NavLink>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={handleLogout}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;

import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <div className="logo-badge" style={{ width: 26, height: 26, fontSize: 13 }}>
                            <Briefcase size={14} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 16, color: '#000000' }}>HireHub</span>
                    </div>
                    <p className="footer-tagline">Connecting talent with opportunity.</p>
                </div>
                <div className="footer-links">
                    <Link to="/jobs">Browse Jobs</Link>
                    <Link to="/register">Get Started</Link>
                    <Link to="/login">Sign In</Link>
                </div>
                <p className="footer-copy">&copy; {new Date().getFullYear()} HireHub. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;

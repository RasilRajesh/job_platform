import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <p>HireHub — a MERN job portal for seekers and recruiters.</p>
                <div className="footer-links">
                    <Link to="/jobs">Browse jobs</Link>
                    <Link to="/register">Create account</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

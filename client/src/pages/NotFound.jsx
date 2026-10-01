import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="container section empty-state">
            <h1>Page not found</h1>
            <p>That route does not exist.</p>
            <Link to="/" className="btn btn-primary">Go home</Link>
        </div>
    );
}

export default NotFound;

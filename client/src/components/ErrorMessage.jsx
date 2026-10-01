function ErrorMessage({ message, onRetry }) {
    return (
        <div className="alert alert-error" role="alert">
            <p>{message || 'Something went wrong. Please try again.'}</p>
            {onRetry && (
                <button type="button" className="btn btn-secondary" onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    );
}

export default ErrorMessage;

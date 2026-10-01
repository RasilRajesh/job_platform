function Loading({ message = 'Loading...' }) {
    return (
        <div className="loading-box" role="status">
            <div className="spinner" aria-hidden="true" />
            <p>{message}</p>
        </div>
    );
}

export default Loading;

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract'];

function JobFilter({ filters, onChange, onSubmit, onReset }) {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onChange({ ...filters, [name]: value });
    };

    return (
        <form className="filter-card" onSubmit={onSubmit}>
            <div className="filter-grid">
                <input name="search" value={filters.search} onChange={handleChange} placeholder="Search title, company, skills..." />
                <input name="location" value={filters.location} onChange={handleChange} placeholder="Location" />
                <input name="minSalary" type="number" min="0" value={filters.minSalary} onChange={handleChange} placeholder="Min salary" />
                <input name="maxSalary" type="number" min="0" value={filters.maxSalary} onChange={handleChange} placeholder="Max salary" />
                <input name="skills" value={filters.skills} onChange={handleChange} placeholder="Skills (React,Node.js)" />
                <select name="jobType" value={filters.jobType} onChange={handleChange}>
                    <option value="">All job types</option>
                    {JOB_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select name="sort" value={filters.sort} onChange={handleChange}>
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="salary-high">Salary: high to low</option>
                    <option value="salary-low">Salary: low to high</option>
                </select>
            </div>
            <div className="filter-actions">
                <button type="submit" className="btn btn-primary">Apply filters</button>
                <button type="button" className="btn btn-secondary" onClick={onReset}>Reset</button>
            </div>
        </form>
    );
}

export default JobFilter;

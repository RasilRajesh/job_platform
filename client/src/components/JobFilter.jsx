import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, X, DollarSign, Briefcase, Sparkles } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const JOB_TYPES = [
    { value: '', label: 'All types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' }
];

const SALARY_TIERS = [
    { value: 'any', label: 'Any salary' },
    { value: '<50k', label: '< $50k' },
    { value: '50-100k', label: '$50k - $100k' },
    { value: '100k+', label: '$100k+' }
];

const SORT_OPTIONS = [
    { value: 'latest', label: 'Latest added' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' }
];

function JobFilter({ filters, onFilterChange, onReset, activeChips = [] }) {
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const [localLocation, setLocalLocation] = useState(filters.location || '');
    const [mobileOpen, setMobileOpen] = useState(false);

    const debouncedSearch = useDebounce(localSearch, 350);
    const debouncedLocation = useDebounce(localLocation, 350);

    // Sync from parent if URL changed externally
    useEffect(() => {
        setLocalSearch(filters.search || '');
    }, [filters.search]);

    useEffect(() => {
        setLocalLocation(filters.location || '');
    }, [filters.location]);

    // Push debounced changes
    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            onFilterChange('search', debouncedSearch);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        if (debouncedLocation !== (filters.location || '')) {
            onFilterChange('location', debouncedLocation);
        }
    }, [debouncedLocation]);

    return (
        <div style={{ marginBottom: 28 }}>
            {/* Main Search Filter Bar */}
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
                    {/* Search Keyword */}
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            style={{ paddingLeft: 38 }}
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="Title, skill, or company..."
                            aria-label="Filter by title or keyword"
                        />
                    </div>

                    {/* Location */}
                    <div style={{ position: 'relative' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            style={{ paddingLeft: 38 }}
                            value={localLocation}
                            onChange={(e) => setLocalLocation(e.target.value)}
                            placeholder="City, State, or Remote..."
                            aria-label="Filter by location"
                        />
                    </div>

                    {/* Job Type */}
                    <div>
                        <select
                            value={filters.jobType || ''}
                            onChange={(e) => onFilterChange('jobType', e.target.value)}
                            aria-label="Filter by job type"
                        >
                            {JOB_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Salary Tier */}
                    <div>
                        <select
                            value={filters.salaryTier || 'any'}
                            onChange={(e) => onFilterChange('salaryTier', e.target.value)}
                            aria-label="Filter by salary range"
                        >
                            {SALARY_TIERS.map((tier) => (
                                <option key={tier.value} value={tier.value}>{tier.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <label className="checkbox" style={{ margin: 0 }}>
                            <input
                                type="checkbox"
                                checked={filters.remote === true}
                                onChange={(e) => onFilterChange('remote', e.target.checked)}
                            />
                            <span>Remote only</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort by:</span>
                        <select
                            style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                            value={filters.sort || 'latest'}
                            onChange={(e) => onFilterChange('sort', e.target.value)}
                            aria-label="Sort listings"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Active Filters Bar */}
            {activeChips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Active filters:</span>
                    {activeChips.map((chip) => (
                        <button
                            key={chip.key}
                            type="button"
                            className="badge chip-soft"
                            onClick={() => onFilterChange(chip.key, '')}
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}
                            title="Remove filter"
                        >
                            <span>{chip.label}</span>
                            <X size={13} />
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={onReset}
                        className="btn-ghost"
                        style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

export default JobFilter;

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useJobFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => {
        return {
            search: searchParams.get('search') || searchParams.get('q') || '',
            location: searchParams.get('location') || '',
            salaryTier: searchParams.get('salaryTier') || 'any',
            jobType: searchParams.get('jobType') || '',
            remote: searchParams.get('remote') === 'true',
            sort: searchParams.get('sort') || 'latest',
            page: parseInt(searchParams.get('page') || '1', 10)
        };
    }, [searchParams]);

    const setFilter = useCallback((key, value) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value === undefined || value === null || value === '' || value === false || value === 'any') {
                next.delete(key);
            } else {
                next.set(key, String(value));
            }
            // Always reset page to 1 when filters change (unless updating page itself)
            if (key !== 'page') {
                next.delete('page');
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const setMultipleFilters = useCallback((updates) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '' || value === false || value === 'any') {
                    next.delete(key);
                } else {
                    next.set(key, String(value));
                }
            });
            if (!('page' in updates)) {
                next.delete('page');
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const clearAll = useCallback(() => {
        setSearchParams(new URLSearchParams(), { replace: true });
    }, [setSearchParams]);

    const activeFilterChips = useMemo(() => {
        const chips = [];
        if (filters.search) chips.push({ key: 'search', label: `Keyword: "${filters.search}"` });
        if (filters.location) chips.push({ key: 'location', label: `Location: ${filters.location}` });
        if (filters.jobType) chips.push({ key: 'jobType', label: `Type: ${filters.jobType}` });
        if (filters.salaryTier && filters.salaryTier !== 'any') {
            const labelMap = {
                '<50k': '< $50k',
                '50-100k': '$50k - $100k',
                '100k+': '$100k+'
            };
            chips.push({ key: 'salaryTier', label: labelMap[filters.salaryTier] || filters.salaryTier });
        }
        if (filters.remote) chips.push({ key: 'remote', label: 'Remote Only' });
        return chips;
    }, [filters]);

    // Build the query object for the backend api
    const apiParams = useMemo(() => {
        const params = {
            search: filters.search || undefined,
            location: filters.location || undefined,
            jobType: filters.jobType || undefined,
            sort: filters.sort !== 'latest' ? filters.sort : undefined,
            page: filters.page > 1 ? filters.page : undefined
        };

        if (filters.remote) {
            params.remote = 'true';
        }

        if (filters.salaryTier === '<50k') {
            params.maxSalary = 50000;
        } else if (filters.salaryTier === '50-100k') {
            params.minSalary = 50000;
            params.maxSalary = 100000;
        } else if (filters.salaryTier === '100k+') {
            params.minSalary = 100000;
        }

        return params;
    }, [filters]);

    return {
        filters,
        setFilter,
        setMultipleFilters,
        clearAll,
        activeFilterChips,
        apiParams
    };
}

export default useJobFilters;

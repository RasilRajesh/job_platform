import { useEffect, useState } from 'react';
import { checkSavedJob, removeSavedJob, saveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const useSavedMap = (jobs) => {
    const { isAuthenticated, user } = useAuth();
    const { success, error: toastError, warning } = useToast();
    const [savedMap, setSavedMap] = useState({});

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!isAuthenticated || user?.role !== 'jobseeker' || !jobs?.length) {
                return;
            }

            try {
                const entries = await Promise.all(
                    jobs.map(async (job) => {
                        try {
                            const data = await checkSavedJob(job._id);
                            return [job._id, Boolean(data.saved)];
                        } catch {
                            return [job._id, false];
                        }
                    })
                );

                if (isMounted) {
                    setSavedMap(Object.fromEntries(entries));
                }
            } catch {
                // Ignore silent load errors
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, [jobs, isAuthenticated, user?.role]);

    const toggleSave = async (jobId) => {
        if (!isAuthenticated) {
            warning('Please log in as a job seeker to bookmark jobs.');
            return { error: 'Please log in to save jobs' };
        }

        if (user?.role !== 'jobseeker') {
            warning('Only job seekers can save job listings.');
            return { error: 'Only job seekers can save jobs' };
        }

        const previousState = Boolean(savedMap[jobId]);
        const nextState = !previousState;

        // 1. Optimistic update
        setSavedMap((prev) => ({ ...prev, [jobId]: nextState }));

        try {
            if (previousState) {
                await removeSavedJob(jobId);
                success('Removed from saved jobs');
            } else {
                await saveJob(jobId);
                success('Job saved to your bookmarks');
            }
            return { error: null };
        } catch (err) {
            // 2. Rollback on failure
            setSavedMap((prev) => ({ ...prev, [jobId]: previousState }));
            toastError(err.message || 'Could not update bookmark');
            return { error: err.message };
        }
    };

    return {
        savedMap,
        toggleSave,
        canSave: isAuthenticated && user?.role === 'jobseeker'
    };
};

export default useSavedMap;

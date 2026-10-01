import { useEffect, useState } from 'react';
import { checkSavedJob, removeSavedJob, saveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useSavedMap = (jobs) => {
    const { isAuthenticated, user } = useAuth();
    const [savedMap, setSavedMap] = useState({});

    useEffect(() => {
        const load = async () => {
            if (!isAuthenticated || user?.role !== 'jobseeker' || !jobs?.length) {
                return;
            }

            const entries = await Promise.all(
                jobs.map(async (job) => {
                    try {
                        const data = await checkSavedJob(job._id);
                        return [job._id, data.saved];
                    } catch {
                        return [job._id, false];
                    }
                })
            );

            setSavedMap(Object.fromEntries(entries));
        };

        load();
    }, [jobs, isAuthenticated, user?.role]);

    const toggleSave = async (jobId) => {
        if (!isAuthenticated || user?.role !== 'jobseeker') {
            return { error: 'Login as a job seeker to save jobs.' };
        }

        try {
            if (savedMap[jobId]) {
                await removeSavedJob(jobId);
                setSavedMap((current) => ({ ...current, [jobId]: false }));
            } else {
                await saveJob(jobId);
                setSavedMap((current) => ({ ...current, [jobId]: true }));
            }
            return { error: null };
        } catch (error) {
            return { error: error.message };
        }
    };

    return { savedMap, toggleSave, canSave: isAuthenticated && user?.role === 'jobseeker' };
};

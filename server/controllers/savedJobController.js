const SavedJob = require('../models/savedJob.js');
const Job = require('../models/job.js');
const mongoose = require('mongoose');

// Save a job — job seeker only
const saveJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        const existingSave = await SavedJob.findOne({
            user: req.user._id,
            job: jobId
        });

        if (existingSave) {
            return res.status(409).json({
                message: 'Job already saved'
            });
        }

        await SavedJob.create({
            user: req.user._id,
            job: jobId
        });

        return res.status(201).json({
            message: 'Job saved successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Job already saved'
            });
        }

        return res.status(500).json({
            message: 'Server error while saving job',
            error: error.message
        });
    }
};

// Get all saved jobs for the logged-in job seeker
const getSavedJobs = async (req, res) => {
    try {
        const savedJobsRaw = await SavedJob.find({ user: req.user._id })
            .populate('job', 'title company location salary skills jobType createdAt')
            .sort({ createdAt: -1 });

        // Skip records where the job was deleted (safety fallback)
        const savedJobs = savedJobsRaw
            .filter((saved) => saved.job)
            .map((saved) => ({
                savedAt: saved.createdAt,
                job: saved.job
            }));

        return res.status(200).json({
            count: savedJobs.length,
            savedJobs
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching saved jobs',
            error: error.message
        });
    }
};

// Remove a saved job — only the owner can delete their own save
const removeSavedJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        const deleted = await SavedJob.findOneAndDelete({
            user: req.user._id,
            job: jobId
        });

        if (!deleted) {
            return res.status(404).json({
                message: 'Saved job not found'
            });
        }

        return res.status(200).json({
            message: 'Job removed from saved list'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while removing saved job',
            error: error.message
        });
    }
};

// Check if a job is saved — useful for React save/unsave button state
const checkSavedJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        const saved = await SavedJob.findOne({
            user: req.user._id,
            job: jobId
        });

        return res.status(200).json({
            saved: !!saved
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while checking saved job',
            error: error.message
        });
    }
};

module.exports = {
    saveJob,
    getSavedJobs,
    removeSavedJob,
    checkSavedJob
};

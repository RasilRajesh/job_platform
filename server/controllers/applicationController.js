const Application = require('../models/application.js');
const Job = require('../models/job.js');
const mongoose = require('mongoose');

const VALID_STATUSES = ['applied', 'shortlisted', 'rejected', 'hired'];

// A. Apply for a Job — job seeker only
const applyForJob = async (req, res) => {
    try {
        // req.params.jobId comes from the URL: POST /api/applications/:jobId
        const { jobId } = req.params;
        const { coverLetter, resume } = req.body;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        if (!coverLetter) {
            return res.status(400).json({
                message: 'Cover letter is required'
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        // Check for duplicate application before creating
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user._id
        });

        if (existingApplication) {
            return res.status(409).json({
                message: 'You have already applied for this job'
            });
        }

        // req.user._id comes from JWT — never accept applicant from req.body
        const application = await Application.create({
            job: jobId,
            applicant: req.user._id,
            coverLetter,
            resume,
            status: 'applied'
        });

        return res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        // Backup for duplicate key if two requests race past findOne
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'You have already applied for this job'
            });
        }

        return res.status(500).json({
            message: 'Server error while submitting application',
            error: error.message
        });
    }
};

// B. Get My Applications — job seeker only
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            applicant: req.user._id
        })
            .populate('job', 'title company location')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: applications.length,
            applications
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching your applications',
            error: error.message
        });
    }
};

// C. Get Applications for a Job — recruiter who owns the job only
const getApplicationsForJob = async (req, res) => {
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

        // Ownership check: only the recruiter who posted this job can view applicants
        if (job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only view applications for your own jobs.'
            });
        }

        const applications = await Application.find({ job: jobId })
            .populate(
                'applicant',
                'name email phone location bio skills education experience resumeUrl profilePicture'
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: applications.length,
            applications
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching applications',
            error: error.message
        });
    }
};

const VALID_STAGES = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];

const mapStageToStatus = (stage) => {
    switch (stage) {
        case 'interview': return 'shortlisted';
        case 'offer': return 'hired';
        case 'rejected': return 'rejected';
        case 'applied':
        case 'reviewing':
        default:
            return 'applied';
    }
};

const mapStatusToStage = (status) => {
    switch (status) {
        case 'shortlisted': return 'interview';
        case 'hired': return 'offer';
        case 'rejected': return 'rejected';
        case 'applied':
        default:
            return 'applied';
    }
};

// D. Update Application Status — recruiter who owns the job only
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid application ID format'
            });
        }

        if (!status) {
            return res.status(400).json({
                message: 'Status is required'
            });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Allowed values: applied, shortlisted, rejected, hired'
            });
        }

        const application = await Application.findById(id).populate('job');

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (!application.job) {
            return res.status(404).json({
                message: 'Associated job not found'
            });
        }

        // Ownership check via the application's linked job
        if (application.job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only update applications for your own jobs.'
            });
        }

        application.status = status;
        // Keep stage in sync
        application.stage = mapStatusToStage(status);
        if (!application.stageHistory) application.stageHistory = [];
        application.stageHistory.push({
            stage: application.stage,
            changedBy: req.user.name || 'Recruiter',
            changedAt: new Date()
        });

        await application.save();

        return res.status(200).json({
            message: 'Application status updated successfully',
            application
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating application status',
            error: error.message
        });
    }
};

// E. Update Application Stage (Kanban pipeline) — recruiter who owns the job only
const updateApplicationStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid application ID format'
            });
        }

        if (!stage || !VALID_STAGES.includes(stage)) {
            return res.status(400).json({
                message: `Invalid stage. Allowed values: ${VALID_STAGES.join(', ')}`
            });
        }

        const application = await Application.findById(id).populate('job');

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (!application.job) {
            return res.status(404).json({
                message: 'Associated job not found'
            });
        }

        if (application.job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only update applications for your own jobs.'
            });
        }

        application.stage = stage;
        // Keep backward-compatible status field in sync
        application.status = mapStageToStatus(stage);

        if (!application.stageHistory) application.stageHistory = [];
        application.stageHistory.push({
            stage,
            changedBy: req.user.name || 'Recruiter',
            changedAt: new Date()
        });

        await application.save();

        return res.status(200).json({
            message: 'Application stage updated successfully',
            application
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating application stage',
            error: error.message
        });
    }
};

// F. Add Internal Recruiter Note — recruiter only
const addApplicationNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid application ID format'
            });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: 'Note text cannot be empty'
            });
        }

        const application = await Application.findById(id).populate('job');

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (application.job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only add notes to your own applicants.'
            });
        }

        const newNote = {
            author: req.user.name || 'Recruiter',
            text: text.trim(),
            createdAt: new Date()
        };

        if (!application.notes) application.notes = [];
        application.notes.push(newNote);
        await application.save();

        return res.status(201).json({
            message: 'Note added successfully',
            notes: application.notes
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while adding note',
            error: error.message
        });
    }
};

// G. Delete Internal Recruiter Note — recruiter only
const deleteApplicationNote = async (req, res) => {
    try {
        const { id, noteId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid application ID format'
            });
        }

        const application = await Application.findById(id).populate('job');

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (application.job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only manage notes on your own applicants.'
            });
        }

        application.notes = (application.notes || []).filter(
            (note) => note._id.toString() !== noteId
        );
        await application.save();

        return res.status(200).json({
            message: 'Note deleted successfully',
            notes: application.notes
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while deleting note',
            error: error.message
        });
    }
};

module.exports = {
    applyForJob,
    getMyApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    updateApplicationStage,
    addApplicationNote,
    deleteApplicationNote
};

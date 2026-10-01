const Application = require('../models/application.js');
const Job = require('../models/job.js');

const RECENT_LIMIT = 5;

// JOB SEEKER DASHBOARD
const getJobseekerDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // countDocuments counts matching documents without fetching them all
        const [totalApplications, applied, shortlisted, rejected, hired] = await Promise.all([
            Application.countDocuments({ applicant: userId }),
            Application.countDocuments({ applicant: userId, status: 'applied' }),
            Application.countDocuments({ applicant: userId, status: 'shortlisted' }),
            Application.countDocuments({ applicant: userId, status: 'rejected' }),
            Application.countDocuments({ applicant: userId, status: 'hired' })
        ]);

        const recentApplicationsRaw = await Application.find({ applicant: userId })
            .populate('job', 'title company location')
            .sort({ createdAt: -1 })
            .limit(RECENT_LIMIT);

        const recentApplications = recentApplicationsRaw.map((application) => ({
            job: {
                title: application.job?.title,
                company: application.job?.company,
                location: application.job?.location
            },
            status: application.status,
            appliedAt: application.createdAt
        }));

        return res.status(200).json({
            user: {
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            },
            statistics: {
                totalApplications,
                applied,
                shortlisted,
                rejected,
                hired
            },
            recentApplications
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching job seeker dashboard',
            error: error.message
        });
    }
};

// RECRUITER DASHBOARD
const getRecruiterDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalJobs = await Job.countDocuments({ recruiter: userId });

        // Find all jobs posted by this recruiter, then count applications for those jobs only
        const recruiterJobs = await Job.find({ recruiter: userId }).select('_id');
        const jobIds = recruiterJobs.map((job) => job._id);

        let totalApplications = 0;
        let applied = 0;
        let shortlisted = 0;
        let rejected = 0;
        let hired = 0;

        if (jobIds.length > 0) {
            [totalApplications, applied, shortlisted, rejected, hired] = await Promise.all([
                Application.countDocuments({ job: { $in: jobIds } }),
                Application.countDocuments({ job: { $in: jobIds }, status: 'applied' }),
                Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' }),
                Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' }),
                Application.countDocuments({ job: { $in: jobIds }, status: 'hired' })
            ]);
        }

        const recentJobs = await Job.find({ recruiter: userId })
            .select('title company location salary createdAt')
            .sort({ createdAt: -1 })
            .limit(RECENT_LIMIT);

        let recentApplicants = [];

        if (jobIds.length > 0) {
            const recentApplicantsRaw = await Application.find({ job: { $in: jobIds } })
                .populate('applicant', 'name email')
                .populate('job', 'title')
                .sort({ createdAt: -1 })
                .limit(RECENT_LIMIT);

            recentApplicants = recentApplicantsRaw.map((application) => ({
                applicant: {
                    name: application.applicant?.name,
                    email: application.applicant?.email
                },
                job: {
                    title: application.job?.title
                },
                status: application.status,
                appliedAt: application.createdAt
            }));
        }

        return res.status(200).json({
            user: {
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            },
            statistics: {
                totalJobs,
                totalApplications,
                applied,
                shortlisted,
                rejected,
                hired
            },
            recentJobs,
            recentApplicants
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching recruiter dashboard',
            error: error.message
        });
    }
};

module.exports = {
    getJobseekerDashboard,
    getRecruiterDashboard
};

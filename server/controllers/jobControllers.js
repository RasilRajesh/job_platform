const Job = require('../models/job.js');
const SavedJob = require('../models/savedJob.js');
const mongoose = require('mongoose');

const VALID_JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract'];
const VALID_SORT_OPTIONS = ['latest', 'oldest', 'salary-high', 'salary-low'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Escape special regex characters so user search input is treated literally
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// CREATE JOB — recruiter only (enforced in routes)
const createJob = async (req, res) => {
    try {
        const { title, description, company, location, salary, skills, jobType } = req.body;

        if (!title || !description || !company || !location || salary === undefined || !skills) {
            return res.status(400).json({
                message: 'Please provide title, description, company, location, salary, and skills'
            });
        }

        if (jobType !== undefined && !VALID_JOB_TYPES.includes(jobType)) {
            return res.status(400).json({
                message: 'Invalid jobType. Allowed values: full-time, part-time, internship, contract'
            });
        }

        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                message: 'Skills must be a non-empty array'
            });
        }

        if (typeof salary !== 'number' || salary < 0) {
            return res.status(400).json({
                message: 'Salary must be a valid positive number'
            });
        }

        // req.user comes from authmiddleware — never trust recruiter ID from the client.
        const job = await Job.create({
            title,
            description,
            company,
            location,
            salary,
            skills,
            jobType,
            recruiter: req.user._id
        });

        return res.status(201).json({
            message: 'Job created successfully',
            job
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while creating job',
            error: error.message
        });
    }
};

// GET ALL JOBS — public, supports search / filter / sort / pagination via req.query
const getAllJobs = async (req, res) => {
    try {
        // req.query holds URL query parameters, e.g. ?search=developer&page=1
        const {
            search,
            q,
            location,
            remote,
            minSalary,
            maxSalary,
            skills,
            jobType,
            sort,
            page,
            limit
        } = req.query;

        const searchTerm = search || q;
        const query = {};

        // --- SEARCH (case-insensitive across multiple fields) ---
        if (searchTerm && searchTerm.trim()) {
            const searchRegex = {
                $regex: escapeRegex(searchTerm.trim()),
                $options: 'i' // 'i' = case-insensitive (developer === Developer)
            };

            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { company: searchRegex },
                { location: searchRegex },
                { skills: searchRegex }
            ];
        }

        // --- FILTER BY REMOTE ---
        if (remote === 'true' || remote === true) {
            const remoteRegex = { $regex: 'remote', $options: 'i' };
            if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    { $or: [{ location: remoteRegex }, { description: remoteRegex }] }
                ];
                delete query.$or;
            } else {
                query.$or = [{ location: remoteRegex }, { description: remoteRegex }];
            }
        }

        // --- FILTER BY LOCATION ---
        if (location && location.trim()) {
            query.location = {
                $regex: escapeRegex(location.trim()),
                $options: 'i'
            };
        }

        // --- FILTER BY SALARY RANGE ($gte = >=, $lte = <=) ---
        if (minSalary !== undefined || maxSalary !== undefined) {
            query.salary = {};

            if (minSalary !== undefined) {
                const min = Number(minSalary);
                if (Number.isNaN(min) || min < 0) {
                    return res.status(400).json({
                        message: 'minSalary must be a valid positive number'
                    });
                }
                query.salary.$gte = min;
            }

            if (maxSalary !== undefined) {
                const max = Number(maxSalary);
                if (Number.isNaN(max) || max < 0) {
                    return res.status(400).json({
                        message: 'maxSalary must be a valid positive number'
                    });
                }
                query.salary.$lte = max;
            }

            if (
                query.salary.$gte !== undefined &&
                query.salary.$lte !== undefined &&
                query.salary.$gte > query.salary.$lte
            ) {
                return res.status(400).json({
                    message: 'minSalary cannot be greater than maxSalary'
                });
            }
        }

        // --- FILTER BY SKILLS (jobs.skills is an array; $all = must contain every listed skill) ---
        if (skills && skills.trim()) {
            const skillsArray = skills.split(',').map((skill) => skill.trim()).filter(Boolean);

            if (skillsArray.length > 0) {
                query.skills = { $all: skillsArray };
            }
        }

        // --- FILTER BY JOB TYPE ---
        if (jobType) {
            if (!VALID_JOB_TYPES.includes(jobType)) {
                return res.status(400).json({
                    message: 'Invalid jobType. Allowed values: full-time, part-time, internship, contract'
                });
            }
            query.jobType = jobType;
        }

        // --- SORT (1 = ascending, -1 = descending) ---
        let sortOption = { createdAt: -1 }; // default: latest first

        if (sort) {
            if (!VALID_SORT_OPTIONS.includes(sort)) {
                return res.status(400).json({
                    message: 'Invalid sort. Allowed values: latest, oldest, salary-high, salary-low'
                });
            }

            switch (sort) {
                case 'oldest':
                    sortOption = { createdAt: 1 };
                    break;
                case 'salary-high':
                    sortOption = { salary: -1 };
                    break;
                case 'salary-low':
                    sortOption = { salary: 1 };
                    break;
                case 'latest':
                default:
                    sortOption = { createdAt: -1 };
                    break;
            }
        }

        // --- PAGINATION ---
        let currentPage = parseInt(page, 10);
        let pageLimit = parseInt(limit, 10);

        if (Number.isNaN(currentPage) || currentPage < 1) {
            currentPage = DEFAULT_PAGE;
        }

        if (Number.isNaN(pageLimit) || pageLimit < 1) {
            pageLimit = DEFAULT_LIMIT;
        }

        if (pageLimit > MAX_LIMIT) {
            pageLimit = MAX_LIMIT;
        }

        // page 1 → skip 0 | page 2 → skip 10 (when limit=10)
        const skip = (currentPage - 1) * pageLimit;

        const totalJobs = await Job.countDocuments(query);
        const totalPages = totalJobs === 0 ? 0 : Math.ceil(totalJobs / pageLimit);

        const jobs = await Job.find(query)
            .populate('recruiter', 'name email')
            .sort(sortOption)
            .skip(skip)
            .limit(pageLimit);

        return res.status(200).json({
            jobs,
            pagination: {
                currentPage,
                totalPages,
                totalJobs,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1 && totalPages > 0
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching jobs',
            error: error.message
        });
    }
};

// GET SINGLE JOB BY ID — public
const getJobById = async (req, res) => {
    try {
        // req.params holds URL parameters — here :id from /api/jobs/:id
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        const job = await Job.findById(id).populate('recruiter', 'name email');

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        return res.status(200).json({ job });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching job',
            error: error.message
        });
    }
};

// UPDATE JOB — authenticated recruiter who owns the job only
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, company, location, salary, skills, jobType } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        // Ownership check: compare job.recruiter (ObjectId) with logged-in user's _id.
        // .toString() converts both ObjectIds to strings for a safe comparison.
        if (job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only update your own jobs.'
            });
        }

        if (salary !== undefined && (typeof salary !== 'number' || salary < 0)) {
            return res.status(400).json({
                message: 'Salary must be a valid positive number'
            });
        }

        if (skills !== undefined && (!Array.isArray(skills) || skills.length === 0)) {
            return res.status(400).json({
                message: 'Skills must be a non-empty array'
            });
        }

        if (jobType !== undefined && !VALID_JOB_TYPES.includes(jobType)) {
            return res.status(400).json({
                message: 'Invalid jobType. Allowed values: full-time, part-time, internship, contract'
            });
        }

        // Only update fields that were sent in req.body
        if (title !== undefined) job.title = title;
        if (description !== undefined) job.description = description;
        if (company !== undefined) job.company = company;
        if (location !== undefined) job.location = location;
        if (salary !== undefined) job.salary = salary;
        if (skills !== undefined) job.skills = skills;
        if (jobType !== undefined) job.jobType = jobType;

        await job.save();

        return res.status(200).json({
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating job',
            error: error.message
        });
    }
};

// DELETE JOB — authenticated recruiter who owns the job only
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid job ID format'
            });
        }

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        if (job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only delete your own jobs.'
            });
        }

        // Remove saved-job bookmarks so no orphaned references remain
        await SavedJob.deleteMany({ job: id });
        await Job.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Job deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while deleting job',
            error: error.message
        });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
};

const User = require('../models/user.js');
const Job = require('../models/job.js');
const Application = require('../models/application.js');
const mongoose = require('mongoose');

const PUBLIC_PROFILE_FIELDS = '-password';

const formatProfile = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
    skills: user.skills || [],
    education: user.education || [],
    experience: user.experience || [],
    resumeUrl: user.resumeUrl || '',
    profilePicture: user.profilePicture || ''
});

const isValidPhone = (phone) => /^[0-9+\-\s]{7,15}$/.test(phone);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUrl = (url) => /^https?:\/\/.+\..+/.test(url);

const normalizeSkills = (skills) => {
    const uniqueSkills = [];
    const seen = new Set();

    for (const skill of skills) {
        if (typeof skill !== 'string') {
            continue;
        }

        const trimmed = skill.trim().replace(/\s+/g, ' ');
        if (!trimmed) {
            continue;
        }

        const key = trimmed.toLowerCase();
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        uniqueSkills.push(trimmed);
    }

    return uniqueSkills;
};

const calculateCompletion = (user) => {
    const checks = [
        { field: 'name', weight: 10, filled: Boolean(user.name && user.name.trim()) },
        { field: 'phone', weight: 10, filled: Boolean(user.phone && user.phone.trim()) },
        { field: 'location', weight: 10, filled: Boolean(user.location && user.location.trim()) },
        { field: 'bio', weight: 10, filled: Boolean(user.bio && user.bio.trim()) },
        { field: 'skills', weight: 15, filled: Array.isArray(user.skills) && user.skills.length > 0 },
        { field: 'education', weight: 15, filled: Array.isArray(user.education) && user.education.length > 0 },
        { field: 'experience', weight: 15, filled: Array.isArray(user.experience) && user.experience.length > 0 },
        { field: 'resume', weight: 15, filled: Boolean(user.resumeUrl && user.resumeUrl.trim()) }
    ];

    const completion = checks.reduce((total, item) => (
        item.filled ? total + item.weight : total
    ), 0);

    const missing = checks.filter((item) => !item.filled).map((item) => item.field);

    return { completion, missing };
};

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(PUBLIC_PROFILE_FIELDS);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            profile: formatProfile(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching profile',
            error: error.message
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const { name, email, phone, location, bio, skills, profilePicture } = req.body;

        if (req.body.password !== undefined || req.body.role !== undefined) {
            return res.status(400).json({
                message: 'Password and role cannot be updated from this endpoint'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: 'Name cannot be empty' });
            }
            user.name = name.trim();
        }

        if (email !== undefined) {
            if (!isValidEmail(email)) {
                return res.status(400).json({ message: 'Please provide a valid email' });
            }

            const existingEmail = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: user._id }
            });

            if (existingEmail) {
                return res.status(409).json({ message: 'Email is already in use' });
            }

            user.email = email.toLowerCase();
        }

        if (phone !== undefined) {
            if (phone !== '' && !isValidPhone(phone)) {
                return res.status(400).json({
                    message: 'Please provide a valid phone number'
                });
            }
            user.phone = phone.trim();
        }

        if (location !== undefined) {
            user.location = location.trim();
        }

        if (bio !== undefined) {
            user.bio = bio.trim();
        }

        if (skills !== undefined) {
            if (!Array.isArray(skills)) {
                return res.status(400).json({ message: 'Skills must be an array of strings' });
            }
            user.skills = normalizeSkills(skills);
        }

        if (profilePicture !== undefined) {
            if (profilePicture !== '' && !isValidUrl(profilePicture)) {
                return res.status(400).json({ message: 'Please provide a valid profile picture URL' });
            }
            user.profilePicture = profilePicture.trim();
        }

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            profile: formatProfile(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating profile',
            error: error.message
        });
    }
};

const addEducation = async (req, res) => {
    try {
        const { degree, institution, startYear, endYear } = req.body;

        if (!degree || !institution || startYear === undefined) {
            return res.status(400).json({
                message: 'Please provide degree, institution, and startYear'
            });
        }

        const parsedStartYear = Number(startYear);
        const parsedEndYear = endYear === undefined || endYear === '' ? undefined : Number(endYear);

        if (Number.isNaN(parsedStartYear) || (parsedEndYear !== undefined && Number.isNaN(parsedEndYear))) {
            return res.status(400).json({
                message: 'startYear and endYear must be valid numbers'
            });
        }

        if (parsedEndYear !== undefined && parsedEndYear < parsedStartYear) {
            return res.status(400).json({
                message: 'endYear cannot be earlier than startYear'
            });
        }

        const user = await User.findById(req.user._id);

        user.education.push({
            degree: degree.trim(),
            institution: institution.trim(),
            startYear: parsedStartYear,
            endYear: parsedEndYear
        });

        await user.save();

        return res.status(201).json({
            message: 'Education added successfully',
            education: user.education
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while adding education',
            error: error.message
        });
    }
};

const updateEducation = async (req, res) => {
    try {
        const { educationId } = req.params;
        const { degree, institution, startYear, endYear } = req.body;

        if (!mongoose.Types.ObjectId.isValid(educationId)) {
            return res.status(400).json({
                message: 'Invalid education ID format'
            });
        }

        const user = await User.findById(req.user._id);
        const educationItem = user.education.id(educationId);

        if (!educationItem) {
            return res.status(404).json({
                message: 'Education record not found'
            });
        }

        if (degree !== undefined) educationItem.degree = degree.trim();
        if (institution !== undefined) educationItem.institution = institution.trim();

        if (startYear !== undefined) {
            const parsedStartYear = Number(startYear);
            if (Number.isNaN(parsedStartYear)) {
                return res.status(400).json({ message: 'startYear must be a valid number' });
            }
            educationItem.startYear = parsedStartYear;
        }

        if (endYear !== undefined) {
            if (endYear === '' || endYear === null) {
                educationItem.endYear = undefined;
            } else {
                const parsedEndYear = Number(endYear);
                if (Number.isNaN(parsedEndYear)) {
                    return res.status(400).json({ message: 'endYear must be a valid number' });
                }
                educationItem.endYear = parsedEndYear;
            }
        }

        if (educationItem.endYear && educationItem.endYear < educationItem.startYear) {
            return res.status(400).json({
                message: 'endYear cannot be earlier than startYear'
            });
        }

        await user.save();

        return res.status(200).json({
            message: 'Education updated successfully',
            education: user.education
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating education',
            error: error.message
        });
    }
};

const deleteEducation = async (req, res) => {
    try {
        const { educationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(educationId)) {
            return res.status(400).json({
                message: 'Invalid education ID format'
            });
        }

        const user = await User.findById(req.user._id);
        const educationItem = user.education.id(educationId);

        if (!educationItem) {
            return res.status(404).json({
                message: 'Education record not found'
            });
        }

        educationItem.deleteOne();
        await user.save();

        return res.status(200).json({
            message: 'Education deleted successfully',
            education: user.education
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while deleting education',
            error: error.message
        });
    }
};

const addExperience = async (req, res) => {
    try {
        const { company, position, startDate, endDate, isCurrent, description } = req.body;

        if (!company || !position || !startDate) {
            return res.status(400).json({
                message: 'Please provide company, position, and startDate'
            });
        }

        const parsedStartDate = new Date(startDate);
        if (Number.isNaN(parsedStartDate.getTime())) {
            return res.status(400).json({
                message: 'Please provide a valid startDate'
            });
        }

        const currentlyWorking = Boolean(isCurrent);
        let parsedEndDate;

        if (!currentlyWorking && endDate) {
            parsedEndDate = new Date(endDate);
            if (Number.isNaN(parsedEndDate.getTime())) {
                return res.status(400).json({
                    message: 'Please provide a valid endDate'
                });
            }
            if (parsedEndDate < parsedStartDate) {
                return res.status(400).json({
                    message: 'endDate cannot be earlier than startDate'
                });
            }
        }

        const user = await User.findById(req.user._id);

        user.experience.push({
            company: company.trim(),
            position: position.trim(),
            startDate: parsedStartDate,
            endDate: currentlyWorking ? undefined : parsedEndDate,
            isCurrent: currentlyWorking,
            description: description ? description.trim() : ''
        });

        await user.save();

        return res.status(201).json({
            message: 'Experience added successfully',
            experience: user.experience
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while adding experience',
            error: error.message
        });
    }
};

const updateExperience = async (req, res) => {
    try {
        const { experienceId } = req.params;
        const { company, position, startDate, endDate, isCurrent, description } = req.body;

        if (!mongoose.Types.ObjectId.isValid(experienceId)) {
            return res.status(400).json({
                message: 'Invalid experience ID format'
            });
        }

        const user = await User.findById(req.user._id);
        const experienceItem = user.experience.id(experienceId);

        if (!experienceItem) {
            return res.status(404).json({
                message: 'Experience record not found'
            });
        }

        if (company !== undefined) experienceItem.company = company.trim();
        if (position !== undefined) experienceItem.position = position.trim();
        if (description !== undefined) experienceItem.description = description.trim();

        if (startDate !== undefined) {
            const parsedStartDate = new Date(startDate);
            if (Number.isNaN(parsedStartDate.getTime())) {
                return res.status(400).json({ message: 'Please provide a valid startDate' });
            }
            experienceItem.startDate = parsedStartDate;
        }

        if (isCurrent !== undefined) {
            experienceItem.isCurrent = Boolean(isCurrent);
            if (experienceItem.isCurrent) {
                experienceItem.endDate = undefined;
            }
        }

        if (endDate !== undefined && !experienceItem.isCurrent) {
            if (endDate === '' || endDate === null) {
                experienceItem.endDate = undefined;
            } else {
                const parsedEndDate = new Date(endDate);
                if (Number.isNaN(parsedEndDate.getTime())) {
                    return res.status(400).json({ message: 'Please provide a valid endDate' });
                }
                experienceItem.endDate = parsedEndDate;
            }
        }

        if (experienceItem.endDate && experienceItem.endDate < experienceItem.startDate) {
            return res.status(400).json({
                message: 'endDate cannot be earlier than startDate'
            });
        }

        await user.save();

        return res.status(200).json({
            message: 'Experience updated successfully',
            experience: user.experience
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating experience',
            error: error.message
        });
    }
};

const deleteExperience = async (req, res) => {
    try {
        const { experienceId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(experienceId)) {
            return res.status(400).json({
                message: 'Invalid experience ID format'
            });
        }

        const user = await User.findById(req.user._id);
        const experienceItem = user.experience.id(experienceId);

        if (!experienceItem) {
            return res.status(404).json({
                message: 'Experience record not found'
            });
        }

        experienceItem.deleteOne();
        await user.save();

        return res.status(200).json({
            message: 'Experience deleted successfully',
            experience: user.experience
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while deleting experience',
            error: error.message
        });
    }
};

const updateSkills = async (req, res) => {
    try {
        const { skills } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({
                message: 'Skills must be an array of strings'
            });
        }

        const user = await User.findById(req.user._id);
        user.skills = normalizeSkills(skills);
        await user.save();

        return res.status(200).json({
            message: 'Skills updated successfully',
            skills: user.skills
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating skills',
            error: error.message
        });
    }
};

const updateResume = async (req, res) => {
    try {
        const { resumeUrl } = req.body;

        if (!resumeUrl || !isValidUrl(resumeUrl)) {
            return res.status(400).json({
                message: 'Please provide a valid resume URL starting with http:// or https://'
            });
        }

        const user = await User.findById(req.user._id);
        user.resumeUrl = resumeUrl.trim();
        await user.save();

        return res.status(200).json({
            message: 'Resume URL updated successfully',
            resumeUrl: user.resumeUrl
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating resume',
            error: error.message
        });
    }
};

const getProfileCompletion = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(PUBLIC_PROFILE_FIELDS);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const { completion, missing } = calculateCompletion(user);

        return res.status(200).json({
            completion,
            missing
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while calculating profile completion',
            error: error.message
        });
    }
};

const getJobseekerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID format'
            });
        }

        const jobseeker = await User.findById(userId).select(PUBLIC_PROFILE_FIELDS);

        if (!jobseeker) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (jobseeker.role !== 'jobseeker') {
            return res.status(403).json({
                message: 'Access denied. You can only view job seeker profiles.'
            });
        }

        const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id');
        const jobIds = recruiterJobs.map((job) => job._id);

        const relatedApplication = await Application.findOne({
            applicant: userId,
            job: { $in: jobIds }
        });

        if (!relatedApplication) {
            return res.status(403).json({
                message: 'Access denied. You can only view profiles of applicants for your own jobs.'
            });
        }

        return res.status(200).json({
            profile: formatProfile(jobseeker)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error while fetching job seeker profile',
            error: error.message
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    updateSkills,
    updateResume,
    getProfileCompletion,
    getJobseekerProfile
};

const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/authmiddleware.js');
const jobseekerOnly = require('../middleware/jobseekerMiddleware.js');
const recruiterOnly = require('../middleware/recruiterMiddleware.js');
const {
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
} = require('../controllers/profileController.js');

// Own profile — any authenticated user
router.get('/me', authmiddleware, getMyProfile);
router.put('/me', authmiddleware, updateMyProfile);

// Job-seeker-only profile sections
router.get('/me/completion', authmiddleware, jobseekerOnly, getProfileCompletion);
router.put('/me/skills', authmiddleware, jobseekerOnly, updateSkills);
router.put('/me/resume', authmiddleware, jobseekerOnly, updateResume);

router.post('/me/education', authmiddleware, jobseekerOnly, addEducation);
router.put('/me/education/:educationId', authmiddleware, jobseekerOnly, updateEducation);
router.delete('/me/education/:educationId', authmiddleware, jobseekerOnly, deleteEducation);

router.post('/me/experience', authmiddleware, jobseekerOnly, addExperience);
router.put('/me/experience/:experienceId', authmiddleware, jobseekerOnly, updateExperience);
router.delete('/me/experience/:experienceId', authmiddleware, jobseekerOnly, deleteExperience);

// Recruiter can view a job seeker only if that person applied to their job
router.get('/jobseeker/:userId', authmiddleware, recruiterOnly, getJobseekerProfile);

module.exports = router;

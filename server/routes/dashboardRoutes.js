const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/authmiddleware.js');
const jobseekerOnly = require('../middleware/jobseekerMiddleware.js');
const recruiterOnly = require('../middleware/recruiterMiddleware.js');
const {
    getJobseekerDashboard,
    getRecruiterDashboard
} = require('../controllers/dashboardController.js');

router.get('/jobseeker', authmiddleware, jobseekerOnly, getJobseekerDashboard);
router.get('/recruiter', authmiddleware, recruiterOnly, getRecruiterDashboard);

module.exports = router;

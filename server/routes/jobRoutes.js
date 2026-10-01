const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/authmiddleware.js');
const recruiterOnly = require('../middleware/recruiterMiddleware.js');
const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
} = require('../controllers/jobControllers.js');

// Middleware order matters:
// 1. authmiddleware runs first → verifies JWT and sets req.user
// 2. recruiterOnly runs second → checks req.user.role === 'recruiter'
// If either fails, the controller never runs.

// Public routes — anyone can view jobs (job seekers included)
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes — require login
router.post('/', authmiddleware, recruiterOnly, createJob);
router.put('/:id', authmiddleware, updateJob);
router.delete('/:id', authmiddleware, deleteJob);

module.exports = router;

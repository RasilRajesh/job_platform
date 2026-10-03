const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/authmiddleware.js');
const recruiterOnly = require('../middleware/recruiterMiddleware.js');
const jobseekerOnly = require('../middleware/jobseekerMiddleware.js');
const {
    applyForJob,
    getMyApplications,
    getApplicationsForJob,
    updateApplicationStatus,
    updateApplicationStage,
    addApplicationNote,
    deleteApplicationNote
} = require('../controllers/applicationController.js');

// Specific routes first — avoids Express treating "my-applications" as an ID

// Job seeker routes
router.get('/my-applications', authmiddleware, jobseekerOnly, getMyApplications);
router.post('/:jobId', authmiddleware, jobseekerOnly, applyForJob);

// Recruiter routes
router.get('/job/:jobId', authmiddleware, recruiterOnly, getApplicationsForJob);
router.put('/:id/status', authmiddleware, recruiterOnly, updateApplicationStatus);
router.patch('/:id/stage', authmiddleware, recruiterOnly, updateApplicationStage);
router.post('/:id/notes', authmiddleware, recruiterOnly, addApplicationNote);
router.delete('/:id/notes/:noteId', authmiddleware, recruiterOnly, deleteApplicationNote);

module.exports = router;

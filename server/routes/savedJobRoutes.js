const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/authmiddleware.js');
const jobseekerOnly = require('../middleware/jobseekerMiddleware.js');
const {
    saveJob,
    getSavedJobs,
    removeSavedJob,
    checkSavedJob
} = require('../controllers/savedJobController.js');

// Specific route before parameterized routes
router.get('/check/:jobId', authmiddleware, jobseekerOnly, checkSavedJob);

router.get('/', authmiddleware, jobseekerOnly, getSavedJobs);
router.post('/:jobId', authmiddleware, jobseekerOnly, saveJob);
router.delete('/:jobId', authmiddleware, jobseekerOnly, removeSavedJob);

module.exports = router;

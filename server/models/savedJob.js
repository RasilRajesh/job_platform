const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
    // References the User who saved the job (job seeker).
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // References the Job that was saved.
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index: one user can save a job only once.
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;

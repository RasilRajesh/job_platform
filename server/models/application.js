const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    // References the Job being applied to.
    // ref: 'Job' links this ObjectId to the Job collection.
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },

    // References the User who applied (job seeker).
    // ref: 'User' links this ObjectId to the User collection.
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    coverLetter: {
        type: String,
        required: true
    },

    resume: {
        type: String
    },

    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'rejected', 'hired'],
        default: 'applied'
    }
}, {
    timestamps: true
});

// Prevent the same user from applying to the same job twice.
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

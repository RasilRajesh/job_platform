const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    company: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    salary: {
        type: Number,
        required: true
    },

    skills: {
        type: [String],
        required: true
    },

    // New field — existing jobs in MongoDB without jobType still work.
    // MongoDB does not backfill old documents; they simply have no jobType
    // until updated. New jobs get default 'full-time' automatically.
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'internship', 'contract'],
        default: 'full-time'
    },

    // ObjectId = MongoDB's unique ID type for documents.
    // ref: 'User' tells Mongoose this field points to the User collection.
    // This link lets you use .populate('recruiter') to fetch recruiter details later.
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // adds createdAt and updatedAt automatically
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

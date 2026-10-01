// Role authorization middleware — runs AFTER authmiddleware.
// Authentication answers "Who are you?" (JWT → req.user).
// Authorization answers "What are you allowed to do?" (role check).
const jobseekerOnly = (req, res, next) => {
    if (req.user.role !== 'jobseeker') {
        return res.status(403).json({
            message: 'Access denied. Only job seekers can perform this action.'
        });
    }
    next();
};

module.exports = jobseekerOnly;

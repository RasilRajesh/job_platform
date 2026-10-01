// Role authorization middleware — runs AFTER authmiddleware.
// authmiddleware sets req.user; this checks the user's role.
const recruiterOnly = (req, res, next) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({
            message: 'Access denied. Only recruiters can perform this action.'
        });
    }
    next();
};

module.exports = recruiterOnly;

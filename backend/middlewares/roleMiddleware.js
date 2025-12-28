/**
 * Role-Based Access Control (RBAC) Middleware
 * Protects routes based on user roles: job_seeker, recruiter, admin
 */

/**
 * Middleware to check if user is a Job Seeker
 */
const isJobSeeker = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.userRole !== 'job_seeker') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Job Seeker privileges required."
        });
    }

    next();
};

/**
 * Middleware to check if user is a Recruiter
 */
const isRecruiter = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.userRole !== 'recruiter') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Recruiter privileges required."
        });
    }

    next();
};

/**
 * Middleware to check if user is an Admin
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};

/**
 * Middleware to check if user is either Recruiter or Admin
 */
const isRecruiterOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.userRole !== 'recruiter' && req.user.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Recruiter or Admin privileges required."
        });
    }

    next();
};

/**
 * Middleware to check if account is active (not suspended)
 */
const isActiveAccount = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.accountStatus === 'suspended') {
        return res.status(403).json({
            success: false,
            message: "Your account has been suspended. Please contact support."
        });
    }

    next();
};

/**
 * Middleware to allow multiple roles
 * Usage: checkRole(['job_seeker', 'recruiter'])
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

module.exports = {
    isJobSeeker,
    isRecruiter,
    isAdmin,
    isRecruiterOrAdmin,
    isActiveAccount,
    checkRole
};

/**
 * Role Helper Utilities
 * Utility functions for checking user roles and permissions
 */

/**
 * Check if user is a job seeker
 * @param {Object} user - User object from Redux state
 * @returns {boolean}
 */
export const isJobSeeker = (user) => {
    return user?.userRole === 'job_seeker';
};

/**
 * Check if user is a recruiter
 * @param {Object} user - User object from Redux state
 * @returns {boolean}
 */
export const isRecruiter = (user) => {
    return user?.userRole === 'recruiter';
};

/**
 * Check if user is an admin
 * @param {Object} user - User object from Redux state
 * @returns {boolean}
 */
export const isAdmin = (user) => {
    return user?.userRole === 'admin';
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object from Redux state
 * @param {Array<string>} roles - Array of role names to check
 * @returns {boolean}
 */
export const hasAnyRole = (user, roles = []) => {
    return roles.includes(user?.userRole);
};

/**
 * Check if user account is active
 * @param {Object} user - User object from Redux state
 * @returns {boolean}
 */
export const isAccountActive = (user) => {
    return user?.accountStatus === 'active';
};

/**
 * Check if user account is suspended
 * @param {Object} user - User object from Redux state
 * @returns {boolean}
 */
export const isAccountSuspended = (user) => {
    return user?.accountStatus === 'suspended';
};

/**
 * Get user's dashboard route based on role
 * @param {Object} user - User object from Redux state
 * @returns {string} Dashboard route path
 */
export const getDashboardRoute = (user) => {
    if (!user) return '/login';

    switch (user.userRole) {
        case 'admin':
            return '/admin';
        case 'recruiter':
            return '/recruiter';
        case 'job_seeker':
        default:
            return '/dashboard';
    }
};

/**
 * Get role display name
 * @param {string} role - Role identifier
 * @returns {string} Human-readable role name
 */
export const getRoleDisplayName = (role) => {
    const roleNames = {
        'job_seeker': 'Job Seeker',
        'recruiter': 'Recruiter',
        'admin': 'Administrator'
    };

    return roleNames[role] || 'Unknown Role';
};

/**
 * Get account status display name
 * @param {string} status - Account status
 * @returns {string} Human-readable status name
 */
export const getAccountStatusDisplayName = (status) => {
    const statusNames = {
        'active': 'Active',
        'suspended': 'Suspended'
    };

    return statusNames[status] || 'Unknown Status';
};

/**
 * Get account status color (for badges)
 * @param {string} status - Account status
 * @returns {string} Tailwind CSS color class
 */
export const getAccountStatusColor = (status) => {
    const colors = {
        'active': 'bg-green-100 text-green-800 border-green-300',
        'suspended': 'bg-red-100 text-red-800 border-red-300'
    };

    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Check if user can access a route
 * @param {Object} user - User object from Redux state
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route
 * @returns {boolean}
 */
export const canAccessRoute = (user, allowedRoles = []) => {
    if (!user || !isAccountActive(user)) return false;
    if (allowedRoles.length === 0) return true; // No role restriction
    return hasAnyRole(user, allowedRoles);
};

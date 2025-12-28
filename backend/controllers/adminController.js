const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const mongoose = require('mongoose');

// @desc    Get all users with filters and pagination
// @route   GET /api/v1/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query - exclude soft-deleted users (where deletedAt is a date)
    const query = {
      $or: [
        { deletedAt: null },
        { deletedAt: { $exists: false } }
      ]
    };

    if (role && role !== 'all') {
      query.userRole = role;
    }

    if (status && status !== 'all') {
      query.accountStatus = status;
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { deletedAt: null },
            { deletedAt: { $exists: false } }
          ]
        },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      // Remove the first $or since we're using $and now
      delete query.$or;
    }

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Get user by ID with full details
// @route   GET /api/v1/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's application count
    const applicationCount = await Application.countDocuments({ user: req.params.id });

    // Get user's posted jobs count (if recruiter)
    let postedJobsCount = 0;
    if (user.userRole === 'recruiter') {
      postedJobsCount = await Job.countDocuments({ postedBy: req.params.id });
    }

    // Get recent applications
    const recentApplications = await Application.find({ user: req.params.id })
      .sort({ applicationDate: -1 })
      .limit(10)
      .select('title company status applicationDate')
      .lean();

    // Get recent jobs (if recruiter)
    let recentJobs = [];
    if (user.userRole === 'recruiter') {
      recentJobs = await Job.find({ postedBy: req.params.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title company status createdAt applicationsCount')
        .lean();
    }

    res.json({
      success: true,
      user: {
        ...user,
        statistics: {
          applicationCount,
          postedJobsCount
        },
        recentApplications,
        recentJobs
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// @desc    Suspend a user account
// @route   PUT /api/v1/admin/users/:id/suspend
// @access  Private (Admin only)
exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason is required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent suspending other admins
    if (user.userRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    user.accountStatus = 'suspended';
    user.suspensionReason = reason;

    await user.save();

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        suspensionReason: user.suspensionReason
      }
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: error.message
    });
  }
};

// @desc    Activate a suspended user account
// @route   PUT /api/v1/admin/users/:id/activate
// @access  Private (Admin only)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.accountStatus = 'active';
    user.suspensionReason = '';

    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

// @desc    Soft delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting other admins
    if (user.userRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Soft delete
    user.deletedAt = new Date();
    user.deletedBy = req.user._id;
    user.accountStatus = 'suspended'; // Also suspend the account

    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['job_seeker', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (job_seeker, recruiter, admin)'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.userRole = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userRole: user.userRole
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// @desc    Get system analytics/statistics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin only)
exports.getSystemAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const activeUsers = await User.countDocuments({ deletedAt: null, accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ deletedAt: null, accountStatus: 'suspended' });
    const jobSeekers = await User.countDocuments({ deletedAt: null, userRole: 'job_seeker' });
    const recruiters = await User.countDocuments({ deletedAt: null, userRole: 'recruiter' });
    const admins = await User.countDocuments({ deletedAt: null, userRole: 'admin' });

    // Job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const draftJobs = await Job.countDocuments({ status: 'draft' });
    const recruiterPostedJobs = await Job.countDocuments({ source: 'recruiter' });

    // Get scraped jobs count from different sources
    const db = mongoose.connection.db;
    const telegramJobsCount = await db.collection('telegram').countDocuments();
    const timesJobsCount = await db.collection('timesjob').countDocuments();
    const hireJobsCount = await db.collection('hirejobs').countDocuments();
    const instahyreJobsCount = await db.collection('instahyre').countDocuments();

    // Application statistics
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const interviewScheduledApplications = await Application.countDocuments({ status: 'interview_scheduled' });

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      deletedAt: null
    });

    // Get applications in last 30 days
    const newApplicationsLast30Days = await Application.countDocuments({
      applicationDate: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          byRole: {
            jobSeekers,
            recruiters,
            admins
          },
          newLast30Days: newUsersLast30Days
        },
        jobs: {
          total: totalJobs + telegramJobsCount + timesJobsCount + hireJobsCount + instahyreJobsCount,
          recruiterPosted: recruiterPostedJobs,
          scraped: {
            telegram: telegramJobsCount,
            timesJob: timesJobsCount,
            hireJobs: hireJobsCount,
            instahyre: instahyreJobsCount
          },
          byStatus: {
            active: activeJobs,
            closed: closedJobs,
            draft: draftJobs
          }
        },
        applications: {
          total: totalApplications,
          byStatus: {
            pending: pendingApplications,
            shortlisted: shortlistedApplications,
            rejected: rejectedApplications,
            interviewScheduled: interviewScheduledApplications
          },
          newLast30Days: newApplicationsLast30Days
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// @desc    Get all jobs (recruiter-posted and scraped)
// @route   GET /api/v1/admin/jobs
// @access  Private (Admin only)
exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, source, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get recruiter-posted jobs from Job model (don't apply status filter yet)
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    const recruiterJobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get scraped jobs from different collections
    const db = mongoose.connection.db;
    const telegramJobs = await db.collection('telegram').find({}).sort({ _id: -1 }).limit(100).toArray();
    const timesJobs = await db.collection('timesjob').find({}).sort({ _id: -1 }).limit(100).toArray();
    const hireJobs = await db.collection('hirejobs').find({}).sort({ _id: -1 }).limit(100).toArray();
    const instahyreJobs = await db.collection('instahyre').find({}).sort({ _id: -1 }).limit(100).toArray();

    // Format scraped jobs to match Job model structure
    const formattedTelegramJobs = telegramJobs.map(job => ({
      ...job,
      source: 'telegram',
      status: 'active',
      company: job.company || 'Unknown',
      location: job.location || 'N/A'
    }));

    const formattedTimesJobs = timesJobs.map(job => ({
      ...job,
      source: 'timesjob',
      status: 'active',
      company: job.company || 'Unknown',
      location: job.location || 'N/A'
    }));

    const formattedHireJobs = hireJobs.map(job => ({
      ...job,
      source: 'hirejobs',
      status: 'active',
      company: job.company || 'Unknown',
      location: job.location || 'N/A'
    }));

    const formattedInstahyreJobs = instahyreJobs.map(job => ({
      ...job,
      source: 'instahyre',
      status: 'active',
      company: job.company || 'Unknown',
      location: job.location || 'N/A'
    }));

    // Combine all jobs
    let allJobs = [
      ...recruiterJobs.map(job => ({ ...job, source: job.source || 'recruiter' })),
      ...formattedTelegramJobs,
      ...formattedTimesJobs,
      ...formattedHireJobs,
      ...formattedInstahyreJobs
    ];

    // Apply source filter if specified
    if (source && source !== 'all') {
      allJobs = allJobs.filter(job => job.source === source);
    }

    // Apply status filter AFTER combining (all scraped jobs are 'active')
    if (status && status !== 'all') {
      allJobs = allJobs.filter(job => job.status === status);
    }

    // Apply search filter if specified
    if (search) {
      const searchLower = search.toLowerCase();
      allJobs = allJobs.filter(job =>
        (job.title && job.title.toLowerCase().includes(searchLower)) ||
        (job.company && job.company.toLowerCase().includes(searchLower)) ||
        (job.description && job.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    allJobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id.getTimestamp());
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id.getTimestamp());
      return dateB - dateA;
    });

    // Apply pagination
    const total = allJobs.length;
    const paginatedJobs = allJobs.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// @desc    Get all applications across the system
// @route   GET /api/v1/admin/applications
// @access  Private (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    // Get applications
    const applications = await Application.find(query)
      .populate('user', 'name email userRole')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// @desc    Close any job (admin override)
// @route   PUT /api/v1/admin/jobs/:id/close
// @access  Private (Admin only)
exports.closeAnyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = 'closed';
    await job.save();

    res.json({
      success: true,
      message: 'Job closed successfully',
      job
    });
  } catch (error) {
    console.error('Error closing job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close job',
      error: error.message
    });
  }
};

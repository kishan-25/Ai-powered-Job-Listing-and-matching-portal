const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Create a new job posting
// @route   POST /api/v1/recruiter/jobs
// @access  Private (Recruiter only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      keySkills,
      location,
      experience,
      salary,
      jobType,
      workMode,
      status,
      expiresAt
    } = req.body;

    // Create job
    const job = await Job.create({
      title,
      company,
      description,
      keySkills: Array.isArray(keySkills) ? keySkills : keySkills?.split(',').map(s => s.trim()),
      location,
      experience,
      salary,
      jobType,
      workMode,
      status: status || 'draft',
      postedBy: req.user._id,
      source: 'recruiter',
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
};

// @desc    Get all jobs posted by the logged-in recruiter
// @route   GET /api/v1/recruiter/jobs
// @access  Private (Recruiter only)
exports.getRecruiterJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { postedBy: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Get jobs
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/v1/recruiter/jobs/:id
// @access  Private (Recruiter/Admin only)
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership (unless admin)
    if (req.user.userRole !== 'admin' && job.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this job'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

// @desc    Update a job
// @route   PUT /api/v1/recruiter/jobs/:id
// @access  Private (Recruiter only - own jobs)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Update fields
    const {
      title,
      company,
      description,
      keySkills,
      location,
      experience,
      salary,
      jobType,
      workMode,
      status,
      expiresAt
    } = req.body;

    if (title) job.title = title;
    if (company) job.company = company;
    if (description) job.description = description;
    if (keySkills) job.keySkills = Array.isArray(keySkills) ? keySkills : keySkills.split(',').map(s => s.trim());
    if (location !== undefined) job.location = location;
    if (experience !== undefined) job.experience = experience;
    if (salary !== undefined) job.salary = salary;
    if (jobType) job.jobType = jobType;
    if (workMode) job.workMode = workMode;
    if (status) job.status = status;
    if (expiresAt) job.expiresAt = expiresAt;

    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

// @desc    Delete a job
// @route   DELETE /api/v1/recruiter/jobs/:id
// @access  Private (Recruiter only - own jobs)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// @desc    Close a job (mark as closed)
// @route   PUT /api/v1/recruiter/jobs/:id/close
// @access  Private (Recruiter only - own jobs)
exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to close this job'
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

// @desc    Get applications for a specific job
// @route   GET /api/v1/recruiter/jobs/:id/applications
// @access  Private (Recruiter only - own jobs)
exports.getJobApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // First verify the job belongs to the recruiter
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    // Build query
    const query = { jobId: req.params.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    // Get applications with user details
    const applications = await Application.find(query)
      .populate('user', 'name email skills experience location linkedin github portfolio')
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
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/v1/recruiter/applications/:id/status
// @access  Private (Recruiter only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the recruiter owns the job
    const job = await Job.findById(application.jobId);

    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update status
    application.status = status;
    if (notes) application.notes = notes;

    // Add to status history
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id
    });

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

// @desc    Get recruiter dashboard statistics
// @route   GET /api/v1/recruiter/stats
// @access  Private (Recruiter only)
exports.getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Get job counts
    const totalJobs = await Job.countDocuments({ postedBy: recruiterId });
    const activeJobs = await Job.countDocuments({ postedBy: recruiterId, status: 'active' });
    const draftJobs = await Job.countDocuments({ postedBy: recruiterId, status: 'draft' });
    const closedJobs = await Job.countDocuments({ postedBy: recruiterId, status: 'closed' });

    // Get all job IDs for this recruiter
    const jobs = await Job.find({ postedBy: recruiterId }).select('_id');
    const jobIds = jobs.map(job => job._id.toString());

    // Get application counts
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });
    const pendingApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'pending'
    });
    const shortlistedApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'shortlisted'
    });

    res.json({
      success: true,
      stats: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          draft: draftJobs,
          closed: closedJobs
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          shortlisted: shortlistedApplications
        }
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

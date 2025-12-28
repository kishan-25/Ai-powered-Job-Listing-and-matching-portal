const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Job = require('../models/Job');

/**
 * @swagger
 * /api/v1/users/saved-jobs/{jobId}:
 *   post:
 *     summary: Save a job to user's saved jobs list
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/saved-jobs/:jobId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if job exists
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    if (user.savedJobs.includes(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    user.savedJobs.push(req.params.jobId);
    await user.save();

    res.json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/users/saved-jobs/{jobId}:
 *   delete:
 *     summary: Remove a job from user's saved jobs list
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/saved-jobs/:jobId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from saved jobs
    user.savedJobs = user.savedJobs.filter(
      jobId => jobId.toString() !== req.params.jobId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Job removed from saved list'
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/users/saved-jobs:
 *   get:
 *     summary: Get all saved jobs for the logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/saved-jobs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      savedJobs: user.savedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs',
      error: error.message
    });
  }
});

module.exports = router;

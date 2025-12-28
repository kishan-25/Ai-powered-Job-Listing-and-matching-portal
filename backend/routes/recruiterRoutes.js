const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isRecruiter, isRecruiterOrAdmin } = require('../middlewares/roleMiddleware');
const {
  createJob,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
  closeJob,
  getJobApplications,
  updateApplicationStatus,
  getRecruiterStats
} = require('../controllers/recruiterController');

/**
 * @swagger
 * /api/v1/recruiter/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.post('/jobs', protect, isRecruiter, createJob);

/**
 * @swagger
 * /api/v1/recruiter/jobs:
 *   get:
 *     summary: Get all jobs posted by the logged-in recruiter
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.get('/jobs', protect, isRecruiter, getRecruiterJobs);

/**
 * @swagger
 * /api/v1/recruiter/stats:
 *   get:
 *     summary: Get recruiter dashboard statistics
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, isRecruiter, getRecruiterStats);

/**
 * @swagger
 * /api/v1/recruiter/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.get('/jobs/:id', protect, isRecruiterOrAdmin, getJobById);

/**
 * @swagger
 * /api/v1/recruiter/jobs/{id}:
 *   put:
 *     summary: Update a job
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.put('/jobs/:id', protect, isRecruiter, updateJob);

/**
 * @swagger
 * /api/v1/recruiter/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/jobs/:id', protect, isRecruiter, deleteJob);

/**
 * @swagger
 * /api/v1/recruiter/jobs/{id}/close:
 *   put:
 *     summary: Close a job posting
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.put('/jobs/:id/close', protect, isRecruiter, closeJob);

/**
 * @swagger
 * /api/v1/recruiter/jobs/{id}/applications:
 *   get:
 *     summary: Get all applications for a specific job
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.get('/jobs/:id/applications', protect, isRecruiter, getJobApplications);

/**
 * @swagger
 * /api/v1/recruiter/applications/{id}/status:
 *   put:
 *     summary: Update application status (shortlist, reject, etc.)
 *     tags: [Recruiter]
 *     security:
 *       - bearerAuth: []
 */
router.put('/applications/:id/status', protect, isRecruiter, updateApplicationStatus);

module.exports = router;

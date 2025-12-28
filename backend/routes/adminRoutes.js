const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const {
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  updateUserRole,
  getSystemAnalytics,
  getAllJobs,
  getAllApplications,
  closeAnyJob
} = require('../controllers/adminController');

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users with filters and pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', protect, isAdmin, getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users/:id', protect, isAdmin, getUserById);

/**
 * @swagger
 * /api/v1/admin/users/{id}/suspend:
 *   put:
 *     summary: Suspend a user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id/suspend', protect, isAdmin, suspendUser);

/**
 * @swagger
 * /api/v1/admin/users/{id}/activate:
 *   put:
 *     summary: Activate a suspended user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id/activate', protect, isAdmin, activateUser);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Soft delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/users/:id', protect, isAdmin, deleteUser);

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id/role', protect, isAdmin, updateUserRole);

/**
 * @swagger
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Get system analytics and statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/analytics', protect, isAdmin, getSystemAnalytics);

/**
 * @swagger
 * /api/v1/admin/jobs:
 *   get:
 *     summary: Get all jobs across the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/jobs', protect, isAdmin, getAllJobs);

/**
 * @swagger
 * /api/v1/admin/applications:
 *   get:
 *     summary: Get all applications across the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/applications', protect, isAdmin, getAllApplications);

/**
 * @swagger
 * /api/v1/admin/jobs/{id}/close:
 *   put:
 *     summary: Close any job (admin override)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/jobs/:id/close', protect, isAdmin, closeAnyJob);

module.exports = router;

const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Job creation validation
const validateCreateJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters long'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location must not exceed 150 characters'),

  body('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
    .withMessage('Invalid job type'),

  body('workMode')
    .optional()
    .isIn(['Remote', 'Hybrid', 'On-site'])
    .withMessage('Invalid work mode'),

  body('status')
    .optional()
    .isIn(['active', 'draft', 'closed'])
    .withMessage('Invalid job status'),

  body('keySkills')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        // If it's a comma-separated string, that's fine
        return true;
      }
      if (Array.isArray(value)) {
        return true;
      }
      throw new Error('Key skills must be an array or comma-separated string');
    }),

  handleValidationErrors
];

// Job update validation
const validateUpdateJob = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters long'),

  body('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
    .withMessage('Invalid job type'),

  body('workMode')
    .optional()
    .isIn(['Remote', 'Hybrid', 'On-site'])
    .withMessage('Invalid work mode'),

  body('status')
    .optional()
    .isIn(['active', 'draft', 'closed'])
    .withMessage('Invalid job status'),

  handleValidationErrors
];

module.exports = {
  validateCreateJob,
  validateUpdateJob,
  handleValidationErrors
};

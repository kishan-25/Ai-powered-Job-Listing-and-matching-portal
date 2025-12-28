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

// Register validation
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),

  body('userRole')
    .optional()
    .isIn(['job_seeker', 'recruiter', 'admin'])
    .withMessage('Invalid user role'),

  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn must be a valid URL'),

  body('github')
    .optional()
    .trim()
    .isURL()
    .withMessage('GitHub must be a valid URL'),

  body('portfolio')
    .optional()
    .trim()
    .isURL()
    .withMessage('Portfolio must be a valid URL'),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  handleValidationErrors
};

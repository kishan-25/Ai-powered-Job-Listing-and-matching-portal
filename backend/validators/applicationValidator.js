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

// Application status update validation
const validateApplicationStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'shortlisted', 'rejected', 'interview_scheduled'])
    .withMessage('Invalid application status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  handleValidationErrors
];

module.exports = {
  validateApplicationStatusUpdate,
  handleValidationErrors
};

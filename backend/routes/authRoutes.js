// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
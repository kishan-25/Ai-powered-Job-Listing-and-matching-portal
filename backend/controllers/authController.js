const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// Register User
const registerUser = async (req, res) => {
    const {
        name,
        email,
        password,
        skills,
        experience,
        jobTitle,
        userRole,
        linkedin,
        github,
        portfolio
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide required fields: name, email, and password"
        });
    }

    // Validate userRole if provided
    if (userRole && !['job_seeker', 'recruiter', 'admin'].includes(userRole)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user role. Must be 'job_seeker', 'recruiter', or 'admin'"
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            skills: skills || [],
            experience: experience || "",
            jobTitle: jobTitle || "Software Engineer",
            userRole: userRole || "job_seeker",
            linkedin: linkedin || "",
            github: github || "",
            portfolio: portfolio || ""
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                skills: user.skills,
                experience: user.experience,
                jobTitle: user.jobTitle,
                userRole: user.userRole,
                accountStatus: user.accountStatus,
                linkedin: user.linkedin,
                github: user.github,
                portfolio: user.portfolio,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid user data"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: error.message
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Check if account is suspended
            if (user.accountStatus === 'suspended') {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been suspended. Please contact support.",
                    suspensionReason: user.suspensionReason || "No reason provided"
                });
            }

            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                skills: user.skills,
                experience: user.experience,
                jobTitle: user.jobTitle,
                userRole: user.userRole,
                accountStatus: user.accountStatus,
                linkedin: user.linkedin,
                github: user.github,
                portfolio: user.portfolio,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (user) {
            res.json({
                success: true, 
                user
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: "User not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error retrieving profile",
            error: error.message
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.skills = req.body.skills || user.skills;
            user.experience = req.body.experience || user.experience;
            user.jobTitle = req.body.jobTitle || user.jobTitle;
            user.education = req.body.education || user.education;
            user.location = req.body.location || user.location;
            user.aboutMe = req.body.aboutMe || user.aboutMe;
            user.projects = req.body.projects || user.projects;
            user.linkedin = req.body.linkedin || user.linkedin;
            user.github = req.body.github || user.github;
            user.portfolio = req.body.portfolio || user.portfolio;

            // Note: userRole cannot be changed by users themselves
            // Only admins can change userRole

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: "Profile updated successfully",
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    skills: updatedUser.skills,
                    experience: updatedUser.experience,
                    jobTitle: updatedUser.jobTitle,
                    userRole: updatedUser.userRole,
                    education: updatedUser.education,
                    location: updatedUser.location,
                    aboutMe: updatedUser.aboutMe,
                    projects: updatedUser.projects,
                    linkedin: updatedUser.linkedin,
                    github: updatedUser.github,
                    portfolio: updatedUser.portfolio,
                },
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error updating profile",
            error: error.message
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
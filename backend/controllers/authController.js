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

    // Only job_seeker and recruiter can self-register; admin role is assigned by existing admins only
    if (userRole && !['job_seeker', 'recruiter'].includes(userRole)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user role. Must be 'job_seeker' or 'recruiter'"
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
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
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
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
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
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error retrieving profile"
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Shared fields
            if (req.body.name        !== undefined) user.name     = req.body.name;
            if (req.body.location    !== undefined) user.location = req.body.location;
            if (req.body.linkedin    !== undefined) user.linkedin = req.body.linkedin;

            // Job-seeker fields
            if (user.userRole !== 'recruiter') {
                if (req.body.skills     !== undefined) user.skills     = req.body.skills;
                if (req.body.experience !== undefined) user.experience = req.body.experience;
                if (req.body.jobTitle   !== undefined) user.jobTitle   = req.body.jobTitle;
                if (req.body.education  !== undefined) user.education  = req.body.education;
                if (req.body.aboutMe    !== undefined) user.aboutMe    = req.body.aboutMe;
                if (req.body.projects   !== undefined) user.projects   = req.body.projects;
                if (req.body.github     !== undefined) user.github     = req.body.github;
                if (req.body.portfolio  !== undefined) user.portfolio  = req.body.portfolio;
            }

            // Recruiter fields
            if (user.userRole === 'recruiter') {
                if (req.body.companyName        !== undefined) user.companyName    = req.body.companyName;
                if (req.body.companyWebsite     !== undefined) user.companyWebsite = req.body.companyWebsite;
                if (req.body.phone              !== undefined) user.phone          = req.body.phone;
                if (req.body.position           !== undefined) user.position       = req.body.position;
                if (req.body.aboutMe            !== undefined) user.aboutMe        = req.body.aboutMe;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: "Profile updated successfully",
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    userRole: updatedUser.userRole,
                    accountStatus: updatedUser.accountStatus,
                    // Job-seeker fields
                    skills: updatedUser.skills,
                    experience: updatedUser.experience,
                    jobTitle: updatedUser.jobTitle,
                    education: updatedUser.education,
                    location: updatedUser.location,
                    aboutMe: updatedUser.aboutMe,
                    projects: updatedUser.projects,
                    linkedin: updatedUser.linkedin,
                    github: updatedUser.github,
                    portfolio: updatedUser.portfolio,
                    // Recruiter fields
                    companyName: updatedUser.companyName,
                    companyWebsite: updatedUser.companyWebsite,
                    phone: updatedUser.phone,
                    position: updatedUser.position,
                },
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating profile"
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
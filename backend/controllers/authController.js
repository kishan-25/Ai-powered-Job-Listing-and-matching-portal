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
        role,
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
            role: role || "Software Engineer",
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
                role: user.role,
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
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                skills: user.skills,
                experience: user.experience,
                role: user.role,
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
            user.role = req.body.role || user.role;
            user.education = req.body.education || user.education;
            user.location = req.body.location || user.location;
            user.aboutMe = req.body.aboutMe || user.aboutMe;
            user.projects = req.body.projects || user.projects;
            user.linkedin = req.body.linkedin || user.linkedin;
            user.github = req.body.github || user.github;
            user.portfolio = req.body.portfolio || user.portfolio;

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
                    role: updatedUser.role,
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
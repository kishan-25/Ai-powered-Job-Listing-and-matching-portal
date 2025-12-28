const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Enhanced profile fields
    skills: {
        type: [String],
        default: []
    },
    experience: {
        type: String,
        default: ""
    },
    // Job title / preferred role (for job seekers)
    jobTitle: {
        type: String,
        enum: [
            "Software Engineer",
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Researcher",
            "Full Stack Developer | Researcher | Software Engineer"
        ],
        default: "Software Engineer"
    },
    // User role in the system (job_seeker, recruiter, admin)
    userRole: {
        type: String,
        enum: ['job_seeker', 'recruiter', 'admin'],
        default: 'job_seeker',
        required: true
    },
    // Account management
    accountStatus: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },
    education: {
        type: String,
        default: ""
    },
    location: { 
        type: String, 
        default: "" 
    },
    aboutMe: { 
        type: String, 
        default: "" 
    },
    projects: { 
        type: [String], 
        default: [] 
    },
    linkedin: {
        type: String,
        default: ""
    },
    github: {
        type: String,
        default: ""
    },
    portfolio: {
        type: String,
        default: ""
    },
    // Recruiter-specific fields
    companyName: {
        type: String,
        default: ""
    },
    companyWebsite: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    position: {
        type: String,
        default: ""
    },
    // Soft delete
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    suspensionReason: {
        type: String,
        default: ""
    },
    // Saved jobs for job seekers
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }]
}, {
    timestamps: true
});

// Indexes for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userRole: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ deletedAt: 1 });

// Hash Password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare passwords
userSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
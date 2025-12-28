// backend/models/Application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "",
  },
  applied: {
    type: Boolean,
    default: true,
  },
  source: {
    type: String,
    required: true,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'interview_scheduled'],
    default: 'pending'
  },
  resumeUrl: {
    type: String,
    default: ""
  },
  coverLetter: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Create indexes for faster queries
applicationSchema.index({ user: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ source: 1 });

module.exports = mongoose.model("Application", applicationSchema);
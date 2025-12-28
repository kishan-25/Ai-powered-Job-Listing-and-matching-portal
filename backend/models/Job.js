const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  keySkills: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  workMode: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site'],
    default: 'On-site'
  },
  source: {
    type: String,
    default: 'recruiter'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'draft'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ status: 1, source: 1 });

module.exports = mongoose.model('Job', jobSchema);

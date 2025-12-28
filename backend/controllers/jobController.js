const mongoose = require("mongoose");
const Job = require("../models/Job");

// Helper function to build search query
const buildSearchQuery = (search, location, experience, jobType, workMode) => {
    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    if (experience) {
        query.experience = { $regex: experience, $options: 'i' };
    }

    if (jobType && jobType !== 'all') {
        query.jobType = jobType;
    }

    if (workMode && workMode !== 'all') {
        query.workMode = workMode;
    }

    return query;
};

const getTelegramJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, location, experience } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { text: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (experience) {
            query.experience = { $regex: experience, $options: 'i' };
        }

        const jobs = await mongoose.connection.db.collection("telegram")
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        const total = await mongoose.connection.db.collection("telegram").countDocuments(query);

        res.status(200).json({
            success: true,
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching telegram jobs",
            error: err.message
        });
    }
};

const getTimesJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, location, experience, jobType } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (experience) {
            query.experience = { $regex: experience, $options: 'i' };
        }

        if (jobType && jobType !== 'all') {
            query.jobType = { $regex: jobType, $options: 'i' };
        }

        const jobs = await mongoose.connection.db.collection("timesjob")
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        const total = await mongoose.connection.db.collection("timesjob").countDocuments(query);

        res.status(200).json({
            success: true,
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch(err) {
        res.status(500).json({
            success: false,
            message: "Error fetching times jobs",
            error: err.message
        });
    }
};

// Get recruiter-posted jobs (active jobs only for job seekers)
const getRecruiterPostedJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, location, experience, jobType, workMode } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query - only show active recruiter-posted jobs
        const query = {
            source: 'recruiter',
            status: 'active'
        };

        // Add search and filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (experience) {
            query.experience = { $regex: experience, $options: 'i' };
        }

        if (jobType && jobType !== 'all') {
            query.jobType = jobType;
        }

        if (workMode && workMode !== 'all') {
            query.workMode = workMode;
        }

        const jobs = await Job.find(query)
            .select('-__v')
            .populate('postedBy', 'name company')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching recruiter posted jobs",
            error: error.message
        });
    }
};

// Get all jobs from all sources (for job seeker dashboard)
const getAllJobs = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, location, experience, jobType, workMode, source } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let allJobs = [];

        // Determine which sources to fetch from
        const sources = source ? [source] : ['telegram', 'timesjob', 'recruiter'];

        // Fetch from selected sources
        if (sources.includes('telegram')) {
            const telegramQuery = {};
            if (search) {
                telegramQuery.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { text: { $regex: search, $options: 'i' } }
                ];
            }
            if (location) telegramQuery.location = { $regex: location, $options: 'i' };
            if (experience) telegramQuery.experience = { $regex: experience, $options: 'i' };

            const telegramJobs = await mongoose.connection.db.collection("telegram")
                .find(telegramQuery)
                .toArray();
            allJobs = allJobs.concat(telegramJobs.map(j => ({ ...j, source: 'telegram' })));
        }

        if (sources.includes('timesjob')) {
            const timesQuery = {};
            if (search) {
                timesQuery.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            if (location) timesQuery.location = { $regex: location, $options: 'i' };
            if (experience) timesQuery.experience = { $regex: experience, $options: 'i' };
            if (jobType && jobType !== 'all') timesQuery.jobType = { $regex: jobType, $options: 'i' };

            const timesJobs = await mongoose.connection.db.collection("timesjob")
                .find(timesQuery)
                .toArray();
            allJobs = allJobs.concat(timesJobs.map(j => ({ ...j, source: 'timesjob' })));
        }

        if (sources.includes('recruiter')) {
            const recruiterQuery = { source: 'recruiter', status: 'active' };
            if (search) {
                recruiterQuery.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            if (location) recruiterQuery.location = { $regex: location, $options: 'i' };
            if (experience) recruiterQuery.experience = { $regex: experience, $options: 'i' };
            if (jobType && jobType !== 'all') recruiterQuery.jobType = jobType;
            if (workMode && workMode !== 'all') recruiterQuery.workMode = workMode;

            const recruiterJobs = await Job.find(recruiterQuery).lean();
            allJobs = allJobs.concat(recruiterJobs);
        }

        // Sort by creation date (newest first)
        allJobs.sort((a, b) => {
            const dateA = a.createdAt || a.created_at || new Date(0);
            const dateB = b.createdAt || b.created_at || new Date(0);
            return new Date(dateB) - new Date(dateA);
        });

        // Apply pagination
        const total = allJobs.length;
        const paginatedJobs = allJobs.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            jobs: paginatedJobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching all jobs",
            error: error.message
        });
    }
};

module.exports = { getTelegramJobs, getTimesJobs, getRecruiterPostedJobs, getAllJobs };
const express = require("express");
const { getTelegramJobs, getTimesJobs, getRecruiterPostedJobs, getAllJobs } = require("../controllers/jobController");

const router = express.Router();

/**
 * @swagger
 * /api/v1/jobs/telegram:
 *   get:
 *     summary: Get Telegram jobs with pagination and filters
 *     tags: [Jobs]
 */
router.get("/telegram", getTelegramJobs);

/**
 * @swagger
 * /api/v1/jobs/times:
 *   get:
 *     summary: Get TimesJob portal jobs with pagination and filters
 *     tags: [Jobs]
 */
router.get("/times", getTimesJobs);

/**
 * @swagger
 * /api/v1/jobs/recruiter:
 *   get:
 *     summary: Get recruiter-posted jobs (active only)
 *     tags: [Jobs]
 */
router.get("/recruiter", getRecruiterPostedJobs);

/**
 * @swagger
 * /api/v1/jobs/all:
 *   get:
 *     summary: Get all jobs from all sources
 *     tags: [Jobs]
 */
router.get("/all", getAllJobs);

module.exports = router;
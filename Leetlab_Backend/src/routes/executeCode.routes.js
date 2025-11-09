import express from "express";
import { executeCode } from "../controllers/executeCode.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/v1/execute-code
router.post("/", authMiddleware, executeCode);

export default router;

import { Submission } from "../models/submission.model.js";

export const getAllSubmission = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id });
    res.status(200).json({ success: true, message: "Submissions fetched successfully", submissions });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const submissions = await Submission.find({ userId: req.user.id, problemId });
    res.status(200).json({ success: true, message: "Submissions fetched successfully", submissions });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const count = await Submission.countDocuments({ problemId });
    res.status(200).json({ success: true, message: "Submissions Fetched successfully", count });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

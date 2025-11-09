import { Problem } from "../models/problem.model.js";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  const {
    title, description, difficulty, tags, examples,
    constraints, testcases, codeSnippets, referenceSolutions,
  } = req.body;

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions || {})) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) return res.status(400).json({ error: `Language ${language} is not supported` });

      const submissions = (testcases || []).map(({ input, output }) => ({
        source_code: solutionCode, language_id: languageId, stdin: input, expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((r) => r.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        if (results[i].status.id !== 3) {
          return res.status(400).json({ error: `Testcase ${i + 1} failed for language ${language}` });
        }
      }
    }

    const newProblem = await Problem.create({
      title, description, difficulty, tags, examples, constraints, testcases, codeSnippets,
      referenceSolutions, user: req.user._id,
    });

    res.status(201).json({ success: true, message: "Problem Created Successfully", problem: newProblem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error While Creating Problem" });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json({ success: true, message: "Problems Fetched Successfully", problems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error While Fetching Problems" });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.status(200).json({ success: true, message: "Problem fetched successfully", problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error While Fetching Problem by ID" });
  }
};

export const updateProblem = async (req, res) => {
  const {
    title, description, difficulty, tags, examples,
    constraints, testcases, codeSnippets, referenceSolutions,
  } = req.body;

  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found." });

    if (referenceSolutions) {
      for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const languageId = getJudge0LanguageId(language);
        if (!languageId) return res.status(400).json({ error: `Language ${language} is not supported` });

        const submissions = (testcases || problem.testcases || []).map(({ input, output }) => ({
          source_code: solutionCode, language_id: languageId, stdin: input, expected_output: output,
        }));

        const submissionResults = await submitBatch(submissions);
        const tokens = submissionResults.map((r) => r.token);
        const results = await pollBatchResults(tokens);

        for (let i = 0; i < results.length; i++) {
          if (results[i].status.id !== 3) {
            return res.status(400).json({ error: `Testcase ${i + 1} failed for language ${language}` });
          }
        }
      }
    }

    problem.title = title ?? problem.title;
    problem.description = description ?? problem.description;
    problem.difficulty = difficulty ?? problem.difficulty;
    problem.tags = tags ?? problem.tags;
    problem.examples = examples ?? problem.examples;
    problem.constraints = constraints ?? problem.constraints;
    problem.testcases = testcases ?? problem.testcases;
    problem.codeSnippets = codeSnippets ?? problem.codeSnippets;
    problem.referenceSolutions = referenceSolutions ?? problem.referenceSolutions;

    await problem.save();
    res.status(200).json({ success: true, message: "Problem updated successfully", problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while updating the problem" });
  }
};

// Get all problems solved by the logged-in user
export const getAllProblemsSolvedByUser = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware

    // Assuming your Problem schema has a `solvedBy` array of { user: ObjectId }
    const problems = await Problem.find({ "solvedBy.user": userId }).populate({
      path: "solvedBy.user",
      select: "name email",
    });

    res.status(200).json({
      success: true,
      message: "Problems solved by user fetched successfully",
      problems,
    });
  } catch (error) {
    console.error("Error fetching problems solved by user:", error);
    res.status(500).json({ error: "Failed to fetch problems solved by user" });
  }
};


export const deleteProblem = async (req, res) => {
  try {
    const deleted = await Problem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Problem Not found" });
    res.status(200).json({ success: true, message: "Problem deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error While deleting the problem" });
  }
};

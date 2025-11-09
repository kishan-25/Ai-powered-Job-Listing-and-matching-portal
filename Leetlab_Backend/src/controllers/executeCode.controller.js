import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { Submission } from "../models/submission.model.js";
import { TestCaseResult } from "../models/testCaseResult.model.js";
import { ProblemSolved } from "../models/problemSolved.model.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(stdin) || stdin.length === 0 ||
        !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
      return res.status(400).json({ error: "Invalid or Missing test cases" });
    }

    const submissions = stdin.map((input) => ({ source_code, language_id, stdin: input }));
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((r) => r.token);
    const results = await pollBatchResults(tokens);

    let allPassed = true;
    const detailed = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected = expected_outputs[i]?.trim();
      const passed = stdout === expected;
      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    const submission = await Submission.create({
      userId,
      problemId,
      sourceCode: source_code,
      language: getLanguageName(language_id),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detailed.map((r) => r.stdout)),
      stderr: detailed.some((r) => r.stderr) ? JSON.stringify(detailed.map((r) => r.stderr)) : null,
      compileOutput: detailed.some((r) => r.compile_output) ? JSON.stringify(detailed.map((r) => r.compile_output)) : null,
      status: allPassed ? "Accepted" : "Wrong Answer",
      memory: detailed.some((r) => r.memory) ? JSON.stringify(detailed.map((r) => r.memory)) : null,
      time: detailed.some((r) => r.time) ? JSON.stringify(detailed.map((r) => r.time)) : null,
    });

    if (allPassed) {
      await ProblemSolved.updateOne(
        { userId, problemId },
        { $setOnInsert: { userId, problemId } },
        { upsert: true }
      );
    }

    const testCaseDocs = detailed.map((r) => ({
      submissionId: submission._id,
      testCase: r.testCase,
      passed: r.passed,
      stdout: r.stdout,
      expected: r.expected,
      stderr: r.stderr,
      compileOutput: r.compile_output,
      status: r.status,
      memory: r.memory,
      time: r.time,
    }));
    await TestCaseResult.insertMany(testCaseDocs);

    const testCases = await TestCaseResult.find({ submissionId: submission._id });

    res.status(200).json({
      success: true,
      message: "Code Executed Successfully!",
      submission,
      testCases,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: "Failed to execute code" });
  }
};

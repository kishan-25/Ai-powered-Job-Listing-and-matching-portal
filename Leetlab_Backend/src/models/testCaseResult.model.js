import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    testCase: Number,
    passed: Boolean,
    stdout: String,
    expected: String,
    stderr: String,
    compileOutput: String,
    status: String,
    memory: String,
    time: String,
  },
  { timestamps: true }
);

export const TestCaseResult = mongoose.model("TestCaseResult", testCaseResultSchema);

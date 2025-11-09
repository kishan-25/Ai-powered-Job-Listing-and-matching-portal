import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    sourceCode: { type: String, required: true },
    language: { type: String, required: true },
    stdin: String,
    stdout: String,
    stderr: String,
    compileOutput: String,
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Runtime Error", "Compilation Error"],
      default: "Accepted",
    },
    memory: String,
    time: String,
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);

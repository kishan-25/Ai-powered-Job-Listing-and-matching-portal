import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true },
    tags: [String],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examples: Object,
    constraints: String,
    hints: String,
    editorial: String,
    testcases: Object,       // array or object based on your UI
    codeSnippets: Object,
    referenceSolutions: Object,
    // optional solvedBy if you want:
    solvedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        solvedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);

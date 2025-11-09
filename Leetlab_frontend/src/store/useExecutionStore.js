import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useExecutionStore = create((set) => ({
  isExecuting: false,
  submission: null,

  executeCode: async (source_code, language_id, stdin, expected_outputs, problemId) => {
    try {
      set({ isExecuting: true });

      console.log(
        "Submission:",
        JSON.stringify({
          source_code,
          language_id,
          stdin,
          expected_outputs,
          problemId,
        })
      );

      const res = await axiosInstance.post("/execute-code", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId,
      });

      set({ submission: res.data.submission });

      toast.success(res.data.message || "✅ Code executed successfully!");
    } catch (error) {
      console.error("Error executing code", error);

      if (error.response) {
        if (error.response.status >= 500) {
          toast.error("⚠️ Code execution server is down, please try again later");
        } else {
          toast.error(error.response.data?.error || "❌ Failed to execute code");
        }
      } else if (error.request) {
        // No response from server (network issue / backend unreachable)
        toast.error("🌐 Cannot connect to server");
      } else {
        toast.error("❌ Unexpected error occurred");
      }
    } finally {
      set({ isExecuting: false });
    }
  },
}));

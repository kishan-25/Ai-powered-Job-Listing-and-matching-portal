"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { generateCoverLetter } from "@/services/coverLetterService";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";
import { trackJobApplication } from "@/services/applicationService";
import { getToken } from "@/services/authService";
import { useToast, ToastContainer } from "@/components/Toast";
import { Sidebar } from "@/components/ui/Sidebar";

// Loading component for Suspense fallback
function LoadingState() {
  return <div className="p-6">Loading job details...</div>;
}

// Main component wrapped in Suspense
function ApplyPageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const source = searchParams.get("source");

  const { user } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationTracking, setApplicationTracking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    const getJobById = async () => {
      try {
        const res =
          source === "times" ? await fetchTimesJobs() : await fetchTelegramJobs();
        const foundJob = res.jobs.find((j) => j._id === jobId);
        setJob(foundJob);
      } catch (err) {
        showError("Failed to load job details. Please try again.");
      }
    };

    if (jobId && source) getJobById();
  }, [jobId, source, showError]);

  const handleGenerateCoverLetter = async () => {
    if (!job) return;
    setLoading(true);
    setError("");

    // Use the token from localStorage first, fall back to user.token if available
    const token = getToken() || user?.token;
    
    if (!token) {
      showError("You must be logged in to generate a cover letter");
      setLoading(false);
      return;
    }

    const payload = {
      jobTitle: job.title,
      companyName: job.company,
      skills: user?.skills || [],
      experience: user?.experience || 1,
      userName: user?.name || "Your Name",
    };

    try {
      const letter = await generateCoverLetter(payload, token);
      setCoverLetter(letter);
      showSuccess("Cover letter generated successfully!");
    } catch (err) {
      console.error("Cover letter generation error:", err);
      // Use the specific error message from the service
      showError(err.message || "Error generating cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationTracking = async (applied) => {
    setApplicationTracking(true);
    
    try {
      const token = getToken();
      if (!token) {
        showError("You must be logged in to track your application");
        return;
      }

      await trackJobApplication({
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        applied: applied,
        source: source,
        applicationDate: new Date().toISOString()
      });

      setHasApplied(applied);
      showSuccess("Application status updated successfully!");
    } catch (err) {
      console.error("Application tracking error:", err);
      showError("Failed to track your application status");
    } finally {
      setApplicationTracking(false);
    }
  };

  const handleApplyNow = () => {
    // Open the job application link in a new tab
    if (job && job.apply_link) {
      window.open(job.apply_link, '_blank');
      
      // Show confirmation dialog after a short delay
      setTimeout(() => {
        setShowConfirmation(true);
      }, 2000); // Give user time to see the external site
    }
  };

  const handleConfirmApplication = (applied) => {
    setShowConfirmation(false);
    if (applied) {
      setHasApplied(true);
      handleApplicationTracking(true);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-background ml-[280px] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Job Application</h1>

      {!job ? (
        <p>Loading job details...</p>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">{job.title}</h2>
          <p className="text-card-foreground">{job.company}</p>
          <p className="text-muted-foreground">{job.location}</p>
          
          {job.apply_link && !hasApplied ? (
            <button
              onClick={handleApplyNow}
              className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary-hover transition-colors duration-200"
              disabled={applicationTracking}
            >
              Apply Now
            </button>
          ) : hasApplied ? (
            <div className="mt-4 p-3 bg-success/10 border border-success/20 text-success rounded-md font-medium">
              You have applied to this job
            </div>
          ) : null}
                  
          {job.description && <p className="mt-2">{job.description}</p>}

          <button
            onClick={handleGenerateCoverLetter}
            className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary-hover transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>

          {coverLetter && (
            <div className="mt-6 bg-primary/5 border border-primary/20 p-4 rounded-md whitespace-pre-wrap">
              <h3 className="text-lg font-semibold mb-3 text-card-foreground">Generated Cover Letter</h3>
              <p className="text-muted-foreground">{coverLetter}</p>
            </div>
          )}
        </div>
      )}

      {/* Application Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">?</span>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Application Status</h3>
              <p className="text-muted-foreground mb-6">
                Have you completed your application for this job?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirmApplication(true)}
                  className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors duration-200 font-semibold"
                  disabled={applicationTracking}
                >
                  {applicationTracking ? "Tracking..." : "Yes, I Applied"}
                </button>
                <button
                  onClick={() => handleConfirmApplication(false)}
                  className="flex-1 bg-muted text-foreground py-3 px-4 rounded-lg hover:bg-muted-foreground/20 transition-colors duration-200 font-semibold"
                >
                  Not Yet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
    </>
  );
}

// Main component export
export default function ApplyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ApplyPageContent />
    </Suspense>
  );    
}
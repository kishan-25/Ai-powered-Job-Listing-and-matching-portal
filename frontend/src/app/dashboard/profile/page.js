"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserApplications } from "@/services/applicationService";
import RoleGuard from "@/components/RoleGuard";
import { useToast, ToastContainer } from "@/components/Toast";
import { Sidebar } from "@/components/ui/Sidebar";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    const fetchUserApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserApplications();
        console.log("Fetched applications data:", data); // Debug log

        // Handle different response structures
        const apps = data?.applications || data || [];
        setApplications(Array.isArray(apps) ? apps : []);

        if (Array.isArray(apps) && apps.length > 0) {
          showSuccess(`Loaded ${apps.length} application${apps.length > 1 ? 's' : ''} successfully!`);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        // Provide more specific error messages
        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          showError("Authentication failed. Please log in again.");
        } else if (err.response?.status === 404) {
          setError("");
          showWarning("No applications found. Start applying to jobs to see them here!");
        } else if (err.response?.status >= 500) {
          setError("Server error. Please try again later.");
          showError("Server error. Please try again later.");
        } else {
          setError("Failed to load your applications. Please try again.");
          showError("Failed to load your applications. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <RoleGuard allowedRoles={['job_seeker']}>
      <Sidebar />
      <div className="min-h-screen bg-background ml-[280px] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">My Profile</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'applications' ? 'border-b-2 border-primary text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('applications')}
          >
            Applied Jobs
          </button>
        </div>
        
        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">Personal Information</h2>
              <Link href="/dashboard/profile/edit">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover transition-colors duration-200">
                  Edit Profile
                </button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground text-sm">Name</p>
                <p className="font-medium">{user?.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium">{user?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Role</p>
                <p className="font-medium">{user?.role || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Experience</p>
                <p className="font-medium">{user?.experience || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Location</p>
                <p className="font-medium">{user?.location || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Education</p>
                <p className="font-medium">{user?.education || "Not provided"}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-muted-foreground text-sm">About Me</p>
              <p className="font-medium">{user?.aboutMe || "Not provided"}</p>
            </div>
            
            <div className="mt-6">
              <p className="text-muted-foreground text-sm">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-sm text-primary">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills provided</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-muted-foreground text-sm">Professional Links</p>
              <div className="mt-2 space-y-2">
                {user?.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-black hover:text-card-foreground font-medium block">
                    GitHub
                  </a>
                )}
                {user?.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-black hover:text-card-foreground font-medium block">
                    LinkedIn
                  </a>
                )}
                {user?.portfolio && (
                  <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-black hover:text-card-foreground font-medium block">
                    Portfolio
                  </a>
                )}
                {!user?.github && !user?.linkedin && !user?.portfolio && (
                  <p>No professional links provided</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Applied Jobs Tab */}
        {activeTab === 'applications' && (
          <div className="bg-card border border-border rounded-xl p-6 shadow">
            <h2 className="text-2xl font-semibold mb-6 text-card-foreground">Applied Jobs</h2>
            
            {loading ? (
              <p>Loading your applications...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You havenot applied to any jobs yet.</p>
                <Link href="/dashboard/jobs">
                  <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover transition-colors duration-200">
                    Browse Jobs
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{app.title}</h3>
                        <p className="text-card-foreground">{app.company}</p>
                        <p className="text-muted-foreground text-sm">{app.location}</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Applied on: {new Date(app.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-success/10 border border-success/20 text-success px-3 py-1 rounded-full text-sm font-semibold">
                        Applied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </RoleGuard>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserApplications } from "@/services/applicationService";
import AuthGuard from "@/utils/authGuard";
import { useToast, ToastContainer } from "@/components/Toast";
import Navbar from "@/components/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import DashboardNav from "@/components/DashboardNav";
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
      try {
        const data = await getUserApplications();
        setApplications(data.applications || []);
        if (data.applications && data.applications.length > 0) {
          showSuccess(`Loaded ${data.applications.length} applications successfully!`);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        // Provide more specific error messages
        if (err.response?.status === 401) {
          showError("Authentication failed. Please log in again.");
        } else if (err.response?.status === 404) {
          showWarning("No applications found. Start applying to jobs to see them here!");
        } else if (err.response?.status >= 500) {
          showError("Server error. Please try again later.");
        } else {
          showError("Failed to load your applications. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserApplications();
  }, [showError, showSuccess, showWarning]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthGuard>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-gray-50 p-6 text-black">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Profile", href: null }
            ]} 
          />
          
          {/* Dashboard Navigation */}
          <DashboardNav />
          
          <h1 className="text-3xl font-bold mb-6 text-black">TalentAlign Profile</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-black text-black bg-lime-100' : 'text-gray-500 hover:text-black'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'applications' ? 'border-b-2 border-black text-black bg-lime-100' : 'text-gray-500 hover:text-black'}`}
            onClick={() => setActiveTab('applications')}
          >
            Applied Jobs
          </button>
        </div>
        
        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">Personal Information</h2>
              <Link href="/dashboard/profile/edit">
                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200">
                  Edit Profile
                </button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-medium">{user?.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{user?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="font-medium">{user?.role || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="font-medium">{user?.experience || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-medium">{user?.location || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Education</p>
                <p className="font-medium">{user?.education || "Not provided"}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">About Me</p>
              <p className="font-medium">{user?.aboutMe || "Not provided"}</p>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="bg-lime-100 border border-lime-200 px-3 py-1 rounded-full text-sm text-gray-800">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills provided</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">Professional Links</p>
              <div className="mt-2 space-y-2">
                {user?.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 font-medium block">
                    GitHub
                  </a>
                )}
                {user?.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 font-medium block">
                    LinkedIn
                  </a>
                )}
                {user?.portfolio && (
                  <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 font-medium block">
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
          <div className="bg-white border rounded-xl p-6 shadow">
            <h2 className="text-2xl font-semibold mb-6 text-black">Applied Jobs</h2>
            
            {loading ? (
              <p>Loading your applications...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">You havenot applied to any jobs yet.</p>
                <Link href="/dashboard/jobs">
                  <button className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200">
                    Browse Jobs
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-lime-300 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{app.title}</h3>
                        <p className="text-gray-700">{app.company}</p>
                        <p className="text-gray-600 text-sm">{app.location}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Applied on: {new Date(app.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-lime-100 border border-lime-200 text-gray-800 px-3 py-1 rounded-full text-sm">
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
    </AuthGuard>
  );
}
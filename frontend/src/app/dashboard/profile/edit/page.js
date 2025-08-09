"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import AuthGuard from "@/utils/authGuard";
import { getToken } from "@/services/authService";
import axios from "axios";
import { loginSuccess } from "@/redux/slices/authSlice";
import Navbar from "@/components/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import DashboardNav from "@/components/DashboardNav";


export default function EditProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
    experience: user?.experience || "",
    education: user?.education || "",
    location: user?.location || "",
    aboutMe: user?.aboutMe || "",
    skills: user?.skills?.join(", ") || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    portfolio: user?.portfolio || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      if (!token) {
        setError("You must be logged in to update your profile");
        setLoading(false);
        return;
      }

      // Convert comma-separated skills to array
      const processedData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(",").map(skill => skill.trim()).filter(Boolean) : []
      };

      console.log("Updating profile with data:", processedData);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.put(
        "http://localhost:5000/api/v1/auth/profile", 
        processedData, 
        config
      );

      console.log("Profile update response:", response.data);

      // Update user in Redux state
      if (response.data.success) {
        dispatch(loginSuccess({
          ...user,
          ...processedData
        }));
        
        // Also update in localStorage if you're storing user data there
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          userData.user = {
            ...userData.user,
            ...processedData
          };
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        setSuccess("Profile updated successfully!");
        
        // Redirect back to profile page after brief delay
        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 1500);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid profile data. Please check your inputs.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthGuard>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-gray-50 p-6 text-black">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Profile", href: "/dashboard/profile" },
              { label: "Edit Profile", href: null }
            ]} 
          />
          
          {/* Dashboard Navigation */}
          <DashboardNav />
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-black">Edit Profile</h1>
            <button 
              onClick={() => router.push("/dashboard/profile")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Back to Profile
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-lime-50 border border-lime-200 text-green-800 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 shadow-lg">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              >
                <option value="">Select a role</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Researcher">Researcher</option>
                <option value="Full Stack Developer | Researcher | Software Engineer">
                  Full Stack Developer | Researcher | Software Engineer
                </option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="experience">
                Experience (Years)
              </label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="education">
                Education
              </label>
              <input
                type="text"
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="location">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="skills">
                Skills (comma separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
                placeholder="React, Node.js, JavaScript"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="github">
                GitHub URL
              </label>
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="linkedin">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="portfolio">
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="aboutMe">
              About Me
            </label>
            <textarea
              id="aboutMe"
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors duration-200"
            ></textarea>
          </div>
          
          <div className="mt-6">
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2 transition-colors duration-200 font-medium"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/profile")}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
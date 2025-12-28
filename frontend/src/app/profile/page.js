"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import AuthGuard from "@/utils/authGuard";
import axios from "axios";
import { getToken, getUserFromLocalStorage } from "@/services/authService";
import { API_BASE_URL } from "@/config/api";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const userData = user || getUserFromLocalStorage();
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    skills: [],
    experience: "",
    role: "Software Engineer",
    education: "",
    location: "",
    aboutMe: "",
    projects: [],
    linkedin: "",
    github: "",
    portfolio: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userData) {
      setFormData({
        skills: userData.skills || [],
        experience: userData.experience || "",
        role: userData.role || "Software Engineer",
        education: userData.education || "",
        location: userData.location || "",
        aboutMe: userData.aboutMe || "",
        projects: userData.projects || [],
        linkedin: userData.linkedin || "",
        github: userData.github || "",
        portfolio: userData.portfolio || ""
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addProject = () => {
    if (projectInput.trim() && !formData.projects.includes(projectInput.trim())) {
      setFormData({
        ...formData,
        projects: [...formData.projects, projectInput.trim()]
      });
      setProjectInput("");
    }
  };

  const removeProject = (projectToRemove) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(project => project !== projectToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = getToken();
    
    if (!token) {
      setError("Authentication error. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/auth/me`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update the user data in Redux and localStorage
        const updatedUser = {
          ...userData,
          ...response.data.user
        };
        
        dispatch(loginSuccess(updatedUser));
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 text-black">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills Section */}
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-grow px-3 py-2 border rounded-l"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1">Current Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium mb-1">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. B.Tech in Computer Science"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Delhi, India"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* About Me */}
            <div>
              <label className="block text-sm font-medium mb-1">About Me</label>
              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                rows="4"
                placeholder="Write a short bio about yourself"
                className="w-full px-3 py-2 border rounded"
              ></textarea>
            </div>

            {/* Projects */}
            <div>
              <label className="block text-sm font-medium mb-1">Projects</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Add a project"
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  className="flex-grow px-3 py-2 border rounded-l"
                />
                <button
                  type="button"
                  onClick={addProject}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {formData.projects.map((project, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{project}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(project)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Portfolio URL</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
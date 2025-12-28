"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import { registerUser } from "@/services/authService";
import { parseResume } from "@/services/resumeService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Briefcase, Building2, ChevronRight, ChevronLeft, Check, Upload } from "lucide-react";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userRole: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [],
    experience: "",
    location: "",
    companyName: "",
    companyWebsite: "",
    phone: "",
    position: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useSelector((state) => state.auth);

  // Redirect already authenticated users
  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      // Redirect based on role
      if (user.userRole === 'admin') {
        router.push('/admin');
      } else if (user.userRole === 'recruiter') {
        router.push('/recruiter');
      } else {
        router.push('/dashboard');
      }
    }
  }, [hydrated, isAuthenticated, user, router]);

  const totalSteps = 3;

  // Show loading state while checking auth
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show nothing (will redirect via useEffect)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, userRole: role }));
    setTimeout(() => setCurrentStep(2), 300);
  };

  const addSkill = (e) => {
    e?.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setResumeFile(file);
    setParsingResume(true);
    const loadingToast = toast.loading('Extracting information from resume...');

    try {
      console.log('Starting resume parsing for file:', file.name);
      const result = await parseResume(file);
      console.log('Resume parsing result:', result);

      // Check if we got valid data (either result.success or result.skills exists)
      if (result && (result.success || result.skills)) {
        // Extract skills, experience, and location from parsed resume
        const extractedSkills = result.skills || [];
        const extractedExperience = result.yearOfExperience || result.experience || '';
        const extractedLocation = result.location || result.contact?.location || '';

        console.log('Extracted data:', { extractedSkills, extractedExperience, extractedLocation });

        // Update form data with extracted information
        if (extractedSkills.length > 0) {
          setFormData(prev => ({
            ...prev,
            skills: extractedSkills,
            experience: extractedExperience?.toString() || prev.experience,
            location: extractedLocation || prev.location
          }));

          toast.dismiss(loadingToast);
          toast.success(`Resume parsed! Extracted ${extractedSkills.length} skills. Review and edit as needed.`);
        } else {
          toast.dismiss(loadingToast);
          toast.error('No skills found in resume. Please fill in manually.');
        }
      } else {
        toast.dismiss(loadingToast);
        console.error('Resume parsing failed:', result.message || 'Invalid response');
        toast.error(result.message || 'Failed to parse resume');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Resume parsing error:', error);
      console.error('Error details:', error.response?.data || error.message);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to extract information from resume';
      toast.error(`${errorMessage}. Please fill in manually.`);
    } finally {
      setParsingResume(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.userRole) {
          toast.error("Please select your role");
          return false;
        }
        return true;

      case 2:
        if (!formData.name.trim()) {
          toast.error("Name is required");
          return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          toast.error("Valid email is required");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return false;
        }
        return true;

      case 3:
        if (formData.userRole === "recruiter") {
          if (!formData.companyName.trim()) {
            toast.error("Company name is required");
            return false;
          }
          if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setIsNavigating(true);
        setCurrentStep(currentStep + 1);
        // Reset the navigation flag after a short delay
        setTimeout(() => setIsNavigating(false), 100);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent submission if we're currently navigating between steps
    if (isNavigating) {
      return;
    }

    // CRITICAL: Only allow submission on final step (step 3)
    if (currentStep !== 3) {
      nextStep();
      return;
    }

    // Only proceed with actual registration on final step (step 3)
    if (!validateStep(currentStep)) return;

    setLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userRole: formData.userRole
      };

      if (formData.userRole === "job_seeker") {
        registrationData.skills = formData.skills;
        registrationData.experience = formData.experience || "0";
        registrationData.location = formData.location;
      } else if (formData.userRole === "recruiter") {
        registrationData.companyName = formData.companyName;
        registrationData.companyWebsite = formData.companyWebsite;
        registrationData.phone = formData.phone;
        registrationData.position = formData.position;
      }

      const data = await registerUser(registrationData);

      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Account created successfully!");
        dispatch(loginSuccess(data));

        if (formData.userRole === "recruiter") {
          router.push("/recruiter");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      if (error.response?.data?.message) {
        if (error.response.data.message.toLowerCase().includes("already exists")) {
          toast.error("This email is already registered. Please log in instead.");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Toaster position="top-center" />

      <div className="max-w-2xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join TalentAlign</h1>
          <p className="text-gray-600">Create your account in just a few steps</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step
                        ? "bg-primary text-white"
                        : currentStep === step
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        currentStep > step ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span className={currentStep >= 1 ? "font-semibold" : ""}>Choose Role</span>
              <span className={currentStep >= 2 ? "font-semibold" : ""}>Basic Info</span>
              <span className={currentStep >= 3 ? "font-semibold" : ""}>
                {formData.userRole === "recruiter" ? "Company Details" : "Profile Details"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={(e) => {
            // Prevent Enter key from submitting form unless on final step
            if (e.key === 'Enter' && currentStep !== 3) {
              e.preventDefault();
            }
          }}>
            {/* Step Content */}
            <div className="min-h-[400px]">
              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
                    <p className="text-gray-600">Select how you want to use TalentAlign</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("job_seeker")}
                      className={`p-8 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                        formData.userRole === "job_seeker"
                          ? "border-primary bg-primary/5 shadow-lg scale-105"
                          : "border-gray-200 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                          <Briefcase size={32} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Job Seeker</h3>
                          <p className="text-gray-600 text-sm">
                            Find your dream job with AI-powered matching
                          </p>
                        </div>
                        <ul className="text-left text-sm text-gray-600 space-y-2">
                          <li className="flex items-center">
                            <Check size={16} className="text-primary mr-2" />
                            Browse job opportunities
                          </li>
                          <li className="flex items-center">
                            <Check size={16} className="text-primary mr-2" />
                            AI-powered job matching
                          </li>
                          <li className="flex items-center">
                            <Check size={16} className="text-primary mr-2" />
                            Track applications
                          </li>
                        </ul>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect("recruiter")}
                      className={`p-8 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                        formData.userRole === "recruiter"
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                          <Building2 size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Recruiter</h3>
                          <p className="text-gray-600 text-sm">
                            Post jobs and find the perfect candidates
                          </p>
                        </div>
                        <ul className="text-left text-sm text-gray-600 space-y-2">
                          <li className="flex items-center">
                            <Check size={16} className="text-blue-500 mr-2" />
                            Post unlimited jobs
                          </li>
                          <li className="flex items-center">
                            <Check size={16} className="text-blue-500 mr-2" />
                            Manage applications
                          </li>
                          <li className="flex items-center">
                            <Check size={16} className="text-blue-500 mr-2" />
                            Find top talent
                          </li>
                        </ul>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Basic Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                    <p className="text-gray-600">Tell us about yourself</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Job Seeker Details */}
              {currentStep === 3 && formData.userRole === "job_seeker" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                    <p className="text-gray-600">Help us match you with the right opportunities</p>
                  </div>

                  {/* Resume Upload Section */}
                  <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-xl p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-primary mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Your Resume (Optional)
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        We'll automatically extract your skills, experience, and location
                      </p>
                      <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                        <Upload size={18} className="mr-2" />
                        {resumeFile ? 'Change Resume' : 'Choose Resume'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          disabled={parsingResume}
                          className="hidden"
                        />
                      </label>
                      {resumeFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: <span className="font-semibold">{resumeFile.name}</span>
                        </p>
                      )}
                      {parsingResume && (
                        <div className="text-sm text-primary mt-2 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Parsing resume...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or fill manually</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Skills</label>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill(e)}
                        placeholder="e.g., JavaScript, React, Node.js"
                        className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-black text-white px-6 py-3 rounded-r-lg hover:bg-gray-800 transition-colors font-semibold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center text-sm text-primary"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-gray-500 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., New York, NY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Recruiter Details */}
              {currentStep === 3 && formData.userRole === "recruiter" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
                    <p className="text-gray-600">Tell us about your company</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company Website</label>
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g., HR Manager, Talent Acquisition"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {currentStep > 1 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Back
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                  >
                    Next
                    <ChevronRight size={20} className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                      formData.userRole === "recruiter"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-primary hover:bg-primary-hover text-white"
                    } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                    <Check size={20} className="ml-1" />
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-black hover:text-gray-700 font-semibold underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

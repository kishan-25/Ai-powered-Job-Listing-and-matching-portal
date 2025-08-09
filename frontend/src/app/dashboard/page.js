"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/slices/authSlice";
import AuthGuard from "@/utils/authGuard";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";
import { calculateJobSkillMatch, getMatchColor, getMatchStrength } from "@/utils/jobMatching";
import { getUserFromLocalStorage } from "@/services/authService";
import Navbar from "@/components/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import DashboardNav from "@/components/DashboardNav";

export default function DashboardPage() {
    const [telegramJobs, setTelegramJobs] = useState([]);
    const [timesJobs, setTimesJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("times");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    
    // Pagination state
    const [currentTelegramPage, setCurrentTelegramPage] = useState(1);
    const [currentTimesPage, setCurrentTimesPage] = useState(1);
    const jobsPerPage = 6;
    
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    
    // Get user data from local storage if not in redux state
    const userData = user || getUserFromLocalStorage();

    const handleLogout = () => {
        dispatch(logout());
        router.push("/");
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Pagination functions
    const getCurrentPageJobs = (jobs, currentPage) => {
        const indexOfLastJob = currentPage * jobsPerPage;
        const indexOfFirstJob = indexOfLastJob - jobsPerPage;
        return jobs.slice(indexOfFirstJob, indexOfLastJob);
    };

    const getTotalPages = (jobs) => {
        return Math.ceil(jobs.length / jobsPerPage);
    };

    const handlePageChange = (pageNumber, jobType) => {
        if (jobType === 'telegram') {
            setCurrentTelegramPage(pageNumber);
        } else {
            setCurrentTimesPage(pageNumber);
        }
    };

    // Using correct job skill matching logic
    useEffect(() => {
        const getJobs = async () => {
            setLoading(true);
            try {
                const telegramRes = await fetchTelegramJobs();
                const timesRes = await fetchTimesJobs();

                if (telegramRes.success) {
                    // Calculate skill match for telegram jobs
                    const jobsWithMatch = telegramRes.jobs.map(job => {
                        // Get key skills from job text if possible
                        const jobSkills = job.keySkills || '';
                        
                        const matchResult = calculateJobSkillMatch(
                            userData?.skills || [], 
                            job.text || "",
                            job.title || "",
                            jobSkills
                        );
                        
                        return {
                            ...job,
                            matchPercentage: matchResult.matchPercentage,
                            matchStrength: getMatchStrength(matchResult.matchPercentage),
                            skillsNotMatched: matchResult.skillsNotMatched
                        };
                    });
                    
                    // Filter out jobs with 0% match and sort remaining by match percentage
                    const filteredJobs = jobsWithMatch.filter(job => job.matchPercentage > 0);
                    setTelegramJobs(filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage));
                }
                
                if (timesRes.success) {
                    // Calculate skill match for times jobs
                    const jobsWithMatch = timesRes.jobs.map(job => {
                        const matchResult = calculateJobSkillMatch(
                            userData?.skills || [], 
                            job.description || "",
                            job.title || "",
                            job.keySkills || ""
                        );
                        
                        return {
                            ...job,
                            matchPercentage: matchResult.matchPercentage,
                            matchStrength: getMatchStrength(matchResult.matchPercentage),
                            skillsNotMatched: matchResult.skillsNotMatched
                        };
                    });
                    
                    // Filter out jobs with 0% match and sort remaining by match percentage
                    const filteredJobs = jobsWithMatch.filter(job => job.matchPercentage > 0);
                    setTimesJobs(filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage));
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
                setError("Failed to load jobs. Please try again later.");
                setLoading(false);
            }
        };

        if (userData) {
            getJobs();
        }
    }, [userData]);

    const renderJobCard = (job, source) => {
        return (
            <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-lime-300">
                <div className="flex justify-between">
                    <h3 className="font-semibold text-lg text-black">{job.title || "No title"}</h3>
                    <div className="flex flex-col items-end">
                        <div className={`${getMatchColor(job.matchPercentage)} font-bold text-lg`}>
                            {job.matchPercentage}% Match
                        </div>
                        <div className="text-sm text-gray-500">
                            {job.matchStrength} match
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-700 mt-2">{job.company || "Unknown company"}</p>
                
                {job.location && <p className="text-gray-600 mt-1"> {job.location}</p>}
                
                {/* Display skills not matched - skills in job description but not in user skills */}
                {job.skillsNotMatched && job.skillsNotMatched.length > 0 && (
                    <div className="mt-2">
                        <p className="text-sm font-medium text-orange-600">Skills not matched:</p>
                        <p className="text-sm text-gray-600">{job.skillsNotMatched.join(", ")}</p>
                    </div>
                )}
                
                {source === "times" && job.keySkills && (
                    <div className="mt-2">
                        <p className="text-sm font-medium">Key Skills:</p>
                        <p className="text-sm text-gray-600">{job.keySkills}</p>
                    </div>
                )}
                
                {source === "telegram" && job.role && (
                    <div className="mt-2">
                        <p className="text-sm font-medium">Role:</p>
                        <p className="text-sm text-gray-600">{job.role}</p>
                    </div>
                )}
                
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => router.push(`/dashboard/apply?jobId=${job._id}&source=${source}`)}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        );
    };

    const renderPagination = (totalJobs, currentPage, jobType) => {
        const totalPages = getTotalPages(totalJobs);
        
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                    onClick={() => handlePageChange(currentPage - 1, jobType)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md ${
                        currentPage === 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-black hover:bg-lime-50 hover:border-lime-300'
                    } transition-colors duration-200`}
                >
                    Previous
                </button>
                
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number, jobType)}
                        className={`px-3 py-2 rounded-md ${
                            currentPage === number
                                ? 'bg-lime-300 text-black font-semibold'
                                : 'bg-white border border-gray-300 text-black hover:bg-lime-50 hover:border-lime-300'
                        } transition-colors duration-200`}
                    >
                        {number}
                    </button>
                ))}
                
                <button
                    onClick={() => handlePageChange(currentPage + 1, jobType)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md ${
                        currentPage === totalPages
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-black hover:bg-lime-50 hover:border-lime-300'
                    } transition-colors duration-200`}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <AuthGuard>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <div className="min-h-screen bg-gray-50 text-black">
                <header className="bg-lime-300 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-black">TalentAlign Dashboard</h1>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumb 
                        items={[
                            { label: "Dashboard", href: null }
                        ]} 
                    />
                    
                    {/* Dashboard Navigation */}
                    <DashboardNav />
                    
                    {/* Welcome section with user info */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
                        <h2 className="text-xl font-semibold text-black">Welcome, {userData?.name || "User"}!</h2>
                        <p className="mt-2 text-gray-600">
                            We have found jobs matching your skills: {userData?.skills?.join(", ") || "No skills added yet"}
                        </p>
                        {(!userData?.skills || userData.skills.length === 0) && (
                            <div className="mt-4 p-4 bg-lime-50 border border-lime-200 text-gray-800 rounded-md">
                                <p>Add skills to your profile to get better job matches!</p>
                                <button 
                                    onClick={() => router.push("/dashboard/profile")}
                                    className="mt-2 text-black hover:text-gray-700 font-medium"
                                >
                                    Update Profile
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Job tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab("telegram")}
                                    className={`${
                                        activeTab === "telegram"
                                            ? "border-black text-black bg-lime-100"
                                            : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
                                >
                                    Telegram Jobs
                                </button>
                                <button
                                    onClick={() => setActiveTab("times")}
                                    className={`${
                                        activeTab === "times"
                                            ? "border-black text-black bg-lime-100"
                                            : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
                                >
                                    Web Portals
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Job listings */}
                    {loading ? (
                        <div className="text-center py-10">Loading jobs...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">{error}</div>
                    ) : (
                        <>
                            {/* Jobs count and pagination info */}
                            <div className="mb-4 text-sm text-gray-600">
                                {activeTab === "telegram" ? (
                                    <>
                                        Showing {telegramJobs.length > 0 ? getCurrentPageJobs(telegramJobs, currentTelegramPage).length : 0} of {telegramJobs.length} Telegram jobs
                                        {telegramJobs.length > jobsPerPage && (
                                            <span className="ml-2">
                                                (Page {currentTelegramPage} of {getTotalPages(telegramJobs)})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        Showing {timesJobs.length > 0 ? getCurrentPageJobs(timesJobs, currentTimesPage).length : 0} of {timesJobs.length} Web Portal jobs
                                        {timesJobs.length > jobsPerPage && (
                                            <span className="ml-2">
                                                (Page {currentTimesPage} of {getTotalPages(timesJobs)})
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeTab === "telegram" && telegramJobs.length > 0 ? (
                                   getCurrentPageJobs(telegramJobs, currentTelegramPage).map((job) => (
                                    <div key={job._id || job.id}>
                                      {renderJobCard(job, "telegram")}
                                    </div>
                                  ))
                                ) : activeTab === "times" && timesJobs.length > 0 ? (
                                    getCurrentPageJobs(timesJobs, currentTimesPage).map((job) => (
                                        <div key={job._id || job.id}>
                                          {renderJobCard(job, "times")}
                                        </div>
                                      ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        No matching jobs found
                                    </div>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            {activeTab === "telegram" && telegramJobs.length > 0 && 
                                renderPagination(telegramJobs, currentTelegramPage, "telegram")
                            }
                            {activeTab === "times" && timesJobs.length > 0 && 
                                renderPagination(timesJobs, currentTimesPage, "times")
                            }
                        </>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/slices/authSlice";
import RoleGuard from "@/components/RoleGuard";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";
import { calculateJobSkillMatch, getMatchColor, getMatchStrength } from "@/utils/jobMatching";
import { getUserFromLocalStorage } from "@/services/authService";
import { Sidebar } from "@/components/ui/Sidebar";
import { StatsCard } from "@/components/ui/StatsCard";
import { JobCard } from "@/components/ui/JobCard";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Bookmark,
  TrendingUp,
  Search,
  Filter,
  MapPin,
  AlertCircle,
  Sparkles,
  Layers
} from "lucide-react";

export default function DashboardPage() {
    const [telegramJobs, setTelegramJobs] = useState([]);
    const [timesJobs, setTimesJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 12;

    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);

    // Get user data from local storage if not in redux state
    const userData = user || getUserFromLocalStorage();

    // Fetch jobs and calculate matches
    useEffect(() => {
        const getJobs = async () => {
            setLoading(true);
            try {
                const telegramRes = await fetchTelegramJobs();
                const timesRes = await fetchTimesJobs();

                let allFetchedJobs = [];

                if (telegramRes.success) {
                    const jobsWithMatch = telegramRes.jobs.map(job => {
                        const matchResult = calculateJobSkillMatch(
                            userData?.skills || [],
                            job.text || "",
                            job.title || "",
                            job.keySkills || ""
                        );

                        return {
                            ...job,
                            source: 'telegram',
                            matchPercentage: matchResult.matchPercentage,
                            matchStrength: getMatchStrength(matchResult.matchPercentage),
                            skillsNotMatched: matchResult.skillsNotMatched,
                            job_type: job.job_type || 'Full-time',
                            skills: job.keySkills?.split(',').map(s => s.trim()).filter(Boolean) || []
                        };
                    });

                    setTelegramJobs(jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage));
                    allFetchedJobs = [...allFetchedJobs, ...jobsWithMatch];
                }

                if (timesRes.success) {
                    const jobsWithMatch = timesRes.jobs.map(job => {
                        const matchResult = calculateJobSkillMatch(
                            userData?.skills || [],
                            job.description || "",
                            job.title || "",
                            job.keySkills || ""
                        );

                        return {
                            ...job,
                            source: 'times',
                            matchPercentage: matchResult.matchPercentage,
                            matchStrength: getMatchStrength(matchResult.matchPercentage),
                            skillsNotMatched: matchResult.skillsNotMatched,
                            text: job.description,
                            job_type: job.job_type || job.employmentType || 'Full-time',
                            skills: job.keySkills?.split(',').map(s => s.trim()).filter(Boolean) || []
                        };
                    });

                    setTimesJobs(jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage));
                    allFetchedJobs = [...allFetchedJobs, ...jobsWithMatch];
                }

                // Sort all jobs by match percentage
                const sortedJobs = allFetchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
                setAllJobs(sortedJobs);
                setFilteredJobs(sortedJobs);
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

    // Filter jobs based on search, location, and tab
    useEffect(() => {
        let jobsToFilter = allJobs;

        // Filter by tab
        if (activeTab === 'telegram') {
            jobsToFilter = telegramJobs;
        } else if (activeTab === 'times') {
            jobsToFilter = timesJobs;
        }

        // Filter by search query
        if (searchQuery) {
            jobsToFilter = jobsToFilter.filter(job =>
                (job.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (job.company?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (job.text?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by location
        if (locationFilter) {
            jobsToFilter = jobsToFilter.filter(job =>
                job.location?.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        setFilteredJobs(jobsToFilter);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchQuery, locationFilter, activeTab, allJobs, telegramJobs, timesJobs]);

    // Get stats
    const stats = [
        {
            title: "Total Jobs",
            value: allJobs.length.toString(),
            icon: Briefcase,
            trend: "up",
            trendValue: "+15%"
        },
        {
            title: "Perfect Matches",
            value: allJobs.filter(j => j.matchPercentage >= 80).length.toString(),
            icon: Sparkles,
            trend: "up",
            trendValue: `${Math.round((allJobs.filter(j => j.matchPercentage >= 80).length / allJobs.length) * 100) || 0}%`
        },
        {
            title: "Good Matches",
            value: allJobs.filter(j => j.matchPercentage >= 60 && j.matchPercentage < 80).length.toString(),
            icon: TrendingUp,
            trend: "neutral"
        },
        {
            title: "Saved Jobs",
            value: "0",
            icon: Bookmark,
            trend: "neutral"
        }
    ];

    // Pagination
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveJob = (job) => {
        console.log("Saved job:", job);
        // TODO: Implement save functionality
    };

    const handleApplyJob = (job) => {
        const source = job.source || 'telegram';
        router.push(`/dashboard/apply?jobId=${job._id}&source=${source}`);
    };

    return (
        <RoleGuard allowedRoles={['job_seeker']}>
            <div className="min-h-screen bg-background">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="ml-[280px] p-8 transition-all">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            Welcome Back, {userData?.name || "User"}! 👋
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Find your perfect job match today
                        </p>
                        {userData?.skills && userData.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-sm text-muted-foreground">Your skills:</span>
                                {userData.skills.slice(0, 5).map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {userData.skills.length > 5 && (
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                                        +{userData.skills.length - 5} more
                                    </span>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* No Skills Alert */}
                    {(!userData?.skills || userData.skills.length === 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-warning/10 border-l-4 border-warning rounded-lg p-6"
                        >
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No Skills Added Yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        You&apos;re currently viewing all jobs with <strong>0% match</strong>. Add your skills to see personalized job matches and get better recommendations!
                                    </p>
                                    <button
                                        onClick={() => router.push("/dashboard/profile/edit")}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                                    >
                                        Add Skills to Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <StatsCard
                                key={index}
                                {...stat}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card rounded-xl border border-border p-6 shadow-sm mb-8"
                    >
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search jobs, companies, keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                                />
                            </div>

                            {/* Location Filter */}
                            <div className="w-full md:w-64 relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                                />
                            </div>
                        </div>

                        {/* Tab Filters */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    activeTab === 'all'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                <Layers className="h-4 w-4" />
                                All Jobs ({allJobs.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('telegram')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    activeTab === 'telegram'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Telegram ({telegramJobs.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('times')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    activeTab === 'times'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Web Portals ({timesJobs.length})
                            </button>
                        </div>
                    </motion.div>

                    {/* Results Info */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">
                            {activeTab === 'all' ? 'All Jobs' : activeTab === 'telegram' ? 'Telegram Jobs' : 'Web Portal Jobs'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Showing {currentJobs.length} of {filteredJobs.length} jobs
                        </p>
                    </div>

                    {/* Jobs Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading jobs...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
                            <p className="text-error font-semibold">{error}</p>
                        </div>
                    ) : currentJobs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {currentJobs.map((job, index) => (
                                    <JobCard
                                        key={job._id || job.id || index}
                                        job={job}
                                        onSave={handleSaveJob}
                                        onApply={handleApplyJob}
                                        delay={0.5 + (index * 0.05)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            currentPage === 1
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary'
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-card border border-border text-foreground hover:bg-primary/10'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            currentPage === totalPages
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery || locationFilter
                                    ? "Try adjusting your search filters"
                                    : "Check back later for new opportunities"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}

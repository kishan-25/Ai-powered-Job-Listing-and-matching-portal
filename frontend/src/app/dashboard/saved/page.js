'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import RoleGuard from '@/components/RoleGuard';
import { Sidebar } from '@/components/ui/Sidebar';
import { getUserFromLocalStorage } from '@/services/authService';
import { calculateJobSkillMatch, getMatchColor, getMatchStrength } from '@/utils/jobMatching';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Bookmark, BookmarkX } from 'lucide-react';

export default function SavedJobsPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const userData = user || getUserFromLocalStorage();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/users/saved-jobs`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Calculate match for each job
        const jobsWithMatch = response.data.savedJobs.map(job => {
          const matchResult = calculateJobSkillMatch(
            userData?.skills || [],
            job.description || '',
            job.title || '',
            job.keySkills || ''
          );

          return {
            ...job,
            matchPercentage: matchResult.matchPercentage,
            matchStrength: getMatchStrength(matchResult.matchPercentage),
            skillsNotMatched: matchResult.skillsNotMatched
          };
        });

        setSavedJobs(jobsWithMatch);
      }
    } catch (error) {
      toast.error('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleUnsave = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/api/v1/users/saved-jobs/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Job removed from saved list');
      fetchSavedJobs();
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  return (
    <RoleGuard allowedRoles={['job_seeker']}>
      <Sidebar />
      <div className="min-h-screen bg-background ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bookmark className="text-primary" />
              Saved Jobs
            </h1>
            <p className="text-muted-foreground mt-1">Your bookmarked job opportunities</p>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading saved jobs...</div>
          ) : savedJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-6">
              <Bookmark className="mx-auto mb-4 text-gray-400" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Jobs Yet</h2>
              <p className="text-gray-600 mb-6">Start browsing jobs and save the ones you&apos;re interested in!</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {savedJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all border border-gray-200 hover:border-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-black mb-1">{job.title}</h3>
                      <p className="text-gray-700">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <div className={`${getMatchColor(job.matchPercentage)} font-bold text-lg`}>
                        {job.matchPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">{job.matchStrength}</div>
                    </div>
                  </div>

                  {job.location && (
                    <p className="text-sm text-gray-600 mb-2">📍 {job.location}</p>
                  )}

                  {job.keySkills && Array.isArray(job.keySkills) && job.keySkills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.keySkills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                            {skill}
                          </span>
                        ))}
                        {job.keySkills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-600">
                            +{job.keySkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => router.push(`/dashboard/apply?jobId=${job._id}&source=recruiter`)}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => handleUnsave(job._id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                      title="Remove from saved"
                    >
                      <BookmarkX size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

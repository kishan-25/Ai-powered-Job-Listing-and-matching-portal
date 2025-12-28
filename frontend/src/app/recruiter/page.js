'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import DashboardNav from '@/components/DashboardNav';
import Breadcrumb from '@/components/Breadcrumb';
import { getRecruiterStats, getRecruiterJobs, closeJob, deleteJob } from '@/services/recruiterService';
import toast from 'react-hot-toast';
import { Briefcase, Users, FileText, CheckCircle, XCircle, Edit, Trash2, PlusCircle } from 'lucide-react';

export default function RecruiterDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [statusFilter, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await getRecruiterStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Fetch jobs
      const filters = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const jobsResponse = await getRecruiterJobs(filters);
      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!confirm('Are you sure you want to close this job?')) return;

    try {
      const response = await closeJob(jobId);
      if (response.success) {
        toast.success('Job closed successfully');
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to close job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;

    try {
      const response = await deleteJob(jobId);
      if (response.success) {
        toast.success('Job deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete job');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RoleGuard allowedRoles={['recruiter']}>
      <DashboardNav />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Recruiter Dashboard</h1>
              <button
                onClick={() => router.push('/recruiter/jobs/new')}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                <PlusCircle size={20} />
                Post New Job
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: 'Recruiter Dashboard', href: null }]} />

          {/* Statistics Cards */}
          {loading && !stats ? (
            <div className="text-center py-10">Loading statistics...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
              {/* Total Jobs */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Jobs</p>
                    <p className="text-3xl font-bold text-black mt-2">{stats?.jobs?.total || 0}</p>
                  </div>
                  <Briefcase className="text-blue-500" size={40} />
                </div>
              </div>

              {/* Active Jobs */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Jobs</p>
                    <p className="text-3xl font-bold text-black mt-2">{stats?.jobs?.active || 0}</p>
                  </div>
                  <CheckCircle className="text-green-500" size={40} />
                </div>
              </div>

              {/* Total Applications */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Applications</p>
                    <p className="text-3xl font-bold text-black mt-2">{stats?.applications?.total || 0}</p>
                  </div>
                  <FileText className="text-purple-500" size={40} />
                </div>
              </div>

              {/* Pending Reviews */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Pending Reviews</p>
                    <p className="text-3xl font-bold text-black mt-2">{stats?.applications?.pending || 0}</p>
                  </div>
                  <Users className="text-orange-500" size={40} />
                </div>
              </div>
            </div>
          )}

          {/* Jobs Table */}
          <div className="bg-white rounded-lg shadow-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Your Posted Jobs</h2>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'draft'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => setStatusFilter('closed')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'closed'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 mb-4">No jobs found</p>
                <button
                  onClick={() => router.push('/recruiter/jobs/new')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-black">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => router.push(`/recruiter/jobs/${job._id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {job.applicationsCount || 0} applicants
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/recruiter/jobs/${job._id}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={() => router.push(`/recruiter/jobs/${job._id}/edit`)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            {job.status === 'active' && (
                              <button
                                onClick={() => handleCloseJob(job._id)}
                                className="text-orange-600 hover:text-orange-800"
                                title="Close Job"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

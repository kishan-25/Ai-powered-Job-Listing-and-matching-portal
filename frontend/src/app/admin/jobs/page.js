'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import DashboardNav from '@/components/DashboardNav';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllJobs } from '@/services/adminService';
import toast from 'react-hot-toast';
import { Briefcase, Search, Filter, Trash2, Eye } from 'lucide-react';

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    source: 'all',
    status: 'all'
  });
  const [totalJobs, setTotalJobs] = useState(0);

  // Force light mode for admin pages
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => {
      // Restore theme when leaving admin pages
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light');
      }
    };
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryFilters = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.source !== 'all' && { source: filters.source }),
        ...(filters.status !== 'all' && { status: filters.status })
      };

      const response = await getAllJobs(queryFilters);
      if (response.success) {
        setJobs(response.jobs);
        setTotalJobs(response.pagination?.total || 0);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const getSourceBadge = (source) => {
    const colors = {
      recruiter: 'bg-blue-100 text-blue-800',
      telegram: 'bg-purple-100 text-purple-800',
      timesjob: 'bg-green-100 text-green-800',
      hirejobs: 'bg-yellow-100 text-yellow-800',
      instahyre: 'bg-pink-100 text-pink-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardNav />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Briefcase size={32} />
              All Jobs Management
            </h1>
            <p className="text-purple-100 mt-1">Manage all job postings across all sources</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Admin Dashboard', href: '/admin' },
              { label: 'Jobs', href: null }
            ]}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by title or company..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Sources</option>
                  <option value="recruiter">Recruiter Posted</option>
                  <option value="telegram">Telegram</option>
                  <option value="timesjob">TimesJob</option>
                  <option value="hirejobs">HireJobs</option>
                  <option value="instahyre">Instahyre</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </form>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-lg shadow-lg mt-6 border border-purple-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                All Jobs ({totalJobs})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="text-xl text-gray-600">Loading jobs...</div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-600 text-lg">No jobs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Job Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Posted Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                            {job.location && (
                              <div className="text-xs text-gray-400 mt-1">📍 {job.location}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSourceBadge(job.source)}`}>
                            {job.source}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {job.status && (
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                              {job.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {job.applicationsCount || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              if (job.source === 'recruiter') {
                                router.push(`/recruiter/jobs/${job._id}`);
                              } else {
                                toast.info('Viewing details for scraped jobs coming soon');
                              }
                            }}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalJobs > filters.limit && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(filters.page - 1) * filters.limit + 1} to {Math.min(filters.page * filters.limit, totalJobs)} of {totalJobs} jobs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`px-4 py-2 rounded-md ${
                      filters.page === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page * filters.limit >= totalJobs}
                    className={`px-4 py-2 rounded-md ${
                      filters.page * filters.limit >= totalJobs
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

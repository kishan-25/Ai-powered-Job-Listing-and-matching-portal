'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import DashboardNav from '@/components/DashboardNav';
import Breadcrumb from '@/components/Breadcrumb';
import { getSystemAnalytics } from '@/services/adminService';
import toast from 'react-hot-toast';
import { Users, Briefcase, FileText, UserCheck, UserX, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getSystemAnalytics();
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardNav />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Admin Header with distinct purple/blue theme */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-purple-100 mt-1">System Overview & Analytics</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-purple-50 transition-colors font-medium"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => router.push('/admin/jobs')}
                  className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition-colors font-medium"
                >
                  View All Jobs
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={[{ label: 'Admin Dashboard', href: null }]} />

          {loading ? (
            <div className="text-center py-20">
              <Activity className="animate-spin mx-auto mb-4" size={48} />
              <p className="text-xl text-gray-600">Loading system analytics...</p>
            </div>
          ) : (
            <>
              {/* User Statistics */}
              <div className="mb-8 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="text-purple-600" />
                  User Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Users</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {analytics?.users?.total || 0}
                        </p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <TrendingUp size={14} />
                          +{analytics?.users?.newLast30Days || 0} this month
                        </p>
                      </div>
                      <Users className="text-purple-500" size={48} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Active Users</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {analytics?.users?.active || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Currently active</p>
                      </div>
                      <UserCheck className="text-green-500" size={48} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Suspended</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {analytics?.users?.suspended || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Requires attention</p>
                      </div>
                      <UserX className="text-red-500" size={48} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">By Role</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm"><span className="font-semibold">{analytics?.users?.byRole?.jobSeekers || 0}</span> Job Seekers</p>
                          <p className="text-sm"><span className="font-semibold">{analytics?.users?.byRole?.recruiters || 0}</span> Recruiters</p>
                          <p className="text-sm"><span className="font-semibold">{analytics?.users?.byRole?.admins || 0}</span> Admins</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Statistics */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-600" />
                  Job Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Jobs</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {analytics?.jobs?.total || 0}
                        </p>
                      </div>
                      <Briefcase className="text-blue-500" size={40} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Recruiter Posted</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {analytics?.jobs?.recruiterPosted || 0}
                        </p>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>Active: {analytics?.jobs?.byStatus?.active || 0}</p>
                          <p>Draft: {analytics?.jobs?.byStatus?.draft || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-cyan-500">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-3">Scraped Jobs</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Telegram:</span>
                          <span className="font-bold">{analytics?.jobs?.scraped?.telegram || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TimesJob:</span>
                          <span className="font-bold">{analytics?.jobs?.scraped?.timesJob || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HireJobs:</span>
                          <span className="font-bold">{analytics?.jobs?.scraped?.hireJobs || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Instahyre:</span>
                          <span className="font-bold">{analytics?.jobs?.scraped?.instahyre || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Statistics */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="text-orange-600" />
                  Application Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <p className="text-sm text-gray-600 font-medium">Total</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.applications?.total || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">All applications</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.applications?.byStatus?.pending || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 font-medium">Shortlisted</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.applications?.byStatus?.shortlisted || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Under consideration</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 font-medium">Interview</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.applications?.byStatus?.interviewScheduled || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Scheduled</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600 font-medium">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.applications?.byStatus?.rejected || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Not selected</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="bg-white text-purple-600 px-6 py-4 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-left"
                  >
                    <Users className="mb-2" size={24} />
                    <p>Manage Users</p>
                    <p className="text-sm text-gray-600 mt-1">View, suspend, or activate users</p>
                  </button>

                  <button
                    onClick={() => router.push('/admin/jobs')}
                    className="bg-white text-blue-600 px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-left"
                  >
                    <Briefcase className="mb-2" size={24} />
                    <p>View All Jobs</p>
                    <p className="text-sm text-gray-600 mt-1">Monitor and manage job listings</p>
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white text-green-600 px-6 py-4 rounded-lg hover:bg-green-50 transition-colors font-semibold text-left"
                  >
                    <Activity className="mb-2" size={24} />
                    <p>Refresh Data</p>
                    <p className="text-sm text-gray-600 mt-1">Update dashboard statistics</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}

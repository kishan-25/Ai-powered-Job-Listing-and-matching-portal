'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import DashboardNav from '@/components/DashboardNav';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllUsers, suspendUser, activateUser, deleteUser, updateUserRole } from '@/services/adminService';
import toast from 'react-hot-toast';
import { Users, Search, Filter, Eye, Ban, CheckCircle, Trash2, UserCog } from 'lucide-react';

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 20,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      };

      const response = await getAllUsers(filters);
      if (response.success) {
        setUsers(response.users);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSuspend = async (userId, userName) => {
    const reason = prompt(`Enter reason for suspending ${userName}:`);
    if (!reason) return;

    try {
      const response = await suspendUser(userId, reason);
      if (response.success) {
        toast.success('User suspended successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to suspend user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      const response = await activateUser(userId);
      if (response.success) {
        toast.success('User activated successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to activate user');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

    try {
      const response = await deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleChangeRole = async (userId, userName, currentRole) => {
    const newRole = prompt(`Change role for ${userName} to (job_seeker/recruiter/admin):`, currentRole);
    if (!newRole || !['job_seeker', 'recruiter', 'admin'].includes(newRole)) {
      toast.error('Invalid role');
      return;
    }

    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        toast.success('User role updated successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      job_seeker: 'bg-blue-100 text-blue-800',
      recruiter: 'bg-orange-100 text-orange-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardNav />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users />
              User Management
            </h1>
            <p className="text-purple-100 mt-1">Manage user accounts and permissions</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Admin Dashboard', href: '/admin' },
              { label: 'User Management', href: null }
            ]}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300"
                >
                  <option value="all">All Roles</option>
                  <option value="job_seeker">Job Seekers</option>
                  <option value="recruiter">Recruiters</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Users ({users.length})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-gray-600">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.userRole)}`}>
                            {user.userRole ? user.userRole.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.accountStatus)}`}>
                            {user.accountStatus ? user.accountStatus.toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/users/${user._id}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>

                            {user.accountStatus === 'active' ? (
                              <button
                                onClick={() => handleSuspend(user._id, user.name)}
                                className="text-orange-600 hover:text-orange-800"
                                title="Suspend User"
                              >
                                <Ban size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(user._id)}
                                className="text-green-600 hover:text-green-800"
                                title="Activate User"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}

                            <button
                              onClick={() => handleChangeRole(user._id, user.name, user.userRole)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Change Role"
                            >
                              <UserCog size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete User"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

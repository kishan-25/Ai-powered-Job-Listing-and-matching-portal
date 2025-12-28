'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import DashboardNav from '@/components/DashboardNav';
import Breadcrumb from '@/components/Breadcrumb';
import { getJobById, updateJob } from '@/services/recruiterService';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    keySkills: '',
    location: '',
    experience: '',
    salary: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    status: 'draft',
    expiresAt: ''
  });

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await getJobById(jobId);
      if (response.success) {
        const job = response.job;
        setFormData({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          keySkills: Array.isArray(job.keySkills) ? job.keySkills.join(', ') : '',
          location: job.location || '',
          experience: job.experience || '',
          salary: job.salary || '',
          jobType: job.jobType || 'Full-time',
          workMode: job.workMode || 'On-site',
          status: job.status || 'draft',
          expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUpdating(true);
    try {
      const jobData = {
        ...formData,
        keySkills: formData.keySkills.split(',').map(s => s.trim()).filter(s => s)
      };

      const response = await updateJob(jobId, jobData);
      if (response.success) {
        toast.success('Job updated successfully!');
        router.push('/recruiter');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update job');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['recruiter']}>
        <DashboardNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Loading job details...</div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['recruiter']}>
      <DashboardNav />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">Edit Job</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Recruiter Dashboard', href: '/recruiter' },
              { label: 'Edit Job', href: null }
            ]}
          />

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 mt-6">
            {/* Job Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Company Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Key Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Skills (comma-separated)
              </label>
              <input
                type="text"
                name="keySkills"
                value={formData.keySkills}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, MongoDB, AWS"
              />
            </div>

            {/* Location and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Salary */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Job Type and Work Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end mt-8">
              <button
                type="button"
                onClick={() => router.push('/recruiter')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                disabled={updating}
              >
                <Save size={20} />
                {updating ? 'Updating...' : 'Update Job'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </RoleGuard>
  );
}

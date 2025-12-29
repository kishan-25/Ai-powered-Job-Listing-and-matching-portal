'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import DashboardNav from '@/components/DashboardNav';
import Breadcrumb from '@/components/Breadcrumb';
import { getJobById, getJobApplications, updateApplicationStatus } from '@/services/recruiterService';
import toast from 'react-hot-toast';
import { MapPin, Briefcase, DollarSign, Calendar, Users, Mail, ExternalLink } from 'lucide-react';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobResponse = await getJobById(jobId);
      if (jobResponse.success) {
        setJob(jobResponse.job);
      }

      // Fetch applications
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const applicationsResponse = await getJobApplications(jobId, filters);
      if (applicationsResponse.success) {
        setApplications(applicationsResponse.applications);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [jobId, statusFilter]);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId, fetchData]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await updateApplicationStatus(applicationId, newStatus);
      if (response.success) {
        toast.success('Application status updated successfully');
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview_scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !job) {
    return (
      <RoleGuard allowedRoles={['recruiter']}>
        <DashboardNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl">Loading job details...</div>
          </div>
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
            <h1 className="text-3xl font-bold text-white">Job Details & Applications</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Recruiter Dashboard', href: '/recruiter' },
              { label: 'Job Details', href: null }
            ]}
          />

          {/* Job Details Card */}
          {job && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-2">{job.title}</h2>
                  <p className="text-lg text-gray-700">{job.company}</p>
                </div>
                <button
                  onClick={() => router.push(`/recruiter/jobs/${jobId}/edit`)}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Edit Job
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {job.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.experience && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase size={18} />
                    <span>{job.experience}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={18} />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={18} />
                  <span>{job.applicationsCount || 0} Applicants</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mr-2">
                  {job.jobType}
                </span>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {job.workMode}
                </span>
              </div>

              {job.keySkills && job.keySkills.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Key Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.keySkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>
          )}

          {/* Applications Section */}
          <div className="bg-white rounded-lg shadow-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">
                  Applications ({applications.length})
                </h2>

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
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'pending'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('shortlisted')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'shortlisted'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() => setStatusFilter('interview_scheduled')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'interview_scheduled'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Interview
                  </button>
                  <button
                    onClick={() => setStatusFilter('rejected')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      statusFilter === 'rejected'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                No applications found for this job
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <div key={application._id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-black">
                            {application.user?.name}
                          </h3>
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Mail size={16} />
                          <span>{application.user?.email}</span>
                        </div>

                        {application.user?.skills && application.user.skills.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Skills: </span>
                            <span className="text-sm text-gray-600">
                              {application.user.skills.join(', ')}
                            </span>
                          </div>
                        )}

                        {application.user?.experience && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Experience: </span>
                            {application.user.experience}
                          </div>
                        )}

                        {application.user?.location && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Location: </span>
                            {application.user.location}
                          </div>
                        )}

                        <div className="flex gap-4 mt-3">
                          {application.user?.linkedin && (
                            <a
                              href={application.user.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              <ExternalLink size={14} /> LinkedIn
                            </a>
                          )}
                          {application.user?.github && (
                            <a
                              href={application.user.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              <ExternalLink size={14} /> GitHub
                            </a>
                          )}
                          {application.user?.portfolio && (
                            <a
                              href={application.user.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              <ExternalLink size={14} /> Portfolio
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, 'interview_scheduled')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {application.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application._id, 'interview_scheduled')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {application.status === 'interview_scheduled' && (
                          <button
                            onClick={() => handleStatusUpdate(application._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function JobFilters({ onFilterChange, onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    experience: '',
    jobType: 'all',
    workMode: 'all'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      location: '',
      experience: '',
      jobType: 'all',
      workMode: 'all'
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(filters.search);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search jobs by title, company, or keywords..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Filter size={18} />
          Filters
        </button>
      </form>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              <select
                name="experience"
                value={filters.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">All Experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Mode
              </label>
              <select
                name="workMode"
                value={filters.workMode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Clear Filters
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

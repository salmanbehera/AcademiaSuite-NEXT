'use client';

import { useState } from 'react';

// Mock admission applications data
const admissionApplications = [
  {
    id: 1,
    applicantName: 'Robert Davis',
    parentName: 'Jennifer Davis',
    dateOfBirth: '2009-05-15',
    gradeApplying: 'Grade 9',
    previousSchool: 'Green Valley Elementary',
    applicationDate: '2025-01-15',
    status: 'Under Review',
    phone: '+1 234-567-8910',
    email: 'jennifer.davis@email.com',
    documents: ['Birth Certificate', 'Previous School Records', 'Medical Certificate'],
    interviewDate: '2025-02-01',
    priority: 'High'
  },
  {
    id: 2,
    applicantName: 'Mia Thompson',
    parentName: 'Mark Thompson',
    dateOfBirth: '2010-08-22',
    gradeApplying: 'Grade 8',
    previousSchool: 'Sunnydale School',
    applicationDate: '2025-01-12',
    status: 'Approved',
    phone: '+1 234-567-8911',
    email: 'mark.thompson@email.com',
    documents: ['Birth Certificate', 'Previous School Records', 'Medical Certificate', 'Photo ID'],
    interviewDate: '2025-01-28',
    priority: 'Medium'
  },
  {
    id: 3,
    applicantName: 'Ethan Rodriguez',
    parentName: 'Maria Rodriguez',
    dateOfBirth: '2008-12-10',
    gradeApplying: 'Grade 10',
    previousSchool: 'Riverside High',
    applicationDate: '2025-01-10',
    status: 'Pending Documents',
    phone: '+1 234-567-8912',
    email: 'maria.rodriguez@email.com',
    documents: ['Birth Certificate', 'Previous School Records'],
    interviewDate: 'TBD',
    priority: 'Low'
  },
  {
    id: 4,
    applicantName: 'Isabella White',
    parentName: 'David White',
    dateOfBirth: '2011-03-18',
    gradeApplying: 'Grade 7',
    previousSchool: 'Oak Tree Elementary',
    applicationDate: '2025-01-08',
    status: 'Interview Scheduled',
    phone: '+1 234-567-8913',
    email: 'david.white@email.com',
    documents: ['Birth Certificate', 'Previous School Records', 'Medical Certificate'],
    interviewDate: '2025-02-05',
    priority: 'High'
  }
];

const admissionStats = [
  {
    title: 'Total Applications',
    value: '156',
    change: '+23',
    color: 'blue'
  },
  {
    title: 'Under Review',
    value: '45',
    change: '+12',
    color: 'yellow'
  },
  {
    title: 'Approved',
    value: '89',
    change: '+15',
    color: 'green'
  },
  {
    title: 'Rejected',
    value: '22',
    change: '+2',
    color: 'red'
  }
];

export default function AdmissionsPage() {
  const [applications, setApplications] = useState(admissionApplications);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const statusOptions = ['All Status', 'Under Review', 'Approved', 'Pending Documents', 'Interview Scheduled', 'Rejected'];
  const gradeOptions = ['All Grades', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || app.status === selectedStatus;
    const matchesGrade = selectedGrade === 'All Grades' || app.gradeApplying === selectedGrade;
    
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Pending Documents': return 'bg-yellow-100 text-yellow-800';
      case 'Interview Scheduled': return 'bg-purple-100 text-purple-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Admissions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage admission applications and enrollment process
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Application
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {admissionStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">+{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <div className={`w-6 h-6 bg-${stat.color}-500 rounded`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Applications</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by applicant name, parent name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade Applying
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interview Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {application.applicantName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                        <div className="text-sm text-gray-500">{application.parentName}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.gradeApplying}</div>
                    <div className="text-sm text-gray-500">{application.previousSchool}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.applicationDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(application.priority)}`}>
                      {application.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.interviewDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Approve</button>
                      <button className="text-red-600 hover:text-red-900">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium text-gray-700">Schedule Interview</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">✅</span>
            <span className="text-sm font-medium text-gray-700">Bulk Approve</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📧</span>
            <span className="text-sm font-medium text-gray-700">Send Notifications</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

// Mock data for the dashboard
const dashboardStats = [
  {
    title: 'Total Students',
    value: '2,547',
    change: '+12.5%',
    trend: 'up',
    icon: '👥',
    color: 'blue'
  },
  {
    title: 'New Admissions',
    value: '45',
    change: '+8.2%',
    trend: 'up',
    icon: '📝',
    color: 'green'
  },
  {
    title: 'Active Classes',
    value: '42',
    change: '+2',
    trend: 'up',
    icon: '🏫',
    color: 'purple'
  },
  {
    title: 'Attendance Rate',
    value: '94.8%',
    change: '+2.1%',
    trend: 'up',
    icon: '📊',
    color: 'orange'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'admission',
    title: 'New Student Admission',
    description: 'Sarah Johnson has been admitted to Grade 10-A',
    time: '2 hours ago',
    icon: '✅',
    color: 'green'
  },
  {
    id: 2,
    type: 'attendance',
    title: 'Attendance Alert',
    description: 'Low attendance detected in Grade 9-B (Below 85%)',
    time: '4 hours ago',
    icon: '⚠️',
    color: 'yellow'
  },
  {
    id: 3,
    type: 'transfer',
    title: 'Student Transfer',
    description: 'Mike Chen transferred from Grade 8-A to 8-B',
    time: '6 hours ago',
    icon: '🔄',
    color: 'blue'
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Academic Achievement',
    description: 'Emma Davis scored highest in Mathematics exam',
    time: '1 day ago',
    icon: '🏆',
    color: 'purple'
  },
  {
    id: 5,
    type: 'discipline',
    title: 'Discipline Report',
    description: 'Incident reported in Grade 7-C - handled successfully',
    time: '2 days ago',
    icon: '📋',
    color: 'red'
  }
];

const topPerformers = [
  {
    id: 1,
    name: 'Emma Davis',
    grade: 'Grade 10-A',
    score: '98.5%',
    subject: 'Mathematics',
    avatar: 'ED'
  },
  {
    id: 2,
    name: 'Alex Johnson',
    grade: 'Grade 9-B',
    score: '97.8%',
    subject: 'Science',
    avatar: 'AJ'
  },
  {
    id: 3,
    name: 'Sophia Chen',
    grade: 'Grade 11-A',
    score: '96.9%',
    subject: 'English',
    avatar: 'SC'
  },
  {
    id: 4,
    name: 'Michael Brown',
    grade: 'Grade 8-C',
    score: '96.2%',
    subject: 'History',
    avatar: 'MB'
  }
];

const classDistribution = [
  { grade: 'Grade 6', students: 245, classes: 6 },
  { grade: 'Grade 7', students: 238, classes: 6 },
  { grade: 'Grade 8', students: 251, classes: 6 },
  { grade: 'Grade 9', students: 267, classes: 7 },
  { grade: 'Grade 10', students: 289, classes: 7 },
  { grade: 'Grade 11', students: 234, classes: 6 },
  { grade: 'Grade 12', students: 223, classes: 6 }
];

const attendanceData = [
  { day: 'Mon', percentage: 96 },
  { day: 'Tue', percentage: 94 },
  { day: 'Wed', percentage: 97 },
  { day: 'Thu', percentage: 93 },
  { day: 'Fri', percentage: 95 },
  { day: 'Sat', percentage: 89 },
];

export default function StudentDashboard() {
  const [timeFilter, setTimeFilter] = useState('week');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of student management and academic performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
            <span className="text-sm text-gray-500">Current Week</span>
          </div>
          <div className="space-y-3">
            {attendanceData.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${day.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {day.percentage}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Average:</strong> 94.8% attendance this week
            </p>
          </div>
        </div>

        {/* Class Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Class Distribution</h3>
            <span className="text-sm text-gray-500">Current Academic Year</span>
          </div>
          <div className="space-y-3">
            {classDistribution.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {grade.grade.split(' ')[1]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{grade.grade}</p>
                    <p className="text-sm text-gray-500">{grade.classes} classes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{grade.students}</p>
                  <p className="text-sm text-gray-500">students</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full bg-${activity.color}-100 flex-shrink-0`}>
                  <span className="text-sm">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <div className="space-y-4">
            {topPerformers.map((student, index) => (
              <div key={student.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{student.avatar}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.grade} • {student.subject}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm font-semibold text-green-600">{student.score}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Students
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Add Student</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">Take Attendance</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium text-gray-700">Generate Report</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">🏫</span>
            <span className="text-sm font-medium text-gray-700">Manage Classes</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📧</span>
            <span className="text-sm font-medium text-gray-700">Send Notice</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">⚙️</span>
            <span className="text-sm font-medium text-gray-700">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

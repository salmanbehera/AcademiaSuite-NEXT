import Link from 'next/link';

const modules = [
  {
    id: 'student',
    title: 'Student Management',
    description: 'Manage student admissions, records, academic progress and class assignments',
    color: 'from-blue-500 to-blue-600',
    route: '/student',
    stats: { total: '2,547', active: '2,431' },
    features: ['Admissions', 'Academic Records', 'Class Management', 'Performance Tracking']
  },
  {
    id: 'payroll',
    title: 'Payroll Management',
    description: 'Handle employee salaries, benefits, attendance and leave management',
    color: 'from-green-500 to-green-600',
    route: '/payroll',
    stats: { total: '324', active: '298' },
    features: ['Salary Processing', 'Attendance', 'Leave Management', 'Tax Calculations']
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Track supplies, equipment, books and manage purchase orders',
    color: 'from-purple-500 to-purple-600',
    route: '/inventory',
    stats: { total: '15,847', lowStock: '23' },
    features: ['Stock Tracking', 'Purchase Orders', 'Suppliers', 'Asset Management']
  },
  {
    id: 'library',
    title: 'Library Management',
    description: 'Manage books, digital resources and library member activities',
    color: 'from-indigo-500 to-indigo-600',
    route: '/library',
    stats: { total: '8,567', issued: '1,234' },
    features: ['Book Catalog', 'Issue/Return', 'Digital Library', 'Member Management']
  },
  {
    id: 'transport',
    title: 'Transport Management',
    description: 'Manage school buses, routes, drivers and student transportation',
    color: 'from-orange-500 to-orange-600',
    route: '/transport',
    stats: { total: '45', active: '42' },
    features: ['Route Management', 'Driver Records', 'Vehicle Tracking', 'Fee Collection']
  },
  {
    id: 'examination',
    title: 'Examination Management',
    description: 'Conduct exams, manage results, grades and academic assessments',
    color: 'from-red-500 to-red-600',
    route: '/examination',
    stats: { total: '156', upcoming: '12' },
    features: ['Exam Scheduling', 'Result Processing', 'Grade Management', 'Report Cards']
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <span className="text-white font-bold">AS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AcademiaSuite</h1>
                <p className="text-sm text-gray-500">Education Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <span className="sr-only">Notifications</span>
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AcademiaSuite
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Complete education management solution for modern institutions. 
            Streamline operations, enhance learning experiences, and drive institutional excellence.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            return (
              <Link key={module.id} href={module.route}>
                <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-white font-bold text-lg">{module.title.charAt(0)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-500">Total</div>
                        <div className="text-lg font-bold text-gray-900">{module.stats.total}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {module.description}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                      {Object.entries(module.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs font-medium text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm font-bold text-gray-900">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-1">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Institution Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2,547</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">324</div>
              <div className="text-sm text-gray-600">Staff Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">45</div>
              <div className="text-sm text-gray-600">Active Classes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">98.5%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 AcademiaSuite. All rights reserved.
            </div>
            <div className="text-sm text-gray-600">
              Version 1.0.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

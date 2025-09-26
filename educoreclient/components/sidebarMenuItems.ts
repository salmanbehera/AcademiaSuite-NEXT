// components/sidebarMenuItems.ts
export const sidebarMenuItems = [
  {
    label: 'Dashboard',
    href: '/student/dashboard',
    icon: '📊'
  },
  {
    label: 'Administration',
    icon: '🏢',
    children: [
      { label: 'Organization', href: '/Administration/Organization', icon: '🏢' },
      { label: 'Branch', href: '/Administration/branch', icon: '🌿' },
      { label: 'Academic Year', href: '/Administration/academicyear', icon: '📅' },
      { label: 'Department', href: '/Administration/department', icon: '🏢' },
      { label: 'Designation', href: '/Administration/designation', icon: '🏷️' },
      { label: 'Division', href: '/Administration/division', icon: '🏢' }
    ]
  },
  {
    label: 'Master',
    icon: '⚙️',
    children: [
      { label: 'Class', href: '/student/master/class', icon: '🏫' },
      { label: 'Section', href: '/student/master/section', icon: '📋' },
      { label: 'semister', href: '/student/master/semister', icon: '📚' },
      { label: 'examcycle', href: '/student/master/examcycle', icon: '📝' },
      { label: 'Stream', href: '/student/master/stream', icon: '🌊' },
      { label: 'Student Category', href: '/student/master/student-category', icon: '👥' },
      
    ]
  },
  {
    label: 'Admission',
    icon: '📝',
    children: [
      { label: 'Enquiry', href: '/student/admission/enquiry', icon: '❓' },
  { label: 'Student Onboarding', href: '/student/StudentEnrollment', icon: '✅' },
      { label: 'Student Leave', href: '/student/admission/leave', icon: '🚶' },
      { label: 'Transfer Certificate', href: '/student/admission/transfer', icon: '📄' }
    ]
  },
  {
    label: 'Fee Collection',
    icon: '💰',
    children: [
      { label: 'Fee Group', href: '/student/FeeManagement/feegroup', icon: '👥' },
      { label: 'Fee Head', href: '/student/FeeManagement/feehead', icon: '📊' },
      { label: 'Class Fee Mapping', href: '/student/FeeManagement/classfeemapping', icon: '🏫' },
      { label: 'Late Fee Policy', href: '/student/FeeManagement/latefeepolicy', icon: '⏰' },
      { label: 'Discount Policy', href: '/student/FeeManagement/discountpolicy', icon: '🏷️' },
      { label: 'Fee Structure', href: '/student/FeeManagement/feestructure', icon: '🏛️' },
      { label: 'Fee Collection', href: '/student/FeeManagement/feecollection', icon: '💵' },
      { label: 'Fee Receipt', href: '/student/FeeManagement/feereceipt', icon: '🧾' },
      { label: 'Fee Reports', href: '/student/FeeManagement/feereports', icon: '📈' }
    ]
  },
  {
    label: 'Attendance',
    icon: '📋',
    children: [
      { label: 'Daily Attendance', href: '/student/attendance/daily', icon: '📅' },
      { label: 'Monthly Report', href: '/student/attendance/monthly', icon: '📊' },
      { label: 'Attendance Settings', href: '/student/attendance/settings', icon: '⚙️' }
    ]
  },
  {
    label: 'Academic Records',
    icon: '📚',
    children: [
      { label: 'Student Records', href: '/student/academic/records', icon: '📝' },
      { label: 'Exam Results', href: '/student/academic/results', icon: '🏆' },
      { label: 'Report Cards', href: '/student/academic/report-cards', icon: '📋' },
      { label: 'Certificates', href: '/student/academic/certificates', icon: '🎓' }
    ]
  },
  {
    label: 'Hostel Management',
    icon: '🏠',
    children: [
      { label: 'Room Allocation', href: '/student/hostel/rooms', icon: '🛏️' },
      { label: 'Hostel Fees', href: '/student/hostel/fees', icon: '💰' },
      { label: 'Mess Management', href: '/student/hostel/mess', icon: '🍽️' }
    ]
  },
  {
    label: 'Library',
    icon: '📖',
    children: [
      { label: 'Book Issue/Return', href: '/student/library/books', icon: '📚' },
      { label: 'Library Card', href: '/student/library/card', icon: '🆔' },
      { label: 'Fine Management', href: '/student/library/fines', icon: '💸' }
    ]
  },
  {
    label: 'Transport',
    icon: '🚌',
    children: [
      { label: 'Route Management', href: '/student/transport/routes', icon: '🗺️' },
      { label: 'Vehicle Tracking', href: '/student/transport/tracking', icon: '📍' },
      { label: 'Transport Fees', href: '/student/transport/fees', icon: '💰' }
    ]
  },
  {
    label: 'Reports',
    icon: '📈',
    children: [
      { label: 'Student Reports', href: '/student/reports/students', icon: '👥' },
      { label: 'Fee Reports', href: '/student/reports/fees', icon: '💰' },
      { label: 'Attendance Reports', href: '/student/reports/attendance', icon: '📊' },
      { label: 'Academic Reports', href: '/student/reports/academic', icon: '📚' }
    ]
  },
  {
    label: 'Settings',
    href: '/student/settings',
    icon: '⚙️'
  }
];

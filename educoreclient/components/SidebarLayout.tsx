"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  label: string;
  href?: string;
  icon: string;
  children?: MenuItem[];
}

export interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarMenuItems: MenuItem[];
  moduleName?: string;
  moduleDesc?: string;
  moduleShort?: string;
}

export default function SidebarLayout({
  children,
  sidebarMenuItems,
  moduleName = "Student Management",
  moduleDesc = "Comprehensive student system",
  moduleShort = "SM"
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuLabel: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuLabel)
        ? prev.filter(label => label !== menuLabel)
        : [...prev, menuLabel]
    );
  };

  const isMenuExpanded = (menuLabel: string) => expandedMenus.includes(menuLabel);

  const isActiveRoute = (href: string) => pathname === href;

  // Check if any child route is active for parent highlighting
  const isAnyChildActive = (children?: MenuItem[]): boolean => {
    if (!children) return false;
    return children.some(child =>
      child.href === pathname ||
      (child.children && isAnyChildActive(child.children))
    );
  };

  const profileMenuItems = [
    { label: 'View Profile', href: '/profile', icon: '👤' },
    { label: 'Account Settings', href: '/settings/account', icon: '⚙️' },
    { label: 'Notifications', href: '/notifications', icon: '🔔' },
    { label: 'Help & Support', href: '/help', icon: '❓' },
    { label: 'Privacy Policy', href: '/privacy', icon: '🔒' },
    { label: 'Logout', href: '/logout', icon: '🚪' }
  ];

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isMenuExpanded(item.label);
    const isActive = item.href ? isActiveRoute(item.href) : false;
    const paddingLeft = sidebarCollapsed ? 'pl-3' : level === 0 ? 'pl-3' : 'pl-6';

    if (hasChildren) {
      const activeOrChildActive = isActive || isAnyChildActive(item.children);
      return (
        <div key={item.label}>
          <button
            onClick={() => !sidebarCollapsed && toggleMenu(item.label)}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-slate-700 hover:bg-slate-50 hover:text-slate-900 ${paddingLeft}`}
          >
            <div className="flex items-center">
              <span className={`${sidebarCollapsed ? 'text-sm' : 'text-sm mr-2'}`}>{item.icon}</span>
              {!sidebarCollapsed && <span className="text-xs font-medium">{item.label}</span>}
            </div>
            {!sidebarCollapsed && (
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          {/* Always expand if any child is active */}
          {!sidebarCollapsed && (isExpanded || isAnyChildActive(item.children)) && (
            <div className="ml-3 space-y-0.5 mt-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href!}
        className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
          isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        } ${paddingLeft}`}
      >
        <span className={`${sidebarCollapsed ? 'text-sm' : 'text-sm mr-2'}`}>{item.icon}</span>
        {!sidebarCollapsed && <span className="text-xs font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Sidebar toggle for desktop */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Toggle sidebar</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>

              {/* Breadcrumb */}
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Home</span>
                      🏠
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-blue-600">{moduleName}</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search ${moduleName.toLowerCase()}...`}
                    className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 016-6h6a6 6 0 016 6v2" />
                  </svg>
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </div>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">A</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-700">Admin User</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Admin User</p>
                        <p className="text-sm text-gray-500">admin@academicsuite.com</p>
                      </div>
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 ${
          sidebarCollapsed ? 'w-14' : 'w-56'
        } bg-white shadow-sm border-r border-slate-200/60 transform transition-all duration-300 ease-in-out`}>
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className={`px-4 py-3 border-b border-slate-200/60 ${sidebarCollapsed ? 'px-3' : ''}`}>
              {!sidebarCollapsed ? (
                <>
                  <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{moduleName}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">{moduleDesc}</p>
                </>
              ) : (
                <div className="flex justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-slate-600 to-slate-800 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{moduleShort}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {sidebarMenuItems.map((item) => renderMenuItem(item))}
            </nav>

            {/* Sidebar footer */}
            <div className={`px-4 py-3 border-t border-slate-200/60 ${sidebarCollapsed ? 'px-3' : ''}`}>
              {!sidebarCollapsed ? (
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-r from-slate-600 to-slate-800 rounded-md flex items-center justify-center">
                    <span className="text-white font-medium text-xs">{moduleShort}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{moduleName} Module</p>
                    <p className="text-xs text-slate-500 truncate">v3.0.1 • Enterprise</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="text-xs text-slate-500">v3</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

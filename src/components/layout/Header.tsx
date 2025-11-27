import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/auth';
import { getNavigationPages } from '../../services/pages';
import { Page } from '../../types';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  RectangleStackIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

export const Header: React.FC = () => {
  const { currentUser, isAdmin, userData, familyData } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [customNavPages, setCustomNavPages] = useState<Page[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch custom navigation pages
  useEffect(() => {
    const fetchNavPages = async () => {
      try {
        const pages = await getNavigationPages();
        setCustomNavPages(pages);
      } catch (error) {
        console.error('Error fetching navigation pages:', error);
      }
    };

    fetchNavPages();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  // Static navigation items
  const staticNavigation = [
    { name: 'Classes', href: '/classes' },
    { name: 'Sports', href: '/sports' },
    { name: 'Events', href: '/events' },
    { name: 'Volunteer', href: '/volunteers' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'About', href: '/about' },
  ];

  // Merge static and custom navigation pages
  const navigation = [
    ...staticNavigation,
    ...customNavPages.map((page) => ({
      name: page.title,
      href: `/pages/${page.slug}`,
    })),
  ];

  // Get profile picture - prefer family member photo for parents
  const getProfilePicture = () => {
    // If user is a parent and has a family with members, use their member photo
    if (familyData && userData?.role === 'family') {
      const parentMember = familyData.members.find(
        m => m.relationship === 'parent' || m.relationship === 'guardian'
      );
      if (parentMember?.photoURL) return parentMember.photoURL;
    }
    // Fallback to user photoURL or null
    return userData?.photoURL || null;
  };

  const profilePicture = getProfilePicture();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/Eagle-Logo.jpg" 
                alt="Tampa Bay HEAT" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {currentUser ? (
              <>
                <Link to="/cart">
                  <Button variant="outline" size="sm">
                    Cart
                  </Button>
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="h-9 w-9 rounded-full object-cover border-2 border-primary-600"
                      />
                    ) : (
                      <UserCircleIcon className="h-9 w-9 text-primary-600" />
                    )}
                    <ChevronDownIcon className={`h-4 w-4 text-neutral-600 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-medium text-neutral-900">
                          {familyData?.familyName || userData?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {userData?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <Cog6ToothIcon className="h-5 w-5 mr-3 text-neutral-400" />
                        Dashboard
                      </Link>

                      <Link
                        to="/enrollments"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <RectangleStackIcon className="h-5 w-5 mr-3 text-neutral-400" />
                        Enrollments
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <ShieldCheckIcon className="h-5 w-5 mr-3 text-neutral-400" />
                          Admin
                        </Link>
                      )}

                      <div className="border-t border-neutral-200 my-2"></div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-neutral-200 pt-4 flex flex-col space-y-2">
                {currentUser ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-50 rounded-lg">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border-2 border-primary-600"
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-primary-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {familyData?.familyName || userData?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {userData?.email}
                        </p>
                      </div>
                    </div>

                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Cog6ToothIcon className="h-5 w-5 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/enrollments" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <RectangleStackIcon className="h-5 w-5 mr-2" />
                        Enrollments
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <ShieldCheckIcon className="h-5 w-5 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Cart
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};


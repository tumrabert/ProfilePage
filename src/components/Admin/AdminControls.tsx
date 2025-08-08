'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AdminControlsProps {
  onLogout: () => void;
  user?: User | null;
}

export default function AdminControls({ onLogout, user }: AdminControlsProps) {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const sections = [
    { id: 'hero', label: 'Hero Section', icon: 'fa-home' },
    { id: 'about', label: 'About Me', icon: 'fa-user' },
    { id: 'experience', label: 'Experience', icon: 'fa-briefcase' },
    { id: 'education', label: 'Education', icon: 'fa-graduation-cap' },
    { id: 'skills', label: 'Skills', icon: 'fa-code' },
    { id: 'projects', label: 'Projects', icon: 'fa-folder-open' },
  ];

  return (
    <>
      {/* Admin Panel Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Admin Controls"
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-cog'}`}></i>
        </button>
      </div>

      {/* Admin Panel */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Admin Panel */}
          <div className="fixed top-16 right-4 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-user-shield text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Admin Panel</h3>
                    <p className="text-gray-400 text-xs">Logged in as {user?.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Quick Edit Sections */}
            <div className="p-4">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
                <i className="fas fa-edit mr-2 text-blue-400"></i>
                Quick Edit Sections
              </h4>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left group"
                  >
                    <i className={`fas ${section.icon} w-5 text-center text-blue-400 group-hover:text-blue-300`}></i>
                    <span className="ml-3 text-gray-300 group-hover:text-white text-sm">
                      {section.label}
                    </span>
                    <i className="fas fa-chevron-right ml-auto text-gray-500 group-hover:text-gray-400 text-xs"></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="p-4 border-t border-gray-700">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
                <i className="fas fa-tools mr-2 text-purple-400"></i>
                Admin Actions
              </h4>
              
              <div className="space-y-2">
                {/* Portfolio API Link */}
                <a
                  href="/api/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left group"
                >
                  <i className="fas fa-database w-5 text-center text-yellow-400 group-hover:text-yellow-300"></i>
                  <span className="ml-3 text-gray-300 group-hover:text-white text-sm">
                    View Portfolio Data
                  </span>
                  <i className="fas fa-external-link-alt ml-auto text-gray-500 group-hover:text-gray-400 text-xs"></i>
                </a>

                {/* Refresh Portfolio Data */}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left group"
                >
                  <i className="fas fa-sync-alt w-5 text-center text-green-400 group-hover:text-green-300"></i>
                  <span className="ml-3 text-gray-300 group-hover:text-white text-sm">
                    Refresh Page
                  </span>
                </button>

                {/* GitHub Integration */}
                <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center text-gray-400 text-sm">
                    <i className="fab fa-github w-5 text-center"></i>
                    <span className="ml-3">GitHub Integration</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Coming soon - currently disabled
                  </p>
                </div>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-700">
              <div className="bg-gray-700/50 p-3 rounded-lg mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Role:</span>
                  <span className="text-blue-400 capitalize">{user?.role || 'Admin'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-gray-300 text-xs truncate ml-2">{user?.email}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-500">
                Admin Panel v1.0
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
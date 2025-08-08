'use client';

import { useState } from 'react';

import Navigation from '@/components/Layout/Navigation';
import Hero from '@/components/Portfolio/Hero';
import About from '@/components/Portfolio/About';
import Experience from '@/components/Portfolio/Experience';
import Education from '@/components/Portfolio/Education';
import Skills from '@/components/Portfolio/Skills';
import Projects from '@/components/Portfolio/Projects';
import Footer from '@/components/Layout/Footer';
import AdminControls from '@/components/Admin/AdminControls';
import LoginModal from '@/components/Admin/LoginModal';

import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';

export default function PortfolioPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { data: portfolio, isLoading, error } = usePortfolio();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Portfolio</h1>
          <p className="text-gray-400">Failed to load portfolio data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      
      <main className="relative">
        <Hero data={portfolio?.intro} />
        <About data={portfolio} />
        <Experience experiences={portfolio?.workExperiences} />
        <Education educations={portfolio?.educations} />
        <Skills technologies={portfolio?.technologies} />
        <Projects projects={portfolio?.displayProjects} />
      </main>

      <Footer />

      {/* Admin Controls */}
      {isAuthenticated ? (
        <AdminControls 
          onLogout={() => window.location.reload()} 
          user={user}
        />
      ) : (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Admin Login
          </button>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
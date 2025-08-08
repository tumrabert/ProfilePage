'use client';

import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'experience', 'education', 'skills', 'projects'];
      const scrollPosition = window.scrollY + 100;

      // Handle navbar background on scroll
      setIsScrolled(window.scrollY > 50);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const navItems = [
    { id: 'hero', label: 'Home', icon: 'fa-home' },
    { id: 'about', label: 'About', icon: 'fa-user' },
    { id: 'experience', label: 'Experience', icon: 'fa-briefcase' },
    { id: 'education', label: 'Education', icon: 'fa-graduation-cap' },
    { id: 'skills', label: 'Skills', icon: 'fa-code' },
    { id: 'projects', label: 'Projects', icon: 'fa-folder-open' },
  ];

  return (
    <>
      {/* Horizontal Navigation Bar - Sticky Top */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 shadow-lg' 
          : 'bg-transparent'
        }
      `}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-code text-white"></i>
              </div>
              <span className="ml-3 font-bold text-white text-xl">Portfolio</span>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                    ${activeSection === item.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <i className={`fas ${item.icon} mr-2 text-sm`}></i>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Social Links & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Social Links - Desktop */}
              <div className="hidden md:flex items-center space-x-3">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                  aria-label="GitHub Profile"
                >
                  <i className="fab fa-github text-sm"></i>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <i className="fab fa-linkedin text-sm"></i>
                </a>
                <a 
                  href="mailto:contact@example.com"
                  className="w-9 h-9 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                  aria-label="Send Email"
                >
                  <i className="fas fa-envelope text-sm"></i>
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                aria-label="Toggle navigation menu"
              >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`
        fixed top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-40 md:hidden
        transition-all duration-300 ease-in-out
        ${isOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'}
      `}>
        <div className="container mx-auto px-6 py-4">
          {/* Mobile Navigation Items */}
          <div className="space-y-2 mb-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-left
                  ${activeSection === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <i className={`fas ${item.icon} w-5 text-center mr-3`}></i>
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Social Links */}
          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-700">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              aria-label="GitHub Profile"
            >
              <i className="fab fa-github"></i>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              aria-label="LinkedIn Profile"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a 
              href="mailto:contact@example.com"
              className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              aria-label="Send Email"
            >
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
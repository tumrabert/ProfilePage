'use client';

import { useQuery } from '@tanstack/react-query';

// Utility function to ensure URL has proper protocol
const ensureUrlProtocol = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
    return url;
  }
  return `https://${url}`;
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio');
      if (!response.ok) return null;
      const data = await response.json();
      return data.data; // Fixed: use data.data instead of data.portfolio
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get social media links from portfolio data
  const socialLinks = [
    {
      name: 'GitHub',
      url: portfolio?.intro?.github,
      icon: 'fab fa-github',
      label: 'GitHub Profile',
      hoverColor: 'hover:bg-gray-700'
    },
    {
      name: 'LinkedIn',
      url: portfolio?.intro?.linkedin,
      icon: 'fab fa-linkedin',
      label: 'LinkedIn Profile',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      name: 'Twitter',
      url: portfolio?.intro?.twitter,
      icon: 'fab fa-twitter',
      label: 'Twitter Profile',
      hoverColor: 'hover:bg-blue-500'
    },
    {
      name: 'Instagram',
      url: portfolio?.intro?.instagram,
      icon: 'fab fa-instagram',
      label: 'Instagram Profile',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      name: 'Website',
      url: portfolio?.intro?.website,
      icon: 'fas fa-globe',
      label: 'Personal Website',
      hoverColor: 'hover:bg-green-600'
    },
    {
      name: 'Email',
      url: portfolio?.intro?.email ? `mailto:${portfolio.intro.email}` : undefined,
      icon: 'fas fa-envelope',
      label: 'Send Email',
      hoverColor: 'hover:bg-red-600'
    }
  ].filter(link => link.url && link.url.trim() !== ''); // Only show links that exist

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 lg:ml-20 xl:ml-64">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {portfolio?.intro?.name || 'Portfolio'}
                </h3>
              </div>
              
              <p className="text-gray-400 mb-6 max-w-md">
                {portfolio?.intro?.description || 'A passionate developer creating amazing digital experiences.'}
              </p>
              
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <a 
                      key={link.name}
                      href={ensureUrlProtocol(link.url)} 
                      target={link.url?.startsWith('mailto:') ? '_self' : '_blank'}
                      rel={link.url?.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 ${link.hoverColor} hover:text-white transition-colors group`}
                      aria-label={link.label}
                    >
                      <i className={`${link.icon} group-hover:scale-110 transition-transform`}></i>
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Navigation */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection('hero')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('experience')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Experience
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('skills')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Skills
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('projects')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Projects
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Get In Touch</h4>
              <div className="space-y-2">
                {portfolio?.intro?.email && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <i className="fas fa-envelope w-4 mr-2"></i>
                    <span>{portfolio.intro.email}</span>
                  </div>
                )}
                {portfolio?.intro?.phone && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <i className="fas fa-phone w-4 mr-2"></i>
                    <span>{portfolio.intro.phone}</span>
                  </div>
                )}
                {portfolio?.intro?.location && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <i className="fas fa-map-marker-alt w-4 mr-2"></i>
                    <span>{portfolio.intro.location}</span>
                  </div>
                )}
              </div>
              
              {/* Current Status */}
              {portfolio?.intro?.quickFacts?.workingOn && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Currently Working On</span>
                  </div>
                  <p className="text-sm text-white">{portfolio.intro.quickFacts.workingOn}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} {portfolio?.intro?.name || 'Portfolio'}. All rights reserved.
            </p>
            
            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors group"
              aria-label="Back to top"
            >
              <i className="fas fa-arrow-up group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
          
          {/* Tech Stack Credits */}
          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-500 text-xs">
              Built with <i className="fas fa-heart text-red-500 mx-1"></i> using 
              <span className="text-blue-400 mx-1">Next.js</span>, 
              <span className="text-blue-400 mx-1">TypeScript</span>, 
              <span className="text-blue-400 mx-1">Tailwind CSS</span>, and 
              <span className="text-green-400 mx-1">MongoDB</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
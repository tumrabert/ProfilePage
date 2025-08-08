'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IIntro } from '@/hooks/usePortfolio';
import { useState } from 'react';
import Image from 'next/image';

interface HeroProps {
  data?: IIntro;
}

export default function Hero({ data }: HeroProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IIntro | null>(null);

  const handleEdit = () => {
    if (!data) return;
    setEditData({ ...data });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData) return;
    
    try {
      await updatePortfolio.mutateAsync({ intro: editData });
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      console.error('Failed to update intro:', error);
      alert('Failed to update intro. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  if (!data) {
    return (
      <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </section>
    );
  }

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 pt-16">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData?.name || ''}
                  onChange={(e) => setEditData(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="text-4xl lg:text-6xl font-bold text-white bg-transparent border-b-2 border-blue-400 focus:outline-none focus:border-blue-300 w-full"
                  placeholder="Your Name"
                />
                <input
                  type="text"
                  value={editData?.title || ''}
                  onChange={(e) => setEditData(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="text-xl lg:text-2xl text-blue-300 bg-transparent border-b border-blue-400 focus:outline-none focus:border-blue-300 w-full"
                  placeholder="Your Title"
                />
                <textarea
                  value={editData?.description || ''}
                  onChange={(e) => setEditData(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="text-lg text-gray-300 bg-gray-800 border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-400 w-full"
                  rows={4}
                  placeholder="Your description"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={updatePortfolio.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updatePortfolio.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
                  {data.name} {data.nickname && `(${data.nickname})`}
                </h1>
                <p className="text-xl lg:text-2xl text-blue-300 mb-6 animate-fade-in-delay-1">
                  {data.title || 'Software Developer'}
                </p>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl animate-fade-in-delay-2">
                  {data.description || 'Welcome to my portfolio'}
                </p>
                
                {/* Contact Links */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-in-delay-3">
                  {data.email && (
                    <a href={`mailto:${data.email}`} className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                      <i className="fas fa-envelope mr-2"></i>
                      {data.email}
                    </a>
                  )}
                  {data.github && (
                    <a href={`https://github.com/${data.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                      <i className="fab fa-github mr-2"></i>
                      {data.github}
                    </a>
                  )}
                  {data.website && (
                    <a href={`https://${data.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                      <i className="fas fa-globe mr-2"></i>
                      {data.website}
                    </a>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-delay-4">
                  <button
                    onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <i className="fas fa-folder-open mr-2"></i>
                    View My Work
                  </button>
                  <button
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg font-medium hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    <i className="fas fa-user mr-2"></i>
                    About Me
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Profile Image */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-2xl ring-4 ring-blue-500 ring-opacity-50 animate-fade-in-delay-2 relative">
                {data.avatar ? (
                  <Image
                    src={data.avatar}
                    alt={data.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i className="fas fa-user text-6xl text-white opacity-80"></i>
                  </div>
                )}
              </div>
              
              {/* Floating tech icons */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <i className="fab fa-react text-white"></i>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                <i className="fab fa-node-js text-white"></i>
              </div>
              <div className="absolute top-1/2 -left-8 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                <i className="fab fa-js-square text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Edit Button */}
        {isAuthenticated && !isEditing && (
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            title="Edit Hero Section"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-white text-2xl hover:text-blue-400 transition-colors"
        >
          <i className="fas fa-chevron-down"></i>
        </button>
      </div>
    </section>
  );
}
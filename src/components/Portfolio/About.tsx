'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IPortfolio } from '@/hooks/usePortfolio';
import { useState } from 'react';

interface AboutProps {
  data?: IPortfolio;
}

export default function About({ data }: AboutProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editSummary, setEditSummary] = useState('');

  const handleEdit = () => {
    if (!data) return;
    setEditSummary(data.summary || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePortfolio.mutateAsync({ summary: editSummary });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update summary:', error);
      alert('Failed to update summary. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditSummary('');
  };

  if (!data) {
    return (
      <section id="about" className="py-20 bg-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { intro } = data;

  return (
    <section id="about" className="py-20 bg-gray-800 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              About Me
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full h-64 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:border-blue-400 resize-none"
                    placeholder="Write your professional summary..."
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
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {data.summary || 'Professional summary goes here...'}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <i className="fas fa-envelope text-blue-400 w-5"></i>
                      <span className="ml-3">{intro?.email || 'email@example.com'}</span>
                    </div>
                    {intro?.phone && (
                      <div className="flex items-center text-gray-300">
                        <i className="fas fa-phone text-blue-400 w-5"></i>
                        <span className="ml-3">{intro.phone}</span>
                      </div>
                    )}
                    {intro?.location && (
                      <div className="flex items-center text-gray-300">
                        <i className="fas fa-map-marker-alt text-blue-400 w-5"></i>
                        <span className="ml-3">{intro.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-700/50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {intro?.quickFacts?.hobbies?.map((hobby, index) => (
                      <span
                        key={index}
                        className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        {hobby}
                      </span>
                    )) || (
                      <span className="text-gray-400">Add your interests...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Stats */}
              <div className="bg-gray-700/50 p-6 rounded-xl mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Facts</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-semibold">
                      {intro?.quickFacts?.yearOfExperience || 0}+ years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Projects</span>
                    <span className="text-white font-semibold">
                      {data.displayProjects?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Technologies</span>
                    <span className="text-white font-semibold">
                      {data.technologies?.length || 0}+
                    </span>
                  </div>
                </div>
              </div>

              {/* Favorite Stack */}
              {intro?.quickFacts?.favoriteStack && intro.quickFacts.favoriteStack.length > 0 && (
                <div className="bg-gray-700/50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-4">Favorite Stack</h3>
                  <div className="space-y-2">
                    {intro.quickFacts.favoriteStack.map((tech, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-600/50 p-3 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Edit Button */}
        {isAuthenticated && !isEditing && (
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            title="Edit About Section"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>
    </section>
  );
}
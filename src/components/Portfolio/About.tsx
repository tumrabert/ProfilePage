'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IPortfolio } from '@/hooks/usePortfolio';
import { useState } from 'react';
import { formatTextWithLineBreaks } from '@/utils/textFormatting';

interface AboutProps {
  data?: IPortfolio;
}

export default function About({ data }: AboutProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editYearsOfExperience, setEditYearsOfExperience] = useState<number>(0);
  const [editProjectsCount, setEditProjectsCount] = useState<number>(0);
  const [editTechnologiesCount, setEditTechnologiesCount] = useState<number>(0);

  const handleEdit = () => {
    if (!data) return;
    setEditSummary(data.summary || '');
    setEditInterests(data.intro?.quickFacts?.hobbies || []);
    setEditYearsOfExperience(data.intro?.quickFacts?.yearOfExperience || 0);
    setEditProjectsCount(data.intro?.quickFacts?.projectsCount || data.displayProjects?.length || 0);
    setEditTechnologiesCount(data.intro?.quickFacts?.technologiesCount || data.technologies?.length || 0);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedIntro = {
        name: data?.intro?.name || '',
        email: data?.intro?.email || '',
        phone: data?.intro?.phone || '',
        location: data?.intro?.location || '',
        github: data?.intro?.github || '',
        linkedin: data?.intro?.linkedin || '',
        instagram: data?.intro?.instagram || '',
        twitter: data?.intro?.twitter || '',
        website: data?.intro?.website || '',
        avatar: data?.intro?.avatar || '',
        title: data?.intro?.title || '',
        description: data?.intro?.description || '',
        ...data?.intro,
        quickFacts: {
          ...data?.intro?.quickFacts,
          hobbies: editInterests,
          yearOfExperience: editYearsOfExperience,
          projectsCount: editProjectsCount,
          technologiesCount: editTechnologiesCount
        }
      };
      
      await updatePortfolio.mutateAsync({ 
        summary: editSummary,
        intro: updatedIntro
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update about section:', error);
      alert('Failed to update about section. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditSummary('');
    setEditInterests([]);
    setEditYearsOfExperience(0);
    setEditProjectsCount(0);
    setEditTechnologiesCount(0);
  };

  const addInterest = () => {
    setEditInterests([...editInterests, '']);
  };

  const updateInterest = (index: number, value: string) => {
    const updated = editInterests.map((interest, i) => 
      i === index ? value : interest
    );
    setEditInterests(updated);
  };

  const removeInterest = (index: number) => {
    setEditInterests(editInterests.filter((_, i) => i !== index));
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
                <div className="space-y-6">
                  {/* Summary Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Professional Summary</label>
                    <textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full h-64 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:border-blue-400 resize-none"
                      placeholder="Write your professional summary..."
                    />
                  </div>
                  
                  {/* Interests Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Interests & Hobbies</label>
                    <div className="space-y-2">
                      {editInterests.map((interest, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={interest}
                            onChange={(e) => updateInterest(index, e.target.value)}
                            placeholder="Enter an interest or hobby..."
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                          />
                          <button
                            onClick={() => removeInterest(index)}
                            className="text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addInterest}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:border-blue-400 transition-colors"
                      >
                        <i className="fas fa-plus mr-2"></i>Add Interest
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick Facts Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quick Facts</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Years of Experience</label>
                        <input
                          type="number"
                          value={editYearsOfExperience}
                          onChange={(e) => setEditYearsOfExperience(parseInt(e.target.value) || 0)}
                          min="0"
                          max="50"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                          placeholder="Years of experience"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Projects Completed</label>
                        <input
                          type="number"
                          value={editProjectsCount}
                          onChange={(e) => setEditProjectsCount(parseInt(e.target.value) || 0)}
                          min="0"
                          max="1000"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                          placeholder="Number of projects"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Technologies Known</label>
                        <input
                          type="number"
                          value={editTechnologiesCount}
                          onChange={(e) => setEditTechnologiesCount(parseInt(e.target.value) || 0)}
                          min="0"
                          max="500"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                          placeholder="Number of technologies"
                        />
                      </div>
                    </div>
                  </div>
                  
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
                  <div className="text-gray-300 leading-relaxed text-lg">
                    {formatTextWithLineBreaks(data.summary || 'Professional summary goes here...')}
                  </div>
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
                      {intro?.quickFacts?.projectsCount || data.displayProjects?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Technologies</span>
                    <span className="text-white font-semibold">
                      {intro?.quickFacts?.technologiesCount || data.technologies?.length || 0}+
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
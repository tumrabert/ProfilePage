'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, ITechnology } from '@/hooks/usePortfolio';
import { useState } from 'react';

interface SkillsProps {
  technologies?: ITechnology[];
}

export default function Skills({ technologies = [] }: SkillsProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ITechnology[]>([]);

  const handleEdit = () => {
    setEditData([...technologies]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePortfolio.mutateAsync({ technologies: editData });
      setIsEditing(false);
      setEditData([]);
    } catch (error) {
      console.error('Failed to update technologies:', error);
      alert('Failed to update technologies. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData([]);
  };

  const addTechnology = () => {
    const newTech: ITechnology = {
      section: 'Frontend',
      details: []
    };
    setEditData([...editData, newTech]);
  };

  const removeTechnology = (index: number) => {
    setEditData(editData.filter((_, i) => i !== index));
  };

  const updateTechnology = (index: number, field: keyof ITechnology, value: string | string[]) => {
    const updated = editData.map((tech, i) => 
      i === index ? { ...tech, [field]: value } : tech
    );
    setEditData(updated);
  };

  // Technologies are already grouped by section
  const categories = technologies;



  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend': return 'fa-palette';
      case 'backend': return 'fa-server';
      case 'database': return 'fa-database';
      case 'devops': return 'fa-cloud';
      case 'mobile': return 'fa-mobile-alt';
      case 'tools': return 'fa-tools';
      case 'testing': return 'fa-vial';
      default: return 'fa-code';
    }
  };

  return (
    <section id="skills" className="py-20 bg-gray-900 relative">
      <div className="container mx-auto px-6 lg:px-8 lg:ml-20 xl:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Skills & Technologies
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Technologies I work with and my proficiency levels</p>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              {editData.map((tech, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">Technology #{index + 1}</h3>
                    <button
                      onClick={() => removeTechnology(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={tech.section}
                      onChange={(e) => updateTechnology(index, 'section', e.target.value)}
                      placeholder="Section Name (e.g., Frontend, Backend)"
                      className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={tech.details.join(', ')}
                      onChange={(e) => updateTechnology(index, 'details', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="React, Vue, Angular, JavaScript"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between">
                <button
                  onClick={addTechnology}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Add Technology
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={updatePortfolio.isPending}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updatePortfolio.isPending ? 'Saving...' : 'Save All'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {categories.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                      {/* Category Header */}
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <i className={`fas ${getCategoryIcon(category.section)} text-white`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {category.section}
                        </h3>
                      </div>

                      {/* Technologies */}
                      <div className="space-y-3">
                        {category.details.map((tech, index) => (
                          <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                            <span className="text-white font-medium">{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl text-gray-600 mb-4">
                    <i className="fas fa-code"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Skills Added</h3>
                  <p className="text-gray-500">Add your technical skills and proficiency levels.</p>
                </div>
              )}

              {/* Skills Summary */}
              {technologies.length > 0 && (
                <div className="mt-16 bg-gray-800/30 p-8 rounded-xl border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    <i className="fas fa-chart-bar mr-2"></i>
                    Skills Overview
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 text-center">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {technologies.length}
                      </div>
                      <div className="text-sm text-gray-400">Technology Categories</div>
                    </div>
                    
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {technologies.reduce((total, tech) => total + tech.details.length, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Technologies</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Admin Edit Button */}
        {isAuthenticated && !isEditing && (
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            title="Edit Skills Section"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>
    </section>
  );
}
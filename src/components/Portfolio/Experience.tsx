'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IWorkExperience } from '@/hooks/usePortfolio';
import { useState } from 'react';
import { MonthYearRangePicker } from '@/components/UI/YearPicker';
import DragDropList, { DragDropTextList } from '@/components/UI/DragDropList';

interface ExperienceProps {
  experiences?: IWorkExperience[];
}

export default function Experience({ experiences = [] }: ExperienceProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IWorkExperience[]>([]);

  const handleEdit = () => {
    setEditData([...experiences]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePortfolio.mutateAsync({ workExperiences: editData });
      setIsEditing(false);
      setEditData([]);
    } catch (error) {
      console.error('Failed to update experiences:', error);
      alert('Failed to update experiences. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData([]);
  };

  const addExperience = () => {
    const newExp: IWorkExperience = {
      position: '',
      company: '',
      start: '',
      end: '',
      details: [],
      order: editData.length
    };
    setEditData([...editData, newExp]);
  };

  const removeExperience = (index: number) => {
    setEditData(editData.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof IWorkExperience, value: string | string[] | number) => {
    const updated = editData.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setEditData(updated);
  };

  const updateExperienceDetails = (expIndex: number, details: string[]) => {
    updateExperience(expIndex, 'details', details);
  };

  const reorderExperiences = (reorderedExperiences: IWorkExperience[]) => {
    // Update order field for each experience
    const updatedExperiences = reorderedExperiences.map((exp, index) => ({
      ...exp,
      order: index
    }));
    setEditData(updatedExperiences);
  };

  return (
    <section id="experience" className="py-20 bg-gray-900 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Work Experience
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">My professional journey and career milestones</p>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <DragDropList
                items={editData}
                onItemsChange={reorderExperiences}
                renderItem={(exp, index) => (
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-grip-vertical text-gray-400 mr-2 cursor-grab"></i>
                        Experience #{index + 1}
                      </h3>
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="Company Name"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        placeholder="Job Title/Position"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2">Employment Period</label>
                      <MonthYearRangePicker
                        startValue={exp.start}
                        endValue={exp.end}
                        onStartChange={(date) => updateExperience(index, 'start', date)}
                        onEndChange={(date) => updateExperience(index, 'end', date)}
                        allowOngoing={true}
                        maxYear={new Date().getFullYear()}
                        className="grid grid-cols-2 gap-4"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2">Company URL (optional)</label>
                      <input
                        type="url"
                        value={exp.url || ''}
                        onChange={(e) => updateExperience(index, 'url', e.target.value)}
                        placeholder="https://company.com"
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Job Details & Achievements</label>
                      <DragDropTextList
                        items={exp.details || []}
                        onItemsChange={(newDetails) => updateExperienceDetails(index, newDetails)}
                        addButtonText="Add Detail"
                        placeholder="e.g., Led team of 5 developers, Increased efficiency by 40%, Built scalable APIs"
                        className="bg-gray-600 border border-gray-500"
                      />
                    </div>
                  </div>
                )}
              />
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={addExperience}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Add Experience
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
            <div className="relative">
              {/* Timeline - Only show if there are experiences */}
              <div className="relative">
                {experiences.length > 0 && (
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-blue-500"></div>
                )}
                
                <div className="space-y-12">
                  {experiences.length > 0 ? experiences.map((exp, index) => (
                    <div key={exp._id || index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      {/* Timeline dot */}
                      <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-gray-900 z-10"></div>
                      
                      {/* Content */}
                      <div className={`ml-12 md:ml-0 w-full md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                        <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-700">
                          {/* Header */}
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {exp.position}
                              </h3>
                              <h4 className="text-lg text-blue-400 font-semibold">
                                {exp.url ? (
                                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {exp.company}
                                  </a>
                                ) : (
                                  exp.company
                                )}
                              </h4>
                            </div>
                            <div className="text-sm text-gray-400 mt-2 md:mt-0 text-right">
                              <div className="flex items-center justify-start md:justify-end">
                                <i className="fas fa-calendar-alt mr-2"></i>
                                {exp.start} - {exp.end}
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          {exp.details && exp.details.length > 0 && (
                            <div>
                              <ul className="space-y-2">
                                {exp.details.map((detail, detailIndex) => (
                                  <li key={detailIndex} className="text-gray-300 text-sm flex items-start">
                                    <i className="fas fa-chevron-right text-blue-400 mr-2 mt-1 text-xs"></i>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="text-6xl text-gray-600 mb-4">
                        <i className="fas fa-briefcase"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Work Experience Added</h3>
                      <p className="text-gray-500">Add your professional experience to showcase your career journey.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Edit Button */}
        {isAuthenticated && !isEditing && (
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            title="Edit Experience Section"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>
    </section>
  );
}
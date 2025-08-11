'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IEducation } from '@/hooks/usePortfolio';
import { useState } from 'react';
import { YearRangePicker } from '@/components/UI/YearPicker';
import DragDropList, { DragDropTextList } from '@/components/UI/DragDropList';

interface EducationProps {
  educations?: IEducation[];
}

export default function Education({ educations = [] }: EducationProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IEducation[]>([]);

  const handleEdit = () => {
    setEditData([...educations]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updatePortfolio.mutateAsync({ educations: editData });
      setIsEditing(false);
      setEditData([]);
    } catch (error) {
      console.error('Failed to update education:', error);
      alert('Failed to update education. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData([]);
  };

  const addEducation = () => {
    const newEdu: IEducation = {
      degree: '',
      university: '',
      start_year: '',
      end_year: '',
      details: []
    };
    setEditData([...editData, newEdu]);
  };

  const removeEducation = (index: number) => {
    setEditData(editData.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof IEducation, value: string | string[] | number) => {
    const updated = editData.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    setEditData(updated);
  };

  const updateEducationDetails = (eduIndex: number, details: string[]) => {
    updateEducation(eduIndex, 'details', details);
  };

  // const addDetail = (eduIndex: number, detail: string) => {
  //   const currentDetails = editData[eduIndex].details || [];
  //   updateEducation(eduIndex, 'details', [...currentDetails, detail]);
  // };

  // const editDetail = (eduIndex: number, detailIndex: number, newDetail: string) => {
  //   const currentDetails = editData[eduIndex].details || [];
  //   const updatedDetails = currentDetails.map((detail, i) => 
  //     i === detailIndex ? newDetail : detail
  //   );
  //   updateEducation(eduIndex, 'details', updatedDetails);
  // };

  // const removeDetail = (eduIndex: number, detailIndex: number) => {
  //   const currentDetails = editData[eduIndex].details || [];
  //   const updatedDetails = currentDetails.filter((_, i) => i !== detailIndex);
  //   updateEducation(eduIndex, 'details', updatedDetails);
  // };

  const reorderEducations = (reorderedEducations: IEducation[]) => {
    // Update order field for each education
    const updatedEducations = reorderedEducations.map((edu, index) => ({
      ...edu,
      order: index
    }));
    setEditData(updatedEducations);
  };

  return (
    <section id="education" className="py-20 bg-gray-800 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Education
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">My academic background and qualifications</p>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <DragDropList
                items={editData}
                onItemsChange={reorderEducations}
                renderItem={(edu, index) => (
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-grip-vertical text-gray-400 mr-2 cursor-grab"></i>
                        Education #{index + 1}
                      </h3>
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={edu.university}
                        onChange={(e) => updateEducation(index, 'university', e.target.value)}
                        placeholder="University Name"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Degree (e.g., Bachelor's, Master's)"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2">Study Period</label>
                      <YearRangePicker
                        startYear={edu.start_year}
                        endYear={edu.end_year}
                        onStartYearChange={(year) => updateEducation(index, 'start_year', year)}
                        onEndYearChange={(year) => updateEducation(index, 'end_year', year)}
                        allowPresent={true}
                        className="grid grid-cols-2 gap-4"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2">GPAX (optional)</label>
                      <input
                        type="text"
                        value={edu.GPAX || ''}
                        onChange={(e) => updateEducation(index, 'GPAX', e.target.value)}
                        placeholder="3.50"
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Education Details</label>
                      <DragDropTextList
                        items={edu.details || []}
                        onItemsChange={(newDetails) => updateEducationDetails(index, newDetails)}
                        addButtonText="Add Detail"
                        placeholder="e.g., Relevant coursework, achievements, honors"
                        className="bg-gray-600 border border-gray-500"
                      />
                    </div>
                  </div>
                )}
              />
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={addEducation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Add Education
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
            <div className="flex flex-wrap justify-center gap-8">
              {educations.length > 0 ? educations.map((edu, index) => (
                <div key={edu._id || index} className="w-full max-w-md bg-gray-700/50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600 hover:border-blue-500/50">
                  {/* Institution Header */}
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-graduation-cap text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {edu.university}
                      </h3>
                      <p className="text-blue-400 font-semibold">
                        {edu.degree}
                      </p>
                      {edu.GPAX && (
                        <p className="text-gray-400 text-sm">
                          GPAX: {edu.GPAX}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center text-gray-400 mb-4">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    <span>{edu.start_year} - {edu.end_year}</span>
                  </div>

                  {/* Details */}
                  {edu.details && edu.details.length > 0 && (
                    <div className="border-t border-gray-600 pt-4">
                      <div className="space-y-2">
                        {edu.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start">
                            <i className="fas fa-chevron-right text-blue-400 mr-2 mt-1 text-xs"></i>
                            <span className="text-gray-300 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-2 text-center py-16">
                  <div className="text-6xl text-gray-600 mb-4">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Education Added</h3>
                  <p className="text-gray-500">Add your educational background and qualifications.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Edit Button */}
        {isAuthenticated && !isEditing && (
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            title="Edit Education Section"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>
    </section>
  );
}
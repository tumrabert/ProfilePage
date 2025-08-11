'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, ITechnology, ISkillCategory } from '@/hooks/usePortfolio';
import { useState } from 'react';
import TechLogo from '@/components/UI/TechLogo';
import TechnologySelector from '@/components/UI/TechnologySelector';
import DragDropList, { DragDropTextList } from '@/components/UI/DragDropList';
import { Technology } from '@/types/technology';

interface SkillsProps {
  technologies?: ITechnology[];
  skillCategories?: ISkillCategory[];
}

export default function Skills({ technologies = [], skillCategories = [] }: SkillsProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ISkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Group technologies by category for editing
  const getSkillCategoriesForEditing = (): ISkillCategory[] => {
    const grouped = technologies.reduce((acc, tech) => {
      const category = tech.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tech);
      return acc;
    }, {} as Record<string, ITechnology[]>);
    
    return Object.entries(grouped).map(([name, techs], index) => ({
      name,
      technologies: techs.sort((a, b) => (a.order || 0) - (b.order || 0)),
      order: index
    }));
  };

  const handleEdit = () => {
    setEditData([...getSkillCategoriesForEditing()]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Convert skill categories back to flat technologies
      const flatTechnologies: ITechnology[] = [];
      editData.forEach((category, categoryIndex) => {
        category.technologies.forEach((tech, techIndex) => {
          flatTechnologies.push({
            ...tech,
            category: category.name,
            order: categoryIndex * 100 + techIndex
          });
        });
      });
      
      console.log('Saving technologies:', flatTechnologies);
      await updatePortfolio.mutateAsync({ technologies: flatTechnologies });
      setIsEditing(false);
      setEditData([]);
    } catch (error) {
      console.error('Failed to update skills:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update skills: ${errorMessage}. Please try again.`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData([]);
  };

  const addNewCategory = () => {
    const newCategory: ISkillCategory = {
      name: newCategoryName.trim() || 'New Category',
      technologies: [],
      order: editData.length
    };
    setEditData([...editData, newCategory]);
    setNewCategoryName('');
  };

  const removeCategory = (categoryIndex: number) => {
    setEditData(editData.filter((_, i) => i !== categoryIndex));
  };

  const updateCategoryName = (categoryIndex: number, newName: string) => {
    const updated = editData.map((category, i) => 
      i === categoryIndex ? { ...category, name: newName } : category
    );
    setEditData(updated);
  };

  const addTechnologyToCategory = (categoryIndex: number, selectedTech: Technology) => {
    const newTech: ITechnology = {
      name: selectedTech.name,
      category: editData[categoryIndex].name,
      order: editData[categoryIndex].technologies.length
    };
    
    const updated = editData.map((category, i) => 
      i === categoryIndex 
        ? { ...category, technologies: [...category.technologies, newTech] }
        : category
    );
    setEditData(updated);
  };

  const removeTechnologyFromCategory = (categoryIndex: number, techIndex: number) => {
    const updated = editData.map((category, i) => 
      i === categoryIndex 
        ? { 
            ...category, 
            technologies: category.technologies.filter((_, j) => j !== techIndex)
          }
        : category
    );
    setEditData(updated);
  };

  const updateTechnologyInCategory = (categoryIndex: number, techIndex: number, field: keyof ITechnology, value: string | number) => {
    const updated = editData.map((category, i) => 
      i === categoryIndex 
        ? {
            ...category,
            technologies: category.technologies.map((tech, j) => 
              j === techIndex ? { ...tech, [field]: value } : tech
            )
          }
        : category
    );
    setEditData(updated);
  };

  const reorderCategories = (reorderedCategories: ISkillCategory[]) => {
    // Update order field for each category
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      order: index
    }));
    setEditData(updatedCategories);
  };

  const reorderTechnologiesInCategory = (categoryIndex: number, reorderedTechs: ITechnology[]) => {
    const updated = editData.map((category, i) => 
      i === categoryIndex 
        ? {
            ...category,
            technologies: reorderedTechs.map((tech, j) => ({ ...tech, order: j }))
          }
        : category
    );
    setEditData(updated);
  };

  // Group technologies by category
  const groupedTechnologies = technologies.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, ITechnology[]>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend': return 'fa-palette';
      case 'backend': return 'fa-server';
      case 'database': return 'fa-database';
      case 'devops': case 'cloud & devops': return 'fa-cloud';
      case 'mobile': return 'fa-mobile-alt';
      case 'tools': return 'fa-tools';
      case 'testing': return 'fa-vial';
      case 'programming languages': return 'fa-layer-group';
      case 'frameworks & libraries': return 'fa-cube';
      default: return 'fa-cog';
    }
  };


  return (
    <section id="skills" className="py-20 bg-gray-900 relative">
      <div className="container mx-auto px-6 lg:px-8">
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
              {/* Add New Category */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  <i className="fas fa-plus mr-2 text-blue-400"></i>
                  Add New Skill Category
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Backend, Frontend, Mobile..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                    onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                  />
                  <button
                    onClick={addNewCategory}
                    disabled={!newCategoryName.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Category
                  </button>
                </div>
              </div>

              {/* Skill Categories - Similar to Work Experience */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    <i className="fas fa-cog mr-2 text-purple-400"></i>
                    Skill Categories ({editData.length})
                  </h3>
                </div>
                
                <DragDropList
                  items={editData}
                  onItemsChange={reorderCategories}
                  renderItem={(category, categoryIndex) => (
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1">
                          <i className="fas fa-grip-vertical text-gray-400 cursor-grab"></i>
                          <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
                            <i className={`fas ${getCategoryIcon(category.name)} text-white`}></i>
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                              className="text-xl font-bold text-white bg-transparent border-none focus:outline-none focus:bg-gray-700 rounded px-2 py-1"
                              placeholder="Category Name"
                            />
                            <p className="text-xs text-gray-400 mt-1">{category.technologies.length} technologies</p>
                          </div>
                        </div>
                        
                        {/* Remove Category Button */}
                        <button
                          onClick={() => removeCategory(categoryIndex)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                          title="Remove category"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>

                      {/* Add Technology to Category */}
                      <div className="mb-4">
                        <TechnologySelector
                          onChange={(tech) => addTechnologyToCategory(categoryIndex, tech)}
                          placeholder={`Add technology to ${category.name}...`}
                          className="w-full"
                        />
                      </div>

                      {/* Technologies in Category */}
                      {category.technologies.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Technologies:</h4>
                          <DragDropList
                            items={category.technologies}
                            onItemsChange={(reorderedTechs) => reorderTechnologiesInCategory(categoryIndex, reorderedTechs)}
                            renderItem={(tech, techIndex) => (
                              <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <i className="fas fa-grip-vertical text-gray-400 cursor-grab text-xs"></i>
                                    <TechLogo 
                                      technology={{ name: tech.name, icon: tech.name, isCustom: false }}
                                      size="sm"
                                      showName={false}
                                    />
                                    <span className="text-white font-medium">{tech.name}</span>
                                  </div>
                                  
                                  
                                  {/* Remove Technology Button */}
                                  <button
                                    onClick={() => removeTechnologyFromCategory(categoryIndex, techIndex)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                                    title="Remove technology"
                                  >
                                    <i className="fas fa-times text-xs"></i>
                                  </button>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleSave}
                  disabled={updatePortfolio.isPending}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {updatePortfolio.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {technologies.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Object.entries(groupedTechnologies).map(([category, techs]) => (
                    <div key={category} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                      {/* Category Header */}
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <i className={`fas ${getCategoryIcon(category)} text-white`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {category}
                          </h3>
                          <p className="text-xs text-gray-400">{techs.length} technologies</p>
                        </div>
                      </div>

                      {/* Technologies - Featured Projects Style */}
                      <div className="flex flex-wrap gap-2">
                        {techs.map((tech, index) => (
                          <div key={index} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                            {tech.name}
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
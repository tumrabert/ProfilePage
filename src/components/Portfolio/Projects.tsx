'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IProject } from '@/hooks/usePortfolio';
import { useState } from 'react';
import TechLogo from '@/components/UI/TechLogo';
import TechnologySelector from '@/components/UI/TechnologySelector';
import ImageUploader from '@/components/UI/ImageUploader';
import DragDropList from '@/components/UI/DragDropList';
import { Technology } from '@/types/technology';

// Utility function to ensure URL has proper protocol
const ensureUrlProtocol = (url: string | undefined): string => {
  if (!url) return '';
  
  // Clean up the URL
  let cleanUrl = url.trim();
  
  // If it already has a protocol, return as is
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  // Remove common prefixes that might cause issues
  if (cleanUrl.startsWith('www.')) {
    cleanUrl = cleanUrl.substring(4);
  }
  
  // Add https protocol
  return `https://${cleanUrl}`;
};

interface ProjectsProps {
  projects?: IProject[];
}

export default function Projects({ projects = [] }: ProjectsProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<IProject[]>([]);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const handleEdit = () => {
    setEditData([...projects]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Validate and clean the data before saving
      const cleanedData = editData.map((project, index) => {
        const cleanProject = {
          ...project,
          name: project.name?.trim() || `Project ${index + 1}`,
          description: project.description?.trim() || `Description for ${project.name?.trim() || `Project ${index + 1}`}`,
          technologies: project.technologies || [],
          featured: Boolean(project.featured),
          order: project.order ?? index,
          hide: project.hide ?? false,
          // Handle both image and screenshotUrl for compatibility
          image: project.image || '',
          screenshotUrl: project.image || project.screenshotUrl || '',
          demo: project.demo?.trim() || '',
          github: project.github?.trim() || ''
        };
        
        // Ensure name and description are not empty (required by schema)
        if (!cleanProject.name.trim()) {
          cleanProject.name = `Project ${index + 1}`;
        }
        if (!cleanProject.description.trim()) {
          cleanProject.description = `Description for ${cleanProject.name}`;
        }
        
        return cleanProject;
      });

      // Additional validation - filter out any invalid projects
      const validProjects = cleanedData.filter(project => 
        project.name && project.name.trim() && 
        project.description && project.description.trim()
      );
      
      console.log('Saving projects data:', validProjects);
      console.log('Projects count:', validProjects.length);
      
      // Log each project's key fields for debugging
      validProjects.forEach((project, index) => {
        console.log(`Project ${index + 1}:`, {
          name: project.name,
          description: project.description,
          technologies: project.technologies,
          featured: project.featured,
          order: project.order,
          hide: project.hide
        });
      });
      
      await updatePortfolio.mutateAsync({ 
        displayProjects: validProjects
      });
      
      console.log('Projects saved successfully');
      setIsEditing(false);
      setEditData([]);
    } catch (error) {
      console.error('Failed to update projects:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Enhanced error handling with more specific messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Try to extract validation details from the error
      let specificError = errorMessage;
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        if (response && response.data) {
          console.error('API Error Response:', response.data);
          if (response.data.details) {
            console.error('Validation Details:', response.data.details);
            const fieldErrors = Object.keys(response.data.details).map(field => 
              `${field}: ${response.data.details[field].message}`
            ).join(', ');
            specificError = `Validation failed in fields: ${fieldErrors}`;
          } else if (response.data.fields) {
            specificError = `Validation failed in fields: ${response.data.fields.join(', ')}`;
          }
        }
      }
      
      if (errorMessage.includes('fetch')) {
        alert('Network error: Failed to update projects. Please check your connection and try again.');
      } else if (errorMessage.includes('validation') || errorMessage.includes('Validation')) {
        alert(`Validation error: ${specificError}. Please ensure all project names and descriptions are filled.`);
      } else {
        alert(`Failed to update projects: ${specificError}. Please try again.`);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData([]);
  };

  const addProject = () => {
    const newProject: IProject = {
      name: '',
      description: '',
      technologies: [],
      featured: false,
      image: '',
      demo: '',
      github: '',
      hide: false,
      order: editData.length
    };
    setEditData([...editData, newProject]);
  };

  const removeProject = (index: number) => {
    setEditData(editData.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof IProject, value: string | string[] | boolean | number) => {
    const updated = editData.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    );
    setEditData(updated);
  };

  const addTechnology = (projectIndex: number, selectedTech: Technology | { name: string; icon?: string }) => {
    const currentTechs = editData[projectIndex].technologies || [];
    if (!currentTechs.includes(selectedTech.name)) {
      updateProject(projectIndex, 'technologies', [...currentTechs, selectedTech.name]);
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const currentTechs = editData[projectIndex].technologies || [];
    const updatedTechs = currentTechs.filter((_, i) => i !== techIndex);
    updateProject(projectIndex, 'technologies', updatedTechs);
  };

  const reorderProjects = (reorderedProjects: IProject[]) => {
    // Update order field for each project
    const updatedProjects = reorderedProjects.map((project, index) => ({
      ...project,
      order: index
    }));
    setEditData(updatedProjects);
  };

  const filteredProjects = filter === 'featured' 
    ? projects.filter(p => p.featured) 
    : projects;

  return (
    <section id="projects" className="py-20 bg-gray-800 relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Projects
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">A showcase of my recent work and personal projects</p>
          </div>

          {!isEditing && projects.length > 0 && (
            <div className="flex justify-center mb-12">
              <div className="bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  All Projects ({projects.length})
                </button>
                <button
                  onClick={() => setFilter('featured')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    filter === 'featured' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Featured ({projects.filter(p => p.featured).length})
                </button>
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-6">
              {/* Add New Project Button */}
              <div className="text-center">
                <button
                  onClick={addProject}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>Add New Project
                </button>
              </div>
              
              {/* Projects List */}
              <DragDropList
                items={editData}
                onItemsChange={reorderProjects}
                renderItem={(project, index) => (
                  <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 space-y-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <i className="fas fa-grip-vertical text-gray-400 mr-2 cursor-grab"></i>
                        {project.name || `Project #${index + 1}`}
                      </h3>
                      <button
                        onClick={() => removeProject(index)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Remove project"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        placeholder="Project Name *"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.featured}
                            onChange={(e) => updateProject(index, 'featured', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${project.featured ? 'bg-blue-600' : 'bg-gray-500'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${project.featured ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </div>
                          <span className="ml-3 text-white font-medium">Featured Project</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      onKeyDown={(e) => {
                        // Ensure Enter key creates new lines instead of submitting
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          // Allow default behavior (new line)
                        }
                      }}
                      placeholder="Describe your project, its purpose, and key features..."
                      rows={4}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400 resize-y"
                      style={{ minHeight: '100px' }}
                    />
                    
                    {/* Links */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="url"
                        value={project.demo || ''}
                        onChange={(e) => updateProject(index, 'demo', e.target.value)}
                        placeholder="🌐 Live Demo URL"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                      <input
                        type="url"
                        value={project.github || ''}
                        onChange={(e) => updateProject(index, 'github', e.target.value)}
                        placeholder="📦 GitHub Repository URL"
                        className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    {/* Main Project Image */}
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3">
                        <i className="fas fa-image mr-2 text-blue-400"></i>
                        Main Project Image
                      </h4>
                      <ImageUploader
                        currentImage={project.image || ''}
                        onImageChange={(imageUrl) => updateProject(index, 'image', imageUrl)}
                        placeholder="Upload image or enter website URL to generate screenshot"
                        className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
                        showUrlToggle={true}
                      />
                      {project.demo && (
                        <div className="mt-2 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                          <p className="text-xs text-blue-300 mb-2 font-medium">
                            <i className="fas fa-lightbulb mr-1"></i>
                            Quick Tip: Generate Website Thumbnail
                          </p>
                          <div className="text-xs text-gray-300 space-y-1">
                            <p>1. Switch to "Website Screenshot" tab above</p>
                            <p>2. Enter your demo URL: <code className="bg-gray-700 px-1 rounded text-blue-300">{project.demo}</code></p>
                            <p>3. Click "Generate Thumbnail" button 📷</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Technologies */}
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3">
                        <i className="fas fa-code mr-2 text-green-400"></i>
                        Technologies Used
                      </h4>
                      
                      {/* Current Technologies */}
                      {project.technologies.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <div key={techIndex} className="flex items-center bg-gray-600 rounded-lg px-3 py-2">
                                <TechLogo 
                                  technology={{ name: tech, icon: tech, isCustom: false }}
                                  size="sm"
                                  showName={false}
                                  className="mr-2"
                                />
                                <span className="text-white text-sm mr-2">{tech}</span>
                                <button
                                  onClick={() => removeTechnology(index, techIndex)}
                                  className="text-red-400 hover:text-red-300 text-xs"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add Technology */}
                      <TechnologySelector
                        onChange={(tech) => addTechnology(index, tech)}
                        placeholder="Search and add technologies..."
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                className="space-y-6"
              />
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-600">
                <button
                  onClick={handleSave}
                  disabled={updatePortfolio.isPending}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {updatePortfolio.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save All Projects
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProjects.map((project, index) => (
                    <div key={project._id || index} className="bg-gray-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-600 hover:border-blue-500/50 group">
                      {/* Project Image */}
                      <div className="relative overflow-hidden h-48">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <i className="fas fa-code text-6xl text-white opacity-50"></i>
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        {project.featured && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                            <i className="fas fa-star mr-1"></i>
                            Featured
                          </div>
                        )}
                        
                        {/* Overlay with links */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100">
                          {project.demo && (
                            <a
                              href={ensureUrlProtocol(project.demo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                              title="View Live Demo"
                            >
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                          )}
                          {project.github && (
                            <a
                              href={ensureUrlProtocol(project.github)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
                              title="View Source Code"
                            >
                              <i className="fab fa-github"></i>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Project Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>
                        
                        <p className="text-gray-300 mb-4 line-clamp-3">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.slice(0, 5).map((tech, techIndex) => (
                              <div
                                key={techIndex}
                                className="flex items-center bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs font-medium"
                              >
                                <TechLogo 
                                  technology={{ name: tech, icon: tech, isCustom: false }}
                                  size="sm"
                                  showName={false}
                                  className="mr-1"
                                />
                                {tech}
                              </div>
                            ))}
                            {project.technologies.length > 5 && (
                              <span className="bg-gray-600/50 text-gray-400 px-2 py-1 rounded text-xs flex items-center">
                                <i className="fas fa-plus mr-1"></i>
                                {project.technologies.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Project Links at bottom */}
                        <div className="flex space-x-3 mt-4">
                          {project.demo && (
                            <a
                              href={project.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                            >
                              <i className="fas fa-external-link-alt mr-1"></i>
                              Live Demo
                            </a>
                          )}
                          {project.github && (
                            <a
                              href={ensureUrlProtocol(project.github)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
                            >
                              <i className="fab fa-github mr-1"></i>
                              Source Code
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl text-gray-600 mb-4">
                    <i className="fas fa-folder-open"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {filter === 'featured' ? 'No Featured Projects' : 'No Projects Added'}
                  </h3>
                  <p className="text-gray-500">
                    {filter === 'featured' 
                      ? 'Mark some projects as featured to display them here.' 
                      : 'Add your projects to showcase your work and skills.'}
                  </p>
                </div>
              )}

              {/* View All Projects CTA */}
              {filter === 'featured' && projects.length > filteredProjects.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setFilter('all')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    View All Projects ({projects.length})
                  </button>
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
            title="Edit Projects Section"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>
    </section>
  );
}
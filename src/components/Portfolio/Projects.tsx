'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpdatePortfolio, IProject } from '@/hooks/usePortfolio';
import { useState } from 'react';

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
      await updatePortfolio.mutateAsync({ 
        displayProjects: editData
      });
      setIsEditing(false);
      setEditData([]);
    } catch (error) {
      console.error('Failed to update projects:', error);
      alert('Failed to update projects. Please try again.');
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
      featured: false
    };
    setEditData([...editData, newProject]);
  };

  const removeProject = (index: number) => {
    setEditData(editData.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof IProject, value: string | string[] | boolean) => {
    const updated = editData.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    );
    setEditData(updated);
  };

  const filteredProjects = filter === 'featured' 
    ? projects.filter(p => p.featured) 
    : projects;

  return (
    <section id="projects" className="py-20 bg-gray-800 relative">
      <div className="container mx-auto px-6 lg:px-8 lg:ml-20 xl:ml-64">
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
            <div className="space-y-8">
              {editData.map((project, index) => (
                <div key={index} className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">Project #{index + 1}</h3>
                    <button
                      onClick={() => removeProject(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      placeholder="Project Name"
                      className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="url"
                      value={project.demo || ''}
                      onChange={(e) => updateProject(index, 'demo', e.target.value)}
                      placeholder="Live Demo URL"
                      className="bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="url"
                      value={project.github || ''}
                      onChange={(e) => updateProject(index, 'github', e.target.value)}
                      placeholder="GitHub URL"
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
                        <span className="ml-2 text-white">Featured Project</span>
                      </label>
                    </div>
                  </div>
                  
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    placeholder="Project description"
                    rows={3}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400 mb-4"
                  />
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={project.technologies.join(', ')}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="React, Node.js, MongoDB"
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between">
                <button
                  onClick={addProject}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Add Project
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
              {filteredProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProjects.map((project, index) => (
                    <div key={project._id || index} className="bg-gray-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-600 hover:border-blue-500/50 group">
                      {/* Project Image */}
                      <div className="relative overflow-hidden h-48">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <i className="fas fa-code text-6xl text-white opacity-50"></i>
                        </div>
                        
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
                              href={project.demo}
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
                              href={project.github}
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
                            {project.technologies.slice(0, 4).map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 4 && (
                              <span className="bg-gray-600/50 text-gray-400 px-2 py-1 rounded text-xs">
                                +{project.technologies.length - 4} more
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
                              href={project.github}
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
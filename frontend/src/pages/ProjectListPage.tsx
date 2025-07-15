import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useProjectsStore } from "../store/projectsStore";
import type { ProjectCreateData } from "../types";
import { 
  Plus, 
  FolderOpen, 
  Edit, 
  Trash2, 
  LogOut, 
  User,
  X
} from "lucide-react";

const ProjectListPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: number; name: string; description?: string } | null>(null);
  const navigate = useNavigate();
  
  const { user, logout } = useAuthStore();
  const { 
    projects, 
    isLoading, 
    error, 
    fetchProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    clearError 
  } = useProjectsStore();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectCreateData>();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: ProjectCreateData) => {
    try {
      await createProject(data);
      setShowCreateModal(false);
      reset();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleEditProject = async (data: ProjectCreateData) => {
    if (!editingProject) return;
    
    try {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
      reset();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const openEditModal = (project: { id: number; name: string; description?: string }) => {
    setEditingProject(project);
    reset({ name: project.name, description: project.description });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    reset();
    clearError();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {user?.username}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-600 mt-1 text-base lg:text-lg">Manage your projects and track progress</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center text-sm lg:text-base font-medium transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="p-6 lg:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                      <FolderOpen className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600 mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{project.name}</h3>
                        <p className="text-sm lg:text-base text-gray-600 mt-1 line-clamp-2">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
                  >
                    Open Project
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create/Edit Project Modal */}
      {(showCreateModal || editingProject) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md lg:max-w-lg w-full">
            <div className="flex justify-between items-center p-6 lg:p-8 border-b">
              <h3 className="text-lg lg:text-xl font-semibold">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(editingProject ? handleEditProject : handleCreateProject)} className="p-6 lg:p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', {
                      required: 'Project name is required',
                      minLength: {
                        value: 3,
                        message: 'Project name must be at least 3 characters'
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                    placeholder="Enter project description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-6 py-3 text-sm lg:text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 text-sm lg:text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;

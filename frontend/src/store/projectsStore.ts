import { create } from 'zustand';
import { projectsApi } from '../services/api';
import type { Project, ProjectCreateData } from '../types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  createProject: (data: ProjectCreateData) => Promise<Project>;
  updateProject: (id: number, data: ProjectCreateData) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  clearError: () => void;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsApi.getProjects();
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  fetchProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.getProject(id);
      set({ currentProject: project, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  createProject: async (data: ProjectCreateData) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await projectsApi.createProject(data);
      set(state => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      return newProject;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (id: number, data: ProjectCreateData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await projectsApi.updateProject(id, data);
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update project',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await projectsApi.deleteProject(id);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete project',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));

import axios from 'axios';
import type { 
  User, 
  Project, 
  Issue, 
  AuthResponse, 
  LoginData, 
  SignupData, 
  ProjectCreateData, 
  IssueCreateData,
  ApiError 
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: ProjectCreateData): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  updateProject: async (id: number, data: ProjectCreateData): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Issues API
export const issuesApi = {
  getIssuesByProject: async (projectId: number): Promise<Issue[]> => {
    const response = await api.get(`/issues/project/${projectId}`);
    return response.data;
  },

  getIssue: async (id: number): Promise<Issue> => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  createIssue: async (data: IssueCreateData): Promise<Issue> => {
    const response = await api.post('/issues', data);
    return response.data;
  },

  updateIssue: async (id: number, data: IssueCreateData): Promise<Issue> => {
    const response = await api.put(`/issues/${id}`, data);
    return response.data;
  },

  updateIssueStatus: async (id: number, status: string): Promise<void> => {
    await api.patch(`/issues/${id}/status`, { status });
  },

  deleteIssue: async (id: number): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },
};

export default api;

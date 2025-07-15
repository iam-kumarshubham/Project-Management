export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
}

export interface Issue {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: number;
  project_id: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
}

export interface IssueCreateData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: number;
  project_id: number;
}

export type IssueStatus = 'To Do' | 'In Progress' | 'Done';
export type IssuePriority = 'Low' | 'Medium' | 'High';

export interface ApiError {
  detail: string;
}

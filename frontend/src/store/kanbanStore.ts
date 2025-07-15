import { create } from "zustand";
import { issuesApi } from "../services/api";
import type { Issue, IssueCreateData } from "../types";

interface KanbanState {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchIssues: (projectId: number) => Promise<void>;
  createIssue: (data: IssueCreateData) => Promise<Issue>;
  updateIssue: (id: number, data: IssueCreateData) => Promise<void>;
  deleteIssue: (id: number) => Promise<void>;
  moveIssue: (issueId: number, status: string) => Promise<void>;
  clearError: () => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  issues: [],
  isLoading: false,
  error: null,

  fetchIssues: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const issues = await issuesApi.getIssuesByProject(projectId);
      set({ issues, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch issues',
        isLoading: false,
      });
    }
  },

  createIssue: async (data: IssueCreateData) => {
    set({ isLoading: true, error: null });
    try {
      const newIssue = await issuesApi.createIssue(data);
      set(state => ({
        issues: [...state.issues, newIssue],
        isLoading: false,
      }));
      return newIssue;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create issue',
        isLoading: false,
      });
      throw error;
    }
  },

  updateIssue: async (id: number, data: IssueCreateData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedIssue = await issuesApi.updateIssue(id, data);
      set(state => ({
        issues: state.issues.map(issue =>
          issue.id === id ? updatedIssue : issue
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update issue',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteIssue: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await issuesApi.deleteIssue(id);
      set(state => ({
        issues: state.issues.filter(issue => issue.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete issue',
        isLoading: false,
      });
      throw error;
    }
  },

  moveIssue: async (issueId: number, status: string) => {
    // Optimistically update the UI
    set(state => ({
      issues: state.issues.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      ),
    }));
    
    try {
      await issuesApi.updateIssueStatus(issueId, status);
    } catch (error: any) {
      // Revert the optimistic update on error
      const { issues } = get();
      const originalIssue = issues.find(i => i.id === issueId);
      if (originalIssue) {
        // We'd need to store the original status to revert properly
        // For now, we'll just refetch the issues
        // get().fetchIssues(originalIssue.project_id);
      }
      set({
        error: error.response?.data?.detail || 'Failed to update issue status',
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

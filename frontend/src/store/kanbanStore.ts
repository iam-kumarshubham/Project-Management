import { create } from "zustand";
import { Issue } from "../types";

interface KanbanState {
  issues: Issue[];
  fetchIssues: (projectId: number) => Promise<void>;
  moveIssue: (issueId: number, status: string) => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  issues: [],
  fetchIssues: async (projectId: number) => {
    // Replace with your API call
    const res = await fetch(`/api/issues/project/${projectId}`);
    const data = await res.json();
    set({ issues: data });
  },
  moveIssue: (issueId, status) => {
    set(state => ({
      issues: state.issues.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      ),
    }));
    // Optionally, send update to backend
    fetch(`/api/issues/${issueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
}));

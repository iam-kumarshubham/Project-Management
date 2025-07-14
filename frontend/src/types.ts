export interface Issue {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: number;
  project_id: number;
}

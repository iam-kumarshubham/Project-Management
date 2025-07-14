import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useKanbanStore } from "../store/kanbanStore";
import IssueCard from "../components/IssueCard";

const statuses = ["To Do", "In Progress", "Done"];

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const { issues, fetchIssues, moveIssue } = useKanbanStore();

  useEffect(() => {
    if (id) fetchIssues(Number(id));
  }, [id, fetchIssues]);

  const onDrop = (status: string, issueId: number) => {
    moveIssue(issueId, status);
  };

  return (
    <div className="p-8">
      <h2 className="mb-6 text-2xl font-bold">Project Details</h2>
      <div className="flex gap-4">
        {statuses.map((status) => (
          <div
            key={status}
            className="flex-1 bg-gray-100 rounded p-4 min-h-[300px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const issueId = Number(e.dataTransfer.getData("issueId"));
              onDrop(status, issueId);
            }}
          >
            <h3 className="mb-2 font-semibold">{status}</h3>
            {issues
              .filter((issue) => issue.status === status)
              .map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
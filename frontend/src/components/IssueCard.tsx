import React from "react";
import { Issue } from "../types";

interface Props {
  issue: Issue;
}

const IssueCard: React.FC<Props> = ({ issue }) => {
  return (
    <div
      className="bg-white rounded shadow p-2 mb-2 cursor-move"
      draggable
      onDragStart={e => e.dataTransfer.setData("issueId", String(issue.id))}
    >
      <div className="font-bold">{issue.title}</div>
      <div className="text-sm text-gray-600">{issue.status}</div>
      <div className="text-xs text-gray-400">{issue.priority}</div>
    </div>
  );
};

export default IssueCard;

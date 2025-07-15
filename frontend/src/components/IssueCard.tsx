import React from "react";
import { useDrag } from "react-dnd";
import { Edit, Trash2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { Issue } from "../types";

interface Props {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onDelete: (issueId: number) => void;
}

const IssueCard: React.FC<Props> = ({ issue, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'issue',
    item: { id: issue.id, status: issue.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'To Do':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'In Progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'Done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-move transition-all hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-3' : 'opacity-100'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {issue.title}
        </h4>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(issue);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(issue.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {issue.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {issue.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(issue.status)}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              getPriorityColor(issue.priority)
            }`}
          >
            {issue.priority}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          ID: {issue.id}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;

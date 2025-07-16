import React from "react";
import IssueCard from "../components/IssueCard";
import { useDrop } from "react-dnd";

interface KanbanBoardProps {
  issues: any[];
  onEdit: (issue: any) => void;
  onDelete: (issueId: number) => void;
  moveIssue: (issueId: number, status: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues, onEdit, onDelete, moveIssue }) => {
  const onDrop = (status: string, item: { id: number }) => {
    moveIssue(item.id, status);
  };

  const [, dropToDo] = useDrop(() => ({ accept: "issue", drop: (item: any) => onDrop("To Do", item) }));
  const [, dropInProgress] = useDrop(() => ({ accept: "issue", drop: (item: any) => onDrop("In Progress", item) }));
  const [, dropDone] = useDrop(() => ({ accept: "issue", drop: (item: any) => onDrop("Done", item) }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div ref={dropToDo} className="bg-gray-100 rounded-lg p-4 lg:p-6 min-h-[500px] lg:min-h-[600px]">
          <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            To Do
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {issues.filter(issue => issue.status === "To Do").map(issue => (
              <IssueCard key={issue.id} issue={issue} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
        <div ref={dropInProgress} className="bg-gray-100 rounded-lg p-4 lg:p-6 min-h-[500px] lg:min-h-[600px]">
          <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            In Progress
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {issues.filter(issue => issue.status === "In Progress").map(issue => (
              <IssueCard key={issue.id} issue={issue} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
        <div ref={dropDone} className="bg-gray-100 rounded-lg p-4 lg:p-6 min-h-[500px] lg:min-h-[600px]">
          <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Done
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {issues.filter(issue => issue.status === "Done").map(issue => (
              <IssueCard key={issue.id} issue={issue} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;


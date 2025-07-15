import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useProjectsStore } from "../store/projectsStore";
import { useKanbanStore } from "../store/kanbanStore";
import IssueCard from "../components/IssueCard";
import IssueModal from "../components/IssueModal";
import { Plus } from "lucide-react";

const statuses = ["To Do", "In Progress", "Done"];

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();

  const { currentProject, fetchProject } = useProjectsStore();
  const {
    issues,
    isLoading,
    error,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssue,
    clearError,
  } = useKanbanStore();

  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchIssues(projectId);
    }
  }, [projectId, fetchProject, fetchIssues]);

  const onDrop = (status: string, item: { id: number }) => {
    moveIssue(item.id, status);
  };

  const [, dropToDo] = useDrop(() => ({ accept: "issue", drop: (item: any) => onDrop("To Do", item) }));
  const [, dropInProgress] = useDrop(() => ({ accept: "issue", drop: (item: any) => onDrop("In Progress", item) }));
  const [, dropDone] = useDrop(() => ({ accept: "issue", drop: (item: any) => onDrop("Done", item) }));

  const handleEdit = (issue: any) => {
    setEditingIssue(issue);
    setShowModal(true);
  };

  const handleDelete = async (issueId: number) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await deleteIssue(issueId);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const handleModalSubmit = async (data: any) => {
    try {
      if (editingIssue) {
        await updateIssue(editingIssue.id, data);
      } else {
        await createIssue(data);
      }
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:underline font-medium"
          >
            ← Back to Projects
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {currentProject?.name || "Loading..."}
              </h1>
              {currentProject?.description && (
                <p className="text-gray-600 mt-2 text-sm lg:text-base">{currentProject.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                setEditingIssue(null);
                setShowModal(true);
              }}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium text-sm lg:text-base transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Issue
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        </div>
      )}

      {/* Drag-and-Drop Kanban Board */}
      <DndProvider backend={HTML5Backend}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div ref={dropToDo} className="bg-gray-100 rounded-lg p-4 lg:p-6 min-h-[500px] lg:min-h-[600px]">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                To Do
              </h3>
              <div className="space-y-3 lg:space-y-4">
                {issues.filter((issue) => issue.status === "To Do").map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
            <div ref={dropInProgress} className="bg-gray-100 rounded-lg p-4 lg:p-6 min-h-[500px] lg:min-h-[600px]">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                In Progress
              </h3>
              <div className="space-y-3 lg:space-y-4">
                {issues.filter((issue) => issue.status === "In Progress").map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
            <div ref={dropDone} className="bg-gray-100 rounded-lg p-4 lg:p-6 min-h-[500px] lg:min-h-[600px]">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Done
              </h3>
              <div className="space-y-3 lg:space-y-4">
                {issues.filter((issue) => issue.status === "Done").map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DndProvider>

      {/* Issue Modal */}
      <IssueModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          clearError();
        }}
        onSubmit={handleModalSubmit}
        issue={editingIssue}
        projectId={projectId}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectDetailPage;

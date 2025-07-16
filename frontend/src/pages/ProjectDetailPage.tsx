import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useProjectsStore } from "../store/projectsStore";
import { useKanbanStore } from "../store/kanbanStore";
import IssueModal from "../components/IssueModal";
import { Plus } from "lucide-react";
import KanbanBoard from "./KanbanBoard";

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
        <KanbanBoard
          issues={issues}
          onEdit={handleEdit}
          onDelete={handleDelete}
          moveIssue={moveIssue}
        />
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

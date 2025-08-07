import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { apiClient } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeProvider";
import { useProjects } from "../hooks/useProjects";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  PlusIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { ShareProjectModal } from "../components/ShareProjectModal";

export const ProjectsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isPageLoading } = usePageLoading();

  // Get current section from URL params
  const currentSection = searchParams.get("section") || "my-projects";
  const {
    projects,
    sharedProjects,
    isLoading,
    refetch,
    refetchSharedProjects,
  } = useProjects();

  // Helper function to check if user is owner of a project
  const isProjectOwner = (project: any) => {
    return user && project && project.owner_id && user.id === project.owner_id;
  };

  // Handle section change
  const handleSectionChange = (section: string) => {
    setSearchParams({ section });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsCreating(true);
    apiClient
      .createProject({ name: projectName })
      .then(() => {
        setProjectName("");
        setShowCreateForm(false);
        refetch();
      })
      .catch((error) => {
        console.error("Failed to create project:", error);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      apiClient
        .deleteProject(id)
        .then(() => {
          refetch();
        })
        .catch((error) => {
          console.error("Failed to delete project:", error);
        });
    }
  };

  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    setIsNavigating(true);
    // Small delay to show the loading animation
    setTimeout(() => {
      console.log("Executing navigation to:", path);
      navigate(path);
    }, 500);
  };

  // Show loading animation while page is loading
  if (isPageLoading) {
    return (
      <div
        className={`min-h-screen flex items-start justify-center pt-40 transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
        }`}
      >
        <LoadingAnimation size="xl" showText={false} />
      </div>
    );
  }

  // Show loading animation while navigating
  if (isNavigating) {
    return (
      <div className="fixed inset-0 flex items-start justify-center pt-40 z-50">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="relative z-10">
          <LoadingAnimation size="xl" showText={false} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div
          className={`transition-all duration-300 ease-out ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
                }`}
              >
                Projects
              </h1>
              <p
                className={`mt-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Manage your circuit design projects
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div
          className={`transition-all duration-300 ease-out ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-4 border border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-4 border border-green-200/50"
          }`}
        >
          <div className="flex space-x-2">
            <button
              onClick={() => handleSectionChange("my-projects")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                currentSection === "my-projects"
                  ? theme === "dark"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-green-500 text-white shadow-lg"
                  : theme === "dark"
                  ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              My Projects ({projects?.length || 0})
            </button>
            <button
              onClick={() => handleSectionChange("shared")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                currentSection === "shared"
                  ? theme === "dark"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-blue-500 text-white shadow-lg"
                  : theme === "dark"
                  ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Shared with Me ({sharedProjects?.length || 0})
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton
              type="project-card"
              className={theme === "dark" ? "dark" : ""}
            />
            <LoadingSkeleton
              type="project-card"
              className={theme === "dark" ? "dark" : ""}
            />
            <LoadingSkeleton
              type="project-card"
              className={theme === "dark" ? "dark" : ""}
            />
            <LoadingSkeleton
              type="project-card"
              className={theme === "dark" ? "dark" : ""}
            />
            <LoadingSkeleton
              type="project-card"
              className={theme === "dark" ? "dark" : ""}
            />
            <LoadingSkeleton
              type="project-card"
              className={theme === "dark" ? "dark" : ""}
            />
          </div>
        ) : currentSection === "my-projects" ? (
          <>
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`transition-all duration-500 ease-out ${
                      theme === "dark"
                        ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-green-500/10 hover:border-green-500/20"
                        : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3 shadow-lg">
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {project.name}
                            </h3>
                            {isProjectOwner(project) && (
                              <span
                                className={`px-1.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                                  theme === "dark"
                                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                    : "bg-purple-100 text-purple-700 border border-purple-200"
                                }`}
                              >
                                <StarIcon className="h-2.5 w-2.5" />
                                Owner
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Last edited{" "}
                            {new Date(project.updated_at).toLocaleDateString()}
                            {project.created_at !== project.updated_at && (
                              <span className="ml-2 text-xs opacity-75">
                                (created{" "}
                                {new Date(
                                  project.created_at
                                ).toLocaleDateString()}
                                )
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShareModalOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-300 ease-out"
                          title="Share project"
                        >
                          <ShareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate(`/projects/${project.id}`)
                          }
                          className="text-green-400 hover:text-green-300 transition-colors duration-300 ease-out"
                          title="View project"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-300 ease-out"
                          title="Delete project"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() =>
                          handleNavigate(`/projects/${project.id}`)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex-1 text-center ${
                          theme === "dark"
                            ? "bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-green-500/30"
                            : "bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-green-300"
                        }`}
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleNavigate(`/projects/${project.id}/editor`)
                        }
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-green-500/20 flex-1 text-center"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`transition-all duration-300 ease-out ${
                  theme === "dark"
                    ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-12 text-center border border-gray-700/50"
                    : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 text-center border border-green-200/50"
                }`}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <FolderIcon className="h-8 w-8 text-white" />
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  No projects yet
                </h3>
                <p
                  className={`mb-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Get started by creating your first circuit project.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 inline-flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Project
                </button>
              </div>
            )}
          </>
        ) : currentSection === "shared" ? (
          <>
            {sharedProjects && sharedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedProjects.map((share) => (
                  <div
                    key={share.id}
                    className={`transition-all duration-500 ease-out ${
                      theme === "dark"
                        ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-blue-500/10 hover:border-blue-500/20"
                        : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-blue-200/50 hover:shadow-blue-500/20 hover:border-blue-300/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg mr-3 shadow-lg">
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {share.project?.name || "Unknown Project"}
                            </h3>
                            {isProjectOwner(share.project) && (
                              <span
                                className={`px-1.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                                  theme === "dark"
                                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                    : "bg-purple-100 text-purple-700 border border-purple-200"
                                }`}
                              >
                                <StarIcon className="h-2.5 w-2.5" />
                                Owner
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            Shared by {share.shared_by_user?.name || "Unknown"}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            {share.role === "viewer"
                              ? "Read Only"
                              : "Read & Write"}{" "}
                            • Last edited{" "}
                            {new Date(
                              share.project?.updated_at || share.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      {share.role === "viewer" ? (
                        // Read-only: Show only one "View" button
                        <button
                          onClick={() =>
                            handleNavigate(`/projects/${share.project_id}`)
                          }
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-blue-500/20 w-full text-center"
                        >
                          View
                        </button>
                      ) : (
                        // Read & Write: Show both "View" and "Edit" buttons
                        <>
                          <button
                            onClick={() =>
                              handleNavigate(`/projects/${share.project_id}`)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex-1 text-center ${
                              theme === "dark"
                                ? "bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-blue-500/30"
                                : "bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleNavigate(
                                `/projects/${share.project_id}/editor`
                              )
                            }
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-blue-500/20 flex-1 text-center"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`transition-all duration-300 ease-out ${
                  theme === "dark"
                    ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-12 text-center border border-gray-700/50"
                    : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 text-center border border-green-200/50"
                }`}
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <ShareIcon className="h-8 w-8 text-white" />
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  No shared projects
                </h3>
                <p
                  className={`mb-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Projects shared with you will appear here.
                </p>
              </div>
            )}
          </>
        ) : null}

        {/* Create Project Modal */}
        {showCreateForm && (
          <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-[9999] ${
              theme === "dark"
                ? "bg-gray-900/80 backdrop-blur-sm"
                : "bg-gray-600/50"
            }`}
          >
            <div
              className={`relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl ${
                theme === "dark"
                  ? "bg-gray-800/90 border-gray-700/50"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="mt-3">
                <h3
                  className={`text-xl font-bold mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create New Project
                </h3>
                <form onSubmit={handleCreateProject}>
                  <div className="mb-4">
                    <label
                      htmlFor="project-name"
                      className={`block text-sm font-medium mb-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Project Name
                    </label>
                    <input
                      id="project-name"
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg transition-all duration-300 ease-out ${
                        theme === "dark"
                          ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                          : "border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      }`}
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 flex-1 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <LoadingAnimation size="sm" showText={false} />
                      ) : (
                        "Create"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ease-out flex-1 ${
                        theme === "dark"
                          ? "bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-green-500/30"
                          : "bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-green-300"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Share Project Modal */}
        {selectedProject && (
          <ShareProjectModal
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false);
              setSelectedProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

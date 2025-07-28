import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeProvider";
import {
  PlusIcon,
  FolderIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

export const ProjectsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Use user-specific query key to prevent cache conflicts between users
  const queryKey = user ? ["projects", user.id] : ["projects"];

  const { data: projects, isLoading } = useQuery({
    queryKey,
    queryFn: () => apiClient.getProjects(),
    enabled: !!user, // Only fetch if user is authenticated
  });

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => apiClient.createProject({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setShowCreateModal(false);
      setNewProjectName("");
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProjectMutation.mutate(newProjectName.trim());
    }
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

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
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : projects && projects.length > 0 ? (
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
                      <h3
                        className={`text-lg font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {project.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-green-400 hover:text-green-300 transition-colors duration-300 ease-out"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-300 ease-out"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex-1 text-center ${
                      theme === "dark"
                        ? "bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-green-500/30"
                        : "bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-green-300"
                    }`}
                  >
                    View
                  </Link>
                  <Link
                    to={`/projects/${project.id}/editor`}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-green-500/20 flex-1 text-center"
                  >
                    Edit
                  </Link>
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
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Project
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-50 ${
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
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 flex-1 disabled:opacity-50"
                    >
                      {createProjectMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Create"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
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
      </div>
    </div>
  );
};

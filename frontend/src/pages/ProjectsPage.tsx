import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your circuit design projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary inline-flex items-center"
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
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FolderIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="btn btn-outline flex-1 text-center"
                >
                  View
                </Link>
                <Link
                  to={`/projects/${project.id}/editor`}
                  className="btn btn-primary flex-1 text-center"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first circuit project.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Project
              </h3>
              <form onSubmit={handleCreateProject}>
                <div className="mb-4">
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Project Name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    className="input w-full"
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
                    className="btn btn-primary flex-1"
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
                    className="btn btn-outline flex-1"
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
  );
};

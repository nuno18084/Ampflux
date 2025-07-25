import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  ArrowLeftIcon,
  PencilIcon,
  ClockIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
  });

  const { data: versions } = useQuery({
    queryKey: ["circuit-versions", projectId],
    queryFn: () => apiClient.getCircuitVersions(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Project not found
        </h2>
        <Link to="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/projects" className="text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600">Circuit Design Project</p>
            </div>
          </div>
          <Link
            to={`/projects/${project.id}/editor`}
            className="btn btn-primary inline-flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Circuit
          </Link>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Project Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <FolderIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-600">
                Name: {project.name}
              </span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-600">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            {project.description && (
              <div>
                <span className="text-sm text-gray-600">
                  Description: {project.description}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Circuit Versions
          </h2>
          {versions && versions.length > 0 ? (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Version {version.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project.id}/editor?version=${version.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No versions yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start designing your circuit to create the first version.
              </p>
              <Link
                to={`/projects/${project.id}/editor`}
                className="btn btn-primary inline-flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Start Designing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/projects/${project.id}/editor`}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Edit Circuit</h3>
              <p className="text-sm text-gray-500">
                Design and modify your circuit
              </p>
            </div>
          </Link>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClockIcon className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">View History</h3>
              <p className="text-sm text-gray-500">See all circuit versions</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FolderIcon className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Export</h3>
              <p className="text-sm text-gray-500">Download circuit files</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

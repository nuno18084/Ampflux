import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { apiClient } from "../lib/api";
import {
  ArrowLeftIcon,
  PencilIcon,
  FolderIcon,
  ClockIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient.getProject(parseInt(projectId!)),
    enabled: !!projectId,
  });

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ["circuit-versions", projectId],
    queryFn: () => apiClient.getCircuitVersions(parseInt(projectId!)),
    enabled: !!projectId,
  });

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-start justify-center pt-40">
        <LoadingAnimation size="xl" showText={false} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Project not found
          </h2>
          <Link
            to="/projects"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-green-500/20 inline-flex items-center"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/projects"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <p className="text-gray-300 mt-1">Circuit Design Project</p>
              </div>
            </div>
            <Link
              to={`/projects/${project.id}/editor`}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-green-500/20 inline-flex items-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Circuit
            </Link>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">
              Project Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3 shadow-lg">
                  <FolderIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-gray-300">
                  Name: {project.name}
                </span>
              </div>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg mr-3 shadow-lg">
                  <ClockIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-gray-300">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              {project.description && (
                <div>
                  <span className="text-sm text-gray-300">
                    Description: {project.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Circuit Versions</h2>
              {versions && versions.length > 0 && (
                <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1 rounded-full shadow-sm border border-gray-600">
                  {versions.length} version{versions.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {versions && versions.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 border border-gray-600/50 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 hover:border-green-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
                        <ClockIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Version {version.version_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(version.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/projects/${project.id}/editor?version=${version.id}`}
                      className="text-green-400 hover:text-green-300 text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <FolderIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No versions yet
                </h3>
                <p className="text-gray-400 mb-4">
                  Start designing your circuit to create the first version.
                </p>
                <Link
                  to={`/projects/${project.id}/editor`}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center border border-green-500/20"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Start Designing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/projects/${project.id}/editor`}
              className="group flex items-center p-6 rounded-xl transition-all duration-500 ease-out bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                <PencilIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Edit Circuit</h3>
                <p className="text-sm text-gray-400">
                  Design and modify your circuit
                </p>
              </div>
            </Link>

            <button className="group flex items-center p-6 rounded-xl transition-all duration-500 ease-out bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">View History</h3>
                <p className="text-sm text-gray-400">
                  See all circuit versions
                </p>
              </div>
            </button>

            <button className="group flex items-center p-6 rounded-xl transition-all duration-500 ease-out bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Export</h3>
                <p className="text-sm text-gray-400">Download circuit files</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

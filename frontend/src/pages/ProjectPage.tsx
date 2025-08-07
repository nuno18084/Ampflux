import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { apiClient } from "../lib/api";
import { useTheme } from "../contexts/ThemeProvider";
import { useProjectPermissions } from "../hooks/useProjectPermissions";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowLeftIcon,
  PencilIcon,
  FolderIcon,
  ClockIcon,
  BoltIcon,
  ShareIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { ShareProjectModal } from "../components/ShareProjectModal";

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { theme } = useTheme();

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000); // Show loading for 1 second

    return () => clearTimeout(timer);
  }, []);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient.getProject(parseInt(projectId!)),
    enabled: !!projectId,
  });

  // Get project permissions
  const permissions = useProjectPermissions(parseInt(projectId!));

  // Get current user
  const { user } = useAuth();

  // Check if current user is the owner
  const isOwner =
    user && project && project.owner_id && user.id === project.owner_id;

  const {
    data: versions,
    isLoading: versionsLoading,
    refetch: refetchVersions,
  } = useQuery({
    queryKey: ["circuit-versions", projectId],
    queryFn: () => apiClient.getCircuitVersions(parseInt(projectId!)),
    enabled: !!projectId,
  });

  // Refetch versions when page loads to get latest data
  useEffect(() => {
    if (!isPageLoading && projectId) {
      refetchVersions();
    }
  }, [isPageLoading, projectId, refetchVersions]);

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

  if (projectLoading || permissions.isLoading) {
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

  if (!project) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
        }`}
      >
        <div className="text-center">
          <h2
            className={`text-2xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
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
            <div className="flex items-center space-x-4">
              <Link
                to="/projects"
                className={`transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-green-400"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1
                    className={`text-3xl font-bold ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                        : "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
                    }`}
                  >
                    {project.name}
                  </h1>
                  {isOwner && (
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
                  className={`mt-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Circuit Design Project
                  {!permissions.canEdit && (
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        theme === "dark"
                          ? "bg-gray-700/50 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      Read Only
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {permissions.canShare && (
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-blue-500/20 inline-flex items-center"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Share
                </button>
              )}
              {permissions.canEdit && (
                <Link
                  to={`/projects/${project.id}/editor`}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-green-500/20 inline-flex items-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Circuit
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`transition-all duration-300 ease-out ${
              theme === "dark"
                ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
                : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Project Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3 shadow-lg">
                  <FolderIcon className="h-4 w-4 text-white" />
                </div>
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Name: {project.name}
                </span>
              </div>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg mr-3 shadow-lg">
                  <ClockIcon className="h-4 w-4 text-white" />
                </div>
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              {project.description && (
                <div>
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description: {project.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-out ${
              theme === "dark"
                ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
                : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Circuit Versions
              </h2>
              {versions && versions.length > 0 && (
                <span
                  className={`text-sm px-3 py-1 rounded-full shadow-sm border ${
                    theme === "dark"
                      ? "text-gray-300 bg-gray-700/50 border-gray-600"
                      : "text-gray-600 bg-white border-green-200"
                  }`}
                >
                  {versions.length} version{versions.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {versions && versions.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                      theme === "dark"
                        ? "border-gray-600/50 bg-gray-700/50 hover:bg-gray-600/50 hover:border-green-500/30"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
                        <ClockIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Version {version.version_number}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {new Date(version.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/projects/${project.id}/editor?version=${version.id}`}
                      className={`text-sm font-medium hover:underline ${
                        theme === "dark"
                          ? "text-green-400 hover:text-green-300"
                          : "text-green-600 hover:text-green-700"
                      }`}
                    >
                      {permissions.canEdit ? "View" : "View Only"}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <FolderIcon className="h-8 w-8 text-white" />
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  No versions yet
                </h3>
                <p
                  className={`mb-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Start designing your circuit to create the first version.
                </p>
                {permissions.canEdit && (
                  <Link
                    to={`/projects/${project.id}/editor`}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center border border-green-500/20"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Start Designing
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`transition-all duration-300 ease-out ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50"
          }`}
        >
          <h2
            className={`text-xl font-bold mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permissions.canEdit && (
              <Link
                to={`/projects/${project.id}/editor`}
                className={`group flex items-center p-6 rounded-xl transition-all duration-500 ease-out ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
                    : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 hover:shadow-lg hover:border-green-300/50"
                }`}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                  <PencilIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Edit Circuit
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Design and modify your circuit
                  </p>
                </div>
              </Link>
            )}

            <button
              className={`group flex items-center p-6 rounded-xl transition-all duration-500 ease-out ${
                theme === "dark"
                  ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
                  : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 hover:shadow-lg hover:border-green-300/50"
              }`}
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3
                  className={`font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  View History
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  See all circuit versions
                </p>
              </div>
            </button>

            <button
              className={`group flex items-center p-6 rounded-xl transition-all duration-500 ease-out ${
                theme === "dark"
                  ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
                  : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 hover:shadow-lg hover:border-green-300/50"
              }`}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3
                  className={`font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Export
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Download circuit files
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Share Project Modal */}
        <ShareProjectModal
          projectId={parseInt(projectId!)}
          projectName={project?.name || ""}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      </div>
    </div>
  );
};

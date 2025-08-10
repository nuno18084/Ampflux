import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeProvider";
import { useDashboard } from "../hooks/useDashboard";
import {
  PlusIcon,
  FolderIcon,
  BoltIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  StarIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { allProjects, recentProjects, isLoading } = useDashboard();
  const navigate = useNavigate();
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Control skeleton display timing
  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      // Keep skeleton visible for at least 500ms to prevent flash
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Helper function to check if user is owner of a project
  const isProjectOwner = (project: any) => {
    return user && project && project.owner_id && user.id === project.owner_id;
  };

  // Separate owned and shared projects
  const ownedProjects = allProjects.filter((project: any) =>
    isProjectOwner(project)
  );
  const sharedProjects = allProjects.filter(
    (project: any) => !isProjectOwner(project) && project.isShared
  );

  // Navigation handlers
  const handleNavigateToMyProjects = () => {
    navigate("/projects");
  };

  const handleNavigateToSharedProjects = () => {
    navigate("/projects?section=shared");
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
        {showSkeleton ? (
          <LoadingSkeleton
            type="header"
            className={theme === "dark" ? "dark" : ""}
          />
        ) : (
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
                  AmpFlux Dashboard
                </h1>
                <p
                  className={`mt-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Welcome to AmpFlux - Your Circuit Design Platform
                </p>
                {user?.company && (
                  <div
                    className={`flex items-center mt-3 text-sm px-3 py-1 rounded-full w-fit border ${
                      theme === "dark"
                        ? "text-gray-400 bg-gray-700/50 border-gray-600"
                        : "text-gray-600 bg-green-100/50 border-green-200"
                    }`}
                  >
                    <BuildingOfficeIcon
                      className={`h-4 w-4 mr-2 ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <span>{user.company.name}</span>
                  </div>
                )}
              </div>
              <Link
                to="/projects"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20"
              >
                <PlusIcon className="h-5 w-5 mr-2 inline" />
                New Project
              </Link>
            </div>
          </div>
        )}

        {/* Stats and Recent Projects in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={() => navigate("/projects?section=all-projects")}
              className={`transition-all duration-500 ease-out w-full text-left min-h-[100px] ${
                theme === "dark"
                  ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-green-500/10 hover:border-green-500/20 hover:bg-gray-700/50"
                  : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50 hover:bg-green-50/50"
              }`}
            >
              {showSkeleton ? (
                <LoadingSkeleton type="stat" />
              ) : (
                <div className="flex items-center h-full">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                      <FolderIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Projects
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {allProjects.length}
                    </p>
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={handleNavigateToMyProjects}
              className={`transition-all duration-500 ease-out w-full text-left min-h-[100px] ${
                theme === "dark"
                  ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-purple-500/10 hover:border-purple-500/20 hover:bg-gray-700/50"
                  : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-purple-500/20 hover:border-purple-300/50 hover:bg-purple-50/50"
              }`}
            >
              {showSkeleton ? (
                <LoadingSkeleton type="stat" />
              ) : (
                <div className="flex items-center h-full">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                      <FolderIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      My Projects
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {ownedProjects.length}
                    </p>
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={handleNavigateToSharedProjects}
              className={`transition-all duration-500 ease-out w-full text-left min-h-[100px] ${
                theme === "dark"
                  ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-green-500/10 hover:border-green-500/20 hover:bg-gray-700/50"
                  : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50 hover:bg-green-50/50"
              }`}
            >
              {showSkeleton ? (
                <LoadingSkeleton type="stat" />
              ) : (
                <div className="flex items-center h-full">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                      <ShareIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Shared with Me
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {sharedProjects.length}
                    </p>
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2 h-full max-h-[350px]">
            {showSkeleton ? (
              <div
                className={`transition-all duration-300 ease-out overflow-hidden h-full max-h-[350px] flex flex-col ${
                  theme === "dark"
                    ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-700/50"
                    : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-green-200/50"
                }`}
              >
                <div
                  className={`px-6 py-4 border-b ${
                    theme === "dark"
                      ? "border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900"
                      : "border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Match the actual title: text-xl font-bold */}
                    <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
                    <div className="flex items-center space-x-3">
                      {/* Match the actual badge: text-sm px-3 py-1 rounded-full */}
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-24"></div>
                      {/* Match the actual link: text-sm font-medium */}
                      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <div className="space-y-3">
                    <LoadingSkeleton type="card" />
                    <LoadingSkeleton type="card" />
                    <LoadingSkeleton type="card" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`transition-all duration-300 ease-out overflow-hidden h-full max-h-[350px] flex flex-col ${
                  theme === "dark"
                    ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-700/50"
                    : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-green-200/50"
                }`}
              >
                <div
                  className={`px-6 py-4 border-b ${
                    theme === "dark"
                      ? "border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900"
                      : "border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2
                      className={`text-xl font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Recent Projects
                    </h2>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm px-3 py-1 rounded-full shadow-sm border ${
                          theme === "dark"
                            ? "text-gray-300 bg-gray-700/50 border-gray-600"
                            : "text-gray-600 bg-white border-green-200"
                        }`}
                      >
                        Showing {Math.min(3, allProjects?.length || 0)} of{" "}
                        {allProjects?.length || 0}
                      </span>
                      <Link
                        to="/projects"
                        className={`text-sm font-medium hover:underline ${
                          theme === "dark"
                            ? "text-green-400 hover:text-green-300"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  {recentProjects.length > 0 ? (
                    <div className="space-y-3">
                      {recentProjects.map((project) => (
                        <div
                          key={project.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ease-out min-h-[60px] ${
                            theme === "dark"
                              ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
                              : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-200/50 hover:shadow-lg hover:border-green-300/50"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`p-2 rounded-lg mr-4 shadow-lg ${
                                project.isShared
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                  : "bg-gradient-to-r from-green-500 to-emerald-600"
                              }`}
                            >
                              <FolderIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`text-sm font-semibold ${
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
                                {project.isShared && (
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      theme === "dark"
                                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                                        : "bg-blue-100 text-blue-700 border border-blue-200"
                                    }`}
                                  >
                                    Shared ({project.role})
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
                                {new Date(
                                  project.updated_at
                                ).toLocaleDateString()}
                                {project.isShared && project.sharedBy && (
                                  <span className="ml-2">
                                    • Shared by {project.sharedBy.name}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/projects/${project.id}`}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-green-500/20"
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
                      <Link
                        to="/projects"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-green-500/20 inline-flex items-center"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Project
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {showSkeleton ? (
          <LoadingSkeleton
            type="quick-actions"
            className={theme === "dark" ? "dark" : ""}
          />
        ) : (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/projects"
                className={`group flex items-center p-6 rounded-xl transition-all duration-500 ease-out min-h-[100px] ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
                    : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 hover:shadow-lg hover:border-green-300/50"
                }`}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Create New Project
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Start designing a new circuit
                  </p>
                </div>
              </Link>

              <Link
                to="/projects"
                className={`group flex items-center p-6 rounded-xl transition-all duration-500 ease-out min-h-[100px] ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:shadow-lg hover:border-green-500/30"
                    : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 hover:shadow-lg hover:border-green-300/50"
                }`}
              >
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-500 ease-out shadow-lg">
                  <CogIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Manage Projects
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    View and organize your projects
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import {
  PlusIcon,
  FolderIcon,
  BoltIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export const DashboardPageLight: React.FC = () => {
  const { user } = useAuth();
  const queryKey = user ? ["projects", user.id] : ["projects"];

  const { data: projects, isLoading } = useQuery({
    queryKey,
    queryFn: () => apiClient.getProjects(),
    enabled: !!user,
  });

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                AmpFlux Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome to AmpFlux - Your Circuit Design Platform
              </p>
              {user?.company && (
                <div className="flex items-center mt-3 text-sm text-gray-600 bg-green-100/50 px-3 py-1 rounded-full w-fit border border-green-200">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2 text-green-600" />
                  <span>{user.company.name}</span>
                </div>
              )}
            </div>
            <Link
              to="/projects"
              className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-green-500/20"
            >
              <PlusIcon className="h-5 w-5 mr-2 inline" />
              New Project
            </Link>
          </div>
        </div>

        {/* Stats and Recent Projects in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                    <FolderIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Total Projects
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? "..." : projects?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <BoltIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Active Circuits
                  </p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <ChartBarIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Simulations
                  </p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-green-200/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Projects
                  </h2>
                  {projects && projects.length > 3 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border border-green-200">
                        Showing 3 of {projects.length}
                      </span>
                      <Link
                        to="/projects"
                        className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline"
                      >
                        View All
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : recentProjects.length > 0 ? (
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-200/50 hover:shadow-lg hover:border-green-300/50 transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-4 shadow-lg">
                            <FolderIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Created{" "}
                              {new Date(
                                project.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/projects/${project.id}`}
                          className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg border border-green-500/20"
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first circuit project.
                    </p>
                    <Link
                      to="/projects"
                      className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center border border-green-500/20"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Project
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/projects"
              className="group flex items-center p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 rounded-xl hover:shadow-lg hover:border-green-300/50 transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Create New Project
                </h3>
                <p className="text-sm text-gray-600">
                  Start designing a new circuit
                </p>
              </div>
            </Link>

            <Link
              to="/projects"
              className="group flex items-center p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 rounded-xl hover:shadow-lg hover:border-green-300/50 transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Projects</h3>
                <p className="text-sm text-gray-600">
                  View and organize your projects
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

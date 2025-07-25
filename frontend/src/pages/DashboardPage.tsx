import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  PlusIcon,
  FolderIcon,
  BoltIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

export const DashboardPage: React.FC = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.getProjects(),
  });

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome to AmpFlux - Your Circuit Design Platform
            </p>
          </div>
          <Link
            to="/projects"
            className="btn btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Projects
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? "..." : projects?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BoltIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Active Circuits
              </p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Simulations</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <FolderIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
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
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first circuit project.
              </p>
              <Link
                to="/projects"
                className="btn btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Project
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/projects"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create New Project</h3>
              <p className="text-sm text-gray-500">
                Start designing a new circuit
              </p>
            </div>
          </Link>

          <Link
            to="/projects"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CogIcon className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Projects</h3>
              <p className="text-sm text-gray-500">
                View and organize your projects
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

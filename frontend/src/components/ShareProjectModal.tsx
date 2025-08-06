import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ShareProjectModalProps {
  projectId: number;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"viewer" | "editor">(
    "viewer"
  );

  // Share project mutation
  const shareProjectMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      apiClient.shareProject(projectId, email, role),
    onSuccess: () => {
      setEmail("");
      setSelectedRole("viewer");
      alert(
        "Project shared successfully! An email will be sent to the recipient."
      );
    },
    onError: (error: any) => {
      alert(
        `Failed to share project: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  const handleShareProject = () => {
    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    shareProjectMutation.mutate({ email: email.trim(), role: selectedRole });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 overflow-y-auto h-full w-full z-[9999] ${
        theme === "dark" ? "bg-gray-900/80 backdrop-blur-sm" : "bg-gray-600/50"
      }`}
    >
      <div
        className={`relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl ${
          theme === "dark"
            ? "bg-gray-800/90 border-gray-700/50"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Share Project
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Project Info */}
        <div className="mb-6">
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Sharing: <span className="font-medium">{projectName}</span>
          </p>
        </div>

        {/* Share Form */}
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500"
              }`}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Permission Level
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as "viewer" | "editor")
              }
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500"
              }`}
            >
              <option value="viewer">Read Only</option>
              <option value="editor">Read & Write</option>
            </select>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShareProject}
            disabled={shareProjectMutation.isPending}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === "dark" ? "hover:bg-green-700" : "hover:bg-green-700"
            }`}
          >
            {shareProjectMutation.isPending ? "Sharing..." : "Share Project"}
          </button>
        </div>

        {/* Info Text */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>How it works:</strong> When you share a project, an email
            will be sent to the recipient with a link to access the project.
            They'll need to create an account if they don't have one already.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import {
  FolderIcon,
  StarIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeProvider";

interface ProjectCardProps {
  // Project data
  project: any;
  projectId: number;
  projectName: string;
  updatedAt: string;
  createdAt: string;

  // Card type and styling
  cardType: "owned" | "shared";
  isOwner?: boolean;

  // Shared project specific data
  sharedByUser?: {
    name: string;
    email: string;
  };
  sharedWithUser?: {
    name: string;
    email: string;
  };
  role?: "viewer" | "editor";
  sharedByEmail?: string;

  // Action handlers
  onNavigate: (path: string) => void;
  onShare?: () => void;
  onDelete?: () => void;

  // Theme
  theme: "dark" | "light";
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  projectId,
  projectName,
  updatedAt,
  createdAt,
  cardType,
  isOwner = false,
  sharedByUser,
  sharedWithUser,
  role,
  sharedByEmail,
  onNavigate,
  onShare,
  onDelete,
  theme,
}) => {
  const getCardStyles = () => {
    const baseStyles =
      "transition-all duration-500 ease-out flex flex-col h-full";

    if (cardType === "owned") {
      return `${baseStyles} ${
        theme === "dark"
          ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-green-500/10 hover:border-green-500/20"
          : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-green-200/50 hover:shadow-green-500/20 hover:border-green-300/50"
      }`;
    } else {
      return `${baseStyles} ${
        theme === "dark"
          ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-700/50 hover:shadow-blue-500/10 hover:border-blue-500/20"
          : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-blue-200/50 hover:shadow-blue-500/20 hover:border-blue-300/50"
      }`;
    }
  };

  const getIconStyles = () => {
    if (cardType === "owned") {
      return "bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3 shadow-lg mt-1";
    } else {
      return "bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg mr-3 shadow-lg mt-1";
    }
  };

  const getRoleBadge = () => {
    if (cardType === "shared") {
      return (
        <span
          className={`px-1.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
            theme === "dark"
              ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}
        >
          Shared ({role})
        </span>
      );
    }
    return null;
  };

  const getOwnerBadge = () => {
    if (isOwner) {
      return (
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
      );
    }
    return null;
  };

  const getDescription = () => {
    if (cardType === "owned") {
      return (
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Last edited {new Date(updatedAt).toLocaleDateString()}
          {createdAt !== updatedAt && (
            <span className="ml-2 text-xs opacity-75">
              (created {new Date(createdAt).toLocaleDateString()})
            </span>
          )}
        </p>
      );
    } else if (cardType === "shared") {
      return (
        <>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Shared by {sharedByUser?.name || "Unknown"}
          </p>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {role === "viewer" ? "Read Only" : "Read & Write"} • Last edited{" "}
            {new Date(updatedAt).toLocaleDateString()}
          </p>
        </>
      );
    }
    return null;
  };

  const getActionButtons = () => {
    if (cardType === "owned") {
      return (
        <div className="flex space-x-2">
          <button
            onClick={onShare}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-300 ease-out"
            title="Share project"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate(`/projects/${projectId}`)}
            className="text-green-400 hover:text-green-300 transition-colors duration-300 ease-out"
            title="View project"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 transition-colors duration-300 ease-out"
            title="Delete project"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      );
    } else if (cardType === "shared") {
      // Add empty div to maintain same height as owned cards
      return <div className="flex space-x-2 h-6"></div>;
    }
    return null;
  };

  const getBottomButtons = () => {
    if (cardType === "owned") {
      return (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onNavigate(`/projects/${projectId}`)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-green-500/20 flex-1 text-center"
          >
            View
          </button>
          <button
            onClick={() => onNavigate(`/projects/${projectId}/editor`)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-blue-500/20 flex-1 text-center"
          >
            Edit Circuit
          </button>
        </div>
      );
    } else if (cardType === "shared") {
      if (role === "viewer") {
        return (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onNavigate(`/projects/${projectId}`)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-blue-500/20 w-full text-center"
            >
              View
            </button>
          </div>
        );
      } else {
        return (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onNavigate(`/projects/${projectId}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex-1 text-center ${
                theme === "dark"
                  ? "bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-blue-500/30"
                  : "bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-blue-300"
              }`}
            >
              View
            </button>
            <button
              onClick={() => onNavigate(`/projects/${projectId}/editor`)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 ease-out shadow-md hover:shadow-lg border border-blue-500/20 flex-1 text-center"
            >
              Edit
            </button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className={getCardStyles()}>
      <div className="flex items-start justify-between flex-grow">
        <div className="flex items-start">
          <div className={getIconStyles()}>
            <FolderIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3
                className={`text-lg font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {projectName}
              </h3>
              {getOwnerBadge()}
              {getRoleBadge()}
            </div>
            {getDescription()}
          </div>
        </div>
        {getActionButtons()}
      </div>
      <div className="mt-auto">{getBottomButtons()}</div>
    </div>
  );
};

import React from "react";

interface LoadingSkeletonProps {
  type?: "stat" | "card" | "text" | "project-card";
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "stat",
  className = "",
}) => {
  if (type === "stat") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="bg-gray-300 dark:bg-gray-600 p-3 rounded-xl shadow-lg w-12 h-12"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <div className="flex items-center">
            <div className="bg-gray-300 dark:bg-gray-600 p-2 rounded-lg mr-4 shadow-lg w-9 h-9"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            </div>
          </div>
          <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg w-16 h-8"></div>
        </div>
      </div>
    );
  }

  if (type === "project-card") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div
          className={`transition-all duration-500 ease-out rounded-2xl p-6 border ${
            className.includes("dark")
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl border-green-200/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-gray-300 dark:bg-gray-600 p-2 rounded-lg mr-3 shadow-lg w-6 h-6"></div>
              <div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="bg-gray-300 dark:bg-gray-600 w-5 h-5 rounded"></div>
              <div className="bg-gray-300 dark:bg-gray-600 w-5 h-5 rounded"></div>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg flex-1 h-8"></div>
            <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg flex-1 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    );
  }

  return null;
};

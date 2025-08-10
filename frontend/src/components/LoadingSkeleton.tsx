import React from "react";

interface LoadingSkeletonProps {
  type?:
    | "stat"
    | "card"
    | "text"
    | "project-card"
    | "header"
    | "tabs"
    | "quick-actions";
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "stat",
  className = "",
}) => {
  if (type === "stat") {
    return (
      <div className={`animate-pulse ${className}`}>
        {/* Match the actual content structure (no padding, that's in the button container) */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {/* Match the actual icon container: p-3 with h-7 w-7 icon = 52px total */}
            <div className="bg-gray-300 dark:bg-gray-600 p-3 rounded-xl shadow-lg w-12 h-12"></div>
          </div>
          <div className="ml-4">
            {/* Match the actual text sizes */}
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
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
            {/* Match the actual icon container: p-2 with h-5 w-5 icon = 36px total */}
            <div className="bg-gray-300 dark:bg-gray-600 p-2 rounded-lg mr-4 shadow-lg w-9 h-9"></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {/* Project name: text-sm font-semibold */}
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                {/* Badge placeholder: text-xs px-1.5 py-0.5 */}
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
              </div>
              {/* Description text: text-sm */}
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
            </div>
          </div>
          {/* View button: px-4 py-2 text-sm font-medium */}
          <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg w-16 h-8"></div>
        </div>
      </div>
    );
  }

  if (type === "project-card") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div
          className={`transition-all duration-500 ease-out rounded-2xl p-6 border flex flex-col h-full min-h-[200px] ${
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
          <div className="flex-grow"></div>
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

  if (type === "header") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div
          className={`transition-all duration-300 ease-out rounded-2xl p-6 border ${
            className.includes("dark")
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-green-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              {/* Match the actual title size: text-3xl font-bold */}
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 mb-2"></div>
              {/* Match the actual subtitle size: mt-1 */}
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-80 mb-3"></div>
              {/* Optional company badge: mt-3 text-sm px-3 py-1 */}
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-32"></div>
            </div>
            {/* Match the actual button size: px-6 py-3 with icon */}
            <div className="bg-gray-300 dark:bg-gray-600 px-6 py-3 rounded-xl w-40 h-12"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "tabs") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div
          className={`transition-all duration-300 ease-out rounded-2xl p-4 border ${
            className.includes("dark")
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-green-200/50"
          }`}
        >
          <div className="flex space-x-2">
            <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg w-24 h-8"></div>
            <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg w-20 h-8"></div>
            <div className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg w-28 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "quick-actions") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div
          className={`transition-all duration-300 ease-out rounded-2xl p-6 border ${
            className.includes("dark")
              ? "bg-gray-800/50 backdrop-blur-sm shadow-2xl border-gray-700/50"
              : "bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-green-200/50"
          }`}
        >
          {/* Match the actual title size: text-xl font-bold mb-6 */}
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Match the actual quick action card structure: p-6 rounded-xl border */}
            <div className="flex items-center p-6 rounded-xl border">
              {/* Match the actual icon container: p-3 with h-6 w-6 icon */}
              <div className="bg-gray-300 dark:bg-gray-600 p-3 rounded-lg mr-4 w-12 h-12"></div>
              <div>
                {/* Match the actual title size: font-semibold */}
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-2"></div>
                {/* Match the actual description size: text-sm */}
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              </div>
            </div>
            <div className="flex items-center p-6 rounded-xl border">
              <div className="bg-gray-300 dark:bg-gray-600 p-3 rounded-lg mr-4 w-12 h-12"></div>
              <div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-36 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

import React from "react";

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  showText?: boolean;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = "md",
  text = "Loading...",
  showText = false,
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Logo Container */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Background Circle */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse" />

        {/* Logo Icon with Animated Outline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative ${iconSizes[size]}`}>
            <svg
              className="text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {/* Animated bolt path that draws itself */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
                className="animate-draw-bolt"
                strokeDasharray="100"
                strokeDashoffset="100"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading Text - Only show if showText is true */}
      {showText && (
        <div className={`text-center ${textSizes[size]}`}>
          <div className="text-gray-600 dark:text-gray-300 font-medium">
            {text}
          </div>
          <div className="flex justify-center space-x-1 mt-2">
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

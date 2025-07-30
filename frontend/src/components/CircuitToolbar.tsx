import React from "react";
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeProvider";

interface CircuitToolbarProps {
  project: any;
  handleBack: () => void;
  handleSave: () => void;
  handleSimulate: () => void;
  isSaving: boolean;
  isSimulating: boolean;
  saveSuccess: boolean;
  placedComponents: any[];
}

export const CircuitToolbar: React.FC<CircuitToolbarProps> = ({
  project,
  handleBack,
  handleSave,
  handleSimulate,
  isSaving,
  isSimulating,
  saveSuccess,
  placedComponents,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`border-b px-6 py-4 transition-colors duration-200 ${
        theme === "dark"
          ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
              theme === "dark"
                ? "border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 focus:ring-green-500"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Project
          </button>
          <div>
            <h1
              className={`text-xl font-semibold transition-colors duration-200 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {project?.name} - Circuit Editor
            </h1>
          </div>
        </div>
        <div className="flex space-x-3">
          {saveSuccess && (
            <div
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                theme === "dark"
                  ? "text-green-400 bg-green-900/20"
                  : "text-green-600 bg-green-50"
              }`}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Saved successfully!
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || placedComponents.length === 0}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200 ${
              theme === "dark"
                ? "border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 focus:ring-green-500"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
            }`}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating || placedComponents.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            {isSimulating ? "Simulating..." : "Simulate"}
          </button>
        </div>
      </div>
    </div>
  );
};

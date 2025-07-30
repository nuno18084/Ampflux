import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeProvider";
import type { PlacedComponent } from "../types/circuit";

interface CircuitPropertiesPanelProps {
  selectedComponent: PlacedComponent | null;
  handlePropertyChange: (
    componentId: string,
    property: string,
    value: number | boolean | string
  ) => void;
  isPropertiesPanelCollapsed: boolean;
  setIsPropertiesPanelCollapsed: (collapsed: boolean) => void;
}

export const CircuitPropertiesPanel: React.FC<CircuitPropertiesPanelProps> = ({
  selectedComponent,
  handlePropertyChange,
  isPropertiesPanelCollapsed,
  setIsPropertiesPanelCollapsed,
}) => {
  const { theme } = useTheme();

  if (!selectedComponent) {
    return (
      <div
        className={`${
          isPropertiesPanelCollapsed ? "w-16" : "w-80"
        } h-full border-l transition-all duration-500 ease-out ${
          theme === "dark"
            ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
            : "bg-white/90 backdrop-blur-sm border-gray-200/50"
        }`}
      >
        <div
          className={`p-6 ${
            isPropertiesPanelCollapsed
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Properties
          </h3>
          <p
            className={`text-sm transition-colors duration-200 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Select a component to edit its properties
          </p>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() =>
            setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)
          }
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 p-2 rounded-full shadow-lg transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600"
              : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 border border-gray-300"
          }`}
          title={
            isPropertiesPanelCollapsed
              ? "Expand Properties"
              : "Collapse Properties"
          }
        >
          {isPropertiesPanelCollapsed ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${
        isPropertiesPanelCollapsed ? "w-16" : "w-80"
      } h-full border-l transition-all duration-500 ease-out relative ${
        theme === "dark"
          ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
          : "bg-white/90 backdrop-blur-sm border-gray-200/50"
      }`}
    >
      <div
        className={`p-6 ${
          isPropertiesPanelCollapsed
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Properties
          </h3>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              theme === "dark"
                ? "bg-blue-900/30 text-blue-300"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {selectedComponent.type}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Component Name
            </label>
            <input
              type="text"
              value={selectedComponent.name}
              onChange={(e) =>
                handlePropertyChange(
                  selectedComponent.id,
                  "name",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>

          {Object.entries(selectedComponent.properties).map(([key, value]) => (
            <div key={key}>
              <label
                className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              {typeof value === "boolean" ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) =>
                      handlePropertyChange(
                        selectedComponent.id,
                        key,
                        e.target.checked
                      )
                    }
                    className={`mr-2 rounded transition-colors duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                        : "border-gray-300 text-blue-600 focus:ring-blue-500"
                    }`}
                  />
                  <span
                    className={`text-sm transition-colors duration-200 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {value ? "Enabled" : "Disabled"}
                  </span>
                </label>
              ) : typeof value === "number" ? (
                <input
                  type="number"
                  value={value as number}
                  onChange={(e) =>
                    handlePropertyChange(
                      selectedComponent.id,
                      key,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              ) : (
                <input
                  type="text"
                  value={value as string}
                  onChange={(e) =>
                    handlePropertyChange(
                      selectedComponent.id,
                      key,
                      e.target.value
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={() =>
          setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)
        }
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 p-2 rounded-full shadow-lg transition-all duration-200 ${
          theme === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600"
            : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 border border-gray-300"
        }`}
        title={
          isPropertiesPanelCollapsed
            ? "Expand Properties"
            : "Collapse Properties"
        }
      >
        {isPropertiesPanelCollapsed ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

import React from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeProvider";
import type { CircuitComponent } from "../types/circuit";

interface CircuitSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  showGettingStarted: boolean;
  setShowGettingStarted: (show: boolean) => void;
  circuitComponents: CircuitComponent[];
  handleDragStart: (e: React.DragEvent, component: CircuitComponent) => void;
}

export const CircuitSidebar: React.FC<CircuitSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  showGettingStarted,
  setShowGettingStarted,
  circuitComponents,
  handleDragStart,
}) => {
  const { theme } = useTheme();

  // Independent search component that filters locally
  const IndependentSearchInput = React.memo(() => {
    const [searchValue, setSearchValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Filter components locally
    const filteredComponentsLocal = React.useMemo(() => {
      return circuitComponents.filter((component) =>
        component.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [searchValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const newValue = e.target.value;
      setSearchValue(newValue);
      console.log("Search input changed:", newValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation();
      console.log("Search input focused");
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation();
      console.log("Search input blurred");
    };

    return (
      <div>
        {/* Sticky header */}
        <div
          className="sticky top-0 pt-3 pb-2 z-10"
          style={{ backgroundColor: "rgb(27, 34, 48)" }}
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Components
          </h3>
          <div className="relative mb-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search components..."
              value={searchValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              className={`w-full pl-10 pr-8 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              autoComplete="off"
              spellCheck="false"
              style={{ userSelect: "text" }}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  inputRef.current?.focus();
                }}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable components list */}
        <div className="grid grid-cols-2 gap-3">
          {filteredComponentsLocal.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              className={`border rounded-lg p-3 cursor-move transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <component.icon
                  className={`h-8 w-8 mb-2 transition-colors duration-200 ${
                    theme === "dark" ? "text-green-400" : "text-blue-600"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {component.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });

  IndependentSearchInput.displayName = "IndependentSearchInput";

  return (
    <div
      className={`${
        isSidebarCollapsed ? "w-24" : "w-64"
      } h-full border-r transition-all duration-500 ease-out flex flex-col ${
        theme === "dark"
          ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
          : "bg-white/90 backdrop-blur-sm border-gray-200/50"
      }`}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      {/* Logo at top */}
      <div className="pl-4 pr-2 py-4 pb-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                AmpFlux
              </span>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1 rounded-lg transition-colors duration-200 ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title="Collapse sidebar"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1 rounded-lg transition-colors duration-200 ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title="Expand sidebar"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Components section - scrollable */}
      {!isSidebarCollapsed && (
        <div
          className={`transition-all duration-[2000ms] ease-in-out ${
            showGettingStarted
              ? "flex-1 overflow-y-auto px-4 pb-4"
              : "h-full overflow-y-auto px-4 pb-4"
          }`}
        >
          <IndependentSearchInput />
        </div>
      )}

      {/* Starting Guide at bottom */}
      {!isSidebarCollapsed && (
        <div
          className={`flex-shrink-0 border-t border-gray-200 dark:border-gray-700 transition-all duration-[2000ms] ease-in-out ${
            showGettingStarted
              ? "max-h-48 opacity-100 transform translate-y-0"
              : "max-h-0 opacity-0 transform translate-y-full overflow-hidden"
          }`}
        >
          <div className="p-4">
            <div
              className={`p-3 rounded-lg relative ${
                theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
              }`}
            >
              <button
                onClick={() => setShowGettingStarted(false)}
                className={`absolute top-1 right-1 p-2 rounded-full transition-all duration-300 ease-in-out ${
                  theme === "dark"
                    ? "text-blue-200 hover:text-white hover:bg-blue-600 shadow-lg"
                    : "text-blue-600 hover:text-white hover:bg-blue-500 shadow-lg"
                }`}
                title="Close getting started guide"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <h4
                className={`text-sm font-medium mb-2 pr-8 ${
                  theme === "dark" ? "text-blue-300" : "text-blue-900"
                }`}
              >
                Getting Started
              </h4>
              <ul
                className={`text-xs space-y-1 ${
                  theme === "dark" ? "text-blue-200" : "text-blue-700"
                }`}
              >
                <li>• Drag components to the canvas</li>
                <li>• Click components to edit properties</li>
                <li>• Drag components to move them</li>
                <li>• Connect components with dots</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeProvider";
import type {
  PlacedComponent,
  Connection,
  CircuitComponent,
} from "../types/circuit";

interface CircuitCanvasProps {
  placedComponents: PlacedComponent[];
  connections: Connection[];
  connectingFrom: string | null;
  mousePosition: { x: number; y: number } | null;
  zoom: number;
  theme: string;
  draggedComponent: string | null;
  handleComponentMouseDown: (e: React.MouseEvent, componentId: string) => void;
  handleCanvasMouseMove: (e: React.MouseEvent) => void;
  handleCanvasMouseUp: () => void;
  handleComponentClick: (component: PlacedComponent) => void;
  handleComponentDelete: (componentId: string) => void;
  handleConnectionDotClick: (componentId: string) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  circuitComponents: CircuitComponent[];
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  placedComponents,
  connections,
  connectingFrom,
  mousePosition,
  zoom,
  theme,
  draggedComponent,
  handleComponentMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleComponentClick,
  handleComponentDelete,
  handleConnectionDotClick,
  handleDrop,
  handleDragOver,
  handleWheel,
  handleMouseDown,
  handleMouseUp,
  setZoom,
  setPan,
  circuitComponents,
}) => {
  return (
    <div className="flex-1 p-6 relative overflow-hidden">
      <div
        className={`w-full h-full border-2 border-dashed rounded-lg relative overflow-hidden transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gray-800/50 backdrop-blur-sm border-gray-600/50"
            : "bg-white border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          cursor: draggedComponent ? "grabbing" : "default",
        }}
      >
        {/* Canvas Content Container - Fixed workable area */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            width: "100%",
            height: "100%",
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={(e) => {
            handleCanvasMouseUp();
            handleMouseUp();
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          {/* Placed components */}
          {placedComponents.map((component) => (
            <div key={component.id} className="group">
              <div
                style={{
                  position: "absolute",
                  left: component.x,
                  top: component.y,
                  width: "120px",
                  height: "120px",
                  backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                  border: `2px solid ${
                    theme === "dark" ? "#4b5563" : "#d1d5db"
                  }`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  color: theme === "dark" ? "#e5e7eb" : "#374151",
                  fontWeight: "bold",
                  fontSize: "14px",
                  textAlign: "center",
                  boxShadow:
                    theme === "dark"
                      ? "0 2px 4px rgba(0,0,0,0.3)"
                      : "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "move",
                  userSelect: "none", // Disable text selection
                  transform: `scale(${zoom})`, // Components scale
                  transformOrigin: "top left",
                }}
                onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
                onMouseUp={(e) => {
                  // Clear drag timeout if mouse is released before drag starts
                  if ((e.currentTarget as any).dragTimeout) {
                    clearTimeout((e.currentTarget as any).dragTimeout);
                    (e.currentTarget as any).dragTimeout = null;
                  }
                  // Handle component click if not dragging
                  if (!draggedComponent) {
                    handleComponentClick(component);
                  }
                }}
              >
                <div>
                  <div className="flex justify-center mb-1">
                    {(() => {
                      const componentDef = circuitComponents.find(
                        (c) => c.id === component.type
                      );
                      if (componentDef) {
                        const IconComponent = componentDef.icon;
                        return (
                          <IconComponent
                            className={`h-6 w-6 ${
                              theme === "dark"
                                ? "text-green-400"
                                : "text-blue-600"
                            }`}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div style={{ fontSize: "12px", textAlign: "center" }}>
                    {component.name}
                  </div>
                  <button
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleComponentDelete(component.id);
                    }}
                    className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 ${
                      theme === "dark"
                        ? "text-red-400 group-hover:text-red-300 group-hover:bg-red-900/30"
                        : "text-red-600 group-hover:text-red-700 group-hover:bg-red-100"
                    }`}
                    title="Delete component"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Connection dots */}
              <div
                style={{
                  position: "absolute",
                  left: component.x + 55 - 50 * (1 - zoom), // Move very close
                  top: component.y + 125 - 50 * (1 - zoom), // Move very close
                  width: "10px",
                  height: "10px",
                  backgroundColor:
                    connectingFrom === component.id ? "#ef4444" : "#3b82f6",
                  borderRadius: "50%",
                  cursor: "pointer",
                  zIndex: 1001,
                  border: `2px solid ${theme === "dark" ? "#1f2937" : "white"}`,
                  boxShadow:
                    theme === "dark"
                      ? "0 2px 4px rgba(0,0,0,0.4)"
                      : "0 2px 4px rgba(0,0,0,0.2)",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  pointerEvents: "auto",
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleConnectionDotClick(component.id);
                }}
                title={
                  connectingFrom === component.id
                    ? "Click to cancel connection"
                    : "Click to start connection"
                }
              />
            </div>
          ))}

          {/* Connection lines - Follow the dots */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
          >
            {/* Existing connections */}
            {connections.map((connection) => {
              const fromComponent = placedComponents.find(
                (c) => c.id === connection.from
              );
              const toComponent = placedComponents.find(
                (c) => c.id === connection.to
              );

              if (!fromComponent || !toComponent) return null;

              return (
                <line
                  key={connection.id}
                  x1={fromComponent.x + 55 - 50 * (1 - zoom) + 5}
                  y1={fromComponent.y + 125 - 50 * (1 - zoom) + 5}
                  x2={toComponent.x + 55 - 50 * (1 - zoom) + 5}
                  y2={toComponent.y + 125 - 50 * (1 - zoom) + 5}
                  stroke="green"
                  strokeWidth="3"
                />
              );
            })}

            {/* Active connection line following mouse */}
            {connectingFrom && mousePosition && (
              <line
                x1={(() => {
                  const fromComponent = placedComponents.find(
                    (c) => c.id === connectingFrom
                  );
                  return fromComponent
                    ? fromComponent.x + 55 - 50 * (1 - zoom) + 5
                    : 0;
                })()}
                y1={(() => {
                  const fromComponent = placedComponents.find(
                    (c) => c.id === connectingFrom
                  );
                  return fromComponent
                    ? fromComponent.y + 125 - 50 * (1 - zoom) + 5
                    : 0;
                })()}
                x2={mousePosition.x}
                y2={mousePosition.y}
                stroke="green"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
            )}
          </svg>
        </div>

        {/* Zoom Controls - Bottom Right Corner */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg backdrop-blur-sm transition-colors duration-200 ${
              theme === "dark"
                ? "bg-gray-800/80 border border-gray-700/50"
                : "bg-white/90 border border-gray-200/50"
            }`}
          >
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded border transition-colors duration-200 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
              title="Zoom Out"
            >
              -
            </button>
            <span
              className={`text-sm font-medium px-2 transition-colors duration-200 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded border transition-colors duration-200 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
              title="Reset View (Ctrl+0)"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

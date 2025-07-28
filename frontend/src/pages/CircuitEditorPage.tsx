import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  CogIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface CircuitComponent {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  properties: Record<string, number | boolean>;
}

interface PlacedComponent {
  id: string;
  componentId: string;
  type: string;
  name: string;
  x: number;
  y: number;
  properties: Record<string, number | boolean>;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const circuitComponents: CircuitComponent[] = [
  {
    id: "resistor",
    type: "resistor",
    name: "Resistor",
    icon: CogIcon,
    properties: { resistance: 100 },
  },
  {
    id: "capacitor",
    type: "capacitor",
    name: "Capacitor",
    icon: CogIcon,
    properties: { capacitance: 0.001 },
  },
  {
    id: "inductor",
    type: "inductor",
    name: "Inductor",
    icon: CogIcon,
    properties: { inductance: 0.001 },
  },
  {
    id: "led",
    type: "led",
    name: "LED",
    icon: CogIcon,
    properties: { forward_voltage: 2.1, current_limit: 0.02 },
  },
  {
    id: "switch",
    type: "switch",
    name: "Switch",
    icon: CogIcon,
    properties: { is_closed: false },
  },
];

export const CircuitEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentPositionsRef = useRef<PlacedComponent[]>([]); // Track current positions during drag

  // Force remount on every page load to reset state
  const remountKey = Date.now();

  // State
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>(
    []
  );
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] =
    useState<PlacedComponent | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Queries
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient.getProject(parseInt(projectId!)),
    enabled: !!projectId,
  });

  const {
    data: savedCircuit,
    isLoading: circuitLoading,
    error: circuitError,
  } = useQuery({
    queryKey: ["circuitVersions", parseInt(projectId!)],
    queryFn: () => {
      console.log("=== FETCHING CIRCUIT VERSIONS ===");
      console.log("Project ID:", projectId);
      return apiClient.getCircuitVersions(parseInt(projectId!));
    },
    enabled: !!projectId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Monitor savedCircuit changes
  useEffect(() => {
    console.log("=== SAVED CIRCUIT DATA CHANGED ===");
    console.log("savedCircuit:", savedCircuit);
    console.log("circuitLoading:", circuitLoading);
    console.log("circuitError:", circuitError);
  }, [savedCircuit, circuitLoading, circuitError]);

  // Load saved circuit data
  useEffect(() => {
    if (savedCircuit && savedCircuit.length > 0 && !circuitLoading) {
      // The backend returns versions ordered by version_number DESC (newest first)
      // So the latest version is at index 0, not at the end
      const latestCircuit = savedCircuit[0]; // FIXED: Use index 0 instead of length-1

      try {
        const circuitData = JSON.parse(latestCircuit.data_json);

        if (circuitData.components && circuitData.components.length > 0) {
          setPlacedComponents(circuitData.components);
        }
        if (circuitData.connections && circuitData.connections.length > 0) {
          setConnections(circuitData.connections);
        }
      } catch (error) {
        console.error("Error parsing saved circuit data:", error);
      }
    }
  }, [savedCircuit, circuitLoading]);

  // Debug component rendering - only log once when components change
  useEffect(() => {
    if (placedComponents.length > 0) {
      console.log("=== COMPONENTS LOADED ===");
      console.log("Total components:", placedComponents.length);
      placedComponents.forEach((comp, index) => {
        console.log(`Component ${index + 1}:`, {
          id: comp.id,
          name: comp.name,
          x: comp.x,
          y: comp.y,
          type: comp.type,
        });
      });

      // Log the first component's exact position
      const firstComponent = placedComponents[0];
      console.log("FIRST COMPONENT POSITION:", {
        name: firstComponent.name,
        x: firstComponent.x,
        y: firstComponent.y,
        id: firstComponent.id,
      });

      // Log all component positions
      console.log("ALL COMPONENT POSITIONS:");
      placedComponents.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.name}: (${comp.x}, ${comp.y})`);
      });
    }
  }, [placedComponents.length]); // Only trigger when length changes, not on every render

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (circuitData: any) => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const jsonData = JSON.stringify(circuitData);

      return fetch(`http://localhost:8000/circuits/${projectId}/save_version`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data_json: jsonData,
        }),
      }).then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Save failed: ${response.status} ${text}`);
          });
        }
        return response.json();
      });
    },
    onSuccess: (data) => {
      // Only show success message for manual saves, not auto-saves
      if (data && data.id) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }

      // Invalidate the circuit versions cache to force a fresh fetch
      queryClient.invalidateQueries({
        queryKey: ["circuitVersions", parseInt(projectId!)],
      });
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      alert(`Save failed: ${error.message}`);
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (circuitData: any) =>
      apiClient.simulateCircuit(parseInt(projectId!), circuitData),
    onSuccess: (result) => {
      setSimulationResult(result);
    },
    onError: () => {
      alert("Simulation failed");
    },
  });

  // Event handlers
  const handleDragStart = (e: React.DragEvent, component: CircuitComponent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const componentData = JSON.parse(
      e.dataTransfer.getData("application/json")
    );
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // Center the component
    const y = e.clientY - rect.top - 60;

    const newComponent: PlacedComponent = {
      id: `${componentData.id}_${Date.now()}`,
      componentId: componentData.id,
      type: componentData.type,
      name: componentData.name,
      x,
      y,
      properties: componentData.properties,
    };

    setPlacedComponents((prev) => [...prev, newComponent]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleComponentMouseDown = (
    e: React.MouseEvent,
    componentId: string
  ) => {
    e.stopPropagation();
    const component = placedComponents.find((c) => c.id === componentId);
    if (component) {
      // Add a small delay to distinguish between click and drag
      const dragTimeout = setTimeout(() => {
        setDraggedComponent(componentId);
        setIsDragging(true);
      }, 150); // 150ms delay before starting drag

      // Store the timeout ID to clear it if needed
      (e.currentTarget as any).dragTimeout = dragTimeout;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Track mouse position for connection line
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (draggedComponent) {
      // Simple position calculation: mouse position relative to canvas
      let x = e.clientX - rect.left - 60; // Center the component on mouse
      let y = e.clientY - rect.top - 60;

      // Constrain to canvas boundaries
      const componentSize = 120;
      const padding = 10;
      x = Math.max(padding, Math.min(x, rect.width - componentSize - padding));
      y = Math.max(padding, Math.min(y, rect.height - componentSize - padding));

      const updatedComponents = placedComponents.map((component) =>
        component.id === draggedComponent ? { ...component, x, y } : component
      );

      setPlacedComponents(updatedComponents);
      currentPositionsRef.current = updatedComponents; // Update ref with current positions
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggedComponent) {
      // Use the ref to get the most current positions
      const currentComponents =
        currentPositionsRef.current.length > 0
          ? currentPositionsRef.current
          : placedComponents;

      // Save the final position immediately
      const circuitData = {
        components: currentComponents,
        connections: connections,
      };
      saveMutation.mutate(circuitData);
    }
    setDraggedComponent(null);
    setIsDragging(false);
  };

  const handleComponentClick = (component: PlacedComponent) => {
    setSelectedComponent(component);
  };

  const handleConnectionDotClick = (componentId: string) => {
    if (!connectingFrom) {
      // Start connection
      setConnectingFrom(componentId);
    } else if (connectingFrom !== componentId) {
      // Complete connection
      const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        from: connectingFrom,
        to: componentId,
      };
      setConnections((prev) => [...prev, newConnection]);
      setConnectingFrom(null);
    } else {
      // Clicked the same dot, cancel connection
      setConnectingFrom(null);
    }
  };

  const handleComponentDelete = (componentId: string) => {
    setPlacedComponents((prev) => prev.filter((c) => c.id !== componentId));
    setConnections((prev) =>
      prev.filter((c) => c.from !== componentId && c.to !== componentId)
    );
    setSelectedComponent(null);
  };

  const handlePropertyChange = (
    componentId: string,
    property: string,
    value: number | boolean
  ) => {
    setPlacedComponents((prev) =>
      prev.map((component) =>
        component.id === componentId
          ? {
              ...component,
              properties: { ...component.properties, [property]: value },
            }
          : component
      )
    );
  };

  const handleSave = () => {
    console.log("Manual save triggered");
    const circuitData = {
      components: placedComponents,
      connections: connections,
    };
    console.log("Manual save circuit data:", circuitData);
    saveMutation.mutate(circuitData);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    const circuitData = {
      components: placedComponents,
      connections: connections,
    };
    simulateMutation.mutate(circuitData);
    setIsSimulating(false);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  if (projectLoading || circuitLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div key={remountKey} className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
          <p className="text-sm text-gray-500">Drag to add to circuit</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {circuitComponents.map((component) => (
              <div
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <component.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-xs font-medium text-gray-700">
                    {component.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedComponent && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                {selectedComponent.name} Properties
              </h3>
              <button
                onClick={() => handleComponentDelete(selectedComponent.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete component"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(selectedComponent.properties).map(
                ([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      type={typeof value === "boolean" ? "checkbox" : "number"}
                      checked={typeof value === "boolean" ? value : undefined}
                      value={typeof value === "number" ? value : undefined}
                      onChange={(e) => {
                        const newValue =
                          typeof value === "boolean"
                            ? e.target.checked
                            : parseFloat(e.target.value);
                        handlePropertyChange(
                          selectedComponent.id,
                          key,
                          newValue
                        );
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {showInstructions && (
          <div className="border-t border-gray-200 p-4 bg-blue-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Getting Started
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Drag components to the canvas</li>
                  <li>• Click components to edit properties</li>
                  <li>• Drag components to move them</li>
                </ul>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-blue-500 hover:text-blue-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Project
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project?.name} - Circuit Editor
                </h1>
                <p className="text-sm text-gray-500">
                  Build your circuit by dragging components
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {saveSuccess && (
                <div className="flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Saved successfully!
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || placedComponents.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleSimulate}
                disabled={isSimulating || placedComponents.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {isSimulating ? "Simulating..." : "Simulate"}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 relative">
          <div
            className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{
              cursor: draggedComponent ? "grabbing" : "default",
              userSelect: "none", // Disable text selection on canvas
            }}
          >
            {/* Placed Components */}
            {placedComponents.map((component, index) => (
              <div key={component.id}>
                {/* Component */}
                <div
                  style={{
                    position: "absolute",
                    left: component.x,
                    top: component.y,
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#f3f4f6",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    color: "#374151",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    cursor: "move",
                    userSelect: "none", // Disable text selection
                  }}
                  onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
                  onMouseUp={(e) => {
                    // Clear drag timeout if mouse is released before drag starts
                    if ((e.currentTarget as any).dragTimeout) {
                      clearTimeout((e.currentTarget as any).dragTimeout);
                      (e.currentTarget as any).dragTimeout = null;
                    }
                  }}
                  onClick={(e) => {
                    // Clear any pending drag timeout
                    if ((e.currentTarget as any).dragTimeout) {
                      clearTimeout((e.currentTarget as any).dragTimeout);
                      (e.currentTarget as any).dragTimeout = null;
                    }

                    // Only trigger click if we didn't just drag
                    if (!isDragging) {
                      handleComponentClick(component);
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", marginBottom: "5px" }}>
                      {component.name}
                    </div>
                  </div>
                </div>

                {/* Connection dots */}
                <div
                  style={{
                    position: "absolute",
                    left: component.x + 55, // Center below component
                    top: component.y + 125, // Below component
                    width: "10px",
                    height: "10px",
                    backgroundColor:
                      connectingFrom === component.id ? "#ef4444" : "#3b82f6",
                    borderRadius: "50%",
                    cursor: "pointer",
                    zIndex: 1001,
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
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

            {/* Connection lines */}
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
                    x1={fromComponent.x + 60}
                    y1={fromComponent.y + 130}
                    x2={toComponent.x + 60}
                    y2={toComponent.y + 130}
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
                    return fromComponent ? fromComponent.x + 60 : 0;
                  })()}
                  y1={(() => {
                    const fromComponent = placedComponents.find(
                      (c) => c.id === connectingFrom
                    );
                    return fromComponent ? fromComponent.y + 130 : 0;
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
        </div>
      </div>
    </div>
  );
};

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
import { LoadingAnimation } from "../components/LoadingAnimation";
import { useTheme } from "../contexts/ThemeProvider";

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
  const { theme } = useTheme();

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
  const [isDragging, setIsDragging] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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
    // First check if we have session storage data (current session)
    const sessionData = sessionStorage.getItem(`circuit_${projectId}`);
    if (sessionData) {
      try {
        const circuitData = JSON.parse(sessionData);
        if (circuitData.components && circuitData.components.length > 0) {
          setPlacedComponents(circuitData.components);
        }
        if (circuitData.connections && circuitData.connections.length > 0) {
          setConnections(circuitData.connections);
        }
        return; // Don't load from saved versions if we have session data
      } catch (error) {
        console.error("Error parsing session data:", error);
      }
    }

    // Load from saved versions if no session data
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
  }, [savedCircuit, circuitLoading, projectId]);

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
      // Only show success message for version saves (when leaving editor)
      if (data && data.id) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
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
    setDraggedComponent(null);
    setIsDragging(false);
    setConnectingFrom(null);
  };

  // Zoom and Pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      // Middle mouse or Ctrl+Left
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "0" && e.ctrlKey) {
      e.preventDefault();
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Add panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );

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
    // Just save to memory during the session, don't create a version
    const circuitData = {
      components: placedComponents,
      connections: connections,
    };
    // Store in session storage for persistence during the session
    sessionStorage.setItem(`circuit_${projectId}`, JSON.stringify(circuitData));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
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
    // Create a version when leaving the editor
    const circuitData = {
      components: placedComponents,
      connections: connections,
    };

    // Save the current state as a version
    saveMutation.mutate(circuitData);

    // Clear session storage
    sessionStorage.removeItem(`circuit_${projectId}`);

    // Navigate back to projects
    navigate(`/projects/${projectId}`);
  };

  if (projectLoading || circuitLoading) {
    return (
      <div
        className={`min-h-screen flex items-start justify-center pt-40 transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
        }`}
      >
        <LoadingAnimation size="xl" showText={false} />
      </div>
    );
  }

  return (
    <div
      key={remountKey}
      className={`h-screen flex transition-colors duration-200 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gray-50"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-64 flex flex-col transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50"
            : "bg-white border-r border-gray-200"
        }`}
      >
        <div
          className={`p-4 border-b transition-colors duration-200 ${
            theme === "dark" ? "border-gray-700/50" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold transition-colors duration-200 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Components
          </h2>
          <p
            className={`text-sm transition-colors duration-200 ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Drag to add to circuit
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {circuitComponents.map((component) => (
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

        {/* Properties Panel */}
        {selectedComponent && (
          <div
            className={`border-t p-4 transition-colors duration-200 ${
              theme === "dark" ? "border-gray-700/50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-sm font-medium transition-colors duration-200 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {selectedComponent.name} Properties
              </h3>
              <button
                onClick={() => handleComponentDelete(selectedComponent.id)}
                className="text-red-600 hover:text-red-700 p-1 transition-colors duration-200"
                title="Delete component"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(selectedComponent.properties).map(
                ([key, value]) => (
                  <div key={key}>
                    <label
                      className={`block text-xs font-medium mb-1 transition-colors duration-200 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                      className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 transition-colors duration-200 ${
                        theme === "dark"
                          ? "bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {showInstructions && (
          <div
            className={`border-t p-4 transition-colors duration-200 ${
              theme === "dark"
                ? "border-gray-700/50 bg-blue-900/20"
                : "border-gray-200 bg-blue-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`text-sm font-medium mb-1 transition-colors duration-200 ${
                    theme === "dark" ? "text-blue-300" : "text-blue-900"
                  }`}
                >
                  Getting Started
                </h4>
                <ul
                  className={`text-xs space-y-1 transition-colors duration-200 ${
                    theme === "dark" ? "text-blue-200" : "text-blue-700"
                  }`}
                >
                  <li>• Drag components to the canvas</li>
                  <li>• Click components to edit properties</li>
                  <li>• Drag components to move them</li>
                </ul>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
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
                Back to Project
              </button>
              <div>
                <h1
                  className={`text-xl font-semibold transition-colors duration-200 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {project?.name} - Circuit Editor
                </h1>
                <p
                  className={`text-sm transition-colors duration-200 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Build your circuit by dragging components
                </p>
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

        {/* Canvas */}
        <div className="flex-1 p-6 relative">
          <div
            className={`w-full h-full border-2 border-dashed rounded-lg relative overflow-hidden transition-colors duration-200 ${
              theme === "dark"
                ? "bg-gray-800/50 backdrop-blur-sm border-gray-600/50"
                : "bg-white border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={(e) => {
              handleCanvasMouseUp();
              handleMouseUp();
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            style={{
              cursor: draggedComponent ? "grabbing" : "default",
              userSelect: "none", // Disable text selection on canvas
            }}
          >
            {/* Canvas Content Container - Fixed workable area */}
            <div
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
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
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                    }}
                    onMouseDown={(e) =>
                      handleComponentMouseDown(e, component.id)
                    }
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
                      <div style={{ fontSize: "12px", marginBottom: "5px" }}>
                        {component.name}
                      </div>
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
                      border: `2px solid ${
                        theme === "dark" ? "#1f2937" : "white"
                      }`,
                      boxShadow:
                        theme === "dark"
                          ? "0 2px 4px rgba(0,0,0,0.4)"
                          : "0 2px 4px rgba(0,0,0,0.2)",
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
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
      </div>
    </div>
  );
};

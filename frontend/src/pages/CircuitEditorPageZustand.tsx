import React, { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useCircuitStore } from "../stores/circuitStore";
import type { PlacedComponent, Connection } from "../stores/circuitStore";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

// Circuit components data
const circuitComponents = [
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

export const CircuitEditorPageZustand: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zustand store
  const {
    placedComponents,
    connections,
    selectedComponent,
    draggedComponent,
    connectingFrom,
    mousePosition,
    dragOffset,
    setPlacedComponents,
    addComponent,
    moveComponent,
    setConnections,
    addConnection,
    setSelectedComponent,
    setDraggedComponent,
    setConnectingFrom,
    setMousePosition,
    setDragOffset,
    clearCircuit,
    loadCircuit,
  } = useCircuitStore();

  // Queries
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient.getProject(parseInt(projectId!)),
    enabled: !!projectId,
  });

  const { data: savedCircuit, isLoading: circuitLoading } = useQuery({
    queryKey: ["circuit", projectId],
    queryFn: () => apiClient.getCircuitVersions(parseInt(projectId!)),
    enabled: !!projectId,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (circuitData: any) => {
      console.log("=== SAVE MUTATION CALLED ===");
      console.log("Circuit data to save:", circuitData);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      return fetch(`http://localhost:8000/circuits/${projectId}/save_version`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data_json: JSON.stringify(circuitData),
        }),
      }).then((response) => {
        console.log("Save response status:", response.status);
        if (!response.ok) {
          return response.text().then((text) => {
            console.error("Save response error:", text);
            throw new Error(`Save failed: ${response.status} ${text}`);
          });
        }
        return response.json();
      });
    },
    onSuccess: (data) => {
      console.log("=== SAVE SUCCESS ===");
      console.log("Save response:", data);
    },
    onError: (error: any) => {
      console.error("=== SAVE ERROR ===");
      console.error("Save error:", error);
    },
  });

  // Load saved circuit data
  useEffect(() => {
    console.log("=== LOADING CIRCUIT DATA ===");
    console.log("Saved circuit data received:", savedCircuit);

    if (savedCircuit && savedCircuit.length > 0 && !circuitLoading) {
      console.log("Found", savedCircuit.length, "saved versions");
      const latestCircuit = savedCircuit[savedCircuit.length - 1];

      try {
        const circuitData = JSON.parse(latestCircuit.data_json);
        console.log("Parsed circuit data:", circuitData);

        if (circuitData.components && circuitData.components.length > 0) {
          console.log("Loading", circuitData.components.length, "components");
          loadCircuit(circuitData.components, circuitData.connections || []);
          console.log("Circuit loaded successfully");
        }
      } catch (error) {
        console.error("Error parsing saved circuit data:", error);
      }
    }
  }, [savedCircuit, circuitLoading, loadCircuit]);

  // Event handlers
  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const componentData = JSON.parse(
      e.dataTransfer.getData("application/json")
    );
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // Center the component
    const y = e.clientY - rect.top - 40;

    const newComponent: PlacedComponent = {
      id: `${componentData.id}_${Date.now()}`,
      componentId: componentData.id,
      type: componentData.type,
      name: componentData.name,
      x,
      y,
      properties: componentData.properties,
    };

    console.log("Adding new component:", newComponent);
    addComponent(newComponent);
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
      setDragOffset({
        x: e.clientX - component.x,
        y: e.clientY - component.y,
      });
      setDraggedComponent(componentId);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedComponent && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left - dragOffset.x;
      let y = e.clientY - rect.top - dragOffset.y;

      // Constrain to canvas boundaries
      const componentSize = 80;
      const padding = 10;
      x = Math.max(padding, Math.min(x, rect.width - componentSize - padding));
      y = Math.max(padding, Math.min(y, rect.height - componentSize - padding));

      console.log("Moving component:", { componentId: draggedComponent, x, y });
      moveComponent(draggedComponent, x, y);
    }

    // Update mouse position for connection line
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setMousePosition({ x, y });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggedComponent) {
      console.log("Drag completed, saving final position");
      // Save the final position
      setTimeout(() => {
        const circuitData = {
          components: placedComponents,
          connections: connections,
        };
        saveMutation.mutate(circuitData);
      }, 100);
    }
    setDraggedComponent(null);
  };

  const handleComponentClick = (component: PlacedComponent) => {
    setSelectedComponent(component);
  };

  const handleSave = () => {
    console.log("Manual save triggered");
    const circuitData = {
      components: placedComponents,
      connections: connections,
    };
    saveMutation.mutate(circuitData);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  if (projectLoading || circuitLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
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
                  {project?.name} - Circuit Editor (Zustand)
                </h1>
                <p className="text-sm text-gray-500">
                  Build your circuit by dragging components
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={placedComponents.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 relative">
          <div
            ref={canvasRef}
            className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{
              cursor: draggedComponent ? "grabbing" : "default",
              backgroundColor: "lightblue",
              border: "3px solid orange",
              minHeight: "400px",
            }}
          >
            {/* Debug info */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                fontSize: "12px",
                zIndex: 10000,
              }}
            >
              <div>
                <strong>Zustand Debug:</strong>
              </div>
              <div>Components: {placedComponents.length}</div>
              <div>Connections: {connections.length}</div>
              <div>Dragged: {draggedComponent || "none"}</div>
              {placedComponents.map((comp, index) => (
                <div
                  key={comp.id}
                  style={{ marginLeft: "10px", fontSize: "10px" }}
                >
                  {index + 1}. {comp.name} at ({comp.x}, {comp.y})
                </div>
              ))}
            </div>

            {/* Placed Components */}
            {placedComponents.map((component) => (
              <div
                key={component.id}
                style={{
                  position: "absolute",
                  left: component.x,
                  top: component.y,
                  width: 100,
                  height: 100,
                  backgroundColor: "yellow",
                  border: "5px solid red",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "grab",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "black",
                  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                }}
                onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
                onClick={() => handleComponentClick(component)}
              >
                {component.name}
              </div>
            ))}

            {/* Connection lines */}
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
                  x1={fromComponent.x + 50}
                  y1={fromComponent.y + 50}
                  x2={toComponent.x + 50}
                  y2={toComponent.y + 50}
                  stroke="green"
                  strokeWidth="3"
                  z-index="500"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

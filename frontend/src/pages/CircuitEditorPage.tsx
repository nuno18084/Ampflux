import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { useTheme } from "../contexts/ThemeProvider";
import { CircuitSidebar } from "../components/CircuitSidebar";
import { CircuitToolbar } from "../components/CircuitToolbar";
import { CircuitCanvas } from "../components/CircuitCanvas";
import { CircuitPropertiesPanel } from "../components/CircuitPropertiesPanel";
import { circuitComponents } from "../data/circuitComponents";
import type { PlacedComponent, Connection } from "../types/circuit";

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
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        // Check for components with very large coordinates
        if (comp.x > 1000 || comp.y > 1000) {
          console.warn(
            `⚠️ Component ${comp.name} has large coordinates: (${comp.x}, ${comp.y})`
          );
        }
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
  const handleDragStart = (e: React.DragEvent, component: any) => {
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
    // Only process if mouse is actually over the canvas
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }

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
    // Only process if mouse is actually over the canvas
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only process if mouse is actually over the canvas
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      // Middle mouse or Ctrl+Left
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only process if mouse is actually over the canvas
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }
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
    value: number | boolean | string
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
      <CircuitSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        showGettingStarted={showGettingStarted}
        setShowGettingStarted={setShowGettingStarted}
        circuitComponents={circuitComponents}
        handleDragStart={handleDragStart}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <CircuitToolbar
          project={project}
          handleBack={handleBack}
          handleSave={handleSave}
          handleSimulate={handleSimulate}
          isSaving={isSaving}
          isSimulating={isSimulating}
          saveSuccess={saveSuccess}
          placedComponents={placedComponents}
        />

        {/* Canvas */}
        <CircuitCanvas
          placedComponents={placedComponents}
          connections={connections}
          connectingFrom={connectingFrom}
          mousePosition={mousePosition}
          zoom={zoom}
          theme={theme}
          draggedComponent={draggedComponent}
          handleComponentMouseDown={handleComponentMouseDown}
          handleCanvasMouseMove={handleCanvasMouseMove}
          handleCanvasMouseUp={handleCanvasMouseUp}
          handleComponentClick={handleComponentClick}
          handleComponentDelete={handleComponentDelete}
          handleConnectionDotClick={handleConnectionDotClick}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleWheel={handleWheel}
          handleMouseDown={handleMouseDown}
          handleMouseUp={handleMouseUp}
          setZoom={setZoom}
          setPan={setPan}
          circuitComponents={circuitComponents}
        />
      </div>

      {/* Properties Panel */}
      <CircuitPropertiesPanel
        selectedComponent={selectedComponent}
        handlePropertyChange={handlePropertyChange}
      />
    </div>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { useTheme } from "../contexts/ThemeProvider";
import { CircuitSidebar } from "../components/CircuitSidebar";
import { CircuitToolbar } from "../components/CircuitToolbar";
import { CircuitCanvas } from "../components/CircuitCanvas";
import { CircuitPropertiesPanel } from "../components/CircuitPropertiesPanel";
import { circuitComponents } from "../data/circuitComponents";
import { useCircuitEditor } from "../hooks/useCircuitEditor";

export const CircuitEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    // Refs
    canvasRef,
    currentPositionsRef,

    // State
    placedComponents,
    setPlacedComponents,
    connections,
    setConnections,
    selectedComponent,
    setSelectedComponent,
    draggedComponent,
    setDraggedComponent,
    isDragging,
    setIsDragging,
    connectingFrom,
    setConnectingFrom,
    mousePosition,
    setMousePosition,
    isSaving,
    setIsSaving,
    saveSuccess,
    setSaveSuccess,
    isSimulating,
    setIsSimulating,
    simulationResult,
    setSimulationResult,
    showGettingStarted,
    setShowGettingStarted,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isPropertiesPanelCollapsed,
    setIsPropertiesPanelCollapsed,

    // Zoom and Pan
    zoom,
    setZoom,
    pan,
    setPan,
    stableSetPan,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,

    // Queries
    project,
    projectLoading,
    savedCircuit,
    circuitLoading,
    circuitError,

    // Mutations
    saveMutation,
    simulateMutation,

    // Permissions
    permissions,
  } = useCircuitEditor();

  // Force remount on every page load to reset state
  const remountKey = Date.now();

  // Loading states
  if (projectLoading || circuitLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!permissions.canEdit) {
      alert("You don't have permission to add components to this project.");
      return;
    }

    try {
      const componentData = JSON.parse(
        e.dataTransfer.getData("application/json")
      );

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 60; // Center the component
      const y = e.clientY - rect.top - 60;

      const newComponent = {
        id: `${componentData.id}_${Date.now()}`,
        componentId: componentData.id,
        type: componentData.type,
        name: componentData.name,
        x,
        y,
        properties: componentData.properties,
      };

      setPlacedComponents((prev) => [...prev, newComponent]);
    } catch (error) {
      console.error("Error in handleDrop:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleComponentMouseDown = (
    e: React.MouseEvent,
    componentId: string
  ) => {
    e.stopPropagation();

    if (!permissions.canEdit) {
      return; // Don't allow dragging for viewers
    }

    const component = placedComponents.find((c) => c.id === componentId);
    if (component) {
      // Add a small delay to distinguish between click and drag
      const dragTimeout = setTimeout(() => {
        setDraggedComponent(componentId);
        setIsDragging(true);
        // Store current positions
        currentPositionsRef.current = [...placedComponents];
      }, 150); // 150ms delay

      // Clear timeout on mouse up
      const handleMouseUp = () => {
        clearTimeout(dragTimeout);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedComponent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 60;
      const y = e.clientY - rect.top - 60;

      setPlacedComponents((prev) =>
        prev.map((component) =>
          component.id === draggedComponent ? { ...component, x, y } : component
        )
      );
    }

    // Update mouse position for potential connections
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedComponent(null);
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
    if (e.button === 0 && !e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      stableSetPan({
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
      stableSetPan({ x: 0, y: 0 });
    }
  };

  const handleComponentClick = (component: any) => {
    setSelectedComponent(component);
  };

  const handleConnectionDotClick = (componentId: string) => {
    if (!permissions.canEdit) {
      return; // Don't allow connections for viewers
    }

    if (!connectingFrom) {
      setConnectingFrom(componentId);
    } else {
      // Create connection
      if (connectingFrom !== componentId) {
        const newConnection = {
          id: `connection_${Date.now()}`,
          from: connectingFrom,
          to: componentId,
        };
        setConnections((prev) => [...prev, newConnection]);
      }
      setConnectingFrom(null);
    }
  };

  const handleComponentDelete = (componentId: string) => {
    if (!permissions.canEdit) {
      alert(
        "You don't have permission to delete components from this project."
      );
      return;
    }

    setPlacedComponents((prev) =>
      prev.filter((component) => component.id !== componentId)
    );
    setConnections((prev) =>
      prev.filter(
        (connection) =>
          connection.from !== componentId && connection.to !== componentId
      )
    );
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  const handlePropertyChange = (
    componentId: string,
    property: string,
    value: number | boolean | string
  ) => {
    if (!permissions.canEdit) {
      alert("You don't have permission to modify components in this project.");
      return;
    }

    setPlacedComponents((prev) =>
      prev.map((component) =>
        component.id === componentId
          ? {
              ...component,
              properties: {
                ...component.properties,
                [property]: value,
              },
            }
          : component
      )
    );
  };

  const handleSave = () => {
    if (!permissions.canEdit) {
      alert("You don't have permission to save this project.");
      return;
    }

    setIsSaving(true);
    const circuitData = {
      components: placedComponents,
      connections,
      viewState: {
        zoom,
        pan,
      },
    };

    saveMutation.mutate(JSON.stringify(circuitData), {
      onSuccess: () => {
        setIsSaving(false);
      },
      onError: () => {
        setIsSaving(false);
      },
    });
  };

  const handleSimulate = () => {
    if (!permissions.canEdit) {
      alert("You don't have permission to simulate this project.");
      return;
    }

    setIsSimulating(true);
    const circuitData = {
      components: placedComponents,
      connections,
    };

    simulateMutation.mutate(JSON.stringify(circuitData), {
      onSuccess: () => {
        setIsSimulating(false);
      },
      onError: () => {
        setIsSimulating(false);
      },
    });
  };

  const handleBack = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      key={remountKey}
      className={`h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <CircuitToolbar
        project={project}
        handleBack={handleBack}
        handleSave={handleSave}
        handleSimulate={handleSimulate}
        isSaving={isSaving}
        isSimulating={isSimulating}
        saveSuccess={saveSuccess}
        placedComponents={placedComponents}
        permissions={permissions}
      />

      <div className="flex-1 flex overflow-hidden">
        <CircuitSidebar
          circuitComponents={circuitComponents}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onDragStart={handleDragStart}
        />

        <div className="flex-1 relative overflow-hidden">
          <CircuitCanvas
            ref={canvasRef}
            placedComponents={placedComponents}
            connections={connections}
            zoom={zoom}
            pan={pan}
            selectedComponent={selectedComponent}
            draggedComponent={draggedComponent}
            connectingFrom={connectingFrom}
            mousePosition={mousePosition}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onComponentMouseDown={handleComponentMouseDown}
            onCanvasMouseMove={handleCanvasMouseMove}
            onCanvasMouseUp={handleCanvasMouseUp}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onComponentClick={handleComponentClick}
            onConnectionDotClick={handleConnectionDotClick}
            onComponentDelete={handleComponentDelete}
            onPropertyChange={handlePropertyChange}
            circuitComponents={circuitComponents}
          />
        </div>

        <CircuitPropertiesPanel
          selectedComponent={selectedComponent}
          onPropertyChange={handlePropertyChange}
          isCollapsed={isPropertiesPanelCollapsed}
          onToggleCollapse={() =>
            setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)
          }
          showGettingStarted={showGettingStarted}
          setShowGettingStarted={setShowGettingStarted}
        />
      </div>
    </div>
  );
};

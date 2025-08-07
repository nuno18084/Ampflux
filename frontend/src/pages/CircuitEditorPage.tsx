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
import {
  createHandleDragStart,
  createHandleDrop,
  createHandleDragOver,
  createHandleComponentMouseDown,
  createHandleCanvasMouseMove,
  createHandleCanvasMouseUp,
  createHandleWheel,
  createHandleMouseDown,
  createHandleMouseMove,
  createHandleMouseUp,
  createHandleKeyDown,
  createHandleComponentClick,
  createHandleConnectionDotClick,
  createHandleComponentDelete,
  createHandlePropertyChange,
  createHandleSave,
  createHandleSimulate,
} from "../utils/circuitEditorUtils";

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
  const handleDragStart = createHandleDragStart();
  const handleDrop = createHandleDrop(
    placedComponents,
    setPlacedComponents,
    zoom,
    pan,
    permissions
  );
  const handleDragOver = createHandleDragOver();
  const handleComponentMouseDown = createHandleComponentMouseDown(
    placedComponents,
    setDraggedComponent,
    setIsDragging,
    currentPositionsRef,
    permissions
  );
  const handleCanvasMouseMove = createHandleCanvasMouseMove(
    draggedComponent,
    placedComponents,
    setPlacedComponents,
    currentPositionsRef,
    zoom,
    pan,
    isDragging,
    setMousePosition
  );
  const handleCanvasMouseUp = createHandleCanvasMouseUp(
    setDraggedComponent,
    setIsDragging
  );
  const handleWheel = createHandleWheel(zoom, setZoom);
  const handleMouseDown = createHandleMouseDown(setIsPanning, setPanStart);
  const handleMouseMove = createHandleMouseMove(
    isPanning,
    panStart,
    pan,
    setPan
  );
  const handleMouseUp = createHandleMouseUp(setIsPanning, setPanStart);
  const handleKeyDown = createHandleKeyDown(
    selectedComponent,
    placedComponents,
    setPlacedComponents,
    setSelectedComponent
  );
  const handleComponentClick = createHandleComponentClick(setSelectedComponent);
  const handleConnectionDotClick = createHandleConnectionDotClick(
    connectingFrom,
    setConnectingFrom,
    connections,
    setConnections,
    permissions
  );
  const handleComponentDelete = createHandleComponentDelete(
    placedComponents,
    setPlacedComponents,
    connections,
    setConnections,
    setSelectedComponent,
    permissions,
    selectedComponent
  );
  const handlePropertyChange = createHandlePropertyChange(
    placedComponents,
    setPlacedComponents,
    permissions
  );
  const handleSave = createHandleSave(
    permissions,
    setIsSaving,
    saveMutation,
    placedComponents,
    connections,
    zoom,
    pan
  );
  const handleSimulate = createHandleSimulate(
    permissions,
    setIsSimulating,
    simulateMutation,
    placedComponents,
    connections
  );

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
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          showGettingStarted={showGettingStarted}
          setShowGettingStarted={setShowGettingStarted}
          circuitComponents={circuitComponents}
          handleDragStart={handleDragStart}
        />

        <div className="flex-1 relative overflow-hidden">
          <CircuitCanvas
            placedComponents={placedComponents}
            connections={connections}
            connectingFrom={connectingFrom}
            mousePosition={mousePosition}
            zoom={zoom}
            theme={theme}
            draggedComponent={draggedComponent}
            pan={pan}
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
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            setZoom={setZoom}
            setPan={stableSetPan}
            circuitComponents={circuitComponents}
          />
        </div>

        <CircuitPropertiesPanel
          selectedComponent={selectedComponent}
          handlePropertyChange={handlePropertyChange}
          isPropertiesPanelCollapsed={isPropertiesPanelCollapsed}
          setIsPropertiesPanelCollapsed={setIsPropertiesPanelCollapsed}
        />
      </div>
    </div>
  );
};

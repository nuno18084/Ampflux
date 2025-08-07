import { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useProjectPermissions } from "./useProjectPermissions";
import type { PlacedComponent, Connection } from "../types/circuit";

export const useCircuitEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentPositionsRef = useRef<PlacedComponent[]>([]);
  const panRef = useRef({ x: 0, y: 0 });
  const intendedPanRef = useRef({ x: 0, y: 0 });

  // Get user permissions for this project
  const permissions = useProjectPermissions(parseInt(projectId!));

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
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] =
    useState(false);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  panRef.current = pan; // Keep ref in sync with state

  // Create a stable setPan function that preserves state during re-renders
  const stableSetPan = useCallback((newPan: { x: number; y: number }) => {
    intendedPanRef.current = newPan;
    setPan(newPan);
  }, []);

  // Preserve pan state when properties panel changes
  useEffect(() => {
    if (intendedPanRef.current.x !== 0 || intendedPanRef.current.y !== 0) {
      setTimeout(() => {
        if (pan.x === 0 && pan.y === 0) {
          stableSetPan(intendedPanRef.current);
        }
      }, 100);
    }
  }, [isPropertiesPanelCollapsed, pan, stableSetPan]);

  // Prevent pan from being reset during re-renders
  useEffect(() => {
    if (
      pan.x === 0 &&
      pan.y === 0 &&
      intendedPanRef.current.x !== 0 &&
      intendedPanRef.current.y !== 0
    ) {
      stableSetPan(intendedPanRef.current);
    }
  }, [pan, stableSetPan]);

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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Monitor savedCircuit changes
  useEffect(() => {
    // Circuit data loaded successfully
  }, [savedCircuit, circuitLoading, circuitError]);

  // Load saved circuit data
  useEffect(() => {
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
        if (circuitData.viewState) {
          if (circuitData.viewState.zoom) {
            setZoom(circuitData.viewState.zoom);
          }
          if (circuitData.viewState.pan) {
            stableSetPan(circuitData.viewState.pan);
          }
        }
        return;
      } catch (error) {
        console.error("Error parsing session data:", error);
      }
    }

    if (savedCircuit && savedCircuit.length > 0 && !circuitLoading) {
      const latestCircuit = savedCircuit[0];

      try {
        const circuitData = JSON.parse(latestCircuit.data_json);

        if (circuitData.components && circuitData.components.length > 0) {
          setPlacedComponents(circuitData.components);
        }
        if (circuitData.connections && circuitData.connections.length > 0) {
          setConnections(circuitData.connections);
        }
        if (circuitData.viewState) {
          if (circuitData.viewState.zoom) {
            setZoom(circuitData.viewState.zoom);
          }
          if (circuitData.viewState.pan) {
            stableSetPan(circuitData.viewState.pan);
          }
        }
      } catch (error) {
        console.error("Error parsing circuit data:", error);
      }
    }
  }, [savedCircuit, circuitLoading, projectId, stableSetPan]);

  // Save circuit data to session storage
  useEffect(() => {
    const circuitData = {
      components: placedComponents,
      connections,
      viewState: {
        zoom,
        pan,
      },
    };
    sessionStorage.setItem(`circuit_${projectId}`, JSON.stringify(circuitData));
  }, [placedComponents, connections, zoom, pan, projectId]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (dataJson: string) =>
      apiClient.saveCircuitVersion(parseInt(projectId!), dataJson),
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (circuitData: string) =>
      apiClient.simulateCircuit(parseInt(projectId!), circuitData),
    onSuccess: (data) => {
      setSimulationResult(data);
    },
  });

  // Add panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // Add global mouse event handling for panning
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning && panStart) {
        stableSetPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setPanStart(null);
    };

    if (isPanning) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isPanning, panStart, stableSetPan]);

  return {
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
  };
};

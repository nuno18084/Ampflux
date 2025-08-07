import type { PlacedComponent, Connection } from "../types/circuit";

// Drag and Drop Handlers
export const createHandleDragStart =
  () => (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

export const createHandleDrop =
  (
    placedComponents: PlacedComponent[],
    setPlacedComponents: (components: PlacedComponent[]) => void,
    zoom: number,
    pan: { x: number; y: number },
    permissions: { canEdit: boolean }
  ) =>
  (e: React.DragEvent) => {
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
      const x = (e.clientX - rect.left - 60) / zoom - pan.x;
      const y = (e.clientY - rect.top - 60) / zoom - pan.y;

      const newComponent = {
        id: `${componentData.id}_${Date.now()}`,
        componentId: componentData.id,
        type: componentData.id,
        name: componentData.name,
        x,
        y,
        properties: componentData.properties,
      };

      setPlacedComponents([...placedComponents, newComponent]);
    } catch (error) {
      console.error("Error in handleDrop:", error);
    }
  };

export const createHandleDragOver = () => (e: React.DragEvent) => {
  e.preventDefault();
};

// Mouse Event Handlers
export const createHandleComponentMouseDown =
  (
    placedComponents: PlacedComponent[],
    setDraggedComponent: (componentId: string | null) => void,
    setIsDragging: (dragging: boolean) => void,
    currentPositionsRef: React.MutableRefObject<PlacedComponent[]>,
    permissions: { canEdit: boolean }
  ) =>
  (e: React.MouseEvent, componentId: string) => {
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

export const createHandleCanvasMouseMove =
  (
    draggedComponent: string | null,
    placedComponents: PlacedComponent[],
    setPlacedComponents: (components: PlacedComponent[]) => void,
    currentPositionsRef: React.MutableRefObject<PlacedComponent[]>,
    zoom: number,
    pan: { x: number; y: number },
    isDragging: boolean,
    setMousePosition: (position: { x: number; y: number } | null) => void
  ) =>
  (e: React.MouseEvent) => {
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

export const createHandleCanvasMouseUp =
  (
    setDraggedComponent: (componentId: string | null) => void,
    setIsDragging: (dragging: boolean) => void
  ) =>
  () => {
    setDraggedComponent(null);
    setIsDragging(false);
  };

// Wheel and Mouse Handlers
export const createHandleWheel =
  (zoom: number, setZoom: (zoom: number) => void) => (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

export const createHandleMouseDown =
  (
    setIsPanning: (panning: boolean) => void,
    setPanStart: (start: { x: number; y: number } | null) => void
  ) =>
  (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

export const createHandleMouseMove =
  (
    isPanning: boolean,
    panStart: { x: number; y: number } | null,
    pan: { x: number; y: number },
    setPan: (pan: { x: number; y: number }) => void
  ) =>
  (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
    }
  };

export const createHandleMouseUp =
  (
    setIsPanning: (panning: boolean) => void,
    setPanStart: (start: { x: number; y: number } | null) => void
  ) =>
  () => {
    setIsPanning(false);
    setPanStart(null);
  };

// Keyboard Handlers
export const createHandleKeyDown =
  (
    selectedComponent: PlacedComponent | null,
    placedComponents: PlacedComponent[],
    setPlacedComponents: (components: PlacedComponent[]) => void,
    setSelectedComponent: (component: PlacedComponent | null) => void
  ) =>
  (e: React.KeyboardEvent) => {
    if (e.key === "Delete" && selectedComponent) {
      const updatedComponents = placedComponents.filter(
        (component) => component.id !== selectedComponent.id
      );
      setPlacedComponents(updatedComponents);
      setSelectedComponent(null);
    }
  };

// Component Interaction Handlers
export const createHandleComponentClick =
  (setSelectedComponent: (component: PlacedComponent | null) => void) =>
  (component: PlacedComponent) => {
    setSelectedComponent(component);
  };

export const createHandleConnectionDotClick =
  (
    connectingFrom: string | null,
    setConnectingFrom: (componentId: string | null) => void,
    connections: Connection[],
    setConnections: (connections: Connection[]) => void,
    permissions: { canEdit: boolean }
  ) =>
  (componentId: string) => {
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

export const createHandleComponentDelete =
  (
    placedComponents: PlacedComponent[],
    setPlacedComponents: (components: PlacedComponent[]) => void,
    connections: Connection[],
    setConnections: (connections: Connection[]) => void,
    setSelectedComponent: (component: PlacedComponent | null) => void,
    permissions: { canEdit: boolean },
    selectedComponent: PlacedComponent | null
  ) =>
  (componentId: string) => {
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

// Property Change Handler
export const createHandlePropertyChange =
  (
    placedComponents: PlacedComponent[],
    setPlacedComponents: (components: PlacedComponent[]) => void,
    permissions: { canEdit: boolean }
  ) =>
  (componentId: string, property: string, value: number | boolean | string) => {
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

// Save and Simulate Handlers
export const createHandleSave =
  (
    permissions: { canEdit: boolean },
    setIsSaving: (saving: boolean) => void,
    saveMutation: any,
    placedComponents: PlacedComponent[],
    connections: Connection[],
    zoom: number,
    pan: { x: number; y: number }
  ) =>
  () => {
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

export const createHandleSimulate =
  (
    permissions: { canEdit: boolean },
    setIsSimulating: (simulating: boolean) => void,
    simulateMutation: any,
    placedComponents: PlacedComponent[],
    connections: Connection[]
  ) =>
  () => {
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

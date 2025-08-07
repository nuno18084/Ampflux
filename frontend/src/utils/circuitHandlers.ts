import type { PlacedComponent, Connection } from "../types/circuit";

// Drag and Drop Handlers
export const handleDragStart = (e: React.DragEvent, component: any) => {
  e.dataTransfer.setData("application/json", JSON.stringify(component));
};

export const handleDrop = (
  e: React.DragEvent,
  placedComponents: PlacedComponent[],
  setPlacedComponents: (components: PlacedComponent[]) => void,
  zoom: number,
  pan: { x: number; y: number }
) => {
  e.preventDefault();
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
      type: componentData.id, // Use componentData.id as type
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

export const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
};

// Mouse Event Handlers
export const handleComponentMouseDown = (
  e: React.MouseEvent,
  componentId: string,
  setDraggedComponent: (componentId: string | null) => void,
  setIsDragging: (dragging: boolean) => void,
  setCurrentPositions: (positions: PlacedComponent[]) => void,
  placedComponents: PlacedComponent[]
) => {
  e.preventDefault();
  e.stopPropagation();
  setDraggedComponent(componentId);
  setIsDragging(true);
  setCurrentPositions([...placedComponents]);

  const handleMouseUp = () => {
    setDraggedComponent(null);
    setIsDragging(false);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mouseup", handleMouseUp);
};

export const handleCanvasMouseMove = (
  e: React.MouseEvent,
  draggedComponent: string | null,
  placedComponents: PlacedComponent[],
  setPlacedComponents: (components: PlacedComponent[]) => void,
  currentPositionsRef: React.MutableRefObject<PlacedComponent[]>,
  zoom: number,
  pan: { x: number; y: number }
) => {
  if (draggedComponent && currentPositionsRef.current.length > 0) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - 60) / zoom - pan.x;
    const y = (e.clientY - rect.top - 60) / zoom - pan.y;

    const updatedComponents = placedComponents.map((component) => {
      if (component.id === draggedComponent) {
        return { ...component, x, y };
      }
      return component;
    });

    setPlacedComponents(updatedComponents);
  }
};

export const handleCanvasMouseUp = (
  setDraggedComponent: (componentId: string | null) => void,
  setIsDragging: (dragging: boolean) => void
) => {
  setDraggedComponent(null);
  setIsDragging(false);
};

// Wheel and Mouse Handlers
export const handleWheel = (
  e: React.WheelEvent,
  zoom: number,
  setZoom: (zoom: number) => void
) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
  setZoom(newZoom);
};

export const handleMouseDown = (
  e: React.MouseEvent,
  setIsPanning: (panning: boolean) => void,
  setPanStart: (start: { x: number; y: number } | null) => void
) => {
  if (e.button === 1) {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }
};

export const handleMouseMove = (
  e: React.MouseEvent,
  isPanning: boolean,
  panStart: { x: number; y: number } | null,
  pan: { x: number; y: number },
  setPan: (pan: { x: number; y: number }) => void
) => {
  if (isPanning && panStart) {
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
  }
};

export const handleMouseUp = (
  setIsPanning: (panning: boolean) => void,
  setPanStart: (start: { x: number; y: number } | null) => void
) => {
  setIsPanning(false);
  setPanStart(null);
};

// Keyboard Handlers
export const handleKeyDown = (
  e: React.KeyboardEvent,
  selectedComponent: PlacedComponent | null,
  placedComponents: PlacedComponent[],
  setPlacedComponents: (components: PlacedComponent[]) => void,
  setSelectedComponent: (component: PlacedComponent | null) => void
) => {
  if (e.key === "Delete" && selectedComponent) {
    const updatedComponents = placedComponents.filter(
      (component) => component.id !== selectedComponent.id
    );
    setPlacedComponents(updatedComponents);
    setSelectedComponent(null);
  }
};

// Component Interaction Handlers
export const handleComponentClick = (
  component: PlacedComponent,
  setSelectedComponent: (component: PlacedComponent | null) => void
) => {
  setSelectedComponent(component);
};

export const handleConnectionDotClick = (
  componentId: string,
  connectingFrom: string | null,
  setConnectingFrom: (componentId: string | null) => void,
  connections: Connection[],
  setConnections: (connections: Connection[]) => void
) => {
  if (!connectingFrom) {
    setConnectingFrom(componentId);
  } else if (connectingFrom !== componentId) {
    const newConnection = {
      id: `connection_${Date.now()}`,
      from: connectingFrom,
      to: componentId,
    };
    setConnections([...connections, newConnection]);
    setConnectingFrom(null);
  } else {
    setConnectingFrom(null);
  }
};

export const handleComponentDelete = (
  componentId: string,
  placedComponents: PlacedComponent[],
  setPlacedComponents: (components: PlacedComponent[]) => void,
  connections: Connection[],
  setConnections: (connections: Connection[]) => void,
  setSelectedComponent: (component: PlacedComponent | null) => void
) => {
  const updatedComponents = placedComponents.filter(
    (component) => component.id !== componentId
  );
  setPlacedComponents(updatedComponents);

  const updatedConnections = connections.filter(
    (connection) =>
      connection.from !== componentId && connection.to !== componentId
  );
  setConnections(updatedConnections);

  setSelectedComponent(null);
};

// Property Change Handler
export const handlePropertyChange = (
  componentId: string,
  property: string,
  value: number | boolean | string,
  placedComponents: PlacedComponent[],
  setPlacedComponents: (components: PlacedComponent[]) => void
) => {
  const updatedComponents = placedComponents.map((component) => {
    if (component.id === componentId) {
      return {
        ...component,
        properties: {
          ...component.properties,
          [property]: value,
        },
      };
    }
    return component;
  });
  setPlacedComponents(updatedComponents);
};

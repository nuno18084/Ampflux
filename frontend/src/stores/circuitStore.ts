import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface PlacedComponent {
  id: string;
  componentId: string;
  type: string;
  name: string;
  x: number;
  y: number;
  properties: Record<string, number | boolean>;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

interface CircuitState {
  // State
  placedComponents: PlacedComponent[];
  connections: Connection[];
  selectedComponent: PlacedComponent | null;
  draggedComponent: string | null;
  connectingFrom: string | null;
  mousePosition: { x: number; y: number } | null;
  dragOffset: { x: number; y: number };

  // Actions
  setPlacedComponents: (components: PlacedComponent[]) => void;
  addComponent: (component: PlacedComponent) => void;
  updateComponent: (id: string, updates: Partial<PlacedComponent>) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, x: number, y: number) => void;

  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;

  setSelectedComponent: (component: PlacedComponent | null) => void;
  setDraggedComponent: (id: string | null) => void;
  setConnectingFrom: (id: string | null) => void;
  setMousePosition: (position: { x: number; y: number } | null) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;

  // Clear all state
  clearCircuit: () => void;

  // Load circuit data
  loadCircuit: (
    components: PlacedComponent[],
    connections: Connection[]
  ) => void;
}

export const useCircuitStore = create<CircuitState>()(
  devtools(
    (set, get) => ({
      // Initial state
      placedComponents: [],
      connections: [],
      selectedComponent: null,
      draggedComponent: null,
      connectingFrom: null,
      mousePosition: null,
      dragOffset: { x: 0, y: 0 },

      // Actions
      setPlacedComponents: (components) =>
        set({ placedComponents: components }),

      addComponent: (component) =>
        set((state) => ({
          placedComponents: [...state.placedComponents, component],
        })),

      updateComponent: (id, updates) =>
        set((state) => ({
          placedComponents: state.placedComponents.map((comp) =>
            comp.id === id ? { ...comp, ...updates } : comp
          ),
        })),

      removeComponent: (id) =>
        set((state) => ({
          placedComponents: state.placedComponents.filter(
            (comp) => comp.id !== id
          ),
          connections: state.connections.filter(
            (conn) => conn.from !== id && conn.to !== id
          ),
        })),

      moveComponent: (id, x, y) =>
        set((state) => ({
          placedComponents: state.placedComponents.map((comp) =>
            comp.id === id ? { ...comp, x, y } : comp
          ),
        })),

      setConnections: (connections) => set({ connections }),

      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
        })),

      setSelectedComponent: (component) =>
        set({ selectedComponent: component }),

      setDraggedComponent: (id) => set({ draggedComponent: id }),

      setConnectingFrom: (id) => set({ connectingFrom: id }),

      setMousePosition: (position) => set({ mousePosition: position }),

      setDragOffset: (offset) => set({ dragOffset: offset }),

      clearCircuit: () =>
        set({
          placedComponents: [],
          connections: [],
          selectedComponent: null,
          draggedComponent: null,
          connectingFrom: null,
          mousePosition: null,
          dragOffset: { x: 0, y: 0 },
        }),

      loadCircuit: (components, connections) =>
        set({
          placedComponents: components,
          connections: connections,
        }),
    }),
    {
      name: "circuit-store",
    }
  )
);

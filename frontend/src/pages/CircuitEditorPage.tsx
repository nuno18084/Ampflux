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
  BoltIcon,
  MinusIcon,
  PlusIcon,
  MagnifyingGlassIcon,
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

  const circuitComponents: CircuitComponent[] = [
    // Power Components
    {
      id: "battery",
      type: "battery",
      name: "Battery",
      icon: BoltIcon,
      properties: { voltage: 9 },
    },
    {
      id: "power_supply",
      type: "power_supply",
      name: "Power Supply",
      icon: BoltIcon,
      properties: { voltage: 12 },
    },
    {
      id: "ground",
      type: "ground",
      name: "Ground",
      icon: MinusIcon,
      properties: {},
    },
    {
      id: "vcc",
      type: "vcc",
      name: "VCC",
      icon: PlusIcon,
      properties: { voltage: 5 },
    },

    // Passive Components
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
      id: "potentiometer",
      type: "potentiometer",
      name: "Potentiometer",
      icon: CogIcon,
      properties: { resistance: 1000 },
    },
    {
      id: "variable_resistor",
      type: "variable_resistor",
      name: "Variable Resistor",
      icon: CogIcon,
      properties: { resistance: 100 },
    },

    // Diodes & LEDs
    {
      id: "diode",
      type: "diode",
      name: "Diode",
      icon: CogIcon,
      properties: { forward_voltage: 0.7 },
    },
    {
      id: "led",
      type: "led",
      name: "LED",
      icon: CogIcon,
      properties: { forward_voltage: 2.1, current_limit: 0.02 },
    },
    {
      id: "zener_diode",
      type: "zener_diode",
      name: "Zener Diode",
      icon: CogIcon,
      properties: { breakdown_voltage: 5.1 },
    },
    {
      id: "schottky_diode",
      type: "schottky_diode",
      name: "Schottky Diode",
      icon: CogIcon,
      properties: { forward_voltage: 0.3 },
    },
    {
      id: "photodiode",
      type: "photodiode",
      name: "Photodiode",
      icon: CogIcon,
      properties: { sensitivity: 0.5 },
    },

    // Transistors
    {
      id: "npn_transistor",
      type: "npn_transistor",
      name: "NPN Transistor",
      icon: CogIcon,
      properties: { gain: 100 },
    },
    {
      id: "pnp_transistor",
      type: "pnp_transistor",
      name: "PNP Transistor",
      icon: CogIcon,
      properties: { gain: 100 },
    },
    {
      id: "mosfet_n",
      type: "mosfet_n",
      name: "N-MOSFET",
      icon: CogIcon,
      properties: { threshold_voltage: 2.5 },
    },
    {
      id: "mosfet_p",
      type: "mosfet_p",
      name: "P-MOSFET",
      icon: CogIcon,
      properties: { threshold_voltage: -2.5 },
    },
    {
      id: "igbt",
      type: "igbt",
      name: "IGBT",
      icon: CogIcon,
      properties: { collector_voltage: 600 },
    },

    // Switches & Relays
    {
      id: "switch_spst",
      type: "switch_spst",
      name: "SPST Switch",
      icon: CogIcon,
      properties: { is_closed: false },
    },
    {
      id: "switch_spdt",
      type: "switch_spdt",
      name: "SPDT Switch",
      icon: CogIcon,
      properties: { position: "center" },
    },
    {
      id: "switch_dpdt",
      type: "switch_dpdt",
      name: "DPDT Switch",
      icon: CogIcon,
      properties: { position: "center" },
    },
    {
      id: "relay",
      type: "relay",
      name: "Relay",
      icon: CogIcon,
      properties: { coil_voltage: 12 },
    },
    {
      id: "push_button",
      type: "push_button",
      name: "Push Button",
      icon: CogIcon,
      properties: { is_pressed: false },
    },
    {
      id: "toggle_switch",
      type: "toggle_switch",
      name: "Toggle Switch",
      icon: CogIcon,
      properties: { is_on: false },
    },

    // Sensors
    {
      id: "thermistor",
      type: "thermistor",
      name: "Thermistor",
      icon: CogIcon,
      properties: { resistance: 10000 },
    },
    {
      id: "photoresistor",
      type: "photoresistor",
      name: "Photoresistor",
      icon: CogIcon,
      properties: { resistance: 1000 },
    },
    {
      id: "pressure_sensor",
      type: "pressure_sensor",
      name: "Pressure Sensor",
      icon: CogIcon,
      properties: { sensitivity: 1 },
    },
    {
      id: "accelerometer",
      type: "accelerometer",
      name: "Accelerometer",
      icon: CogIcon,
      properties: { range: 2 },
    },
    {
      id: "gyroscope",
      type: "gyroscope",
      name: "Gyroscope",
      icon: CogIcon,
      properties: { range: 250 },
    },
    {
      id: "magnetic_sensor",
      type: "magnetic_sensor",
      name: "Magnetic Sensor",
      icon: CogIcon,
      properties: { sensitivity: 0.1 },
    },

    // Integrated Circuits
    {
      id: "op_amp",
      type: "op_amp",
      name: "Op-Amp",
      icon: CogIcon,
      properties: { gain: 100000 },
    },
    {
      id: "comparator",
      type: "comparator",
      name: "Comparator",
      icon: CogIcon,
      properties: { threshold: 2.5 },
    },
    {
      id: "voltage_regulator",
      type: "voltage_regulator",
      name: "Voltage Regulator",
      icon: CogIcon,
      properties: { output_voltage: 5 },
    },
    {
      id: "microcontroller",
      type: "microcontroller",
      name: "Microcontroller",
      icon: CogIcon,
      properties: { clock_speed: 16000000 },
    },
    {
      id: "fpga",
      type: "fpga",
      name: "FPGA",
      icon: CogIcon,
      properties: { logic_cells: 1000 },
    },
    {
      id: "dac",
      type: "dac",
      name: "DAC",
      icon: CogIcon,
      properties: { resolution: 12 },
    },
    {
      id: "adc",
      type: "adc",
      name: "ADC",
      icon: CogIcon,
      properties: { resolution: 12 },
    },

    // Display Components
    {
      id: "lcd_display",
      type: "lcd_display",
      name: "LCD Display",
      icon: CogIcon,
      properties: { rows: 2, columns: 16 },
    },
    {
      id: "oled_display",
      type: "oled_display",
      name: "OLED Display",
      icon: CogIcon,
      properties: { width: 128, height: 64 },
    },
    {
      id: "seven_segment",
      type: "seven_segment",
      name: "7-Segment Display",
      icon: CogIcon,
      properties: { digits: 4 },
    },
    {
      id: "led_matrix",
      type: "led_matrix",
      name: "LED Matrix",
      icon: CogIcon,
      properties: { rows: 8, columns: 8 },
    },

    // Communication
    {
      id: "uart",
      type: "uart",
      name: "UART",
      icon: CogIcon,
      properties: { baud_rate: 9600 },
    },
    {
      id: "spi",
      type: "spi",
      name: "SPI",
      icon: CogIcon,
      properties: { clock_speed: 1000000 },
    },
    {
      id: "i2c",
      type: "i2c",
      name: "I2C",
      icon: CogIcon,
      properties: { clock_speed: 100000 },
    },
    {
      id: "ethernet",
      type: "ethernet",
      name: "Ethernet",
      icon: CogIcon,
      properties: { speed: 100 },
    },
    {
      id: "wifi_module",
      type: "wifi_module",
      name: "WiFi Module",
      icon: CogIcon,
      properties: { frequency: 2.4 },
    },
    {
      id: "bluetooth",
      type: "bluetooth",
      name: "Bluetooth",
      icon: CogIcon,
      properties: { version: 4.0 },
    },

    // Motors & Actuators
    {
      id: "dc_motor",
      type: "dc_motor",
      name: "DC Motor",
      icon: CogIcon,
      properties: { voltage: 12, current: 1 },
    },
    {
      id: "stepper_motor",
      type: "stepper_motor",
      name: "Stepper Motor",
      icon: CogIcon,
      properties: { steps_per_revolution: 200 },
    },
    {
      id: "servo_motor",
      type: "servo_motor",
      name: "Servo Motor",
      icon: CogIcon,
      properties: { angle_range: 180 },
    },
    {
      id: "solenoid",
      type: "solenoid",
      name: "Solenoid",
      icon: CogIcon,
      properties: { voltage: 12 },
    },
    {
      id: "vibrator",
      type: "vibrator",
      name: "Vibrator",
      icon: CogIcon,
      properties: { frequency: 100 },
    },

    // Audio Components
    {
      id: "speaker",
      type: "speaker",
      name: "Speaker",
      icon: CogIcon,
      properties: { impedance: 8 },
    },
    {
      id: "microphone",
      type: "microphone",
      name: "Microphone",
      icon: CogIcon,
      properties: { sensitivity: -40 },
    },
    {
      id: "audio_amplifier",
      type: "audio_amplifier",
      name: "Audio Amplifier",
      icon: CogIcon,
      properties: { gain: 20 },
    },
    {
      id: "headphone_jack",
      type: "headphone_jack",
      name: "Headphone Jack",
      icon: CogIcon,
      properties: { impedance: 32 },
    },

    // Connectors & Headers
    {
      id: "pin_header",
      type: "pin_header",
      name: "Pin Header",
      icon: CogIcon,
      properties: { pins: 10 },
    },
    {
      id: "jumper",
      type: "jumper",
      name: "Jumper",
      icon: CogIcon,
      properties: { is_connected: false },
    },
    {
      id: "terminal_block",
      type: "terminal_block",
      name: "Terminal Block",
      icon: CogIcon,
      properties: { terminals: 4 },
    },
    {
      id: "usb_connector",
      type: "usb_connector",
      name: "USB Connector",
      icon: CogIcon,
      properties: { version: 2.0 },
    },
    {
      id: "hdmi_connector",
      type: "hdmi_connector",
      name: "HDMI Connector",
      icon: CogIcon,
      properties: { version: 1.4 },
    },

    // Protection & Safety
    {
      id: "fuse",
      type: "fuse",
      name: "Fuse",
      icon: CogIcon,
      properties: { current_rating: 1 },
    },
    {
      id: "varistor",
      type: "varistor",
      name: "Varistor",
      icon: CogIcon,
      properties: { breakdown_voltage: 18 },
    },
    {
      id: "tvs_diode",
      type: "tvs_diode",
      name: "TVS Diode",
      icon: CogIcon,
      properties: { breakdown_voltage: 5.5 },
    },
    {
      id: "esd_protection",
      type: "esd_protection",
      name: "ESD Protection",
      icon: CogIcon,
      properties: { protection_voltage: 15 },
    },

    // Crystals & Oscillators
    {
      id: "crystal",
      type: "crystal",
      name: "Crystal",
      icon: CogIcon,
      properties: { frequency: 16000000 },
    },
    {
      id: "oscillator",
      type: "oscillator",
      name: "Oscillator",
      icon: CogIcon,
      properties: { frequency: 1000000 },
    },
    {
      id: "clock_generator",
      type: "clock_generator",
      name: "Clock Generator",
      icon: CogIcon,
      properties: { frequency: 50000000 },
    },

    // Filters & Coupling
    {
      id: "low_pass_filter",
      type: "low_pass_filter",
      name: "Low Pass Filter",
      icon: CogIcon,
      properties: { cutoff_frequency: 1000 },
    },
    {
      id: "high_pass_filter",
      type: "high_pass_filter",
      name: "High Pass Filter",
      icon: CogIcon,
      properties: { cutoff_frequency: 100 },
    },
    {
      id: "band_pass_filter",
      type: "band_pass_filter",
      name: "Band Pass Filter",
      icon: CogIcon,
      properties: { center_frequency: 1000 },
    },
    {
      id: "transformer",
      type: "transformer",
      name: "Transformer",
      icon: CogIcon,
      properties: { turns_ratio: 1 },
    },
    {
      id: "optocoupler",
      type: "optocoupler",
      name: "Optocoupler",
      icon: CogIcon,
      properties: { isolation_voltage: 5000 },
    },

    // Logic Gates
    {
      id: "and_gate",
      type: "and_gate",
      name: "AND Gate",
      icon: CogIcon,
      properties: { inputs: 2 },
    },
    {
      id: "or_gate",
      type: "or_gate",
      name: "OR Gate",
      icon: CogIcon,
      properties: { inputs: 2 },
    },
    {
      id: "not_gate",
      type: "not_gate",
      name: "NOT Gate",
      icon: CogIcon,
      properties: { inputs: 1 },
    },
    {
      id: "nand_gate",
      type: "nand_gate",
      name: "NAND Gate",
      icon: CogIcon,
      properties: { inputs: 2 },
    },
    {
      id: "nor_gate",
      type: "nor_gate",
      name: "NOR Gate",
      icon: CogIcon,
      properties: { inputs: 2 },
    },
    {
      id: "xor_gate",
      type: "xor_gate",
      name: "XOR Gate",
      icon: CogIcon,
      properties: { inputs: 2 },
    },
    {
      id: "flip_flop",
      type: "flip_flop",
      name: "Flip-Flop",
      icon: CogIcon,
      properties: { type: "d" },
    },
    {
      id: "multiplexer",
      type: "multiplexer",
      name: "Multiplexer",
      icon: CogIcon,
      properties: { inputs: 4 },
    },
    {
      id: "demultiplexer",
      type: "demultiplexer",
      name: "Demultiplexer",
      icon: CogIcon,
      properties: { outputs: 4 },
    },

    // Memory
    {
      id: "ram",
      type: "ram",
      name: "RAM",
      icon: CogIcon,
      properties: { capacity: 1024 },
    },
    {
      id: "rom",
      type: "rom",
      name: "ROM",
      icon: CogIcon,
      properties: { capacity: 1024 },
    },
    {
      id: "eeprom",
      type: "eeprom",
      name: "EEPROM",
      icon: CogIcon,
      properties: { capacity: 1024 },
    },
    {
      id: "flash_memory",
      type: "flash_memory",
      name: "Flash Memory",
      icon: CogIcon,
      properties: { capacity: 8192 },
    },

    // Power Management
    {
      id: "buck_converter",
      type: "buck_converter",
      name: "Buck Converter",
      icon: CogIcon,
      properties: { output_voltage: 3.3 },
    },
    {
      id: "boost_converter",
      type: "boost_converter",
      name: "Boost Converter",
      icon: CogIcon,
      properties: { output_voltage: 12 },
    },
    {
      id: "buck_boost",
      type: "buck_boost",
      name: "Buck-Boost",
      icon: CogIcon,
      properties: { output_voltage: 5 },
    },
    {
      id: "charge_pump",
      type: "charge_pump",
      name: "Charge Pump",
      icon: CogIcon,
      properties: { output_voltage: 5 },
    },
    {
      id: "power_monitor",
      type: "power_monitor",
      name: "Power Monitor",
      icon: CogIcon,
      properties: { current_range: 10 },
    },

    // RF & Wireless
    {
      id: "antenna",
      type: "antenna",
      name: "Antenna",
      icon: CogIcon,
      properties: { frequency: 2.4 },
    },
    {
      id: "rf_amplifier",
      type: "rf_amplifier",
      name: "RF Amplifier",
      icon: CogIcon,
      properties: { gain: 20 },
    },
    {
      id: "mixer",
      type: "mixer",
      name: "Mixer",
      icon: CogIcon,
      properties: { frequency: 1000000 },
    },
    {
      id: "modulator",
      type: "modulator",
      name: "Modulator",
      icon: CogIcon,
      properties: { modulation: "am" },
    },
    {
      id: "demodulator",
      type: "demodulator",
      name: "Demodulator",
      icon: CogIcon,
      properties: { modulation: "am" },
    },

    // Test & Measurement
    {
      id: "voltmeter",
      type: "voltmeter",
      name: "Voltmeter",
      icon: CogIcon,
      properties: { range: 20 },
    },
    {
      id: "ammeter",
      type: "ammeter",
      name: "Ammeter",
      icon: CogIcon,
      properties: { range: 10 },
    },
    {
      id: "ohmmeter",
      type: "ohmmeter",
      name: "Ohmmeter",
      icon: CogIcon,
      properties: { range: 1000000 },
    },
    {
      id: "oscilloscope",
      type: "oscilloscope",
      name: "Oscilloscope",
      icon: CogIcon,
      properties: { bandwidth: 100000000 },
    },
    {
      id: "logic_analyzer",
      type: "logic_analyzer",
      name: "Logic Analyzer",
      icon: CogIcon,
      properties: { channels: 8 },
    },

    // Environmental
    {
      id: "humidity_sensor",
      type: "humidity_sensor",
      name: "Humidity Sensor",
      icon: CogIcon,
      properties: { range: 100 },
    },
    {
      id: "gas_sensor",
      type: "gas_sensor",
      name: "Gas Sensor",
      icon: CogIcon,
      properties: { gas_type: "co2" },
    },
    {
      id: "light_sensor",
      type: "light_sensor",
      name: "Light Sensor",
      icon: CogIcon,
      properties: { sensitivity: 1 },
    },
    {
      id: "sound_sensor",
      type: "sound_sensor",
      name: "Sound Sensor",
      icon: CogIcon,
      properties: { sensitivity: -40 },
    },
    {
      id: "vibration_sensor",
      type: "vibration_sensor",
      name: "Vibration Sensor",
      icon: CogIcon,
      properties: { sensitivity: 1 },
    },

    // Mechanical
    {
      id: "fan",
      type: "fan",
      name: "Fan",
      icon: CogIcon,
      properties: { speed: 2000 },
    },
    {
      id: "pump",
      type: "pump",
      name: "Pump",
      icon: CogIcon,
      properties: { flow_rate: 1 },
    },
    {
      id: "valve",
      type: "valve",
      name: "Valve",
      icon: CogIcon,
      properties: { is_open: false },
    },
    {
      id: "heater",
      type: "heater",
      name: "Heater",
      icon: CogIcon,
      properties: { power: 100 },
    },
    {
      id: "cooler",
      type: "cooler",
      name: "Cooler",
      icon: CogIcon,
      properties: { power: 50 },
    },
  ];

  // Independent search component that filters locally
  const IndependentSearchInput = React.memo(() => {
    const [searchValue, setSearchValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    // Filter components locally
    const filteredComponentsLocal = React.useMemo(() => {
      return circuitComponents.filter((component) =>
        component.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [searchValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const newValue = e.target.value;
      setSearchValue(newValue);
      console.log("Search input changed:", newValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation();
      console.log("Search input focused");
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation();
      console.log("Search input blurred");
    };

    return (
      <>
        {/* Sticky header */}
        <div
          className="sticky top-0 pt-3 pb-2 z-10"
          style={{ backgroundColor: "rgb(27, 34, 48)" }}
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Components
          </h3>
          <div className="relative mb-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search components..."
              value={searchValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              className={`w-full pl-10 pr-8 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              autoComplete="off"
              spellCheck="false"
              style={{ userSelect: "text" }}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  inputRef.current?.focus();
                }}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable components list */}
        <div className="grid grid-cols-2 gap-3">
          {filteredComponentsLocal.map((component) => (
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
      </>
    );
  });

  IndependentSearchInput.displayName = "IndependentSearchInput";

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
        className={`w-64 h-full border-r transition-all duration-500 ease-out flex flex-col ${
          theme === "dark"
            ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
            : "bg-white/90 backdrop-blur-sm border-gray-200/50"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      >
        {/* Logo at top */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              AmpFlux
            </span>
          </div>
        </div>

        {/* Components section - scrollable */}
        <div
          className={`transition-all duration-[2000ms] ease-in-out ${
            showGettingStarted
              ? "flex-1 overflow-y-auto px-4 pb-4"
              : "h-full overflow-y-auto px-4 pb-4"
          }`}
        >
          <IndependentSearchInput />
        </div>

        {/* Starting Guide at bottom */}
        <div
          className={`flex-shrink-0 border-t border-gray-200 dark:border-gray-700 transition-all duration-[2000ms] ease-in-out ${
            showGettingStarted
              ? "max-h-48 opacity-100 transform translate-y-0"
              : "max-h-0 opacity-0 transform translate-y-full overflow-hidden"
          }`}
        >
          <div className="p-4">
            <div
              className={`p-3 rounded-lg relative ${
                theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
              }`}
            >
              <button
                onClick={() => setShowGettingStarted(false)}
                className={`absolute top-1 right-1 p-2 rounded-full transition-all duration-300 ease-in-out ${
                  theme === "dark"
                    ? "text-blue-200 hover:text-white hover:bg-blue-600 shadow-lg"
                    : "text-blue-600 hover:text-white hover:bg-blue-500 shadow-lg"
                }`}
                title="Close getting started guide"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <h4
                className={`text-sm font-medium mb-2 pr-8 ${
                  theme === "dark" ? "text-blue-300" : "text-blue-900"
                }`}
              >
                Getting Started
              </h4>
              <ul
                className={`text-xs space-y-1 ${
                  theme === "dark" ? "text-blue-200" : "text-blue-700"
                }`}
              >
                <li>• Drag components to the canvas</li>
                <li>• Click components to edit properties</li>
                <li>• Drag components to move them</li>
                <li>• Connect components with dots</li>
              </ul>
            </div>
          </div>
        </div>
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
            style={{
              cursor: draggedComponent ? "grabbing" : "default",
            }}
          >
            {/* Canvas Content Container - Fixed workable area */}
            <div
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
              }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={(e) => {
                handleCanvasMouseUp();
                handleMouseUp();
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
            >
              {/* Placed components */}
              {placedComponents.map((component) => (
                <div key={component.id}>
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
                      transform: `scale(${zoom})`, // Components scale
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
                      <div className="flex justify-center mb-1">
                        {(() => {
                          const componentDef = circuitComponents.find(
                            (c) => c.id === component.type
                          );
                          if (componentDef) {
                            const IconComponent = componentDef.icon;
                            return (
                              <IconComponent
                                className={`h-6 w-6 ${
                                  theme === "dark"
                                    ? "text-green-400"
                                    : "text-blue-600"
                                }`}
                              />
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div style={{ fontSize: "12px", textAlign: "center" }}>
                        {component.name}
                      </div>
                      <button
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleComponentDelete(component.id);
                        }}
                        className={`absolute top-1 right-1 p-1 rounded-full transition-colors duration-200 ${
                          theme === "dark"
                            ? "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                            : "text-red-600 hover:text-red-700 hover:bg-red-100"
                        }`}
                        title="Delete component"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
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
                      pointerEvents: "auto",
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
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

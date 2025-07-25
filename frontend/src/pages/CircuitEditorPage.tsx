import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  DocumentArrowDownIcon,
  PlayIcon,
  CogIcon,
  BoltIcon,
  Battery0Icon,
  LightBulbIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
  CpuChipIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface CircuitComponent {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  properties: Record<string, number | boolean>;
}

const circuitComponents: CircuitComponent[] = [
  {
    id: "battery",
    type: "voltage_source",
    name: "Battery",
    icon: Battery0Icon,
    properties: { voltage: 12, internal_resistance: 0.1 },
  },
  {
    id: "resistor",
    type: "resistor",
    name: "Resistor",
    icon: Square3Stack3DIcon,
    properties: { resistance: 100 },
  },
  {
    id: "capacitor",
    type: "capacitor",
    name: "Capacitor",
    icon: CircleStackIcon,
    properties: { capacitance: 1e-6 },
  },
  {
    id: "inductor",
    type: "inductor",
    name: "Inductor",
    icon: CpuChipIcon,
    properties: { inductance: 1e-3 },
  },
  {
    id: "led",
    type: "led",
    name: "LED",
    icon: LightBulbIcon,
    properties: { forward_voltage: 2.1, current_limit: 0.02 },
  },
  {
    id: "switch",
    type: "switch",
    name: "Switch",
    icon: BoltIcon,
    properties: { is_closed: false },
  },
];

export const CircuitEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] =
    useState<CircuitComponent | null>(null);
  const [circuitData, setCircuitData] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient.getProject(Number(projectId)),
    enabled: !!projectId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: string) =>
      apiClient.saveCircuitVersion(Number(projectId), data),
    onSuccess: () => {
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (data: string) =>
      apiClient.simulateCircuit(Number(projectId), data),
    onSuccess: () => {
      setIsSimulating(false);
    },
    onError: () => {
      setIsSimulating(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(circuitData);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    simulateMutation.mutate(circuitData);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleDragStart = (e: React.DragEvent, component: CircuitComponent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = e.dataTransfer.getData("application/json");
    if (componentData) {
      const component = JSON.parse(componentData);
      setSelectedComponent(component);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
          <p className="text-sm text-gray-500">Drag components to the canvas</p>
        </div>

        {/* Components List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {circuitComponents.map((component) => (
              <div
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors duration-200 group"
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

        {/* Properties Panel */}
        {selectedComponent && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Properties
            </h3>
            <div className="space-y-3">
              {Object.entries(selectedComponent.properties).map(
                ([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      type={typeof value === "boolean" ? "checkbox" : "number"}
                      checked={typeof value === "boolean" ? value : undefined}
                      value={typeof value === "number" ? value : undefined}
                      onChange={(e) => {
                        const newProperties = {
                          ...selectedComponent.properties,
                        };
                        if (typeof value === "boolean") {
                          newProperties[key] = e.target.checked;
                        } else {
                          newProperties[key] = parseFloat(e.target.value);
                        }
                        setSelectedComponent({
                          ...selectedComponent,
                          properties: newProperties,
                        });
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Project
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project?.name} - Circuit Editor
                </h1>
                <p className="text-sm text-gray-500">
                  Design and simulate your circuit
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {isSimulating ? "Simulating..." : "Simulate"}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6">
          <div
            className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedComponent ? (
              <div className="text-center">
                <selectedComponent.icon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedComponent.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Component added to canvas
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Circuit Canvas
                </h3>
                <p className="text-sm text-gray-500">
                  Drag components from the sidebar to start building your
                  circuit
                </p>
              </div>
            )}
          </div>
        </div>

        {/* JSON Editor */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Circuit Data (JSON)
          </h3>
          <textarea
            value={circuitData}
            onChange={(e) => setCircuitData(e.target.value)}
            className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Enter circuit data in JSON format..."
          />
        </div>
      </div>
    </div>
  );
};

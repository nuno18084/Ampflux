export interface CircuitComponent {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  properties: Record<string, number | boolean | string>;
}

export interface PlacedComponent {
  id: string;
  componentId: string;
  type: string;
  name: string;
  x: number;
  y: number;
  properties: Record<string, number | boolean | string>;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

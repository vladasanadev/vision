export type NodeType = 'state' | 'identity';

export interface VisionNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  connections: string[];
  strength: number;
  goals?: string[];
  bgColor?: string; // Custom background color
}

export interface Connection {
  from: string;
  to: string;
  strength: number;
}

export interface PhysicsConfig {
  friction: number;
  repulsion: number;
  attraction: number;
  centerGravity: number;
  maxVelocity: number;
}

// Available card colors
export const CARD_COLORS = [
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Teal', value: '#4ECDC4' },
  { name: 'Lavender', value: '#A78BFA' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F472B6' },
  { name: 'Sky', value: '#38BDF8' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Slate', value: '#64748B' },
];

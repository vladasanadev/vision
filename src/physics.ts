import type { VisionNode, PhysicsConfig } from './types';

const DEFAULT_CONFIG: PhysicsConfig = {
  friction: 0.96,
  repulsion: 22000,
  attraction: 0.002,
  centerGravity: 0.0015,
  maxVelocity: 1.0,
};

export function simulatePhysics(
  nodes: VisionNode[],
  width: number,
  height: number,
  config: PhysicsConfig = DEFAULT_CONFIG,
  draggedNodeId?: string | null
): VisionNode[] {
  const centerX = width / 2;
  const centerY = height * 0.45; // Center point slightly above middle

  return nodes.map((node, i) => {
    if (node.id === draggedNodeId) {
      return { ...node, vx: 0, vy: 0 };
    }

    let fx = 0;
    let fy = 0;

    // Repulsion from other nodes
    nodes.forEach((other, j) => {
      if (i === j) return;

      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const minDistance = 320;

      if (distance < minDistance * 2.5) {
        const force = config.repulsion / (distance * distance);
        fx += (dx / distance) * force;
        fy += (dy / distance) * force;
      }
    });

    // Attraction to connected nodes
    node.connections.forEach((connectedId) => {
      const connected = nodes.find((n) => n.id === connectedId);
      if (!connected) return;

      const dx = connected.x - node.x;
      const dy = connected.y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const idealDistance = 380;

      const force = (distance - idealDistance) * config.attraction;
      fx += (dx / distance) * force;
      fy += (dy / distance) * force;
    });

    // Strong pull toward center
    const dxCenter = centerX - node.x;
    const dyCenter = centerY - node.y;
    const distanceFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
    
    const gravityMultiplier = 1 + (distanceFromCenter / 250) * 0.6;
    fx += dxCenter * config.centerGravity * gravityMultiplier;
    fy += dyCenter * config.centerGravity * gravityMultiplier;

    // Apply forces
    let vx = (node.vx + fx) * config.friction;
    let vy = (node.vy + fy) * config.friction;

    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > config.maxVelocity) {
      vx = (vx / speed) * config.maxVelocity;
      vy = (vy / speed) * config.maxVelocity;
    }

    let newX = node.x + vx;
    let newY = node.y + vy;

    // Strong boundaries - keep cards well within the visible area
    const paddingLeft = width * 0.18;
    const paddingRight = width * 0.18;
    const paddingTop = 120;
    const paddingBottom = 180; // Much larger bottom padding
    
    const minX = paddingLeft;
    const maxX = width - paddingRight;
    const minY = paddingTop;
    const maxY = height - paddingBottom;
    
    // Hard boundaries with bounce
    if (newX < minX) {
      newX = minX;
      vx = Math.abs(vx) * 0.2;
    }
    if (newX > maxX) {
      newX = maxX;
      vx = -Math.abs(vx) * 0.2;
    }
    if (newY < minY) {
      newY = minY;
      vy = Math.abs(vy) * 0.2;
    }
    if (newY > maxY) {
      newY = maxY;
      vy = -Math.abs(vy) * 0.2;
    }

    // Smooth rotation
    const targetRotation = Math.sin(Date.now() * 0.00025 + i * 1.8) * 4;
    const newRotation = node.rotation + (targetRotation - node.rotation) * 0.015;

    return {
      ...node,
      x: newX,
      y: newY,
      vx,
      vy,
      rotation: newRotation,
    };
  });
}

export function getConnectionPath(
  from: VisionNode,
  to: VisionNode,
  time: number
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  const perpX = -dy / distance;
  const perpY = dx / distance;
  
  const waveOffset = Math.sin(time * 0.0006) * 8;
  const curveOffset = (distance * 0.05) + waveOffset;
  
  const ctrlX = midX + perpX * curveOffset;
  const ctrlY = midY + perpY * curveOffset;
  
  return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
}

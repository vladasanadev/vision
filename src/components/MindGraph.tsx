import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { VisionNode, NodeType } from '../types';
import { VisionCard } from './VisionCard';
import { CreateCardModal } from './CreateCardModal';
import { CardDetailView } from './CardDetailView';
import { simulatePhysics, getConnectionPath } from '../physics';
import { v4 as uuidv4 } from 'uuid';

const BOTTOM_PANEL_HEIGHT = 120;

interface MindGraphProps {
  nodes: VisionNode[];
  setNodes: React.Dispatch<React.SetStateAction<VisionNode[]>>;
}

export function MindGraph({ nodes, setNodes }: MindGraphProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight - BOTTOM_PANEL_HEIGHT 
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<NodeType | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight - BOTTOM_PANEL_HEIGHT 
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      
      if (delta > 16) {
        setTime(currentTime);
        setNodes(prev => simulatePhysics(prev, dimensions.width, dimensions.height, undefined, draggedId));
        lastTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, draggedId, setNodes]);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDrag = useCallback((id: string, clientX: number, clientY: number) => {
    const maxY = dimensions.height - 180; // Large bottom padding
    const minY = 120;
    const minX = dimensions.width * 0.18;
    const maxX = dimensions.width * 0.82;
    
    const restrictedX = Math.max(minX, Math.min(clientX, maxX));
    const restrictedY = Math.max(minY, Math.min(clientY, maxY));
    
    setNodes(prev => prev.map(node => 
      node.id === id 
        ? { ...node, x: restrictedX, y: restrictedY, vx: 0, vy: 0 }
        : node
    ));
  }, [setNodes, dimensions]);

  const handleDragEnd = useCallback((id: string) => {
    setDraggedId(null);
    setNodes(prev => prev.map(node => 
      node.id === id 
        ? { ...node, vx: node.vx * 0.5, vy: node.vy * 0.5 }
        : node
    ));
  }, [setNodes]);

  const handleSelect = useCallback((id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      setNodes(prev => prev.map(node => {
        if (node.id === connectingFrom && !node.connections.includes(id)) {
          return { ...node, connections: [...node.connections, id] };
        }
        if (node.id === id && !node.connections.includes(connectingFrom)) {
          return { ...node, connections: [...node.connections, connectingFrom] };
        }
        return node;
      }));
      setConnectingFrom(null);
    } else {
      setSelectedId(prev => prev === id ? null : id);
    }
  }, [connectingFrom, setNodes]);

  const handleUpdate = useCallback((id: string, updates: Partial<VisionNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  }, [setNodes]);

  const handleConnect = useCallback((fromId: string) => {
    setConnectingFrom(fromId);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNodes(prev => prev
      .filter(node => node.id !== id)
      .map(node => ({
        ...node,
        connections: node.connections.filter(connId => connId !== id)
      }))
    );
    setSelectedId(null);
    setDetailNodeId(null);
  }, [setNodes]);

  const handleOpenDetail = useCallback((id: string) => {
    setDetailNodeId(id);
  }, []);

  const handleAddGoal = useCallback((parentId: string, goal: string) => {
    setNodes(prev => prev.map(node => 
      node.id === parentId 
        ? { ...node, goals: [...(node.goals || []), goal] }
        : node
    ));
  }, [setNodes]);

  const openCreateModal = useCallback((type: NodeType) => {
    setModalType(type);
    setModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setModalOpen(false);
    setModalType(null);
  }, []);

  const createNode = useCallback((type: NodeType, label: string, description: string) => {
    const newNode: VisionNode = {
      id: uuidv4(),
      type,
      label,
      description: description || undefined,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 200,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 150,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      rotation: (Math.random() - 0.5) * 8,
      scale: 1,
      connections: [],
      strength: 0.6 + Math.random() * 0.4,
      goals: [],
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedId(newNode.id);
  }, [dimensions, setNodes]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setConnectingFrom(null);
  }, []);

  const connections: React.ReactElement[] = [];
  const drawnPairs = new Set<string>();

  nodes.forEach(node => {
    node.connections.forEach(connectedId => {
      const pairKey = [node.id, connectedId].sort().join('-');
      if (drawnPairs.has(pairKey)) return;
      drawnPairs.add(pairKey);

      const connected = nodes.find(n => n.id === connectedId);
      if (!connected) return;

      const path = getConnectionPath(node, connected, time);
      const isHighlighted = selectedId === node.id || selectedId === connectedId;

      connections.push(
        <path
          key={pairKey}
          d={path}
          className={`connection ${isHighlighted ? 'highlighted' : ''}`}
          strokeWidth={isHighlighted ? 2 : 1.5}
        />
      );
    });
  });

  const detailNode = detailNodeId ? nodes.find(n => n.id === detailNodeId) || null : null;

  return (
    <>
      <div 
        ref={containerRef}
        className="mind-graph"
        onClick={handleBackgroundClick}
        style={{ height: `calc(100vh - ${BOTTOM_PANEL_HEIGHT}px)` }}
      >
        <div className="graph-grain" />
        
        <svg className="connections-layer" width={dimensions.width} height={dimensions.height}>
          <g>
            {connections}
          </g>
        </svg>

        <AnimatePresence>
          {nodes.map(node => (
            <VisionCard
              key={node.id}
              node={node}
              isSelected={selectedId === node.id}
              onSelect={handleSelect}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onUpdate={handleUpdate}
              onConnect={handleConnect}
              onDelete={handleDelete}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </AnimatePresence>

        {connectingFrom && (
          <div className="connect-mode">
            Click another card to connect
            <button onClick={() => setConnectingFrom(null)}>Cancel</button>
          </div>
        )}

        {selectedId && !connectingFrom && (
          <div className="selection-actions">
            <button onClick={() => setConnectingFrom(selectedId)}>
              Connect
            </button>
            <button onClick={() => handleOpenDetail(selectedId)}>
              Open
            </button>
          </div>
        )}
      </div>

      <div className="bottom-toolbar" style={{ height: BOTTOM_PANEL_HEIGHT }}>
        <div className="toolbar-inner">
          <div className="toolbar-label">Add Vision</div>
          <div className="toolbar-buttons">
            <button 
              className="create-btn type-state"
              onClick={() => openCreateModal('state')}
            >
              <span className="btn-glyph">◈</span>
              <span className="btn-text">State</span>
            </button>
            <button 
              className="create-btn type-identity"
              onClick={() => openCreateModal('identity')}
            >
              <span className="btn-glyph">◎</span>
              <span className="btn-text">Identity</span>
            </button>
          </div>
        </div>
      </div>

      <CreateCardModal
        isOpen={modalOpen}
        type={modalType}
        onClose={closeCreateModal}
        onCreate={createNode}
      />

      {detailNode && (
        <CardDetailView
          node={detailNode}
          allNodes={nodes}
          onClose={() => setDetailNodeId(null)}
          onUpdate={handleUpdate}
          onAddGoal={handleAddGoal}
        />
      )}
    </>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { VisionNode, NodeType } from '../types';

interface VisionCardProps {
  node: VisionNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
  onUpdate: (id: string, updates: Partial<VisionNode>) => void;
  onConnect: (fromId: string, toId: string) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

const TYPE_STYLES: Record<NodeType, { 
  defaultBg: string; 
  glyph: string;
  text: string;
}> = {
  state: { 
    defaultBg: '#FF6B6B',
    glyph: '◈',
    text: '#fff',
  },
  identity: { 
    defaultBg: '#4ECDC4',
    glyph: '◎',
    text: '#1a1a1a',
  },
};

// Determine text color based on background brightness
function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#1a1a1a' : '#ffffff';
}

export function VisionCard({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
  onDelete,
  onOpenDetail,
}: VisionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const style = TYPE_STYLES[node.type];
  
  const bgColor = node.bgColor || style.defaultBg;
  const textColor = getTextColor(bgColor);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail(node.id);
  };

  return (
    <motion.div
      className={`vision-card ${isSelected ? 'selected' : ''} type-${node.type}`}
      style={{
        left: node.x,
        top: node.y,
        background: `linear-gradient(145deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
        color: textColor,
        '--card-text': textColor,
      } as React.CSSProperties}
      animate={{ 
        scale: isHovered ? 1.06 : node.scale,
        rotate: node.rotation,
        opacity: 1,
      }}
      initial={{ scale: 0, opacity: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        scale: { type: 'spring', stiffness: 400, damping: 28 },
        rotate: { type: 'spring', stiffness: 80, damping: 18 },
        opacity: { duration: 0.3 }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={(e) => {
        e.preventDefault();
        onDragStart(node.id);
        
        const handleMove = (moveEvent: PointerEvent) => {
          onDrag(node.id, moveEvent.clientX, moveEvent.clientY);
        };
        
        const handleUp = () => {
          onDragEnd(node.id);
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handleUp);
        };
        
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
      }}
    >
      <div className="card-shine" />
      
      <div className="card-header">
        <span className="type-glyph">{style.glyph}</span>
        <span className="type-label">{node.type}</span>
      </div>
      
      <div className="card-content">
        <h3 className="card-label">{node.label}</h3>
        {node.description && (
          <p className="card-description">{node.description}</p>
        )}
      </div>
      
      {isSelected && (
        <button 
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

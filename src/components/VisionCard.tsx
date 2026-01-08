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

const DEFAULT_CARD_COLOR = '#E3E1D4';

const TYPE_STYLES: Record<NodeType, { 
  defaultBg: string; 
  glyph: string;
  text: string;
}> = {
  state: { 
    defaultBg: DEFAULT_CARD_COLOR,
    glyph: '◈',
    text: '#1a1a1a',
  },
  identity: { 
    defaultBg: DEFAULT_CARD_COLOR,
    glyph: '◎',
    text: '#1a1a1a',
  },
};

// Different blob paths for variety
const BLOB_PATHS = [
  "M271.9 50.3c30.6 29.3 51.3 75.5 46.6 123.9-4.6 48.4-34.6 99-86.5 136.3s-125.6 61.4-168.3 35.3S9.4 243.5 3.4 177.3C-2.7 111.2-3.1 55.2 24 26.7 51.1-1.9 105.9-2.9 153.4 2.8c47.6 5.8 88 18.2 118.5 47.5z",
  "M285.5 68.3c28.3 35.2 38.4 82.9 27.8 127.5-10.6 44.5-41.9 86-85.4 108.6-43.6 22.7-99.4 26.6-147.1 9.2S9.4 256.3 2.8 199.3C-3.8 142.2-3.8 82.3 25.8 45.5 55.3 8.6 114.4-5.2 162 2.4c47.6 7.5 95.2 30.7 123.5 65.9z",
  "M259.4 47.8c35.9 28.4 65.3 74.3 59.8 119.7-5.4 45.4-45.6 90.4-95.3 120.3-49.8 29.9-109.1 44.8-155.1 29.3S3.9 252.6 1.1 197.4C-1.6 142.3-1.6 78.8 29.7 41.7 61 4.6 123.6-6.2 172.5 3.4c48.9 9.5 51 16 86.9 44.4z",
  "M247.3 55.2c38.8 32.8 71.7 82.6 64.3 127.9-7.4 45.3-55 86.2-105.1 111.6-50.1 25.5-102.7 35.6-147.7 19.8S4.5 249.2 1.2 195C-2.2 140.8-2.2 81.3 28.4 45.9 59 10.4 120.2-1 169.1 1.4c48.9 2.5 39.4 21 78.2 53.8z",
];

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
  
  // Use node id to consistently pick a blob shape
  const blobIndex = parseInt(node.id.replace(/\D/g, '').slice(-1) || '0') % BLOB_PATHS.length;
  const blobPath = BLOB_PATHS[blobIndex];
  const clipId = `blob-clip-${node.id}`;

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
        color: textColor,
        '--card-text': textColor,
        '--blob-time': `${20 + blobIndex * 5}s`,
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
      {/* SVG Blob Shape */}
      <svg 
        className="card-blob" 
        viewBox="0 0 320 360" 
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={blobPath} />
          </clipPath>
        </defs>
        <rect 
          x="0" 
          y="0" 
          width="320" 
          height="360" 
          fill={bgColor}
          clipPath={`url(#${clipId})`}
        />
      </svg>
      
      <div className="card-inner">
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

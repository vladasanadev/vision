import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisionNode, NodeType } from '../types';
import { CARD_COLORS, DEFAULT_CARD_COLOR } from '../types';

interface CardDetailViewProps {
  node: VisionNode | null;
  allNodes: VisionNode[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<VisionNode>) => void;
  onAddGoal: (parentId: string, goal: string) => void;
}

const TYPE_CONFIG: Record<NodeType, { 
  defaultColor: string;
  glyph: string;
  rehearsalPrompts: string[];
}> = {
  state: { 
    defaultColor: DEFAULT_CARD_COLOR,
    glyph: '◈',
    rehearsalPrompts: [
      'When you embody this state, how do you walk into a room?',
      'What decisions become easier in this state?',
      'Who notices when you\'re in this state?',
      'What morning ritual brings you into this state?'
    ]
  },
  identity: { 
    defaultColor: DEFAULT_CARD_COLOR,
    glyph: '◎',
    rehearsalPrompts: [
      'What does this person do on a typical Tuesday?',
      'How does this identity handle setbacks?',
      'What skills does this person continuously develop?',
      'What does this identity never compromise on?'
    ]
  },
};

export function CardDetailView({ node, allNodes, onClose, onUpdate, onAddGoal }: CardDetailViewProps) {
  const [newGoal, setNewGoal] = useState('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [reflection, setReflection] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');

  if (!node) return null;

  const config = TYPE_CONFIG[node.type];
  const currentColor = node.bgColor || config.defaultColor;
  const connectedNodes = allNodes.filter(n => node.connections.includes(n.id));

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onAddGoal(node.id, newGoal.trim());
      setNewGoal('');
    }
  };

  const nextPrompt = () => {
    setActivePromptIndex((prev) => (prev + 1) % config.rehearsalPrompts.length);
    setReflection('');
  };

  const handleColorChange = (color: string) => {
    onUpdate(node.id, { bgColor: color });
  };

  const startEditing = () => {
    setEditLabel(node.label);
    setEditDesc(node.description || '');
    setIsEditingLabel(true);
  };

  const saveEdit = () => {
    if (editLabel.trim()) {
      onUpdate(node.id, { 
        label: editLabel.trim(), 
        description: editDesc.trim() || undefined 
      });
    }
    setIsEditingLabel(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="detail-view"
          style={{ '--detail-color': currentColor } as React.CSSProperties}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <button className="detail-close" onClick={onClose}>×</button>

          <div className="detail-header">
            <span className="detail-glyph" style={{ color: currentColor }}>{config.glyph}</span>
            <span className="detail-type">{node.type}</span>
          </div>

          {isEditingLabel ? (
            <div className="detail-edit-section">
              <input
                type="text"
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                className="detail-edit-input"
                placeholder="Vision name..."
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="detail-edit-textarea"
                placeholder="Description (optional)..."
                rows={2}
              />
              <div className="detail-edit-actions">
                <button onClick={() => setIsEditingLabel(false)}>Cancel</button>
                <button onClick={saveEdit} className="primary">Save</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="detail-title" onClick={startEditing}>{node.label}</h1>
              {node.description && (
                <p className="detail-description" onClick={startEditing}>{node.description}</p>
              )}
              {!node.description && (
                <button className="add-description-btn" onClick={startEditing}>
                  + Add description
                </button>
              )}
            </>
          )}

          {/* Color Picker Section */}
          <div className="color-section">
            <h3>Card Color</h3>
            <div className="color-grid">
              {CARD_COLORS.map(color => (
                <button
                  key={color.value}
                  className={`color-swatch ${currentColor === color.value ? 'active' : ''}`}
                  style={{ background: color.value }}
                  onClick={() => handleColorChange(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {connectedNodes.length > 0 && (
            <div className="detail-connections">
              <h3>Connected to</h3>
              <div className="connection-chips">
                {connectedNodes.map(n => (
                  <span 
                    key={n.id} 
                    className="connection-chip"
                    style={{ background: n.bgColor || TYPE_CONFIG[n.type].defaultColor }}
                  >
                    {TYPE_CONFIG[n.type].glyph} {n.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rehearsal-section">
            <h3>
              <span className="rehearsal-icon">◉</span>
              Mental Rehearsal
            </h3>
            <div className="rehearsal-prompt">
              <p>{config.rehearsalPrompts[activePromptIndex]}</p>
              <textarea
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="Take a moment to visualize..."
                rows={3}
              />
              <button className="next-prompt-btn" onClick={nextPrompt}>
                Next prompt →
              </button>
            </div>
          </div>

          <div className="goals-section">
            <h3>
              <span className="goals-icon">◎</span>
              Milestones
            </h3>
            <div className="add-goal">
              <input
                type="text"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                placeholder="Add a milestone..."
                onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              />
              <button onClick={handleAddGoal} disabled={!newGoal.trim()}>
                Add
              </button>
            </div>
            {node.goals && node.goals.length > 0 && (
              <ul className="goals-list">
                {node.goals.map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

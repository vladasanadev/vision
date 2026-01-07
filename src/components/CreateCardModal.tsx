import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NodeType } from '../types';

interface CreateCardModalProps {
  isOpen: boolean;
  type: NodeType | null;
  onClose: () => void;
  onCreate: (type: NodeType, label: string, description: string) => void;
}

const TYPE_CONFIG: Record<NodeType, { 
  title: string; 
  placeholder: string; 
  descPlaceholder: string;
  glyph: string;
  color: string;
  suggestions: string[];
}> = {
  state: { 
    title: 'Define a Future State',
    placeholder: 'How do you want to feel?',
    descPlaceholder: 'What does this state look like in daily life?',
    glyph: '◈',
    color: '#FF6B6B',
    suggestions: [
      'Calm Authority',
      'Inner Peace',
      'Creative Flow',
      'Radiant Confidence',
      'Grounded Presence',
      'Joyful Energy',
      'Centered Focus',
      'Resilient Strength',
      'Financial Freedom',
      'Effortless Success'
    ]
  },
  identity: { 
    title: 'Claim an Identity',
    placeholder: 'Who are you becoming?',
    descPlaceholder: 'What does this person do differently?',
    glyph: '◎',
    color: '#4ECDC4',
    suggestions: [
      'Builder',
      'Creator',
      'Leader',
      'Artist',
      'Founder',
      'Mentor',
      'Visionary',
      'Craftsman',
      'Innovator',
      'Storyteller'
    ]
  },
};

export function CreateCardModal({ isOpen, type, onClose, onCreate }: CreateCardModalProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = type ? TYPE_CONFIG[type] : null;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setLabel('');
      setDescription('');
      setShowSuggestions(true);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type && label.trim()) {
      onCreate(type, label.trim(), description.trim());
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLabel(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleInputChange = (value: string) => {
    setLabel(value);
    setShowSuggestions(value.length === 0);
  };

  return (
    <AnimatePresence>
      {isOpen && type && config && (
        <motion.div
          className="create-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="create-modal"
            style={{ '--modal-accent': config.color } as React.CSSProperties}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="modal-header">
              <span className="modal-glyph" style={{ color: config.color }}>{config.glyph}</span>
              <span className="modal-type">{type}</span>
            </div>

            <h2 className="modal-title">{config.title}</h2>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-field">
                <label>What is it?</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={label}
                  onChange={e => handleInputChange(e.target.value)}
                  placeholder={config.placeholder}
                  maxLength={50}
                />
              </div>

              {/* AI Suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    className="suggestions-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="suggestions-label">
                      <span className="ai-icon">✦</span>
                      Suggestions
                    </div>
                    <div className="suggestions-grid">
                      {config.suggestions.map((suggestion, i) => (
                        <motion.button
                          key={suggestion}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(suggestion)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ 
                            '--chip-color': config.color,
                          } as React.CSSProperties}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="form-field">
                <label>Describe it <span className="optional">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={config.descPlaceholder}
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-create"
                  disabled={!label.trim()}
                  style={{ background: config.color }}
                >
                  Add to Board
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

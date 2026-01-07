import { useState, useEffect } from 'react';
import { MindGraph } from './components/MindGraph';
import type { VisionNode } from './types';
import './App.css';

const STORAGE_KEY = 'visionboard-nodes';

const INITIAL_NODES: VisionNode[] = [
  {
    id: '1',
    type: 'state',
    label: 'Calm Authority',
    description: 'Speaking with conviction',
    x: 450,
    y: 280,
    vx: 0,
    vy: 0,
    rotation: -3,
    scale: 1,
    connections: ['2'],
    strength: 0.9,
  },
  {
    id: '2',
    type: 'identity',
    label: 'Builder',
    description: 'Creating systems that last',
    x: 650,
    y: 320,
    vx: 0,
    vy: 0,
    rotation: 4,
    scale: 1,
    connections: ['1', '3'],
    strength: 0.85,
  },
  {
    id: '3',
    type: 'state',
    label: 'Creative Flow',
    description: 'Deep immersion in work',
    x: 550,
    y: 450,
    vx: 0,
    vy: 0,
    rotation: -2,
    scale: 1,
    connections: ['2'],
    strength: 0.75,
  },
];

function App() {
  const [nodes, setNodes] = useState<VisionNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out old theme/constraint types if they exist
        return parsed.filter((n: VisionNode) => n.type === 'state' || n.type === 'identity');
      } catch {
        return INITIAL_NODES;
      }
    }
    return INITIAL_NODES;
  });

  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('visionboard-intro-seen');
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  }, [nodes]);

  const handleDismissIntro = () => {
    setShowIntro(false);
    localStorage.setItem('visionboard-intro-seen', 'true');
  };

  const handleReset = () => {
    if (window.confirm('Reset to initial example?')) {
      setNodes(INITIAL_NODES);
      localStorage.removeItem('visionboard-intro-seen');
      setShowIntro(true);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Vision Board</h1>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </header>

      <MindGraph nodes={nodes} setNodes={setNodes} />

      {showIntro && (
        <div className="intro-overlay" onClick={handleDismissIntro}>
          <div className="intro-card" onClick={e => e.stopPropagation()}>
            <h2>Rehearse your future.</h2>
            <p>
              Add visions. Move them. Watch outcomes reorganize.
            </p>
            <div className="intro-legend">
              <div className="legend-item">
                <span className="legend-dot state"></span>
                <span>States</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot identity"></span>
                <span>Identities</span>
              </div>
            </div>
            <button className="intro-dismiss" onClick={handleDismissIntro}>
              Begin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

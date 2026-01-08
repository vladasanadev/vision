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
    x: 300,
    y: 200,
    vx: 0,
    vy: 0,
    rotation: -3,
    scale: 1,
    connections: [],
    strength: 0.9,
  },
  {
    id: '2',
    type: 'identity',
    label: 'Builder',
    description: 'Creating systems that last',
    x: 550,
    y: 180,
    vx: 0,
    vy: 0,
    rotation: 4,
    scale: 1,
    connections: [],
    strength: 0.85,
  },
  {
    id: '3',
    type: 'state',
    label: 'Creative Flow',
    description: 'Deep immersion in work',
    x: 800,
    y: 220,
    vx: 0,
    vy: 0,
    rotation: -2,
    scale: 1,
    connections: [],
    strength: 0.75,
  },
  {
    id: '4',
    type: 'identity',
    label: 'Visionary',
    description: 'Seeing what others miss',
    x: 400,
    y: 380,
    vx: 0,
    vy: 0,
    rotation: 2,
    scale: 1,
    connections: [],
    strength: 0.8,
  },
  {
    id: '5',
    type: 'state',
    label: 'Inner Peace',
    description: 'Grounded and centered',
    x: 650,
    y: 400,
    vx: 0,
    vy: 0,
    rotation: -4,
    scale: 1,
    connections: [],
    strength: 0.7,
  },
  {
    id: '6',
    type: 'identity',
    label: 'Leader',
    description: 'Inspiring others forward',
    x: 250,
    y: 350,
    vx: 0,
    vy: 0,
    rotation: 3,
    scale: 1,
    connections: [],
    strength: 0.85,
  },
  {
    id: '7',
    type: 'state',
    label: 'Abundance',
    description: 'Wealth in all forms',
    x: 750,
    y: 350,
    vx: 0,
    vy: 0,
    rotation: -1,
    scale: 1,
    connections: [],
    strength: 0.9,
  },
  {
    id: '8',
    type: 'identity',
    label: 'Creator',
    description: 'Making beautiful things',
    x: 500,
    y: 300,
    vx: 0,
    vy: 0,
    rotation: 2,
    scale: 1,
    connections: [],
    strength: 0.8,
  },
];

function App() {
  const [nodes, setNodes] = useState<VisionNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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

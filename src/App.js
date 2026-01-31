import React, { useState, useEffect } from 'react';
import './App.css';

const MapVisualization = ({ nodes, path }) => {
  if (nodes.length === 0) return <div className="placeholder">Wczytaj plik, aby zobaczyć mapę.</div>;

  const xValues = nodes.map(n => n.x);
  const yValues = nodes.map(n => n.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const padding = 10;
  const width = maxX - minX + 2 * padding;
  const height = maxY - minY + 2 * padding;
  
  const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

  return (
    <div className="component-box">
      <h3>Wizualizacja problemu</h3>
      <div className="map-container">
        <svg viewBox={viewBox} className="tsp-svg">
          {path.length > 1 && path.map((node, index) => {
            if (index === path.length - 1) return null; 
            const nextNode = path[index + 1];
            return (
              <line
                key={`line-${index}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="#3498db"
                strokeWidth={width / 200} 
              />
            );
          })}
          
          {nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={width / 150} 
              fill="red"
            >
              <title>ID: {node.id}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
};

const SolutionDisplay = ({ path }) => {
  const calculateDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const totalDistance = path.reduce((acc, node, index) => {
    if (index === path.length - 1) return acc;
    return acc + calculateDistance(node, path[index + 1]);
  }, 0);

  const pathString = path.map(n => n.id).join(' -> ');

  return (
    <div className="component-box">
      <h3>Rozwiązanie</h3>
      <div className="solution-content">
        <p><strong>Kolejność odwiedzin:</strong></p>
        <div className="path-text">
          {path.length > 0 ? pathString : "Brak wczytanej ścieżki"}
        </div>
        <hr />
        <p><strong>Całkowita długość trasy:</strong> {totalDistance.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default function App() {
  const [nodes, setNodes] = useState([]); 
  const [path, setPath] = useState([]);   

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const parsedNodes = [];
      let isCoordSection = false;

      for (let line of lines) {
        line = line.trim();
        if (line === 'EOF') break;
        if (line === 'NODE_COORD_SECTION') {
          isCoordSection = true;
          continue;
        }
        
        if (isCoordSection) {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            const id = parts[0];
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            if (!isNaN(x) && !isNaN(y)) {
              parsedNodes.push({ id, x, y });
            }
          }
        }
      }

      setNodes(parsedNodes);
      generateRandomPath(parsedNodes);
    };
    reader.readAsText(file);
  };

  const generateRandomPath = (nodesList) => {
    let shuffled = [...nodesList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPath(shuffled);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TSP Visualizer & Optimizer</h1>
        <div className="controls">
          <input 
            type="file" 
            accept=".tsp,.txt" 
            onChange={handleFileUpload} 
            className="file-input"
          />
          <button 
            onClick={() => generateRandomPath(nodes)} 
            disabled={nodes.length === 0}
            className="btn"
          >
            Wylosuj nowe rozwiązanie
          </button>
        </div>
      </header>

      <main className="App-content">
        <MapVisualization nodes={nodes} path={path} />
        <SolutionDisplay path={path} />
      </main>
    </div>
  );
}
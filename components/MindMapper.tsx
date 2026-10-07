
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MindMapNode, MindMapEdge, MindMapData } from '../types';

export const MindMapper: React.FC = () => {
  const [data, setData] = useState<MindMapData>(() => {
    const saved = localStorage.getItem('ea_mindmap');
    return saved ? JSON.parse(saved) : {
      nodes: [{ id: 'root', text: 'PHASE ALPHA', x: 400, y: 300, color: '#3b82f6', type: 'root' }],
      edges: []
    };
  });

  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ea_mindmap', JSON.stringify(data));
  }, [data]);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(id);
    setSelectedNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === draggingNode ? { ...n, x, y } : n)
    }));
  };

  const handleMouseUp = () => setDraggingNode(null);

  const addNode = (parentId: string) => {
    const parent = data.nodes.find(n => n.id === parentId);
    if (!parent) return;

    const id = Math.random().toString(36).substr(2, 9);
    const newNode: MindMapNode = {
      id,
      text: 'NEW IDEA',
      x: parent.x + (Math.random() - 0.5) * 200,
      y: parent.y + (Math.random() - 0.5) * 200,
      color: parent.type === 'root' ? '#818cf8' : '#10b981',
      type: parent.type === 'root' ? 'theme' : 'drill'
    };

    setData(prev => ({
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, { fromId: parentId, toId: id }]
    }));
    setSelectedNode(id);
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return;
    setData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.fromId !== id && e.toId !== id)
    }));
    setSelectedNode(null);
  };

  const updateNodeText = (id: string, text: string) => {
    setData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, text: text.toUpperCase() } : n)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Tactical Brainstorm</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Map out training logic and drill relationships</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setData({ nodes: [{ id: 'root', text: 'PHASE ALPHA', x: 400, y: 300, color: '#3b82f6', type: 'root' }], edges: [] })}
            className="bg-slate-800 hover:bg-red-900/40 text-slate-500 hover:text-red-400 font-black uppercase italic px-4 py-2 rounded-xl transition-all border border-slate-700 text-[10px] tracking-widest"
          >
            Clear HUD
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[600px] bg-slate-950 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl cursor-crosshair group ring-1 ring-slate-800/50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Connection Lines (HUD style) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {data.edges.map((edge, i) => {
            const from = data.nodes.find(n => n.id === edge.fromId);
            const to = data.nodes.find(n => n.id === edge.toId);
            if (!from || !to) return null;
            return (
              <line 
                key={i} 
                x1={from.x} y1={from.y} 
                x2={to.x} y2={to.y} 
                stroke={from.color} 
                strokeWidth="1.5"
                strokeDasharray="4,4"
                filter="url(#glow)"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {data.nodes.map(node => (
          <div
            key={node.id}
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-75 group/node`}
            style={{ left: node.x, top: node.y }}
          >
            <div 
              className={`p-1 rounded-2xl ${selectedNode === node.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105' : ''}`}
              style={{ backgroundColor: node.color + '20' }}
            >
              <div 
                className="px-6 py-3 rounded-xl border-2 flex flex-col items-center gap-1 shadow-lg backdrop-blur-sm transition-colors min-w-[120px]"
                style={{ borderColor: node.color, backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
              >
                {selectedNode === node.id ? (
                  <input
                    autoFocus
                    value={node.text}
                    onChange={(e) => updateNodeText(node.id, e.target.value)}
                    onBlur={() => setSelectedNode(node.id)}
                    className="bg-transparent text-white font-black text-xs uppercase text-center outline-none w-full"
                  />
                ) : (
                  <span className="text-white font-black text-xs uppercase tracking-tighter truncate w-full text-center">
                    {node.text}
                  </span>
                )}
                <div className="flex gap-2 mt-2 opacity-0 group-hover/node:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addNode(node.id); }}
                    className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 shadow-lg"
                    title="Add sub-idea"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  {node.id !== 'root' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:bg-red-600 hover:text-white transition-colors"
                      title="Decommission Idea"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Instructions Overlay */}
        <div className="absolute bottom-6 left-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] pointer-events-none">
          Drag to Reposition • Click to Edit • Hover to Expand Logic
        </div>
      </div>
    </div>
  );
};

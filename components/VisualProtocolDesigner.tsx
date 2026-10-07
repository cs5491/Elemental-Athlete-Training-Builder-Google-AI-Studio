
import React, { useState, useRef, useMemo } from 'react';
import { Exercise, Workout, WorkoutBlock, ExerciseInstance, BoardConnection, BlockTemplate } from '../types';
import { INITIAL_EXERCISES } from '../constants';

interface BoardNode extends ExerciseInstance {
  x: number;
  y: number;
  exercise: Exercise;
}

interface VisualProtocolDesignerProps {
  onSave: (workout: Workout) => void;
  onCancel: () => void;
  onSaveBlock: (template: BlockTemplate) => void;
}

export const VisualProtocolDesigner: React.FC<VisualProtocolDesignerProps> = ({ onSave, onCancel, onSaveBlock }) => {
  const [nodes, setNodes] = useState<BoardNode[]>([]);
  const [connections, setConnections] = useState<BoardConnection[]>([]);
  const [workoutName, setWorkoutName] = useState('UNNAMED_TACTICAL_OP');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Requirement: Only show button if 2+ exercises are "stacked" (connected)
  const canSaveBlock = useMemo(() => {
    return nodes.length >= 2 && connections.length > 0;
  }, [nodes, connections]);

  const filteredLibrary = useMemo(() => {
    return INITIAL_EXERCISES.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleDragStart = (e: React.DragEvent, ex: Exercise) => {
    e.dataTransfer.setData('exerciseId', ex.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const exId = e.dataTransfer.getData('exerciseId');
    const exercise = INITIAL_EXERCISES.find(ex => ex.id === exId);
    
    if (exercise) {
      const newNode: BoardNode = {
        id: Math.random().toString(36).substr(2, 9),
        exerciseId: exercise.id,
        exercise: exercise,
        x: x - 140, // Center under mouse
        y: y - 60,
        sets: [{ reps: 10, weight: 0, completed: false, type: 'Working' }],
        restPeriodSeconds: 90
      };
      setNodes(prev => [...prev, newNode]);
    }
  };

  const startNodeMove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (!node || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingNodeId(id);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingNodeId) {
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: x - dragOffset.x, y: y - dragOffset.y } : n));
    }
  };

  const stopInteractions = () => {
    setDraggingNodeId(null);
    setLinkingFromId(null);
  };

  const startLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkingFromId(id);
  };

  const completeLink = (toId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkingFromId && linkingFromId !== toId) {
      const exists = connections.some(c => (c.fromId === linkingFromId && c.toId === toId) || (c.fromId === toId && c.toId === linkingFromId));
      if (!exists) {
        setConnections([...connections, { fromId: linkingFromId, toId }]);
      }
    }
    setLinkingFromId(null);
  };

  // Logic: Automatically find the node visually 'below' this one and link them
  const autoStackBelow = (id: string) => {
    const currentNode = nodes.find(n => n.id === id);
    if (!currentNode) return;
    
    // Find candidate nodes that are below (higher Y)
    const candidates = nodes.filter(n => n.id !== id && n.y > currentNode.y);
    if (candidates.length === 0) return;
    
    // Sort by proximity in Y coordinate
    candidates.sort((a, b) => (a.y - currentNode.y) - (b.y - currentNode.y));
    const target = candidates[0];
    
    const exists = connections.some(c => (c.fromId === id && c.toId === target.id) || (c.fromId === target.id && c.toId === id));
    if (!exists) {
      setConnections([...connections, { fromId: id, toId: target.id }]);
    }
  };

  const unstack = (fromId: string, toId: string) => {
    setConnections(prev => prev.filter(c => !(c.fromId === fromId && c.toId === toId)));
  };

  const updateNodeData = (id: string, updates: Partial<BoardNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
  };

  const commitToVault = (asBlock: boolean = false) => {
    if (nodes.length === 0) return alert('No drills positioned on architect board.');
    
    // Sort by Y coordinate for natural progression
    const sortedNodes = [...nodes].sort((a, b) => a.y - b.y);
    
    if (asBlock) {
      const blockId = Math.random().toString(36).substr(2, 9);
      const template: BlockTemplate = {
        id: blockId,
        name: workoutName || 'Architected Block',
        type: connections.length > 0 ? 'Circuit' : 'Straight',
        exercises: sortedNodes.map(({ x, y, exercise, id, ...rest }) => ({ ...rest }))
      };
      
      onSaveBlock(template);
      setIsSuccessVisible(true);
      setTimeout(() => setIsSuccessVisible(false), 3000);
      return;
    }

    const block: WorkoutBlock = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'ARCHITECTED SEQUENCE',
      type: connections.length > 0 ? 'Superset' : 'Straight',
      exercises: sortedNodes.map(({ x, y, exercise, ...rest }) => ({ ...rest }))
    };

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name: workoutName,
      description: 'Visually architected tactical sequence with linked dependencies.',
      blocks: [block],
      createdAt: Date.now()
    });
  };

  return (
    <div className="flex h-[800px] bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in duration-500 ring-1 ring-slate-800 relative">
      {/* Success Notification */}
      {isSuccessVisible && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
           <div className="bg-emerald-500 text-white px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Block Archived to Tactical Library
           </div>
        </div>
      )}

      {/* Exercise Arsenal Sidebar */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col p-6">
        <div className="mb-6">
          <h3 className="text-xl font-black italic uppercase text-white tracking-tighter mb-1">Asset Arsenal</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Drag to architect</p>
        </div>
        
        <input 
          placeholder="Search arsenal..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
          {filteredLibrary.map(ex => (
            <div 
              key={ex.id}
              draggable
              onDragStart={(e) => handleDragStart(e, ex)}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-200 text-xs truncate">{ex.name}</span>
                <svg className="w-3 h-3 text-slate-600 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div className="flex gap-2">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{ex.primaryMuscle}</span>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">•</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{ex.equipment}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
           <div className="bg-blue-600/5 border border-blue-500/20 p-4 rounded-2xl">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Board Tips</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Drag anchor dots to link drills for Supersets.</p>
           </div>
        </div>
      </div>

      {/* Architect Canvas */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-900">
        {/* Canvas Header */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-40 pointer-events-none">
          <input 
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
            className="bg-slate-950/40 backdrop-blur-md px-6 py-3 rounded-2xl text-2xl font-black uppercase text-white tracking-tighter outline-none pointer-events-auto border border-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
          />
          <div className="flex gap-3 pointer-events-auto items-center">
            <button onClick={onCancel} className="bg-slate-800 text-slate-400 font-black uppercase italic px-6 py-3 rounded-2xl text-[10px] tracking-widest hover:text-white transition-all border border-slate-700">Abort</button>
            
            {/* CONDITIONAL BUTTON: Only show if criteria (2+ connected drills) are met */}
            {canSaveBlock && (
              <button 
                onClick={() => commitToVault(true)}
                className="bg-indigo-600 text-white font-black uppercase italic px-6 py-3 rounded-2xl text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all border border-indigo-500/50 animate-in slide-in-from-right-2 duration-300"
              >
                Add to Blocks
              </button>
            )}
            
            <button 
              onClick={() => commitToVault(false)}
              className="bg-blue-600 text-white font-black uppercase italic px-8 py-3 rounded-2xl text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all"
            >
              Commit to Vault
            </button>
          </div>
        </div>

        {/* The Grid Board */}
        <div 
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={stopInteractions}
          onMouseLeave={stopInteractions}
          className="flex-1 relative cursor-crosshair overflow-hidden"
          style={{ 
            backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        >
          {/* SVG Layer for Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
             <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orientation="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
             </defs>
             {connections.map((conn, i) => {
               const fromNode = nodes.find(n => n.id === conn.fromId);
               const toNode = nodes.find(n => n.id === conn.toId);
               if (!fromNode || !toNode) return null;
               
               const x1 = fromNode.x + 140;
               const y1 = fromNode.y + 60;
               const x2 = toNode.x + 140;
               const y2 = toNode.y + 60;
               
               return (
                 <line 
                   key={i} 
                   x1={x1} y1={y1} x2={x2} y2={y2} 
                   stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5"
                   className="animate-[dash_2s_linear_infinite]"
                 />
               );
             })}
          </svg>

          {/* Unstack Buttons Layer */}
          {connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.fromId);
            const toNode = nodes.find(n => n.id === conn.toId);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x + 140;
            const y1 = fromNode.y + 60;
            const x2 = toNode.x + 140;
            const y2 = toNode.y + 60;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <button
                key={`unstack-${i}`}
                onClick={() => unstack(conn.fromId, conn.toId)}
                className="absolute z-[45] transform -translate-x-1/2 -translate-y-1/2 bg-slate-950 border border-red-500/50 text-red-500 px-3 py-1.5 rounded-full font-black uppercase text-[8px] tracking-[0.1em] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10 active:scale-90"
                style={{ left: midX, top: midY }}
              >
                Unstack
              </button>
            );
          })}

          {nodes.map(node => (
            <div 
              key={node.id}
              onMouseDown={(e) => startNodeMove(node.id, e)}
              className={`absolute p-1 rounded-2xl transition-all ${draggingNodeId === node.id ? 'z-50 shadow-2xl scale-105 ring-2 ring-blue-500' : 'z-10 shadow-lg'}`}
              style={{ left: node.x, top: node.y, width: '280px' }}
            >
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 backdrop-blur-md relative group/node">
                {/* Link Anchor */}
                <button 
                   onMouseDown={(e) => startLink(node.id, e)}
                   onMouseUp={(e) => completeLink(node.id, e)}
                   className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-900 transition-all z-20 ${linkingFromId === node.id ? 'bg-blue-500 scale-125' : 'bg-slate-700 hover:bg-blue-500'}`}
                />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black uppercase text-white text-xs tracking-tight truncate w-40">{node.exercise.name}</h4>
                    <p className="text-[8px] font-black text-slate-500 uppercase mt-0.5 tracking-widest">{node.exercise.primaryMuscle} Tactical Unit</p>
                  </div>
                  <div className="flex gap-1">
                    {/* NEW: +Stack button to automatically connect to visually lower exercise */}
                    <button 
                      onMouseDown={e => e.stopPropagation()} 
                      onClick={() => autoStackBelow(node.id)}
                      className="p-1.5 bg-blue-600/20 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                      title="Stack with exercise below"
                    >
                      <span className="text-[8px] font-black uppercase">+STACK</span>
                    </button>
                    <button 
                      onMouseDown={e => e.stopPropagation()} 
                      onClick={() => deleteNode(node.id)}
                      className="p-1.5 bg-slate-900 rounded-lg text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mb-1">Sets</label>
                    <input 
                      onMouseDown={e => e.stopPropagation()}
                      type="number" 
                      value={node.sets.length}
                      onChange={e => {
                        const count = Math.max(1, parseInt(e.target.value) || 1);
                        const newSets = Array.from({length: count}, (_, i) => node.sets[i] || { reps: 10, weight: 0, completed: false, type: 'Working' });
                        updateNodeData(node.id, { sets: newSets });
                      }}
                      className="w-full bg-transparent text-[10px] font-black text-blue-400 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mb-1">Reps</label>
                    <input 
                      onMouseDown={e => e.stopPropagation()}
                      type="number" 
                      value={node.sets[0]?.reps}
                      onChange={e => {
                        const r = parseInt(e.target.value) || 0;
                        updateNodeData(node.id, { sets: node.sets.map(s => ({ ...s, reps: r })) });
                      }}
                      className="w-full bg-transparent text-[10px] font-black text-blue-400 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mb-1">Rest</label>
                    <input 
                      onMouseDown={e => e.stopPropagation()}
                      type="number" 
                      value={node.restPeriodSeconds}
                      onChange={e => updateNodeData(node.id, { restPeriodSeconds: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent text-[10px] font-black text-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {nodes.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 pointer-events-none">
              <svg className="w-32 h-32 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <h4 className="text-3xl font-black uppercase">Canvas Active</h4>
              <p className="font-bold uppercase tracking-widest">Architectural HUD Standing By</p>
            </div>
          )}
        </div>

        {/* Footer HUD */}
        <div className="absolute bottom-8 left-8 text-slate-600 text-[8px] font-black uppercase tracking-[0.3em] pointer-events-none flex items-center gap-6">
          <span>System: Protocol Architect V2.1</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
          <span>Latency: 0ms</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
          <span>Mode: Link Dependency Active</span>
        </div>
      </div>
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -10; }
        }
      `}</style>
    </div>
  );
};

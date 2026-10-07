
import React, { useState } from 'react';
import { Macrocycle, Mesocycle } from '../types';

interface MacrocycleEditorProps {
  onSave: (macro: Macrocycle) => void;
  onCancel: () => void;
  initialMacro?: Macrocycle;
  mesocycles: Mesocycle[];
}

export const MacrocycleEditor: React.FC<MacrocycleEditorProps> = ({
  onSave,
  onCancel,
  initialMacro,
  mesocycles
}) => {
  const [name, setName] = useState(initialMacro?.name || '');
  const [description, setDescription] = useState(initialMacro?.description || '');
  const [selectedMesoIds, setSelectedMesoIds] = useState<string[]>(initialMacro?.mesocycleIds || []);

  const addPhase = () => {
    if (mesocycles.length === 0) return alert('No mesocycles available in library');
    setSelectedMesoIds([...selectedMesoIds, mesocycles[0].id]);
  };

  const removePhase = (idx: number) => {
    setSelectedMesoIds(prev => prev.filter((_, i) => i !== idx));
  };

  const updatePhase = (idx: number, id: string) => {
    setSelectedMesoIds(prev => prev.map((item, i) => i === idx ? id : item));
  };

  const handleSave = () => {
    if (!name.trim()) return alert('Macrocycle name required');
    if (selectedMesoIds.length === 0) return alert('Add at least one phase to the roadmap');
    
    onSave({
      id: initialMacro?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      mesocycleIds: selectedMesoIds,
      createdAt: initialMacro?.createdAt || Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">Macro Roadmap Architect</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Design long-term athletic dominance plans</p>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-500 hover:text-white transition-all hover:rotate-90">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Roadmap Identifier</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. 2025 OLYMPIC QUALIFICATION"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white text-xl font-black italic uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Executive Summary</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Outline the high-level progression strategy and major milestones..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-slate-300 h-48 focus:outline-none resize-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Phase Sequencing</label>
              <button 
                onClick={addPhase}
                className="text-[10px] font-black uppercase text-purple-400 hover:text-white"
              >
                + Add Phase Block
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedMesoIds.map((mesoId, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 group hover:border-purple-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-slate-600 uppercase">Phase</span>
                    <span className="text-xl font-black text-white italic">0{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <select 
                      value={mesoId} 
                      onChange={e => updatePhase(idx, e.target.value)}
                      className="w-full bg-transparent text-sm font-black italic uppercase text-slate-300 focus:outline-none focus:text-purple-400 transition-colors"
                    >
                      {mesocycles.map(m => <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={() => removePhase(idx)}
                    className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}

              {selectedMesoIds.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No phases defined</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-5 text-slate-500 font-black uppercase italic border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all tracking-widest">Abort Roadmap</button>
          <button onClick={handleSave} className="flex-1 py-5 bg-purple-600 text-white font-black uppercase italic rounded-3xl shadow-2xl shadow-purple-600/20 hover:bg-purple-500 transition-all tracking-widest active:scale-[0.98]">Commit roadmap</button>
        </div>
      </div>
    </div>
  );
};

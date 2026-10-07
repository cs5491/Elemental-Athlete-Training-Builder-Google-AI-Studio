
import React, { useState, useMemo, useEffect } from 'react';
import { Microcycle, Workout, MicrocycleDay } from '../types';

interface MicrocycleEditorProps {
  onSave: (cycle: Microcycle) => void;
  onCancel: () => void;
  initialCycle?: Microcycle;
  workouts: Workout[];
}

export const MicrocycleEditor: React.FC<MicrocycleEditorProps> = ({
  onSave,
  onCancel,
  initialCycle,
  workouts
}) => {
  const [goal, setGoal] = useState(initialCycle?.goal || 'Strength');
  const [cycleLength, setCycleLength] = useState(initialCycle?.days.length || 7);
  const [isNameLocked, setIsNameLocked] = useState(!!initialCycle?.name);
  const [name, setName] = useState(initialCycle?.name || '');
  const [description, setDescription] = useState(initialCycle?.description || '');
  const [days, setDays] = useState<MicrocycleDay[]>(
    initialCycle?.days || Array.from({ length: 7 }, (_, i) => ({ dayNumber: i + 1, workoutId: 'Rest' }))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedWorkoutId, setDraggedWorkoutId] = useState<string | null>(null);

  // Automatic Naming Protocol
  useEffect(() => {
    if (!isNameLocked) {
      const goalPrefix = goal.substring(0, 3).toUpperCase();
      const lengthSuffix = `${cycleLength}D`;
      const uniqueHash = Math.random().toString(36).substring(2, 5).toUpperCase();
      const generatedName = `UNIT_${goalPrefix}_${lengthSuffix}_${uniqueHash}`;
      setName(generatedName);
    }
  }, [goal, cycleLength, isNameLocked]);

  const handleLengthChange = (newLength: number) => {
    const length = Math.max(3, Math.min(21, newLength));
    setCycleLength(length);
    setDays(prev => {
      if (length > prev.length) {
        const additional = Array.from({ length: length - prev.length }, (_, i) => ({
          dayNumber: prev.length + i + 1,
          workoutId: 'Rest' as const
        }));
        return [...prev, ...additional];
      } else {
        return prev.slice(0, length);
      }
    });
  };

  const updateDay = (dayNum: number, workoutId: string) => {
    setDays(prev => prev.map(d => d.dayNumber === dayNum ? { ...d, workoutId } : d));
  };

  const handleDragStart = (workoutId: string) => {
    setDraggedWorkoutId(workoutId);
  };

  const handleDrop = (dayNumber: number) => {
    if (draggedWorkoutId) {
      updateDay(dayNumber, draggedWorkoutId);
      setDraggedWorkoutId(null);
    }
  };

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [workouts, searchTerm]);

  const handleSave = () => {
    if (!name.trim()) return alert('Tactical Identifier required');
    onSave({
      id: initialCycle?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      goal,
      days,
      createdAt: initialCycle?.createdAt || Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[70] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
        
        {/* Top Intelligence HUD */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
          <div className="flex gap-10 items-center">
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-600 rounded-full"></div>
              <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Microcycle Architect</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Strategic Deployment Sequencing Grid</p>
            </div>
            
            <div className="h-12 w-px bg-slate-800 hidden md:block"></div>

            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Cycle Horizon (Duration)</label>
              <div className="flex items-center bg-slate-950 rounded-xl p-1.5 border border-slate-800 shadow-inner group">
                 <button 
                  onClick={() => handleLengthChange(cycleLength - 1)} 
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                 >-</button>
                 <div className="px-6 flex flex-col items-center">
                   <span className="text-sm font-black text-blue-500 italic leading-none">{cycleLength}</span>
                   <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Days</span>
                 </div>
                 <button 
                  onClick={() => handleLengthChange(cycleLength + 1)} 
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                 >+</button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={onCancel} className="px-10 py-4 bg-slate-800 text-slate-500 font-black uppercase italic rounded-2xl hover:text-white transition-all text-[10px] tracking-widest border border-slate-700">Abort Intel</button>
            <button onClick={handleSave} className="px-10 py-4 bg-blue-600 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all text-[10px] tracking-widest active:scale-95">Commit Program</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tactical Asset Sidebar */}
          <div className="w-80 bg-slate-950/80 border-r border-slate-800 p-6 flex flex-col gap-8 shadow-2xl relative z-10">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black uppercase text-blue-500 tracking-[0.15em]">Workout Arsenal</h4>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              </div>
              <div className="relative group">
                <input 
                  placeholder="Filter Assets..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600/30 transition-all font-bold placeholder:text-slate-700"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              {/* Recovery Asset */}
              <div 
                draggable 
                onDragStart={() => handleDragStart('Rest')}
                className="bg-slate-900/50 border-2 border-dashed border-slate-800 p-5 rounded-3xl cursor-grab active:cursor-grabbing hover:border-slate-600 group transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-600 group-hover:text-slate-400 tracking-widest">Recovery Phase</span>
                  <svg className="w-4 h-4 text-slate-800 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <p className="text-[9px] text-slate-700 font-bold uppercase">Rest, Mobility & Sleep</p>
              </div>

              {filteredWorkouts.map(workout => (
                <div 
                  key={workout.id}
                  draggable 
                  onDragStart={() => handleDragStart(workout.id)}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-3xl cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:bg-slate-800 transition-all group shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2h5v2H7zM7 20h5v2H7zM12 2h5v2h-5zM12 20h5v2h-5z" /></svg>
                  </div>
                  <h5 className="text-[11px] font-black uppercase text-white group-hover:text-blue-400 truncate mb-1 pr-4">{workout.name}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{workout.blocks.length} Neural Blocks</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tactical Protocol</p>
               </div>
               <p className="text-[10px] text-slate-600 leading-relaxed font-medium">Map out a sequence that prioritizes supercompensation and neurological recovery.</p>
            </div>
          </div>

          {/* Grid Tactical Display */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-slate-900 relative">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] group-focus-within:text-blue-500 transition-colors">Tactical Identifier</label>
                    <button 
                      onClick={() => setIsNameLocked(!isNameLocked)}
                      className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-all ${isNameLocked ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-600 hover:text-white'}`}
                    >
                      {isNameLocked ? 'Locked / Manual' : 'Unlocked / Auto'}
                    </button>
                  </div>
                  <input 
                    value={name} 
                    onChange={e => {
                      setName(e.target.value);
                      setIsNameLocked(true);
                    }}
                    placeholder="E.G. ALPHA_STR_PHASE_01"
                    className={`w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-white font-black italic uppercase tracking-tighter focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-xl ${!isNameLocked ? 'opacity-70' : 'opacity-100'}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-3">Deployment Focus</label>
                  <select 
                    value={goal} onChange={e => setGoal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-white font-black italic uppercase focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-xl cursor-pointer"
                  >
                    <option value="Strength">Strength Dominance</option>
                    <option value="Hypertrophy">Structural Hypertrophy</option>
                    <option value="Power">Explosive Power</option>
                    <option value="Conditioning">Metabolic Conditioning</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] block">Tactical Deployment Grid</label>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                       <span className="text-[8px] font-black uppercase text-slate-600">Active Duty</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                       <span className="text-[8px] font-black uppercase text-slate-600">Recovery</span>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5">
                  {days.map(day => {
                    const workout = workouts.find(w => w.id === day.workoutId);
                    const isRest = day.workoutId === 'Rest';
                    
                    return (
                      <div 
                        key={day.dayNumber}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(day.dayNumber)}
                        className={`group min-h-[180px] p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col relative overflow-hidden ${
                          isRest 
                          ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' 
                          : 'bg-blue-600/5 border-blue-500/30 hover:bg-blue-600/10 hover:border-blue-500/60 shadow-2xl shadow-blue-500/5'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-6 z-10">
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Day</span>
                             <span className={`text-xl font-black italic leading-none mt-1 ${isRest ? 'text-slate-700' : 'text-blue-500'}`}>0{day.dayNumber}</span>
                          </div>
                          <div className="flex gap-1">
                            {!isRest && (
                               <button 
                                 onClick={() => updateDay(day.dayNumber, 'Rest')}
                                 className="opacity-0 group-hover:opacity-100 p-2 bg-slate-900 rounded-xl text-slate-500 hover:text-red-500 transition-all border border-slate-800"
                               >
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-end z-10">
                          {isRest ? (
                            <div className="flex flex-col items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity py-4">
                               <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                               <span className="text-[8px] font-black uppercase tracking-widest">Rest Phase</span>
                            </div>
                          ) : (
                            <div>
                               <h5 className="text-xs font-black uppercase text-white leading-tight mb-2 pr-2">{workout?.name}</h5>
                               <div className="flex items-center gap-1.5">
                                 <div className="px-2 py-0.5 bg-blue-600/20 rounded-md border border-blue-500/20">
                                   <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">{workout?.blocks.length} BLKS</span>
                                 </div>
                               </div>
                            </div>
                          )}
                        </div>

                        {/* Manual Selector (Alternative to Drag & Drop) */}
                        <div className="mt-4 pt-4 border-t border-slate-800/50">
                           <select 
                            value={day.workoutId}
                            onChange={(e) => updateDay(day.dayNumber, e.target.value)}
                            className="w-full bg-transparent text-[8px] font-black uppercase text-slate-600 hover:text-blue-400 focus:outline-none transition-colors cursor-pointer"
                           >
                             <option value="Rest" className="bg-slate-900">SET_RECOVERY</option>
                             {workouts.map(w => (
                               <option key={w.id} value={w.id} className="bg-slate-900">{w.name.toUpperCase()}</option>
                             ))}
                           </select>
                        </div>
                        
                        {/* Drop Target Animation Layer */}
                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] border-2 border-blue-500/40 scale-[0.96]"></div>
                        {isRest && <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-full blur-2xl -mr-12 -mt-12"></div>}
                        {!isRest && <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mb-16"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-4">Phase Executive Summary</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Define the physiological adaptations and strategic progression for this deployment period..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-[2.5rem] px-8 py-6 text-slate-300 h-32 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { Microcycle, Workout } from '../types';

interface MicrocycleLibraryProps {
  microcycles: Microcycle[];
  workouts: Workout[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (cycle: Microcycle) => void;
}

export const MicrocycleLibrary: React.FC<MicrocycleLibraryProps> = ({
  microcycles,
  workouts,
  onAdd,
  onDelete,
  onEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<number | 'All'>('All');

  const goals = useMemo(() => {
    const set = new Set(microcycles.map(m => m.goal));
    return ['All', ...Array.from(set)].sort();
  }, [microcycles]);

  const durations = useMemo(() => {
    const set = new Set(microcycles.map(m => m.days.length));
    // Fix: Explicitly type 'a' and 'b' to avoid arithmetic operation errors on potentially unknown types during sorting.
    return ['All', ...Array.from(set).sort((a: number, b: number) => a - b)];
  }, [microcycles]);

  const filteredMicrocycles = useMemo(() => {
    return microcycles.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGoal = selectedGoal === 'All' || m.goal === selectedGoal;
      const matchesDuration = selectedDuration === 'All' || m.days.length === selectedDuration;
      return matchesSearch && matchesGoal && matchesDuration;
    });
  }, [microcycles, searchTerm, selectedGoal, selectedDuration]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Microcycle Library</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Short-term strategic training phases</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic px-6 py-3 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Build Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Tactical Filter Sidebar - Adjusted to exactly 1/3 (4 of 12 columns) */}
        <aside className="lg:col-span-4 space-y-8 sticky top-24 bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <div className="relative">
            <div className="absolute -left-8 top-0 w-1 h-6 bg-blue-600 rounded-full"></div>
            <h4 className="text-xs font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center gap-2">
              Intelligence Filters
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            </h4>
            
            <div className="space-y-8">
              {/* Search */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Identifier Search</label>
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="E.G. UNIT_SQUAT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 transition-all font-bold"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              {/* Goal Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Strategic Focus</label>
                <div className="flex flex-col gap-2">
                  {goals.map(goal => (
                    <button
                      key={goal}
                      onClick={() => setSelectedGoal(goal)}
                      className={`text-left px-5 py-3 rounded-xl text-xs font-black uppercase transition-all border ${
                        selectedGoal === goal 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Phase Horizon</label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map(duration => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration as any)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${
                        selectedDuration === duration 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {duration === 'All' ? 'ALL' : `${duration}D`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats HUD */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Library Density</span>
                  <span className="text-[10px] font-black text-blue-500">{filteredMicrocycles.length} / {microcycles.length}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${(filteredMicrocycles.length / (microcycles.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Clear Action */}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGoal('All');
                  setSelectedDuration('All');
                }}
                className="w-full py-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors border-t border-slate-800 pt-6 mt-4 italic tracking-widest"
              >
                Reset Mission Parameters
              </button>
            </div>
          </div>
        </aside>

        {/* Main Grid - Adjusted to remaining 2/3 (8 of 12 columns) */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMicrocycles.map(cycle => (
              <div key={cycle.id} className="group bg-slate-900 border border-slate-800 rounded-[3rem] p-10 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="bg-slate-800/50 text-slate-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest border border-slate-800">
                        {cycle.goal}
                      </span>
                      <span className="bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest border border-blue-500/20">
                        {cycle.days.length} Days
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(cycle)} className="p-3 bg-slate-800/50 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => confirm('Purge tactical unit?') && onDelete(cycle.id)} className="p-3 bg-slate-800/50 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black italic uppercase text-white mb-4 tracking-tighter group-hover:text-blue-400 transition-colors leading-none">
                    {cycle.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-10 leading-relaxed line-clamp-2 min-h-[40px] font-medium">
                    {cycle.description}
                  </p>

                  {/* Micro-Calendar Visualization */}
                  <div className="grid grid-cols-7 gap-2 mb-10">
                    {cycle.days.map(day => {
                      const isRest = day.workoutId === 'Rest';
                      return (
                        <div key={day.dayNumber} className="flex flex-col items-center gap-1.5">
                          <div 
                            className={`w-full aspect-square rounded-xl flex items-center justify-center border transition-all ${
                              isRest ? 'bg-slate-950 border-slate-800 opacity-20' : 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                            }`}
                            title={isRest ? 'Rest Phase' : workouts.find(w => w.id === day.workoutId)?.name}
                          >
                            {!isRest && <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
                          </div>
                          <span className="text-[7px] font-black text-slate-700 uppercase">D{day.dayNumber}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase italic rounded-2xl transition-all text-[10px] tracking-[0.3em] border border-slate-700/50 active:scale-95 shadow-xl">
                  Deploy Deployment Protocol
                </button>
              </div>
            ))}

            {filteredMicrocycles.length === 0 && (
              <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-800 rounded-[4rem] bg-slate-900/20">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-slate-600 font-black uppercase italic tracking-[0.3em] text-2xl">Unit Not Found</p>
                <p className="text-slate-700 text-sm mt-4 italic font-medium max-w-xs mx-auto">Neural sensors indicate no microcycle matches the current filter parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

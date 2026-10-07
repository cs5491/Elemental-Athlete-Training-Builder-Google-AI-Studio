
import React, { useState, useEffect } from 'react';
import { Workout, WorkoutLog, ExerciseInstance, SetLog, Exercise, WorkoutBlock, SessionPB } from '../types';

interface WorkoutLoggerProps {
  workout: Workout;
  onComplete: (log: Omit<WorkoutLog, 'athleteId'>) => void;
  onCancel: () => void;
  exerciseLibrary: Exercise[];
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ 
  workout, onComplete, onCancel, exerciseLibrary 
}) => {
  const [sessionBlocks, setSessionBlocks] = useState<WorkoutBlock[]>(JSON.parse(JSON.stringify(workout.blocks)));
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [intensity, setIntensity] = useState(7);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const [showInstructions, setShowInstructions] = useState<string | null>(null);
  const [sessionPBs, setSessionPBs] = useState<SessionPB[]>([]);
  const [lastLoggedPB, setLastLoggedPB] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const toggleSet = (blockIdx: number, exIdx: number, setIdx: number) => {
    const next = [...sessionBlocks];
    next[blockIdx].exercises[exIdx].sets[setIdx].completed = !next[blockIdx].exercises[exIdx].sets[setIdx].completed;
    setSessionBlocks(next);
  };

  const updateSetValues = (blockIdx: number, exIdx: number, setIdx: number, field: 'weight' | 'reps', val: number) => {
    const next = [...sessionBlocks];
    next[blockIdx].exercises[exIdx].sets[setIdx][field] = val;
    setSessionBlocks(next);
  };

  const handleRecordPB = (exerciseId: string, blockIdx: number, exIdx: number) => {
    const sets = sessionBlocks[blockIdx].exercises[exIdx].sets;
    const completedSets = sets.filter(s => s.completed);
    
    if (completedSets.length === 0) {
      alert("Complete at least one set before recording a PB.");
      return;
    }

    // Find the "best" set: Highest weight, then highest reps
    const bestSet = completedSets.reduce((prev, curr) => {
      if (curr.weight > prev.weight) return curr;
      if (curr.weight === prev.weight && curr.reps > prev.reps) return curr;
      return prev;
    }, completedSets[0]);

    const exercise = exerciseLibrary.find(e => e.id === exerciseId);
    const newPB: SessionPB = {
      exerciseId,
      exerciseName: exercise?.name || 'Unknown',
      weight: bestSet.weight,
      reps: bestSet.reps
    };

    setSessionPBs(prev => {
      const filtered = prev.filter(p => p.exerciseId !== exerciseId);
      return [...filtered, newPB];
    });

    setLastLoggedPB(`${exercise?.name}: ${bestSet.weight}lbs x ${bestSet.reps}`);
    setTimeout(() => setLastLoggedPB(null), 3000);
  };

  const currentVolume = sessionBlocks.reduce((acc, block) => 
    acc + block.exercises.reduce((exAcc, ex) => 
      exAcc + ex.sets.reduce((sAcc, set) => sAcc + (set.weight * set.reps), 0), 0), 0);

  const handleFinish = () => {
    const duration = Math.floor((Date.now() - startTime) / 60000);
    
    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      workoutId: workout.id,
      workoutName: workout.name,
      date: Date.now(),
      blocks: sessionBlocks,
      durationMinutes: duration,
      intensity,
      totalVolume: currentVolume,
      personalBestsAchieved: sessionPBs.map(p => p.exerciseId),
      sessionPBs: sessionPBs
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      {lastLoggedPB && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl z-[100] animate-in slide-in-from-top-10 duration-300">
          🔥 PB ARCHIVED: {lastLoggedPB}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-20 py-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">Live Session</span>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter">{workout.name}</h2>
            </div>
            <div className="flex gap-4 mt-2">
              <p className="text-blue-500 font-mono text-2xl font-black">{formatTime(elapsed)}</p>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-slate-500">
                <p className="text-[10px] font-black uppercase tracking-widest">Total Volume</p>
                <p className="font-bold text-slate-200">{currentVolume.toLocaleString()} LBS</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => confirm('Abort session? Data will be lost.') && onCancel()}
            className="p-3 bg-slate-900 rounded-full text-slate-500 hover:text-white hover:bg-red-500/20 transition-all border border-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-12 mb-40">
          {sessionBlocks.map((block, bIdx) => {
            const isActive = activeBlockIdx === bIdx;
            return (
              <div 
                key={block.id}
                onClick={() => setActiveBlockIdx(bIdx)}
                className={`transition-all duration-300 rounded-[2.5rem] p-1 ${isActive ? 'bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600' : 'bg-slate-800'}`}
              >
                <div className="bg-slate-900 rounded-[2.3rem] overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Block 0{bIdx + 1}</span>
                      <h3 className="text-xl font-black uppercase text-white tracking-tighter">{block.name}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${block.type === 'Superset' ? 'bg-blue-500 text-white' : block.type === 'Circuit' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        {block.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-10">
                    {block.exercises.map((ex, exIdx) => {
                      const base = exerciseLibrary.find(e => e.id === ex.exerciseId);
                      const currentPB = sessionPBs.find(p => p.exerciseId === ex.exerciseId);
                      
                      return (
                        <div key={ex.id} className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-black uppercase text-slate-200">{exIdx + 1}. {base?.name}</h4>
                                {currentPB && (
                                  <span className="bg-amber-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-bounce">
                                    PR: {currentPB.weight}x{currentPB.reps}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{base?.primaryMuscle} • {ex.restPeriodSeconds}s Rest</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleRecordPB(ex.exerciseId, bIdx, exIdx)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                  currentPB 
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                    : 'bg-slate-800 text-slate-400 hover:text-amber-500 border border-slate-700'
                                }`}
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                {currentPB ? 'Update PB' : 'Record PB'}
                              </button>
                              <button 
                                onClick={() => setShowInstructions(base?.id || null)}
                                className="text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors"
                              >
                                Cues
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">
                              <div className="col-span-1 text-center">Set</div>
                              <div className="col-span-3 text-center">Type</div>
                              <div className="col-span-3 text-center">Weight (lbs)</div>
                              <div className="col-span-3 text-center">Reps</div>
                              <div className="col-span-2"></div>
                            </div>
                            {ex.sets.map((set, sIdx) => (
                              <div key={sIdx} className={`grid grid-cols-12 gap-3 items-center p-3 rounded-2xl transition-all ${set.completed ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700/50'}`}>
                                <div className="col-span-1 text-center font-black text-xs text-slate-500">{sIdx + 1}</div>
                                <div className="col-span-3 text-center">
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-700">
                                    {set.type || 'Working'}
                                  </span>
                                </div>
                                <div className="col-span-3">
                                  <input 
                                    type="number" value={set.weight || ''} placeholder="0"
                                    onChange={(e) => updateSetValues(bIdx, exIdx, sIdx, 'weight', Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-2 text-center font-black text-white focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <input 
                                    type="number" value={set.reps || ''} placeholder="0"
                                    onChange={(e) => updateSetValues(bIdx, exIdx, sIdx, 'reps', Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-2 text-center font-black text-white focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <button 
                                    onClick={() => toggleSet(bIdx, exIdx, sIdx)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-600'}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 z-30 pb-10 pt-6 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Rate of Perceived Exertion</label>
                <span className={`text-xl font-black ${intensity > 8 ? 'text-red-500' : 'text-blue-500'}`}>RPE {intensity}</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
            </div>
            
            <button 
              onClick={handleFinish}
              className="w-full md:w-auto px-16 py-5 bg-gradient-to-r from-blue-700 to-blue-500 rounded-full text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              Finish Session
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-slate-950/95 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowInstructions(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {(() => {
              const ex = exerciseLibrary.find(e => e.id === showInstructions);
              if (!ex) return null;
              return (
                <div className="space-y-10">
                  <div className="text-center">
                    <h3 className="text-3xl font-black uppercase text-white tracking-tighter">{ex.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">{ex.primaryMuscle} Tactical Brief</p>
                  </div>

                  {/* Sequence Images */}
                  {(ex.setupImageUrl || ex.finishImageUrl) && (
                    <div className="grid grid-cols-11 items-center gap-2 px-4">
                      <div className="col-span-5 space-y-2">
                        <p className="text-[8px] font-black uppercase text-indigo-500 tracking-widest text-center">01 Setup</p>
                        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                          {ex.setupImageUrl ? (
                            <img src={ex.setupImageUrl} alt="Setup" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-800 font-black">START_FRAME</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-1 flex justify-center pt-6">
                        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>

                      <div className="col-span-5 space-y-2">
                        <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest text-center">02 Finish</p>
                        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                          {ex.finishImageUrl ? (
                            <img src={ex.finishImageUrl} alt="Finish" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-800 font-black">PEAK_FRAME</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] border-b border-slate-800 pb-2">Technical Execution</h4>
                    <ul className="space-y-4">
                      {ex.instructions.map((step, i) => (
                        <li key={i} className="flex gap-5 items-start">
                          <span className="text-blue-500 font-black italic text-lg leading-none pt-0.5">0{i+1}</span>
                          <span className="text-slate-300 font-medium text-sm leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {ex.description && (
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                       <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Biomechanical Context</h4>
                       <p className="text-xs text-slate-400 leading-relaxed italic">{ex.description}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

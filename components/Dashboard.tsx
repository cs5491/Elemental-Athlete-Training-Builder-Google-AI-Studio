
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';
import { WorkoutLog, PersonalBest, Exercise, Athlete, WellnessLog, PrescribedPrincipleAssignment } from '../types';
import { analyzePerformance } from '../geminiService';
import { Roster } from './Roster';
import { COACHING_PRINCIPLES } from '../constants';

interface DashboardProps {
  logs: WorkoutLog[];
  wellnessLogs?: WellnessLog[];
  allExercises: Exercise[];
  athletes: Athlete[];
  activeAthleteId: string | null;
  onSelectAthlete: (id: string) => void;
  onAddAthlete: (athlete: Omit<Athlete, 'id' | 'joinedAt'>) => void;
  onDeleteAthlete: (id: string) => void;
  prescribedPrinciples: PrescribedPrincipleAssignment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  logs, 
  wellnessLogs = [],
  allExercises, 
  athletes, 
  activeAthleteId, 
  onSelectAthlete, 
  onAddAthlete, 
  onDeleteAthlete,
  prescribedPrinciples
}) => {
  const [insights, setInsights] = useState<string>('Analyzing tactical intelligence...');
  const [showFullRoster, setShowFullRoster] = useState(false);

  useEffect(() => {
    if (activeAthleteId && logs.length > 0) {
      // Analyze performance with wellness context if available
      const athleteWellness = wellnessLogs.filter(w => w.athleteId === activeAthleteId);
      analyzePerformance([...logs, ...athleteWellness]).then(setInsights);
    } else if (!activeAthleteId) {
      setInsights('Select an athlete to see performance insights.');
    } else {
      setInsights('Log sessions to see AI performance insights.');
    }
  }, [logs, activeAthleteId, wellnessLogs]);

  const recentlyActiveAthletes = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => b.date - a.date);
    const uniqueIds = new Set<string>();
    const recentAthletes: Athlete[] = [];
    
    for (const log of sortedLogs) {
      if (uniqueIds.size >= 4) break;
      if (!uniqueIds.has(log.athleteId)) {
        const athlete = athletes.find(a => a.id === log.athleteId);
        if (athlete) {
          uniqueIds.add(log.athleteId);
          recentAthletes.push(athlete);
        }
      }
    }
    
    if (recentAthletes.length < 4) {
      athletes.forEach(a => {
        if (recentAthletes.length < 4 && !uniqueIds.has(a.id)) {
          recentAthletes.push(a);
        }
      });
    }
    
    return recentAthletes;
  }, [logs, athletes]);

  const getAthleteStats = (athleteId: string) => {
    const athleteLogs = logs.filter(l => l.athleteId === athleteId);
    if (athleteLogs.length === 0) return { sessions: 0, volume: 0, maxLoad: 0, lastSeen: 'Never' };

    const sessions = athleteLogs.length;
    const volume = athleteLogs.reduce((acc, log) => 
      acc + log.blocks.reduce((bAcc, b) => 
        bAcc + b.exercises.reduce((eAcc, e) => 
          eAcc + e.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0), 0), 0), 0);
    
    const maxLoad = Math.max(...athleteLogs.flatMap(l => 
      l.blocks.flatMap(b => b.exercises.flatMap(e => e.sets.map(s => s.weight)))
    ), 0);

    const lastDate = Math.max(...athleteLogs.map(l => l.date));
    const lastSeen = new Date(lastDate).toLocaleDateString();

    return { sessions, volume, maxLoad, lastSeen };
  };

  const pbs = useMemo(() => {
    if (!activeAthleteId) return [];
    const map = new Map<string, PersonalBest>();
    logs.filter(l => l.athleteId === activeAthleteId).forEach(log => {
      log.blocks.forEach(block => {
        block.exercises.forEach(ex => {
          const bestSet = ex.sets.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), { weight: 0, reps: 0 });
          const currentBest = map.get(ex.exerciseId);
          if (!currentBest || bestSet.weight > currentBest.weight) {
            const base = allExercises.find(i => i.id === ex.exerciseId);
            map.set(ex.exerciseId, {
              exerciseId: ex.exerciseId,
              exerciseName: base?.name || 'Unknown Drill',
              weight: bestSet.weight,
              reps: bestSet.reps,
              date: log.date
            });
          }
        });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.weight - a.weight);
  }, [logs, allExercises, activeAthleteId]);

  const volumeData = logs.filter(l => l.athleteId === activeAthleteId).map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    volume: log.blocks.reduce((acc, block) => 
      acc + block.exercises.reduce((exAcc, ex) => 
        exAcc + ex.sets.reduce((sAcc, set) => sAcc + (set.weight * set.reps), 0), 0), 0)
  })).reverse();

  const wellnessTrendData = wellnessLogs.filter(w => w.athleteId === activeAthleteId).map(w => ({
    date: new Date(w.date).toLocaleDateString(),
    score: ((w.sleepQuality + (11-w.fatigue) + (11-w.soreness))/3).toFixed(1),
    fatigue: w.fatigue,
    stress: w.stress
  })).reverse();

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700">
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Command Center</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Personnel Intelligence HUD</p>
          </div>
          <button 
            onClick={() => setShowFullRoster(!showFullRoster)}
            className="text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors flex items-center gap-2"
          >
            {showFullRoster ? 'Close Archive' : 'Squad Archive'}
          </button>
        </div>

        {showFullRoster ? (
          <Roster 
            athletes={athletes} 
            activeAthleteId={activeAthleteId} 
            onSelectAthlete={(id) => {
              onSelectAthlete(id);
              setShowFullRoster(false);
            }}
            onAddAthlete={onAddAthlete}
            onDeleteAthlete={onDeleteAthlete}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyActiveAthletes.map(athlete => {
              const stats = getAthleteStats(athlete.id);
              const isActive = activeAthleteId === athlete.id;
              
              return (
                <button
                  key={athlete.id}
                  onClick={() => onSelectAthlete(athlete.id)}
                  className={`flex flex-col p-6 rounded-[2rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/20' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0 relative">
                      {athlete.avatarUrl ? (
                        <img src={athlete.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-slate-500 text-xl">
                          {athlete.name.charAt(0)}
                        </div>
                      )}
                      {isActive && <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className={`font-black uppercase text-base truncate transition-colors ${isActive ? 'text-blue-400' : 'text-white'}`}>
                        {athlete.name}
                      </p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] truncate">{athlete.sport}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Max Load</p>
                      <p className="text-sm font-black text-slate-200">{stats.maxLoad}<span className="text-[8px] ml-0.5 text-slate-500">LB</span></p>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Volume</p>
                      <p className="text-sm font-black text-slate-200">{stats.volume > 1000 ? `${(stats.volume/1000).toFixed(1)}K` : stats.volume}</p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute top-4 right-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {activeAthleteId ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3 tracking-tight text-white">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Force Profile (Volume)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3 tracking-tight text-white">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Bio-Readiness Score
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wellnessTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Recovery Score" />
                    <Line type="monotone" dataKey="fatigue" stroke="#ef4444" strokeWidth={2} name="Fatigue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900/20 p-10 rounded-[3rem] shadow-2xl border border-blue-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Tactical Brief</h3>
                      <p className="text-blue-400 text-xs font-black uppercase tracking-widest mt-1">Victor AI Intelligence</p>
                    </div>
                  </div>
                  <p className="text-xl text-slate-100 leading-relaxed whitespace-pre-wrap font-medium bg-slate-950/40 p-6 rounded-2xl border border-white/5">
                    {insights}
                  </p>
                </div>
              </div>

              {/* Active Protocols Section */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                 <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-white tracking-tight">
                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                    Active Coaching Protocols
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescribedPrinciples.map(pres => {
                      const principle = COACHING_PRINCIPLES.find(p => p.id === pres.principleId);
                      if (!principle) return null;
                      return (
                        <div key={pres.id} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl group hover:border-purple-500/30 transition-all">
                           <span className="text-[7px] font-black uppercase text-purple-400 tracking-widest bg-purple-900/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                              {principle.category}
                           </span>
                           <h4 className="text-sm font-black uppercase text-white mb-2 italic">{principle.title}</h4>
                           <p className="text-[10px] text-slate-400 line-clamp-2 italic mb-4">{principle.summary}</p>
                           <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800">
                              <span className="text-[8px] font-black text-slate-600 uppercase">Assigned {new Date(pres.assignedAt).toLocaleDateString()}</span>
                              <button className="text-[8px] font-black text-blue-500 hover:text-white uppercase tracking-widest">Review Unit</button>
                           </div>
                        </div>
                      );
                    })}
                    {prescribedPrinciples.length === 0 && (
                      <div className="col-span-full py-12 text-center opacity-30 italic font-bold text-slate-600 uppercase tracking-widest border-2 border-dashed border-slate-800 rounded-3xl">
                        No special protocols assigned to subject.
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
              <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-white">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                PB Archive
              </h3>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {pbs.map((pb, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30">
                    <div>
                      <h4 className="font-black uppercase text-slate-200 text-sm">{pb.exerciseName}</h4>
                      <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">{new Date(pb.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-amber-500">{pb.weight}<span className="text-[10px] ml-1">LB</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center">
            <h3 className="text-3xl font-black uppercase text-slate-500 tracking-tighter">Command Active</h3>
            <p className="text-slate-600 text-sm font-medium">Select a subject for profile loading.</p>
        </div>
      )}
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { Athlete, Workout, WorkoutLog, WorkoutBlock } from '../types';

interface AttendanceTrackerProps {
  athletes: Athlete[];
  workouts: Workout[];
  logs: WorkoutLog[];
  onLogAttendance: (athleteIds: string[], workoutId: string, date: number) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  athletes,
  workouts,
  logs,
  onLogAttendance
}) => {
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(workouts[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const toggleAthlete = (id: string) => {
    setSelectedAthleteIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleDeploy = () => {
    if (selectedAthleteIds.length === 0) return alert('Select at least one athlete for the session.');
    if (!selectedWorkoutId) return alert('Select a workout protocol.');
    
    const timestamp = new Date(sessionDate).getTime();
    onLogAttendance(selectedAthleteIds, selectedWorkoutId, timestamp);
    setSelectedAthleteIds([]);
    alert(`Deployment Successful: ${selectedAthleteIds.length} athletes logged.`);
  };

  // Calculate Heatmap Data (Last 14 Days)
  const heatmapDates = useMemo(() => {
    const dates = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const attendanceMatrix = useMemo(() => {
    return athletes.map(athlete => {
      const athleteLogs = logs.filter(l => l.athleteId === athlete.id);
      const activity = heatmapDates.map(dateStr => {
        return athleteLogs.some(l => new Date(l.date).toISOString().split('T')[0] === dateStr);
      });
      return { athlete, activity };
    });
  }, [athletes, logs, heatmapDates]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black uppercase text-white tracking-tighter">Team Attendance</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Mass-log team sessions and track frequency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Deployment Controls */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Session Deployment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Protocol</label>
                <select 
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Session Date</label>
                <input 
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Athletes Present</label>
                <button 
                  onClick={() => setSelectedAthleteIds(athletes.map(a => a.id))}
                  className="text-[10px] font-black uppercase text-blue-500 hover:text-white"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {athletes.map(athlete => {
                  const isSelected = selectedAthleteIds.includes(athlete.id);
                  return (
                    <button
                      key={athlete.id}
                      onClick={() => toggleAthlete(athlete.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                        isSelected 
                          ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                        {isSelected ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : athlete.name.charAt(0)}
                      </div>
                      <span className={`text-[11px] font-black uppercase truncate ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {athlete.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleDeploy}
              className="w-full mt-10 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Deploy Team Session
            </button>
          </section>
        </div>

        {/* Right: History Grid / Heatmap */}
        <div className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl h-full">
            <h3 className="text-xl font-black uppercase text-white mb-8 flex items-center gap-3 tracking-tight">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Attendance Matrix
            </h3>
            
            <div className="space-y-6 overflow-x-auto custom-scrollbar">
              <div className="flex gap-1 justify-end mb-2">
                {heatmapDates.map((d, i) => (
                  <div key={i} className="w-4 text-[8px] font-black text-slate-600 rotate-[-45deg] origin-bottom-left">
                    {new Date(d).getDate()}
                  </div>
                ))}
              </div>
              
              {attendanceMatrix.map(({ athlete, activity }, idx) => (
                <div key={athlete.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase truncate">
                      {athlete.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {activity.map((attended, dayIdx) => (
                      <div 
                        key={dayIdx} 
                        className={`w-4 h-4 rounded-sm transition-all duration-500 ${attended ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}
                        title={`${athlete.name} - ${heatmapDates[dayIdx]}: ${attended ? 'Logged' : 'Missed'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {athletes.length === 0 && (
                <div className="py-20 text-center opacity-30 font-medium text-sm text-slate-500">
                  Register athletes to track attendance
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span className="text-[8px] font-black text-slate-500 uppercase">Logged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                  <span className="text-[8px] font-black text-slate-500 uppercase">Missed</span>
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-600 uppercase">Last 14 Days Heatmap</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { WorkoutLog, Athlete, Workout } from '../types';

interface CalendarViewProps {
  logs: WorkoutLog[];
  athletes: Athlete[];
  workouts: Workout[];
  activeAthleteId: string | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ logs, athletes, workouts, activeAthleteId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Padding for first week
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getLogsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logs.filter(l => {
      const logDateStr = new Date(l.date).toISOString().split('T')[0];
      const matchesDate = logDateStr === dateStr;
      const matchesAthlete = !activeAthleteId || l.athleteId === activeAthleteId;
      return matchesDate && matchesAthlete;
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">Tactical Calendar</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Annual roadmap & historical deployment logs</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-xl">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="px-6 text-center min-w-[160px]">
            <h3 className="text-xl font-black uppercase text-white tracking-widest leading-none">{monthName}</h3>
            <p className="text-[10px] font-black text-blue-500 mt-1">{year}</p>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        <div className="grid grid-cols-7 gap-px bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-800">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="bg-slate-900 p-4 text-center">
              <span className="text-[10px] font-black text-slate-600 tracking-[0.2em]">{day}</span>
            </div>
          ))}

          {monthData.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-slate-950/20 p-6 min-h-[140px]"></div>;
            
            const dateLogs = getLogsForDate(date);
            const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
            
            return (
              <div 
                key={idx} 
                className={`bg-slate-900 p-4 min-h-[140px] border border-slate-800/20 group hover:bg-slate-800/30 transition-all relative ${isToday ? 'ring-inset ring-1 ring-blue-500/50' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-sm font-black italic ${isToday ? 'text-blue-500' : 'text-slate-500'}`}>
                    {date.getDate().toString().padStart(2, '0')}
                  </span>
                  {dateLogs.length > 0 && (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {dateLogs.slice(0, 3).map(log => {
                    const athlete = athletes.find(a => a.id === log.athleteId);
                    return (
                      <div key={log.id} className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800 text-[8px] font-black uppercase tracking-tight text-slate-300 truncate group-hover:border-blue-900/50 transition-colors">
                        <span className="text-blue-500 mr-1">●</span>
                        {activeAthleteId ? log.workoutName : `${athlete?.name.split(' ')[0]}: ${log.workoutName}`}
                      </div>
                    );
                  })}
                  {dateLogs.length > 3 && (
                    <div className="text-[7px] font-black text-slate-600 uppercase pl-1">
                      + {dateLogs.length - 3} more entries
                    </div>
                  )}
                </div>

                {isToday && (
                  <div className="absolute bottom-2 right-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
           <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Historical Fidelity</h4>
           <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-white italic">{logs.length}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Total Sessions<br/>Archived</div>
           </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
           <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Monthly Deployment</h4>
           <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-blue-500 italic">
                {logs.filter(l => new Date(l.date).getMonth() === currentDate.getMonth()).length}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Active Sessions<br/>this month</div>
           </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
           <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">System Status</h4>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Operational</div>
           </div>
        </div>
      </div>
    </div>
  );
};

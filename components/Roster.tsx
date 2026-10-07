
import React, { useState } from 'react';
import { Athlete } from '../types';

interface RosterProps {
  athletes: Athlete[];
  activeAthleteId: string | null;
  onSelectAthlete: (id: string) => void;
  onAddAthlete: (athlete: Omit<Athlete, 'id' | 'joinedAt'>) => void;
  onDeleteAthlete: (id: string) => void;
}

export const Roster: React.FC<RosterProps> = ({ 
  athletes, activeAthleteId, onSelectAthlete, onAddAthlete, onDeleteAthlete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSport, setNewSport] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddAthlete({ name: newName, sport: newSport, goal: newGoal });
    setNewName('');
    setNewSport('');
    setNewGoal('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Athletic Roster</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Manage your team of performers</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic px-6 py-3 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          Add Athlete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {athletes.map(athlete => (
          <div 
            key={athlete.id}
            onClick={() => onSelectAthlete(athlete.id)}
            className={`group cursor-pointer relative p-1 rounded-[2.5rem] transition-all duration-300 ${activeAthleteId === athlete.id ? 'bg-gradient-to-br from-blue-600 to-indigo-600 scale-105 shadow-2xl shadow-blue-600/20' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <div className="bg-slate-900 rounded-[2.3rem] p-6 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700">
                  {athlete.avatarUrl ? (
                    <img src={athlete.avatarUrl} alt={athlete.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-2xl">
                      {athlete.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tight">{athlete.name}</h3>
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{athlete.sport}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Primary Objective</p>
                  <p className="text-slate-300 font-medium text-sm leading-tight line-clamp-2">{athlete.goal || 'No goal set'}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
                  Joined {new Date(athlete.joinedAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm(`Remove ${athlete.name} and all their session data?`)) onDeleteAthlete(athlete.id);
                  }}
                  className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">New Recruit</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Onboard a new high-performer</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Full Name</label>
                <input 
                  required value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Marcus Thorne"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Specialty / Sport</label>
                <input 
                  value={newSport} onChange={e => setNewSport(e.target.value)}
                  placeholder="e.g. Heavyweight MMA"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Training Mission</label>
                <textarea 
                  value={newGoal} onChange={e => setNewGoal(e.target.value)}
                  placeholder="e.g. Increase strike speed by 15%..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-black uppercase italic border border-slate-800 rounded-2xl hover:bg-slate-800">Abort</button>
              <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-blue-600/20">Register</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

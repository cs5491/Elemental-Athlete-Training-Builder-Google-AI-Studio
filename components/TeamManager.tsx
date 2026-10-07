
import React, { useState, useMemo } from 'react';
import { Personnel, PersonnelRole } from '../types';

interface TeamManagerProps {
  teamMembers: Personnel[];
  onAddMember: (member: Omit<Personnel, 'id' | 'joinedAt'>) => void;
  onDeleteMember: (id: string) => void;
  onSelectMember: (id: string) => void;
  activeMemberId: string | null;
}

const ROLE_COLORS: Record<PersonnelRole, string> = {
  Coach: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
  Athlete: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  Medical: 'text-red-400 border-red-500/30 bg-red-500/5',
  Vision: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  Psychology: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
  Movement: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  Combat: 'text-orange-400 border-orange-500/30 bg-orange-500/5'
};

export const TeamManager: React.FC<TeamManagerProps> = ({ 
  teamMembers, onAddMember, onDeleteMember, onSelectMember, activeMemberId 
}) => {
  const [activeRoleFilter, setActiveRoleFilter] = useState<PersonnelRole | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<PersonnelRole>('Athlete');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => activeRoleFilter === 'All' || m.role === activeRoleFilter);
  }, [teamMembers, activeRoleFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember({ name, role, specialty, bio });
    setName('');
    setRole('Athlete');
    setSpecialty('');
    setBio('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Team Command</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Manage elemental personnel and specialists</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs tracking-widest"
        >
          Register Personnel
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {['All', 'Coach', 'Athlete', 'Medical', 'Vision', 'Psychology', 'Movement', 'Combat'].map((r) => (
          <button
            key={r}
            onClick={() => setActiveRoleFilter(r as any)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
              activeRoleFilter === r 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map(member => (
          <div 
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className={`group relative p-1 rounded-[2.5rem] transition-all duration-300 ${activeMemberId === member.id ? 'bg-gradient-to-br from-blue-600 to-indigo-600 scale-[1.02] shadow-2xl' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <div className="bg-slate-900 rounded-[2.3rem] p-6 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 flex-shrink-0">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-xl">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black italic uppercase text-white tracking-tight truncate">{member.name}</h3>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block mt-1 ${ROLE_COLORS[member.role]}`}>
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">Specialization</p>
                  <p className="text-slate-300 font-bold text-xs uppercase tracking-tight">{member.specialty || 'Generalist'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">Brief</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 italic">{member.bio || 'No intelligence briefing recorded.'}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                <div className="text-[8px] font-black uppercase text-slate-600 tracking-widest">
                  Archived {new Date(member.joinedAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm(`Remove ${member.name} from Command?`)) onDeleteMember(member.id);
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
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">Personnel Uplink</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Register a new specialist unit</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Member Name</label>
                <input 
                  required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Elias Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Unit Role</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value as PersonnelRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none"
                  >
                    {['Coach', 'Athlete', 'Medical', 'Vision', 'Psychology', 'Movement', 'Combat'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Primary Specialty</label>
                  <input 
                    value={specialty} onChange={e => setSpecialty(e.target.value)}
                    placeholder="e.g. Biomechanics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Intelligence Briefing (Bio)</label>
                <textarea 
                  value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Operational background and expertise..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white h-32 resize-none outline-none focus:ring-2 focus:ring-blue-600/50 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-black uppercase italic border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all">Abort</button>
              <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95">Archiving Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

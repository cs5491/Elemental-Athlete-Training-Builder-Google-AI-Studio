
import React, { useState, useMemo } from 'react';
import { WellnessLog, Athlete, Question, Questionnaire, QuestionnaireAssignment } from '../types';
import { INITIAL_QUESTIONS, QUESTION_CATEGORIES } from '../constants';

interface WellnessTrackerProps {
  athlete: Athlete | null;
  athletes: Athlete[];
  onSave: (log: Omit<WellnessLog, 'id'>) => void;
  onSelectAthlete: (id: string) => void;
  logs: WellnessLog[];
  onSaveQuestionnaire: (q: Questionnaire) => void;
  onAssignQuestionnaire: (a: QuestionnaireAssignment) => void;
  questionnaires: Questionnaire[];
}

export const WellnessTracker: React.FC<WellnessTrackerProps> = ({ 
  athlete, 
  athletes,
  onSave, 
  onSelectAthlete,
  logs,
  onSaveQuestionnaire,
  onAssignQuestionnaire,
  questionnaires
}) => {
  const [activeView, setActiveView] = useState<'log' | 'architect'>('log');
  
  // Architect State
  const [qSearch, setQSearch] = useState('');
  const [qCategory, setQCategory] = useState<string>('All');
  const [stagedQuestions, setStagedQuestions] = useState<string[]>([]);
  const [protoName, setProtoName] = useState('');
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  // Assignment Modal State
  const [assignTarget, setAssignTarget] = useState<'Individual' | 'Group' | 'All'>('Individual');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Log State
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [soreness, setSoreness] = useState(3);
  const [stress, setStress] = useState(4);
  const [fatigue, setFatigue] = useState(4);
  const [notes, setNotes] = useState('');

  const filteredQuestions = useMemo(() => {
    return INITIAL_QUESTIONS.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(qSearch.toLowerCase());
      const matchesCat = qCategory === 'All' || q.category === qCategory;
      return matchesSearch && matchesCat;
    });
  }, [qSearch, qCategory]);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete) return;
    onSave({
      athleteId: athlete.id,
      date: Date.now(),
      sleepHours,
      sleepQuality,
      soreness,
      stress,
      fatigue,
      notes
    });
    alert('Readiness logged. Visualizing metrics...');
  };

  const handleBuildProtocol = () => {
    if (!protoName || stagedQuestions.length === 0) return alert('Protocol must have a name and at least one question.');
    const newQ: Questionnaire = {
      id: Math.random().toString(36).substr(2, 9),
      name: protoName.toUpperCase(),
      description: `Tactical bio-metric scan: ${stagedQuestions.length} units.`,
      questionIds: stagedQuestions,
      createdAt: Date.now()
    };
    onSaveQuestionnaire(newQ);
    setProtoName('');
    setStagedQuestions([]);
    alert('Deployment Protocol Saved to Archive.');
  };

  const executeAssignment = () => {
    if (!isAssigning) return;
    onAssignQuestionnaire({
      id: Math.random().toString(36).substr(2, 9),
      questionnaireId: isAssigning,
      targetType: assignTarget,
      targetIds: assignTarget === 'All' ? athletes.map(a => a.id) : selectedIds,
      assignedAt: Date.now()
    });
    setIsAssigning(null);
    setSelectedIds([]);
    alert('Protocol Deployed to Target Units.');
  };

  const getMetricColor = (val: number, inverse = false) => {
    const score = inverse ? 11 - val : val;
    if (score >= 8) return 'text-emerald-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase text-white tracking-tighter leading-none italic">Bio-Readiness</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Nervous system & recovery monitoring</p>
        </div>
        <div className="bg-slate-900 p-1 rounded-2xl flex border border-slate-800 w-full md:w-auto shadow-xl">
          <button onClick={() => setActiveView('log')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'log' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Quick Log</button>
          <button onClick={() => setActiveView('architect')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'architect' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Architect</button>
        </div>
      </div>

      {activeView === 'log' && (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl animate-in slide-in-from-left-4 duration-500">
          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Active Unit Selection</label>
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Switch Subject for Data Entry</span>
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {athletes.map(a => {
                  const isActive = athlete?.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelectAthlete(a.id)}
                      className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-300 flex-shrink-0 ${
                        isActive 
                          ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/50 flex-shrink-0">
                        {a.avatarUrl ? <img src={a.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-500">{a.name.charAt(0)}</div>}
                      </div>
                      <div className="text-left">
                        <p className={`text-[11px] font-black uppercase tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-400'}`}>{a.name}</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">{a.sport}</p>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>
      )}

      {activeView === 'log' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {!athlete ? (
            <div className="lg:col-span-2 py-32 text-center border-4 border-dashed border-slate-800 rounded-[3rem] opacity-40">
              <h3 className="text-2xl font-black uppercase text-slate-500">Subject Required</h3>
              <p className="text-slate-600 italic">Select an athlete unit above to log readiness.</p>
            </div>
          ) : (
            <form onSubmit={handleLogSubmit} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl space-y-8 relative overflow-hidden animate-in fade-in duration-500">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-white tracking-tight">Tele-Metric Input: {athlete.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Capture core biological markers</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="group">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sleep Duration</label>
                        <span className="text-xl font-black text-blue-500">{sleepHours}H</span>
                      </div>
                      <input type="range" min="1" max="14" step="0.5" value={sleepHours} onChange={e => setSleepHours(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sleep Quality</label>
                        <span className={`text-xl font-black ${getMetricColor(sleepQuality)}`}>{sleepQuality}/10</span>
                      </div>
                      <input type="range" min="1" max="10" value={sleepQuality} onChange={e => setSleepQuality(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Fatigue</label>
                        <span className={`text-xl font-black ${getMetricColor(fatigue, true)}`}>{fatigue}/10</span>
                      </div>
                      <input type="range" min="1" max="10" value={fatigue} onChange={e => setFatigue(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Systemic Soreness</label>
                        <span className={`text-xl font-black ${getMetricColor(soreness, true)}`}>{soreness}/10</span>
                      </div>
                      <input type="range" min="1" max="10" value={soreness} onChange={e => setSoreness(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mental Stress</label>
                        <span className={`text-xl font-black ${getMetricColor(stress, true)}`}>{stress}/10</span>
                      </div>
                      <input type="range" min="1" max="10" value={stress} onChange={e => setStress(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-4">Readiness Intelligence</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Injuries, mood, dietary context..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all resize-none font-medium" />
                    </div>
                  </div>
               </div>

               <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-6 rounded-[2.5rem] transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-xs tracking-[0.3em] italic">
                  Sync Bio-Readiness Profile
               </button>
            </form>
          )}

          <div className="space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="text-xl font-black uppercase text-white mb-8 border-l-4 border-blue-600 pl-4 tracking-tight">Telemetry Log</h3>
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {logs.map((log, i) => (
                    <div key={i} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</span>
                        <div className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                          <span className="text-[10px] font-black text-slate-400">SCORE: </span>
                          <span className="text-[10px] font-black text-white italic">{((log.sleepQuality + (11-log.fatigue) + (11-log.soreness))/3).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <div className="px-2 py-1 bg-slate-900 rounded-lg text-[8px] font-black text-slate-500 uppercase border border-slate-800 group-hover:border-blue-900 transition-colors">Sleep {log.sleepHours}H</div>
                         <div className="px-2 py-1 bg-slate-900 rounded-lg text-[8px] font-black text-slate-500 uppercase border border-slate-800 group-hover:border-blue-900 transition-colors">Stress {log.stress}</div>
                         <div className="px-2 py-1 bg-slate-900 rounded-lg text-[8px] font-black text-slate-500 uppercase border border-slate-800 group-hover:border-blue-900 transition-colors">Fatigue {log.fatigue}</div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-48 opacity-20">
                        <svg className="w-12 h-12 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-600">No telemetry data archived</p>
                     </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Question Library Sidebar */}
          <aside className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl h-[700px] flex flex-col">
            <h3 className="text-xl font-black uppercase text-white mb-6 italic tracking-tighter">Bio-Metric Intel</h3>
            
            <div className="space-y-4 mb-6">
              <input 
                placeholder="Search metrics..."
                value={qSearch}
                onChange={e => setQSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-bold"
              />
              <div className="flex flex-wrap gap-1.5">
                {['All', ...QUESTION_CATEGORIES].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setQCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${qCategory === cat ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {filteredQuestions.map(q => {
                const isStaged = stagedQuestions.includes(q.id);
                return (
                  <button 
                    key={q.id}
                    onClick={() => setStagedQuestions(prev => isStaged ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center group ${isStaged ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-[11px] font-bold text-white leading-snug">{q.text}</p>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 block">{q.category}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all ${isStaged ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-700 group-hover:border-slate-500'}`}>
                       {isStaged ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Builder and Protocols */}
          <div className="lg:col-span-8 space-y-10">
             <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <h3 className="text-xl font-black uppercase text-white mb-8 italic tracking-tighter">Protocol Staging Area</h3>
                
                <div className="space-y-6">
                  <input 
                    placeholder="Protocol Identifier (e.g. MORNING_VITALS_A)"
                    value={protoName}
                    onChange={e => setProtoName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-xl font-black uppercase italic text-white outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                  />

                  <div className="min-h-[200px] border-2 border-dashed border-slate-800 rounded-[2.5rem] p-8 space-y-3">
                    {stagedQuestions.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center opacity-20">
                         <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                         <p className="text-xs font-black uppercase tracking-widest">Select metric units to begin synthesis</p>
                      </div>
                    ) : (
                      stagedQuestions.map((id, idx) => {
                        const q = INITIAL_QUESTIONS.find(item => item.id === id);
                        return (
                          <div key={id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-left-2 transition-all hover:border-slate-700">
                             <span className="text-blue-500 font-black italic">0{idx + 1}</span>
                             <p className="flex-1 text-sm font-bold text-slate-200">{q?.text}</p>
                             <button onClick={() => setStagedQuestions(prev => prev.filter(i => i !== id))} className="text-slate-700 hover:text-red-500">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button 
                    onClick={handleBuildProtocol}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic rounded-3xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-[11px] tracking-[0.4em]"
                  >
                    Commit Deployment Protocol
                  </button>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-xl font-black uppercase text-white italic tracking-tighter">Mission Protocols (Archive)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {questionnaires.map(q => (
                    <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-xl group">
                       <div>
                         <h4 className="text-lg font-black uppercase italic text-white mb-2 group-hover:text-blue-400 transition-colors">{q.name}</h4>
                         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">{q.questionIds.length} Metrics Integrated</p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setIsAssigning(q.id)} className="flex-1 py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-black uppercase italic rounded-xl transition-all text-[9px] tracking-widest border border-blue-500/20">Deploy Units</button>
                          <button className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                       </div>
                    </div>
                  ))}
                  {questionnaires.length === 0 && (
                    <div className="col-span-full py-12 text-center opacity-30 italic font-bold uppercase text-slate-600">No custom protocols archived.</div>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {isAssigning && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Deploy Protocol</h3>
               <button onClick={() => setIsAssigning(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>

             <div className="space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Configuration</label>
                   <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      {(['Individual', 'Group', 'All'] as const).map(type => (
                        <button 
                          key={type} 
                          onClick={() => { setAssignTarget(type); setSelectedIds([]); }}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${assignTarget === type ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                   {assignTarget === 'All' ? (
                     <div className="py-12 text-center bg-blue-600/5 border border-dashed border-blue-500/20 rounded-3xl">
                        <p className="text-blue-400 font-black uppercase italic tracking-widest">Global Fleet Deployment Active</p>
                        <p className="text-xs text-slate-500 mt-2">Protocol will be assigned to all {athletes.length} archived subjects.</p>
                     </div>
                   ) : assignTarget === 'Individual' ? (
                     athletes.map(a => {
                       const isSelected = selectedIds.includes(a.id);
                       return (
                        <button 
                          key={a.id}
                          onClick={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== a.id) : [...prev, a.id])}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-600'}`}>{a.name.charAt(0)}</div>
                           <div className="flex-1 text-left">
                              <p className="text-sm font-black uppercase text-white leading-none">{a.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">{a.sport}</p>
                           </div>
                           {isSelected && <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                       );
                     })
                   ) : (
                     <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl opacity-40">
                        <p className="text-xs font-black uppercase text-slate-500">Group Metadata Not Loaded</p>
                     </div>
                   )}
                </div>

                <button 
                  onClick={executeAssignment}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic rounded-3xl shadow-2xl shadow-blue-600/20 transition-all text-xs tracking-[0.3em]"
                >
                  Finalize Mission Deployment
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

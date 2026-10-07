
import React from 'react';
import { Mesocycle, Microcycle } from '../types';

interface MesocycleLibraryProps {
  mesocycles: Mesocycle[];
  microcycles: Microcycle[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (meso: Mesocycle) => void;
}

export const MesocycleLibrary: React.FC<MesocycleLibraryProps> = ({
  mesocycles,
  microcycles,
  onAdd,
  onDelete,
  onEdit
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Mesocycle Library</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Strategic multi-week progression blocks</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic px-6 py-3 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Build Mesocycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {mesocycles.map(meso => (
          <div key={meso.id} className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -mr-8 -mt-8"></div>
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest border border-slate-700">
                  {meso.microcycleIds.length} Week Block
                </span>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(meso)} className="p-2 text-slate-600 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => confirm('Delete this mesocycle block?') && onDelete(meso.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter group-hover:text-indigo-400 transition-colors">
                {meso.name}
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-2">
                {meso.description}
              </p>

              <div className="space-y-2 mb-8">
                {meso.microcycleIds.map((microId, idx) => {
                  const micro = microcycles.find(m => m.id === microId);
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] font-black text-indigo-500">W{idx + 1}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase truncate">
                        {micro?.name || 'Microcycle Deleted'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-black uppercase italic rounded-2xl transition-all text-xs tracking-widest border border-indigo-500/30">
              Commit Mesocycle
            </button>
          </div>
        ))}

        {mesocycles.length === 0 && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-800 rounded-[3rem]">
            <p className="text-slate-700 font-black uppercase italic tracking-[0.2em] text-2xl">Mesocycle Library Empty</p>
            <p className="text-slate-600 text-sm mt-4 italic font-medium">Combine multiple microcycles into a long-term mesocycle block.</p>
          </div>
        )}
      </div>
    </div>
  );
};

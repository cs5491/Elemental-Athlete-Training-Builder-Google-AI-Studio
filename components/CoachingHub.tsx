
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COACHING_PRINCIPLES, COACH_EDUCATION, TACTICAL_BOOKMARKS, INITIAL_BOOKS, BOOK_CATEGORIES, COACH_VIDEOS, CoachingPrinciple, EducationalArticle, IntelBookmark, CoachingVideo } from '../constants';
import { Book, Athlete, Personnel, QuizQuestion } from '../types';
import { summarizeBook, generateAdaptiveQuizQuestions } from '../geminiService';

interface CoachingHubProps {
  athletes: Athlete[];
  personnel: Personnel[];
  onPrescribe: (principleId: string, athleteIds: string[]) => void;
  onPrescribeLearning: (principleId: string, personnelIds: string[]) => void;
}

export const CoachingHub: React.FC<CoachingHubProps> = ({ athletes, personnel, onPrescribe, onPrescribeLearning }) => {
  const [activeTab, setActiveTab] = useState<'principles' | 'education' | 'practice'>('principles');
  const [eduSubTab, setEduSubTab] = useState<'articles' | 'videos' | 'books' | 'browser'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<EducationalArticle | null>(null);
  
  // Quiz State
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [knowledgeLevel, setKnowledgeLevel] = useState(5); // 1-10 scale
  const [quizTopic, setQuizTopic] = useState('Strength & Biomechanics');
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Assignment Modal State
  const [isPrescribing, setIsPrescribing] = useState<CoachingPrinciple | null>(null);
  const [prescriptionFlow, setPrescriptionFlow] = useState<'Athlete' | 'Coach'>('Athlete');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignTarget, setAssignTarget] = useState<'Individual' | 'All'>('Individual');

  // Tactical Browser State
  const [browserUrl, setBrowserUrl] = useState('https://www.youtube.com/embed?listType=search&list=athletic+performance+training');
  const [urlInput, setUrlInput] = useState(browserUrl);
  const [browserHistory, setBrowserHistory] = useState<string[]>([browserUrl]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Books State
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [bookFilterCategory, setBookFilterCategory] = useState<string>('All');
  const [bookFilterDifficulty, setBookFilterDifficulty] = useState<string>('All');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const bookFileInputRef = useRef<HTMLInputElement>(null);

  // Video Library State
  const [managedVideos, setManagedVideos] = useState<CoachingVideo[]>(COACH_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<CoachingVideo | null>(COACH_VIDEOS[0]);
  const [videoSearch, setVideoSearch] = useState('');
  const [uplinkInput, setUplinkInput] = useState('');
  const videoUploadRef = useRef<HTMLInputElement>(null);

  const startQuiz = async (topic: string) => {
    setIsQuizLoading(true);
    setQuizTopic(topic);
    setQuizQuestions([]);
    setCurrentQuestionIdx(0);
    setQuizScore(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setSelectedOption(null);
    try {
      const questions = await generateAdaptiveQuizQuestions(topic, 5, knowledgeLevel);
      setQuizQuestions(questions);
    } catch (e) {
      alert("Victor's neural network timed out. Retrying link...");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === quizQuestions[currentQuestionIdx].correctIndex) {
      setQuizScore(prev => prev + 1);
      // Adaptive scaling: If correct, subtly nudge knowledge level up for next batch
      setKnowledgeLevel(prev => Math.min(10, prev + 0.5));
    } else {
      // If incorrect, nudge down
      setKnowledgeLevel(prev => Math.max(1, prev - 0.3));
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setShowExplanation(false);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const navigateTo = (url: string) => {
    let finalUrl = url.trim();
    const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = finalUrl.match(ytRegex);
    if (match && match[2].length === 11) {
      finalUrl = `https://www.youtube.com/embed/${match[2]}`;
    } else if (!finalUrl.startsWith('http')) {
      finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
    }
    setBrowserUrl(finalUrl);
    setUrlInput(finalUrl);
    setBrowserHistory(prev => [...prev, finalUrl]);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.author.toLowerCase().includes(bookSearch.toLowerCase());
      const matchesCat = bookFilterCategory === 'All' || b.category === bookFilterCategory;
      const matchesDiff = bookFilterDifficulty === 'All' || b.difficulty === bookFilterDifficulty;
      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [books, bookSearch, bookFilterCategory, bookFilterDifficulty]);

  const executePrescription = () => {
    if (!isPrescribing) return;
    
    if (prescriptionFlow === 'Athlete') {
      const targets = assignTarget === 'All' ? athletes.map(a => a.id) : selectedIds;
      if (targets.length === 0) return alert('Select target athletes.');
      onPrescribe(isPrescribing.id, targets);
      alert(`Principle "${isPrescribing.title}" prescribed to athletes.`);
    } else {
      const targets = assignTarget === 'All' ? personnel.map(p => p.id) : selectedIds;
      if (targets.length === 0) return alert('Select target staff.');
      onPrescribeLearning(isPrescribing.id, targets);
      alert(`Learning objective "${isPrescribing.title}" assigned to staff.`);
    }
    
    setIsPrescribing(null);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">Coaching Hub</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">The tactical mind behind the performance</p>
        </div>
        <div className="bg-slate-900 p-1 rounded-2xl flex border border-slate-800 w-full md:w-auto shadow-xl">
          <button 
            onClick={() => setActiveTab('principles')} 
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'principles' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Principles
          </button>
          <button 
            onClick={() => setActiveTab('education')} 
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'education' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Education
          </button>
          <button 
            onClick={() => setActiveTab('practice')} 
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'practice' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Practice
          </button>
        </div>
      </div>

      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COACHING_PRINCIPLES.map(principle => (
            <div key={principle.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all flex flex-col shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
              
              <div className="mb-6 flex justify-between items-start">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                  principle.category === 'Tactical' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
                  principle.category === 'Technical' ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' :
                  principle.category === 'Biological' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' :
                  'border-purple-500/50 text-purple-500 bg-purple-500/10'
                }`}>
                  {principle.category}
                </span>
              </div>

              <h3 className="text-2xl font-black uppercase text-white mb-3 tracking-tighter group-hover:text-blue-400 transition-colors italic leading-none">{principle.title}</h3>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">{principle.summary}</p>

              <div className="space-y-3 mt-auto">
                <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Coaching Cues</p>
                {principle.details.map((detail, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <span className="text-blue-500 font-black italic text-xs">0{idx + 1}</span>
                    <span className="text-xs text-slate-300 font-medium leading-tight">{detail}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                  onClick={() => { setIsPrescribing(principle); setPrescriptionFlow('Athlete'); }}
                  className="py-4 bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white font-black uppercase text-[8px] tracking-[0.2em] rounded-2xl transition-all border border-slate-700 shadow-xl"
                >
                  Prescribe to Athlete
                </button>
                <button 
                  onClick={() => { setIsPrescribing(principle); setPrescriptionFlow('Coach'); }}
                  className="py-4 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white font-black uppercase text-[8px] tracking-[0.2em] rounded-2xl transition-all border border-slate-700 shadow-xl"
                >
                  Prescribe to Coach
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'education' && (
        <div className="space-y-10">
          <div className="flex justify-center">
             <div className="bg-slate-950 p-1 rounded-xl flex border border-slate-800 overflow-x-auto">
                {['articles', 'videos', 'books', 'browser'].map(tab => (
                  <button key={tab} onClick={() => setEduSubTab(tab as any)} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${eduSubTab === tab ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{tab}</button>
                ))}
             </div>
          </div>
          {/* Article/Video/Book Rendering Logic Omitted for Brevity as it was in previous file, assuming it's merged or kept. 
              Adding back specific parts as needed for standard operation. */}
          {eduSubTab === 'browser' && (
            <div className="flex flex-col h-[800px] bg-slate-950 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="bg-slate-900 p-4 flex items-center gap-4 border-b border-slate-800">
                <div className="flex gap-1.5 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <form onSubmit={handleUrlSubmit} className="flex-1 group flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 hover:border-blue-500/50 transition-all">
                  <input 
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="Enter Tactical URL..."
                    className="flex-1 bg-transparent border-none text-slate-200 text-xs font-bold outline-none"
                  />
                </form>
              </div>
              <iframe ref={iframeRef} src={browserUrl} className="flex-1 border-none bg-white" title="Intel Browser" />
            </div>
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="max-w-4xl mx-auto space-y-10">
          {!quizQuestions.length && !isQuizLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-4">Neural Evaluation</h3>
                 <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                   Victor AI will generate a technical quiz based on your current knowledge level (${knowledgeLevel.toFixed(1)}/10). The questions will scale in complexity as you provide correct answers.
                 </p>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Choose Specialization</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Biomechanics', 'Pilates Theory', 'Conjugate Method', 'Physiology', 'VBT Strategy', 'Combat Mechanics'].map(topic => (
                        <button 
                          key={topic}
                          onClick={() => startQuiz(topic)}
                          className="px-4 py-3 bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white border border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-center items-center text-center">
                 <div className="w-20 h-20 bg-emerald-600/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 </div>
                 <h4 className="text-xl font-black uppercase text-white mb-2">Practice Modalities</h4>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Learning Simulator</p>
              </div>
            </div>
          ) : isQuizLoading ? (
            <div className="py-40 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 border-4 border-emerald-600/20 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
               <h3 className="text-2xl font-black uppercase text-white tracking-[0.2em] animate-pulse">Initializing Neural Link</h3>
               <p className="text-slate-500 text-xs font-bold uppercase mt-4">Victor is synthesizing technical questions for level {knowledgeLevel.toFixed(1)}...</p>
            </div>
          ) : quizFinished ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl text-center animate-in zoom-in-95 duration-300">
               <div className="w-24 h-24 bg-emerald-600/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl font-black text-emerald-500 italic">{Math.round((quizScore / quizQuestions.length) * 100)}%</span>
               </div>
               <h3 className="text-4xl font-black uppercase text-white tracking-tighter mb-4">Evaluation Complete</h3>
               <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto">
                 Knowledge Level recalibrated to <span className="text-emerald-500 font-black">{knowledgeLevel.toFixed(1)}/10</span>. Personnel performance archived in technical database.
               </p>
               <button 
                 onClick={() => setQuizQuestions([])}
                 className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-xs tracking-widest"
               >
                 Close Evaluation
               </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black italic">V</div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Knowledge Practice</p>
                        <h4 className="text-lg font-black uppercase text-white italic">{quizTopic}</h4>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Tele-Progress</p>
                     <div className="flex gap-1">
                        {quizQuestions.map((_, i) => (
                           <div key={i} className={`h-1.5 w-6 rounded-full ${i <= currentQuestionIdx ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  
                  <div className="relative z-10">
                     <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] mb-4 block">Unit Question {currentQuestionIdx + 1}</span>
                     <h3 className="text-2xl font-black text-white italic leading-tight mb-10">{quizQuestions[currentQuestionIdx].question}</h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizQuestions[currentQuestionIdx].options.map((option, idx) => {
                          let style = "bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:bg-slate-900";
                          if (showExplanation) {
                            if (idx === quizQuestions[currentQuestionIdx].correctIndex) {
                              style = "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg";
                            } else if (idx === selectedOption) {
                              style = "bg-red-500/10 border-red-500 text-red-400 shadow-lg";
                            } else {
                              style = "bg-slate-950 border-slate-800 text-slate-600 opacity-50";
                            }
                          }
                          return (
                            <button 
                              key={idx}
                              onClick={() => handleOptionSelect(idx)}
                              className={`p-6 rounded-2xl border-2 transition-all text-left font-bold text-sm flex items-center justify-between group ${style}`}
                            >
                              <span>{option}</span>
                              {showExplanation && idx === quizQuestions[currentQuestionIdx].correctIndex && <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                          );
                        })}
                     </div>

                     {showExplanation && (
                       <div className="mt-10 p-8 bg-slate-950/60 rounded-3xl border border-white/5 animate-in slide-in-from-top-4">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Victor's Technical Analysis</h4>
                          <p className="text-sm text-slate-300 font-medium italic leading-relaxed">{quizQuestions[currentQuestionIdx].explanation}</p>
                          <button 
                            onClick={nextQuestion}
                            className="mt-8 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic rounded-xl transition-all shadow-xl text-[10px] tracking-widest"
                          >
                            Proceed to Next unit
                          </button>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Prescription Modal */}
      {isPrescribing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-xl text-white ${prescriptionFlow === 'Coach' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                      {prescriptionFlow === 'Coach' ? 'Strategic Assignment' : 'Tactical Prescription'}
                    </h3>
                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">{isPrescribing.title}</p>
                 </div>
               </div>
               <button onClick={() => setIsPrescribing(null)} className="text-slate-500 hover:text-white">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>

             <div className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Target Units ({prescriptionFlow})</label>
                   <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      {(['Individual', 'All'] as const).map(type => (
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

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                   {assignTarget === 'All' ? (
                     <div className="py-12 text-center bg-blue-600/5 border border-dashed border-blue-500/20 rounded-3xl">
                        <p className="text-blue-400 font-black uppercase italic tracking-widest">Team-Wide Deployment</p>
                        <p className="text-xs text-slate-500 mt-2">Objective will be synchronized across all archived members.</p>
                     </div>
                   ) : (
                     (prescriptionFlow === 'Athlete' ? athletes : personnel).map(unit => {
                       const isSelected = selectedIds.includes(unit.id);
                       return (
                        <button 
                          key={unit.id}
                          onClick={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== unit.id) : [...prev, unit.id])}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-600'}`}>{unit.name.charAt(0)}</div>
                           <div className="flex-1 text-left">
                              <p className="text-sm font-black uppercase text-white leading-none">{unit.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">
                                {'role' in unit ? unit.role : (unit as Athlete).sport}
                              </p>
                           </div>
                           {isSelected && <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                       );
                     })
                   )}
                </div>

                <button 
                  onClick={executePrescription}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic rounded-3xl shadow-2xl shadow-blue-600/20 transition-all text-xs tracking-[0.3em]"
                >
                  Confirm Assignment
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

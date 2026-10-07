
import React, { useState, useRef, useEffect } from 'react';
import { Exercise, Equipment, MovementPattern, Difficulty, ExerciseAssociation, EquipmentPiece, GeneralEquipment } from '../types';
import { CATEGORIES } from '../constants';
import { generateExerciseProfile } from '../geminiService';
import { GoogleGenAI } from "@google/genai";

const ListManagerModal: React.FC<{
  title: string;
  items: string[];
  onUpdate: (items: string[]) => void;
  onClose: () => void;
}> = ({ title, items, onUpdate, onClose }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onUpdate([...items, newItem.trim()].sort());
      setNewItem('');
    }
  };

  const removeItem = (item: string) => {
    if (confirm(`Remove "${item}" from tactical database?`)) {
      onUpdate(items.filter(i => i !== item));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase text-white tracking-tighter italic">{title} Manager</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {items.map(item => (
            <div key={item} className="flex justify-between items-center bg-slate-850 border border-slate-800 p-3 rounded-xl group">
              <span className="text-xs font-bold text-slate-200 uppercase">{item}</span>
              <button onClick={() => removeItem(item)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add new item..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600/50"
          />
          <button onClick={addItem} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Add</button>
        </div>
      </div>
    </div>
  );
};

const TagManager: React.FC<{
  tags: string[];
  onUpdate: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}> = ({ tags = [], onUpdate, label, placeholder = "Add Tag..." }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim().toUpperCase())) {
      onUpdate([...tags, input.trim().toUpperCase()]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">{label}</label>}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-slate-800 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded border border-slate-700">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none focus:border-blue-500/50 w-full"
        />
        <button type="button" onClick={addTag} className="px-3 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">+</button>
      </div>
    </div>
  );
};

interface ExerciseCreatorProps {
  onSave: (ex: Exercise) => void;
  onCancel: () => void;
  generalEquipmentList: GeneralEquipment[];
  onAddGeneralEquipmentType: (type: string, imageUrl?: string) => void;
  onUpdateGeneralEquipment: (oldName: string, updated: GeneralEquipment) => void;
  equipmentLibrary: EquipmentPiece[];
  onRegisterEquipment: (piece: Omit<EquipmentPiece, 'id'>) => void;
  muscleGroups: string[]; setMuscleGroups: (l: string[]) => void;
  difficultyLevels: string[]; setDifficultyLevels: (l: string[]) => void;
  movementPatterns: string[]; setMovementPatterns: (l: string[]) => void;
  exerciseAssociations: string[]; setExerciseAssociations: (l: string[]) => void;
}

const CustomVideoPlayer: React.FC<{ url: string, onError?: () => void }> = ({ url, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => {
        console.error("Playback failed", e);
        if (onError) onError();
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / (total || 1)) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.volume = volume;
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (videoRef.current && duration) {
      const seekTo = (val / 100) * duration;
      videoRef.current.currentTime = seekTo;
      setProgress(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative group w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={url}
        key={url}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => onError && onError()}
        muted={isMuted}
        loop={isLooping}
        playsInline
        preload="metadata"
      />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${(!isPlaying || isHovered) ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="w-10 h-10 bg-blue-600/80 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm pointer-events-auto transition-transform hover:scale-110 active:scale-95"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
      </div>
      <div className={`absolute inset-x-0 bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 p-2 transition-transform duration-300 ${ (isHovered || !isPlaying) ? 'translate-y-0' : 'translate-y-full' }`}>
        <div className="relative w-full h-0.5 bg-slate-700/50 rounded-full mb-2 group/scrubber cursor-pointer">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleScrub}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <div className="flex items-center gap-1.5 group/volume">
              <button onClick={toggleMute} className={`transition-colors p-0.5 ${isMuted || volume === 0 ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}>
                {renderVolumeIcon()}
              </button>
              <div className="w-0 group-hover/volume:w-12 overflow-hidden transition-all duration-300 h-4 flex items-center">
                <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-12 h-0.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
              </div>
            </div>
            <span className="text-[8px] font-mono text-slate-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExerciseCreator: React.FC<ExerciseCreatorProps> = ({ 
  onSave, onCancel, generalEquipmentList, onAddGeneralEquipmentType, onUpdateGeneralEquipment, equipmentLibrary, onRegisterEquipment,
  muscleGroups, setMuscleGroups, difficultyLevels, setDifficultyLevels, movementPatterns, setMovementPatterns, exerciseAssociations, setExerciseAssociations
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exercise['category']>('Strength');
  const [association, setAssociation] = useState<string>(exerciseAssociations[0] || 'Traditional');
  const [primaryMuscle, setPrimaryMuscle] = useState(muscleGroups[0] || 'Full Body');
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<Equipment>('Barbell');
  const [exerciseTags, setExerciseTags] = useState<string[]>([]);
  const [isGeneralDropdownOpen, setIsGeneralDropdownOpen] = useState(false);
  const [specificEquipmentId, setSpecificEquipmentId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>(difficultyLevels[0] || 'Intermediate');
  const [movementPattern, setMovementPattern] = useState<string>(movementPatterns[0] || 'Squat');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [setupUrl, setSetupUrl] = useState<string>('');
  const [finishUrl, setFinishUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualProgress, setVisualProgress] = useState('');
  const [showAiInsight, setShowAiInsight] = useState(false);

  // Management State
  const [activeListManager, setActiveListManager] = useState<null | 'Muscles' | 'Levels' | 'Moves' | 'Associations'>(null);

  // New Equipment Management States
  const [isAddingGeneralGear, setIsAddingGeneralGear] = useState(false);
  const [editingGeneralGear, setEditingGeneralGear] = useState<GeneralEquipment | null>(null);
  const [newGeneralGearInput, setNewGeneralGearInput] = useState('');
  const [newGeneralGearImage, setNewGeneralGearImage] = useState<string | undefined>(undefined);
  const [isRegisteringSpecificGear, setIsRegisteringSpecificGear] = useState(false);
  const [newSpecGearName, setNewSpecGearName] = useState('');
  const [newSpecGearManufacturer, setNewSpecGearManufacturer] = useState('');
  const [newSpecGearCategory, setNewSpecGearCategory] = useState<string>('Barbell');
  const [newSpecGearImage, setNewSpecGearImage] = useState<string | undefined>(undefined);
  const [newSpecGearVideo, setNewSpecGearVideo] = useState<string | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setupInputRef = useRef<HTMLInputElement>(null);
  const finishInputRef = useRef<HTMLInputElement>(null);
  const specGearImageRef = useRef<HTMLInputElement>(null);
  const specGearVideoRef = useRef<HTMLInputElement>(null);
  const generalGearImageRef = useRef<HTMLInputElement>(null);
  const generalDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (generalDropdownRef.current && !generalDropdownRef.current.contains(event.target as Node)) {
        setIsGeneralDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, typeSetter?: (type: 'image' | 'video') => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setter(result);
      if (typeSetter) {
        typeSetter(file.type.startsWith('video') ? 'video' : 'image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!name.trim()) return alert('Please enter an exercise name for AI analysis.');
    setIsGenerating(true);
    setShowAiInsight(false);
    try {
      const profile = await generateExerciseProfile(name);
      if (profile.category) setCategory(profile.category as Exercise['category']);
      if (profile.primaryMuscle) setPrimaryMuscle(profile.primaryMuscle);
      if (profile.secondaryMuscles) setSecondaryMuscles(profile.secondaryMuscles);
      if (profile.equipment) setEquipment(profile.equipment as Equipment);
      if (profile.difficulty) setDifficulty(profile.difficulty as Difficulty);
      if (profile.movementPattern) setMovementPattern(profile.movementPattern as MovementPattern);
      if (profile.description) {
        setDescription(profile.description);
        setShowAiInsight(true);
      }
      if (profile.instructions) setInstructions(profile.instructions);
    } catch (error) {
      console.error('Error generating exercise profile:', error);
      alert('Failed to generate exercise profile. Please try manual entry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIVisualize = async () => {
    if (!name.trim()) return alert('Name the exercise first.');
    
    // Check for API key presence
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsVisualizing(true);
    setVisualProgress('Victor is initializing biomechanical simulation...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A professional athlete performing a high-quality technical ${name} in a clean, modern gym environment. Focused, biomechanically correct form. Cinematic lighting.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setVisualProgress('Synthesizing motion frames...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      setVisualProgress('Finalizing deployment...');
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaUrl(reader.result as string);
          setMediaType('video');
          setIsVisualizing(false);
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('AI visualization error:', error);
      alert('Simulation failed. Check API balance or try manual upload.');
      setIsVisualizing(false);
    }
  };

  const handleCommitGeneralGear = () => {
    if (!newGeneralGearInput.trim()) return;
    if (editingGeneralGear) {
      onUpdateGeneralEquipment(editingGeneralGear.name, { name: newGeneralGearInput.trim(), imageUrl: newGeneralGearImage });
      setEditingGeneralGear(null);
    } else {
      onAddGeneralEquipmentType(newGeneralGearInput.trim(), newGeneralGearImage);
    }
    setEquipment(newGeneralGearInput.trim());
    setNewGeneralGearInput('');
    setNewGeneralGearImage(undefined);
    setIsAddingGeneralGear(false);
  };

  const handleStartEditGeneral = (e: React.MouseEvent, type: GeneralEquipment) => {
    e.stopPropagation();
    setEditingGeneralGear(type);
    setNewGeneralGearInput(type.name);
    setNewGeneralGearImage(type.imageUrl);
    setIsAddingGeneralGear(true);
    setIsGeneralDropdownOpen(false);
  };

  const handleCommitSpecificGear = () => {
    if (!newSpecGearName || !newSpecGearManufacturer) return alert('Name and Manufacturer required.');
    onRegisterEquipment({
      name: newSpecGearName,
      manufacturer: newSpecGearManufacturer,
      category: newSpecGearCategory,
      imageUrl: newSpecGearImage,
      videoUrl: newSpecGearVideo
    });
    setNewSpecGearName('');
    setNewSpecGearManufacturer('');
    setNewSpecGearImage(undefined);
    setNewSpecGearVideo(undefined);
    setIsRegisteringSpecificGear(false);
  };

  const handleSave = () => {
    if (!name || !primaryMuscle) return alert('Name and Primary Muscle are required.');
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      association: association as any,
      primaryMuscle,
      secondaryMuscles,
      equipment,
      specificEquipmentId: specificEquipmentId || undefined,
      difficulty: difficulty as any,
      movementPattern: movementPattern as any,
      instructions: instructions.filter(i => i.trim() !== ''),
      videoUrl: '', // Legacy support
      mediaUrl,
      mediaType,
      setupImageUrl: setupUrl,
      finishImageUrl: finishUrl,
      description,
      tags: exerciseTags
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Drill Architect</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Visual Asset Deployment Manager</p>
          </div>
          <button onClick={onCancel} className="p-1.5 text-slate-500 hover:text-white">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-1.5">Exercise Name</label>
                  <div className="flex gap-2">
                    <input 
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Zercher Squat"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {isGenerating ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    </button>
                  </div>
                </div>
                <TagManager tags={exerciseTags} onUpdate={setExerciseTags} label="Classification Tags" />
              </div>

              {showAiInsight && description && (
                <div className="bg-indigo-600/10 border border-indigo-500/30 p-5 rounded-2xl animate-in slide-in-from-top-2 duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Victor's Neural Analysis</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Tactical Purpose & Benefits:</p>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed italic">{description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value as Exercise['category'])} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Association</label>
                    <button type="button" onClick={() => setActiveListManager('Associations')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                  </div>
                  <select value={association} onChange={e => setAssociation(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none">
                    {exerciseAssociations.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Muscle</label>
                    <button type="button" onClick={() => setActiveListManager('Muscles')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                  </div>
                  <select 
                    value={primaryMuscle} 
                    onChange={e => setPrimaryMuscle(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none"
                  >
                    {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Difficulty</label>
                    <button type="button" onClick={() => setActiveListManager('Levels')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                  </div>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none">
                    {difficultyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">General Equipment</label>
                    <button type="button" onClick={() => { setIsAddingGeneralGear(!isAddingGeneralGear); setEditingGeneralGear(null); setNewGeneralGearInput(''); setNewGeneralGearImage(undefined); }} className="text-[8px] font-black uppercase text-blue-500 hover:text-white">
                      {isAddingGeneralGear ? 'Cancel' : '+ New'}
                    </button>
                  </div>
                  {isAddingGeneralGear ? (
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-2 animate-in slide-in-from-top-1">
                       <input 
                         autoFocus value={newGeneralGearInput} onChange={e => setNewGeneralGearInput(e.target.value)}
                         placeholder="Category Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-white outline-none"
                       />
                       <div className="flex gap-1">
                         <button 
                          type="button"
                          onClick={() => generalGearImageRef.current?.click()}
                          className={`flex-1 py-1 rounded font-black uppercase text-[7px] border transition-all ${newGeneralGearImage ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                         >
                           {newGeneralGearImage ? 'Photo Attached' : 'Add Photo'}
                         </button>
                         <input type="file" ref={generalGearImageRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, setNewGeneralGearImage)} />
                         <button type="button" onClick={handleCommitGeneralGear} className="bg-blue-600 px-2 rounded-lg text-white"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></button>
                       </div>
                    </div>
                  ) : (
                    <div className="relative" ref={generalDropdownRef}>
                      <button 
                        type="button"
                        onClick={() => setIsGeneralDropdownOpen(!isGeneralDropdownOpen)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none flex items-center justify-between transition-all hover:border-slate-600 shadow-md group"
                      >
                        <div className="flex items-center gap-2">
                          {(() => {
                            const selected = generalEquipmentList.find(g => g.name === equipment);
                            return selected?.imageUrl ? (
                              <img src={selected.imageUrl} className="w-7 h-7 rounded-lg object-cover border border-slate-700/50 transition-transform group-hover:scale-110" alt="" />
                            ) : null;
                          })()}
                          <span className="truncate max-w-[100px]">{equipment}</span>
                        </div>
                        <svg className={`w-3 h-3 text-slate-500 transition-transform ${isGeneralDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isGeneralDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-[100] max-h-[250px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                          {generalEquipmentList.map(type => (
                            <div 
                              key={type.name}
                              className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group/item ${equipment === type.name ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                              onClick={() => { setEquipment(type.name); setIsGeneralDropdownOpen(false); }}
                            >
                              <div className="flex items-center gap-3 truncate">
                                <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                                  {type.imageUrl ? (
                                    <img src={type.imageUrl} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-slate-800">?</div>
                                  )}
                                </div>
                                <span className="truncate">{type.name}</span>
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => handleStartEditGeneral(e, type)}
                                className="p-2 opacity-0 group-hover/item:opacity-100 bg-slate-900/50 rounded-lg hover:text-blue-400 transition-all border border-slate-700"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Specific Piece</label>
                    <button type="button" onClick={() => setIsRegisteringSpecificGear(!isRegisteringSpecificGear)} className="text-[8px] font-black uppercase text-blue-500 hover:text-white">
                      {isRegisteringSpecificGear ? 'Cancel' : '+ New'}
                    </button>
                  </div>
                  {isRegisteringSpecificGear ? (
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-2 animate-in slide-in-from-top-1">
                       <input value={newSpecGearName} onChange={e => setNewSpecGearName(e.target.value)} placeholder="Equipment Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[9px] text-white" />
                       <input value={newSpecGearManufacturer} onChange={e => setNewSpecGearManufacturer(e.target.value)} placeholder="Manufacturer..." className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[9px] text-white" />
                       <select value={newSpecGearCategory} onChange={e => setNewSpecGearCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[9px] text-white">
                          {generalEquipmentList.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                       </select>
                       <div className="grid grid-cols-2 gap-2">
                         <button 
                          type="button"
                          onClick={() => specGearImageRef.current?.click()}
                          className={`py-1 rounded font-black uppercase text-[7px] border transition-all ${newSpecGearImage ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                         >
                           {newSpecGearImage ? 'Photo OK' : 'Add Photo'}
                         </button>
                         <button 
                          type="button"
                          onClick={() => specGearVideoRef.current?.click()}
                          className={`py-1 rounded font-black uppercase text-[7px] border transition-all ${newSpecGearVideo ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                         >
                           {newSpecGearVideo ? 'Video OK' : 'Add Video'}
                         </button>
                         <input type="file" ref={specGearImageRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, setNewSpecGearImage)} />
                         <input type="file" ref={specGearVideoRef} className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, setNewSpecGearVideo)} />
                       </div>
                       <button type="button" onClick={handleCommitSpecificGear} className="w-full py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded">Add to Vault</button>
                    </div>
                  ) : (
                    <select value={specificEquipmentId} onChange={e => setSpecificEquipmentId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none">
                      <option value="">None Assigned</option>
                      {Array.from(new Set(equipmentLibrary.map(p => p.manufacturer))).sort().map((m: string) => (
                        <optgroup key={m} label={m.toUpperCase()}>
                          {equipmentLibrary.filter(p => p.manufacturer === m).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Move</label>
                    <button type="button" onClick={() => setActiveListManager('Moves')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                  </div>
                  <select value={movementPattern} onChange={e => setMovementPattern(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none">
                    {movementPatterns.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                   <p className="text-[8px] text-slate-500 uppercase font-bold italic pb-2">Assigning to {equipment || 'General Gear'} vault</p>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-1.5">Technical Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Biomechanical overview..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs h-16 resize-none outline-none font-medium" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Execution Steps</label>
                  <button type="button" onClick={() => setInstructions([...instructions, ''])} className="text-[8px] font-black text-blue-500 hover:text-white uppercase">+ Add Step</button>
                </div>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-[10px] font-black text-slate-600 mt-2">{idx + 1}.</span>
                      <input 
                        value={step} 
                        onChange={e => {
                          const next = [...instructions];
                          next[idx] = e.target.value;
                          setInstructions(next);
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-[11px] text-white outline-none font-medium"
                      />
                      <button type="button" onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))} className="text-slate-600 hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Primary Instructional Asset</label>
                  <button 
                    type="button"
                    onClick={handleAIVisualize}
                    disabled={isVisualizing}
                    className="text-[8px] font-black uppercase text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 disabled:opacity-50"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.183.394l-1.428.952c-.347.231-.564.606-.564.996V20a1 1 0 001 1h15a1 1 0 001-1v-2.185c0-.441-.216-.856-.564-1.087l-1.428-.952zM4 11V4a1 1 0 011-1h5l1.414 1.414A2 2 0 0012.828 5H19a1 1 0 011 1v5" /></svg>
                    AI Visualize
                  </button>
                </div>
                <div 
                  onClick={() => !isVisualizing && fileInputRef.current?.click()}
                  className="w-full h-40 bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-slate-800/80 transition-all relative overflow-hidden group"
                >
                  {isVisualizing ? (
                    <div className="text-center p-6 space-y-4">
                      <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest animate-pulse">{visualProgress}</p>
                    </div>
                  ) : mediaUrl ? (
                    <>
                      {mediaType === 'video' ? (
                        <CustomVideoPlayer url={mediaUrl} onError={() => { setMediaUrl(''); setMediaType(undefined); }} />
                      ) : (
                        <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-black uppercase text-[9px] tracking-widest">Change Main Asset</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <svg className="w-6 h-6 text-slate-500 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      <p className="text-slate-400 font-bold text-[8px]">Upload Drill Media</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={(e) => handleMediaUpload(e, setMediaUrl, setMediaType)} accept="image/*,video/*" className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-600 tracking-widest block mb-2">Sequence 01: Setup</label>
                  <div 
                    onClick={() => setupInputRef.current?.click()}
                    className="aspect-square bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-all relative overflow-hidden group"
                  >
                    {setupUrl ? (
                      <img src={setupUrl} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                    <input type="file" ref={setupInputRef} onChange={(e) => handleMediaUpload(e, setSetupUrl)} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-600 tracking-widest block mb-2">Sequence 02: Finish</label>
                  <div 
                    onClick={() => finishInputRef.current?.click()}
                    className="aspect-square bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all relative overflow-hidden group"
                  >
                    {finishUrl ? (
                      <img src={finishUrl} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                    <input type="file" ref={finishInputRef} onChange={(e) => handleMediaUpload(e, setFinishUrl)} accept="image/*" className="hidden" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <button type="button" onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-3.5 rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-[9px] tracking-[0.2em]">
                Commit Drill Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeListManager === 'Muscles' && <ListManagerModal title="Muscle Group" items={muscleGroups} onUpdate={setMuscleGroups} onClose={() => setActiveListManager(null)} />}
      {activeListManager === 'Levels' && <ListManagerModal title="Difficulty Level" items={difficultyLevels} onUpdate={setDifficultyLevels} onClose={() => setActiveListManager(null)} />}
      {activeListManager === 'Moves' && <ListManagerModal title="Movement Pattern" items={movementPatterns} onUpdate={setMovementPatterns} onClose={() => setActiveListManager(null)} />}
      {activeListManager === 'Associations' && <ListManagerModal title="Exercise Association" items={exerciseAssociations} onUpdate={setExerciseAssociations} onClose={() => setActiveListManager(null)} />}
    </div>
  );
};


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Workout, ExerciseInstance, SetLog, Exercise, Equipment, MovementPattern, WorkoutBlock, BlockType, BlockTemplate, Difficulty, ExerciseAssociation, EquipmentPiece, GeneralEquipment } from '../types';
import { SESSION_OBJECTIVES } from '../constants';
import { parseWorkoutFromVoice, scrapeEquipmentFromWebsite } from '../geminiService';

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
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
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
      {label && <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">{label}</label>}
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
        <button onClick={addTag} className="px-3 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">+</button>
      </div>
    </div>
  );
};

interface WorkoutEditorProps {
  onSave: (workout: Workout) => void;
  onCancel: () => void;
  initialWorkout?: Workout;
  exerciseLibrary: Exercise[];
  onCreateCustom: () => void;
  blockTemplates: BlockTemplate[];
  onUpdateBlockLibrary: (templates: BlockTemplate[]) => void;
  equipmentLibrary: EquipmentPiece[];
  onRegisterEquipment: (piece: Omit<EquipmentPiece, 'id'>) => void;
  onBatchRegisterEquipment: (pieces: Omit<EquipmentPiece, 'id'>[]) => void;
  generalEquipmentTypes: GeneralEquipment[];
  onAddGeneralEquipmentType: (type: string, imageUrl?: string, tags?: string[]) => void;
  onUpdateGeneralEquipment: (oldName: string, updated: GeneralEquipment) => void;
  muscleGroups: string[]; setMuscleGroups: (l: string[]) => void;
  difficultyLevels: string[]; setDifficultyLevels: (l: string[]) => void;
  movementPatterns: string[]; setMovementPatterns: (l: string[]) => void;
  exerciseAssociations: string[]; setExerciseAssociations: (l: string[]) => void;
}

const INITIAL_BLOCK_TYPES: string[] = ['Straight', 'Superset', 'Circuit'];
const INITIAL_SET_TYPES: string[] = ['Working', 'Warmup', 'AMRAP', 'Top Set', 'Backoff'];

const SCRAPE_MESSAGES = [
  "Initializing neural search crawlers...",
  "Parsing manufacturer technical specifications...",
  "Synthesizing biomechanical usage instructions...",
  "Indexing visual assets and media links...",
  "Synchronizing tactical equipment vault...",
  "Refining equipment category logic...",
  "Optimizing instruction datasets..."
];

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ 
  onSave, onCancel, initialWorkout, exerciseLibrary, onCreateCustom, blockTemplates, onUpdateBlockLibrary, equipmentLibrary, onRegisterEquipment, onBatchRegisterEquipment, generalEquipmentTypes, onAddGeneralEquipmentType, onUpdateGeneralEquipment,
  muscleGroups, setMuscleGroups, difficultyLevels, setDifficultyLevels, movementPatterns, setMovementPatterns, exerciseAssociations, setExerciseAssociations
}) => {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [description, setDescription] = useState(initialWorkout?.description || '');
  const [workoutTags, setWorkoutTags] = useState<string[]>(initialWorkout?.tags || []);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialWorkout?.blocks || []);
  
  // Tactical Objectives state
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

  // List Management State
  const [activeListManager, setActiveListManager] = useState<null | 'Muscles' | 'Levels' | 'Moves' | 'Associations'>(null);

  // Customization states
  const [availableBlockTypes, setAvailableBlockTypes] = useState<string[]>(INITIAL_BLOCK_TYPES);
  const [availableSetTypes, setAvailableSetTypes] = useState<string[]>(INITIAL_SET_TYPES);
  
  const [addingTypeForBlock, setAddingTypeForBlock] = useState<string | null>(null);
  const [addingTypeForSet, setAddingTypeForSet] = useState<{ blockId: string, exId: string, setIdx: number } | null>(null);
  
  const [newTypeInput, setNewTypeInput] = useState('');

  // Equipment Registry UI State
  const [isRegisteringGear, setIsRegisteringGear] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMsgIdx, setScrapeMsgIdx] = useState(0);

  const [newGearName, setNewGearName] = useState('');
  const [newGearManufacturer, setNewGearManufacturer] = useState('');
  const [newGearCategory, setNewGearCategory] = useState<Equipment>('Barbell');
  const [newGearImage, setNewGearImage] = useState<string | undefined>(undefined);
  const [newGearVideo, setNewGearVideo] = useState<string | undefined>(undefined);
  const [newGearTags, setNewGearTags] = useState<string[]>([]);

  const [isAddingGeneralGear, setIsAddingGeneralGear] = useState(false);
  const [editingGeneralGear, setEditingGeneralGear] = useState<GeneralEquipment | null>(null);
  const [newGeneralGearInput, setNewGeneralGearInput] = useState('');
  const [newGeneralGearImage, setNewGeneralGearImage] = useState<string | undefined>(undefined);
  const [newGeneralGearTags, setNewGeneralGearTags] = useState<string[]>([]);

  // Filtering state
  const [filterGeneralEquipment, setFilterGeneralEquipment] = useState<string>('All');
  const [isGeneralDropdownOpen, setIsGeneralDropdownOpen] = useState(false);
  const [filterEquipmentPieceId, setFilterEquipmentPieceId] = useState<string>('All');
  const [filterPattern, setFilterPattern] = useState<string | 'All'>('All');
  const [filterMuscle, setFilterMuscle] = useState<string | 'All'>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string | 'All'>('All');
  const [filterAssociation, setFilterAssociation] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryTab, setLibraryTab] = useState<'exercises' | 'blocks'>('exercises');

  // Drag and Drop State
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const gearImageInputRef = useRef<HTMLInputElement>(null);
  const gearVideoInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    let interval: any;
    if (isScraping) {
      interval = setInterval(() => {
        setScrapeMsgIdx(prev => (prev + 1) % SCRAPE_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isScraping]);

  useEffect(() => {
    const savedBlockTypes = localStorage.getItem('ea_available_block_types');
    if (savedBlockTypes) setAvailableBlockTypes(JSON.parse(savedBlockTypes));

    const savedSetTypes = localStorage.getItem('ea_available_set_types');
    if (savedSetTypes) setAvailableSetTypes(JSON.parse(savedSetTypes));

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setIsListening(false);
        await handleVoiceToWorkout(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedBlockIdx(idx);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedBlockIdx !== idx) {
      setDropTargetIdx(idx);
    }
  };

  const handleDragEnd = () => {
    setDraggedBlockIdx(null);
    setDropTargetIdx(null);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedBlockIdx === null || draggedBlockIdx === targetIdx) {
      handleDragEnd();
      return;
    }
    const nextBlocks = [...blocks];
    const [removed] = nextBlocks.splice(draggedBlockIdx, 1);
    nextBlocks.splice(targetIdx, 0, removed);
    setBlocks(nextBlocks);
    handleDragEnd();
  };

  const toggleVoiceCapture = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setVoiceTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVoiceToWorkout = async (transcript: string) => {
    setIsProcessingVoice(true);
    try {
      const result = await parseWorkoutFromVoice(transcript, exerciseLibrary);
      if (result.name) setName(prev => prev || result.name || '');
      if (result.description) setDescription(prev => prev || result.description || '');
      if (result.blocks && result.blocks.length > 0) {
        const parsedBlocks: WorkoutBlock[] = result.blocks.map(b => ({
          id: Math.random().toString(36).substr(2, 9),
          name: b.name || 'Untitled Block',
          type: (b.type as any) || 'Straight',
          exercises: (b.exercises || []).map(ex => ({
            id: Math.random().toString(36).substr(2, 9),
            exerciseId: ex.exerciseId || '1',
            restPeriodSeconds: ex.restPeriodSeconds || 90,
            sets: (ex.sets || []).map(s => ({
              ...s,
              type: s.type || 'Working',
              completed: false
            }))
          }))
        }));
        setBlocks(prev => [...prev, ...parsedBlocks]);
      }
    } catch (e) {
      console.error('Voice parsing failed', e);
      alert('Victor could not parse the tactical data from your voice. Try again.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleScrapeWebsite = async () => {
    if (!scrapeUrl.trim()) return alert('Please enter a manufacturer URL (e.g. www.sorinex.com)');
    
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsScraping(true);
    setScrapeMsgIdx(0);
    try {
      const equipment = await scrapeEquipmentFromWebsite(scrapeUrl);
      onBatchRegisterEquipment(equipment);
      alert(`Successfully synthesized and archived ${equipment.length} equipment units from ${scrapeUrl}.`);
      setScrapeUrl('');
    } catch (e) {
      console.error('Scrape failed', e);
      alert('Victor failed to synchronize with the manufacturer portal. Check your API key or the URL.');
    } finally {
      setIsScraping(false);
    }
  };

  const saveBlockAsTemplate = (block: WorkoutBlock) => {
    const template: BlockTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: block.name || 'New Block Template',
      type: block.type,
      exercises: block.exercises.map(({ id, ...rest }) => rest),
      tags: block.tags || []
    };
    onUpdateBlockLibrary([...blockTemplates, template]);
    alert(`Block "${template.name}" saved to library.`);
  };

  const extractAllAsBlocks = () => {
    if (blocks.length === 0) return;
    const newTemplates: BlockTemplate[] = blocks.map(block => ({
      id: Math.random().toString(36).substr(2, 9),
      name: block.name || 'New Block Template',
      type: block.type,
      exercises: block.exercises.map(({ id, ...rest }) => rest),
      tags: block.tags || []
    }));
    onUpdateBlockLibrary([...blockTemplates, ...newTemplates]);
    alert(`Synthesized ${newTemplates.length} blocks to Tactical Library.`);
  };

  const addTemplateToWorkout = (template: BlockTemplate) => {
    const newBlock: WorkoutBlock = {
      id: Math.random().toString(36).substr(2, 9),
      name: template.name,
      type: template.type,
      tags: template.tags || [],
      exercises: template.exercises.map(ex => ({
        ...ex,
        id: Math.random().toString(36).substr(2, 9),
        sets: ex.sets.map(s => ({ ...s, type: s.type || 'Working' }))
      }))
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleAddNewBlockType = (blockId: string) => {
    if (newTypeInput.trim()) {
      const normalized = newTypeInput.trim();
      if (!availableBlockTypes.includes(normalized)) {
        const nextTypes = [...availableBlockTypes, normalized].sort();
        setAvailableBlockTypes(nextTypes);
        localStorage.setItem('ea_available_block_types', JSON.stringify(nextTypes));
      }
      updateBlock(blockId, { type: normalized as any });
      setNewTypeInput('');
      setAddingTypeForBlock(null);
    }
  };

  const handleAddNewSetType = (blockId: string, exId: string, setIdx: number) => {
    if (newTypeInput.trim()) {
      const normalized = newTypeInput.trim();
      if (!availableSetTypes.includes(normalized)) {
        const nextTypes = [...availableSetTypes, normalized].sort();
        setAvailableSetTypes(nextTypes);
        localStorage.setItem('ea_available_set_types', JSON.stringify(nextTypes));
      }
      updateSet(blockId, exId, setIdx, { type: normalized });
      setNewTypeInput('');
      setAddingTypeForSet(null);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCommitGear = () => {
    if (!newGearName || !newGearManufacturer) return alert('Name and Manufacturer required.');
    onRegisterEquipment({
      name: newGearName,
      manufacturer: newGearManufacturer,
      category: newGearCategory,
      imageUrl: newGearImage,
      videoUrl: newGearVideo,
      tags: newGearTags
    });
    setNewGearName('');
    setNewGearManufacturer('');
    setNewGearImage(undefined);
    setNewGearVideo(undefined);
    setNewGearTags([]);
    setIsRegisteringGear(false);
  };

  const handleCommitGeneralGear = () => {
    if (!newGeneralGearInput.trim()) return;
    if (editingGeneralGear) {
      onUpdateGeneralEquipment(editingGeneralGear.name, { name: newGeneralGearInput.trim(), imageUrl: newGeneralGearImage, tags: newGeneralGearTags });
      setEditingGeneralGear(null);
    } else {
      onAddGeneralEquipmentType(newGeneralGearInput.trim(), newGeneralGearImage, newGeneralGearTags);
    }
    setFilterGeneralEquipment(newGeneralGearInput.trim());
    setNewGeneralGearInput('');
    setNewGeneralGearImage(undefined);
    setNewGeneralGearTags([]);
    setIsAddingGeneralGear(false);
  };

  const handleStartEditGeneral = (e: React.MouseEvent, type: GeneralEquipment) => {
    e.stopPropagation();
    setEditingGeneralGear(type);
    setNewGeneralGearInput(type.name);
    setNewGeneralGearImage(type.imageUrl);
    setNewGeneralGearTags(type.tags || []);
    setIsAddingGeneralGear(true);
    setIsGeneralDropdownOpen(false);
  };

  const filteredLibrary = exerciseLibrary.filter(ex => {
    let matchesSpecificEquipment = true;
    if (filterEquipmentPieceId !== 'All') {
      const piece = equipmentLibrary.find(p => p.id === filterEquipmentPieceId);
      matchesSpecificEquipment = piece ? ex.equipment === piece.category : true;
    }
    
    const matchesGeneralEquipment = filterGeneralEquipment === 'All' || ex.equipment.toLowerCase() === filterGeneralEquipment.toLowerCase() || (ex.equipment === 'Bands' && filterGeneralEquipment === 'Band');
    
    const matchesPattern = filterPattern === 'All' || ex.movementPattern === filterPattern;
    const matchesMuscle = filterMuscle === 'All' || ex.primaryMuscle === filterMuscle;
    const matchesDifficulty = filterDifficulty === 'All' || ex.difficulty === filterDifficulty;
    const matchesAssociation = filterAssociation === 'All' || ex.association === filterAssociation;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      ex.name.toLowerCase().includes(q) || 
      ex.primaryMuscle.toLowerCase().includes(q) ||
      ex.movementPattern.toLowerCase().includes(q) ||
      (ex.tags || []).some(t => t.toLowerCase().includes(q));
    return matchesSpecificEquipment && matchesGeneralEquipment && matchesPattern && matchesMuscle && matchesDifficulty && matchesSearch && matchesAssociation;
  });

  const addExerciseToNewBlock = (ex: Exercise) => {
    const newEx: ExerciseInstance = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: ex.id,
      restPeriodSeconds: 90,
      sets: [{ reps: 0, weight: 0, completed: false, type: 'Working' }]
    };
    const newBlock: WorkoutBlock = {
      id: Math.random().toString(36).substr(2, 9),
      name: ex.name,
      type: 'Straight',
      exercises: [newEx],
      tags: []
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<WorkoutBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const addSetToExercise = (blockId: string, instanceId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map(ex => ex.id === instanceId ? {
            ...ex,
            sets: [...ex.sets, { reps: 0, weight: 0, completed: false, type: ex.sets[ex.sets.length-1]?.type || 'Working' }]
          } : ex)
        };
      }
      return b;
    }));
  };

  const updateSet = (blockId: string, instanceId: string, setIdx: number, updates: Partial<SetLog>) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map(ex => ex.id === instanceId ? {
            ...ex,
            sets: ex.sets.map((s, idx) => idx === setIdx ? { ...s, ...updates } : s)
          } : ex)
        };
      }
      return b;
    }));
  };

  const toggleObjective = (obj: string) => {
    setSelectedObjectives(prev => {
      const next = prev.includes(obj) ? prev.filter(o => o !== obj) : [...prev, obj];
      // Sync description
      const prefix = next.length > 0 ? `[FOCUS: ${next.join(', ').toUpperCase()}]\n` : '';
      const cleanDesc = description.replace(/^\[FOCUS: .*\]\n?/, '');
      setDescription(prefix + cleanDesc);
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return alert('Please enter a workout name');
    onSave({
      id: initialWorkout?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      blocks,
      tags: workoutTags,
      createdAt: initialWorkout?.createdAt || Date.now()
    });
  };

  // Logic: Pull the block directly below this one into this block to form a stack/superset
  const stackBlockBelow = (idx: number) => {
    if (idx >= blocks.length - 1) return;
    
    const current = blocks[idx];
    const next = blocks[idx + 1];
    
    const mergedExercises = [...current.exercises, ...next.exercises];
    const updatedBlocks = [...blocks];
    
    updatedBlocks[idx] = {
      ...current,
      exercises: mergedExercises,
      type: 'Superset',
      name: `${current.name} / ${next.name}`.substring(0, 40)
    };
    
    updatedBlocks.splice(idx + 1, 1);
    setBlocks(updatedBlocks);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Strategy Board</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Architect your athletic protocol</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Extract as Blocks Button */}
          <button 
            onClick={extractAllAsBlocks}
            disabled={blocks.length === 0}
            className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-indigo-500/50 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Extract as Blocks</span>
          </button>

          <button 
            onClick={toggleVoiceCapture}
            disabled={isProcessingVoice}
            className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all relative group ${
              isListening ? 'bg-red-600/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {isProcessingVoice ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">{isListening ? 'Intercepting...' : 'Voice Build'}</span>
              </>
            )}
          </button>

          <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3 rounded-full bg-blue-600 text-white font-black uppercase hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 tracking-wider">Save Protocol</button>
        </div>
      </div>

      {voiceTranscript && (
        <div className="mb-8 p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl animate-in slide-in-from-top-2">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Transcript Detected</p>
          <p className="text-xs text-slate-300 italic">"{voiceTranscript}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Session Code Name (e.g. ALPHA_SQUAT)"
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-2xl px-6 py-4 text-2xl font-black uppercase focus:outline-none transition-all placeholder:text-slate-600"
              />
              <TagManager tags={workoutTags} onUpdate={setWorkoutTags} label="Protocol Classification (Tags)" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Tactical Objectives</label>
              <div className="flex flex-wrap gap-2">
                {SESSION_OBJECTIVES.map(obj => {
                  const isActive = selectedObjectives.includes(obj);
                  return (
                    <button
                      key={obj}
                      onClick={() => toggleObjective(obj)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        isActive 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {obj}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed session objectives and focus areas..."
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-2xl px-6 py-4 h-24 focus:outline-none transition-all placeholder:text-slate-600 resize-none font-medium"
            />
          </div>

          <div className="space-y-12">
            {blocks.map((block, bIdx) => {
              const isBeingDragged = draggedBlockIdx === bIdx;
              const isDropTarget = dropTargetIdx === bIdx;
              const hasBlockBelow = bIdx < blocks.length - 1;
              
              return (
                <div 
                  key={block.id} 
                  className={`relative group/draggable transition-all duration-300 ${isBeingDragged ? 'opacity-20 scale-[0.98]' : 'opacity-100'} ${isDropTarget ? 'ring-4 ring-blue-500/50 rounded-[2.5rem] scale-[1.02] z-10 shadow-2xl' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, bIdx)}
                  onDragOver={(e) => handleDragOver(e, bIdx)}
                  onDrop={(e) => handleDrop(e, bIdx)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={`p-1 rounded-[2.5rem] transition-all ${block.type === 'Superset' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : block.type === 'Circuit' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-800'}`}>
                    <div className="bg-slate-900 rounded-[2.3rem] p-6 relative">
                      {/* Drag Handle Overlay */}
                      <div className="absolute top-8 left-2 opacity-0 group-hover/draggable:opacity-40 hover:!opacity-100 transition-opacity cursor-move p-2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 ml-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">{bIdx + 1}</span>
                            <input 
                              value={block.name}
                              onChange={(e) => updateBlock(block.id, { name: e.target.value })}
                              className="bg-transparent text-xl font-black uppercase text-white focus:outline-none focus:text-blue-400 transition-colors"
                            />
                          </div>
                          <TagManager tags={block.tags || []} onUpdate={(t) => updateBlock(block.id, { tags: t })} placeholder="Block Tags..." />
                        </div>
                        <div className="flex items-center gap-2">
                          {addingTypeForBlock === block.id ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                              <input 
                                autoFocus
                                value={newTypeInput}
                                onChange={(e) => setNewTypeInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewBlockType(block.id)}
                                placeholder="New Type..."
                                className="bg-slate-800 text-[10px] font-black uppercase text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/50 focus:outline-none w-24"
                              />
                              <button 
                                onClick={() => handleAddNewBlockType(block.id)}
                                className="p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-all"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button 
                                onClick={() => { setAddingTypeForBlock(null); setNewTypeInput(''); }}
                                className="p-1.5 text-slate-500 hover:text-white"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select 
                                value={block.type}
                                onChange={(e) => updateBlock(block.id, { type: e.target.value as BlockType })}
                                className="bg-slate-800 text-[10px] font-black uppercase text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 focus:outline-none"
                              >
                                {availableBlockTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => setAddingTypeForBlock(block.id)}
                                className="p-1.5 bg-slate-800 rounded-full text-slate-500 hover:text-blue-400 border border-slate-700 hover:border-blue-500/50 transition-all"
                                title="Add New Block Type"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            </div>
                          )}

                          <button 
                            onClick={() => saveBlockAsTemplate(block)}
                            className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                            title="Save as Template"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => removeBlock(block.id)}
                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 ml-6">
                        {block.exercises.map((ex, exIdx) => {
                          const baseEx = exerciseLibrary.find(e => e.id === ex.exerciseId);
                          return (
                            <div key={ex.id} className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                  {baseEx?.mediaUrl && (
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                                      <img src={baseEx.mediaUrl} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-bold text-slate-200">{baseEx?.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{baseEx?.equipment}</span>
                                      <span className="text-[9px] font-black uppercase text-slate-600">•</span>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{baseEx?.movementPattern}</span>
                                      {baseEx?.tags?.map(tag => (
                                        <span key={tag} className="text-[7px] font-black bg-slate-900 text-blue-500 px-1 py-0.5 rounded border border-slate-800 uppercase">{tag}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    const nextEx = block.exercises.filter(e => e.id !== ex.id);
                                    if (nextEx.length === 0) removeBlock(block.id);
                                    else updateBlock(block.id, { exercises: nextEx });
                                  }}
                                  className="text-slate-600 hover:text-red-500 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="grid grid-cols-12 gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest px-2">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-5">Type</div>
                                    <div className="col-span-3">LBS</div>
                                    <div className="col-span-3">REPS</div>
                                  </div>
                                  {ex.sets.map((set, sIdx) => {
                                    const isAddingType = addingTypeForSet?.blockId === block.id && addingTypeForSet?.exId === ex.id && addingTypeForSet?.setIdx === sIdx;
                                    return (
                                      <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                                        <span className="col-span-1 text-[10px] font-black text-slate-600 text-center">{sIdx + 1}</span>
                                        <div className="col-span-5 flex items-center gap-1">
                                          {isAddingType ? (
                                            <div className="flex items-center gap-1 w-full animate-in slide-in-from-left-1">
                                              <input 
                                                autoFocus
                                                value={newTypeInput}
                                                onChange={(e) => setNewTypeInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewSetType(block.id, ex.id, sIdx)}
                                                className="bg-slate-900 border border-blue-500/50 rounded-lg py-1 px-2 text-[8px] font-bold text-blue-400 focus:outline-none w-full"
                                                placeholder="New..."
                                              />
                                              <button onClick={() => setAddingTypeForSet(null)} className="text-slate-500 hover:text-white">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                              </button>
                                            </div>
                                          ) : (
                                            <>
                                              <select 
                                                value={set.type || 'Working'}
                                                onChange={(e) => updateSet(block.id, ex.id, sIdx, { type: e.target.value })}
                                                className="bg-slate-900 border border-slate-700 rounded-lg py-1 px-1 text-[8px] font-bold text-slate-400 focus:outline-none flex-1 truncate"
                                              >
                                                {availableSetTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                              </select>
                                              <button 
                                                onClick={() => setAddingTypeForSet({ blockId: block.id, exId: ex.id, setIdx: sIdx })}
                                                className="p-1 text-slate-600 hover:text-blue-500"
                                              >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        <input 
                                          type="number" value={set.weight || ''} placeholder="0"
                                          onChange={(e) => updateSet(block.id, ex.id, sIdx, { weight: Number(e.target.value) })}
                                          className="col-span-3 bg-slate-900 border border-slate-700 rounded-lg py-1 text-center text-[10px] font-bold text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <input 
                                          type="number" value={set.reps || ''} placeholder="0"
                                          onChange={(e) => updateSet(block.id, ex.id, sIdx, { reps: Number(e.target.value) })}
                                          className="col-span-3 bg-slate-900 border border-slate-700 rounded-lg py-1 text-center text-[10px] font-bold text-white focus:outline-none focus:border-blue-500"
                                        />
                                      </div>
                                    );
                                  })}
                                  <button 
                                    onClick={() => addSetToExercise(block.id, ex.id)}
                                    className="w-full py-1 text-[10px] font-black uppercase text-blue-500 border border-dashed border-slate-700 rounded-lg hover:border-blue-500/50 mt-2"
                                  >
                                    + Set
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest block mb-1">Rest (s)</label>
                                    <input 
                                      type="number" value={ex.restPeriodSeconds}
                                      onChange={(e) => {
                                        const nextExArr = block.exercises.map(item => item.id === ex.id ? { ...item, restPeriodSeconds: Number(e.target.value) } : item);
                                        updateBlock(block.id, { exercises: nextExArr });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-blue-400 focus:outline-none"
                                    />
                                  </div>
                                  <textarea 
                                    placeholder="Execution cues..."
                                    value={ex.notes || ''}
                                    onChange={(e) => {
                                      const nextExArr = block.exercises.map(item => item.id === ex.id ? { ...item, notes: e.target.value } : item);
                                      updateBlock(block.id, { exercises: nextExArr });
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-2 py-1 text-[10px] h-12 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* UPDATE: +Stack Exercise now merges with the block directly below it in the tactical map */}
                        {hasBlockBelow && (
                          <button 
                            onClick={() => stackBlockBelow(bIdx)}
                            className="w-full py-3 text-[10px] font-black uppercase text-blue-400 bg-blue-600/5 border border-dashed border-blue-500/30 rounded-xl hover:bg-blue-600/10 hover:text-blue-300 transition-all flex items-center justify-center gap-2 mt-4"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                            + Stack Exercise Below
                          </button>
                        )}
                        
                        {!hasBlockBelow && (
                          <div className="w-full py-3 text-[10px] font-black uppercase text-slate-600 bg-slate-800/10 border border-dashed border-slate-800 rounded-xl text-center mt-4 italic">
                            Terminal Drill Reached
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {blocks.length === 0 && (
              <div className="py-24 text-center border-4 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-600 font-black uppercase tracking-widest text-xl">Tactical Map Empty</p>
                <p className="text-slate-700 text-sm mt-2">Add individual drills or load pre-built blocks</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 h-fit sticky top-6 space-y-6">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setLibraryTab('exercises')}
                className={`flex-1 pb-2 border-b-2 text-[10px] font-black uppercase transition-all ${libraryTab === 'exercises' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500'}`}
              >
                Drills
              </button>
              <button 
                onClick={() => setLibraryTab('blocks')}
                className={`flex-1 pb-2 border-b-2 text-[10px] font-black uppercase transition-all ${libraryTab === 'blocks' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500'}`}
              >
                Blocks
              </button>
            </div>

            {libraryTab === 'exercises' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black uppercase text-white">Library</h3>
                  <button 
                    onClick={onCreateCustom}
                    className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400"
                  >
                    + Create
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <input 
                    placeholder="Search drills/tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                  
                  {/* Equipment Registry / Synthesis UI */}
                  <div className="space-y-4 bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Equipment Intelligence</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsRegisteringGear(!isRegisteringGear)}
                          className="text-[8px] font-black uppercase text-blue-500 hover:text-white"
                        >
                          {isRegisteringGear ? 'Cancel' : '+ Add Manual'}
                        </button>
                      </div>
                    </div>

                    {/* NEW: AI Manufacturer Portal Scraper */}
                    <div className="space-y-2">
                      <div className="relative group">
                        <input 
                          placeholder="Synthesize from URL (e.g. www.sorinex.com)" 
                          value={scrapeUrl}
                          onChange={e => setScrapeUrl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all font-bold placeholder:text-slate-700"
                        />
                        <button 
                          onClick={handleScrapeWebsite}
                          disabled={isScraping}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
                        >
                          {isScraping ? (
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          )}
                        </button>
                      </div>
                      
                      {isScraping && (
                        <div className="bg-indigo-600/10 border border-indigo-500/30 p-4 rounded-xl animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                              {SCRAPE_MESSAGES[scrapeMsgIdx]}
                            </p>
                          </div>
                          <p className="text-[8px] text-slate-500 mt-2 italic">Connecting to {scrapeUrl} via Victor Intelligence...</p>
                        </div>
                      )}
                    </div>

                    {isRegisteringGear && (
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <input 
                          placeholder="Equipment Name (e.g. Ohio Barbell)"
                          value={newGearName} onChange={e => setNewGearName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none"
                        />
                        <input 
                          placeholder="Manufacturer (e.g. Rogue)"
                          value={newGearManufacturer} onChange={e => setNewGearManufacturer(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none"
                        />
                        <TagManager tags={newGearTags} onUpdate={setNewGearTags} placeholder="Specific Gear Tags..." />
                        <select 
                          value={newGearCategory} onChange={e => setNewGearCategory(e.target.value as Equipment)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none"
                        >
                          {generalEquipmentTypes.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            type="button"
                            onClick={() => gearImageInputRef.current?.click()}
                            className={`py-2 rounded-lg font-black uppercase text-[8px] border transition-all ${newGearImage ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                          >
                            {newGearImage ? 'Photo OK' : 'Add Photo'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => gearVideoInputRef.current?.click()}
                            className={`py-2 rounded-lg font-black uppercase text-[8px] border transition-all ${newGearVideo ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                          >
                            {newGearVideo ? 'Video OK' : 'Add Video'}
                          </button>
                          <input type="file" ref={gearImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, setNewGearImage)} />
                          <input type="file" ref={gearVideoInputRef} className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, setNewGearVideo)} />
                        </div>
                        <button 
                          onClick={handleCommitGear}
                          className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg"
                        >
                          Register Intelligence
                        </button>
                      </div>
                    )}

                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:outline-none appearance-none"
                      value={filterEquipmentPieceId}
                      onChange={(e) => setFilterEquipmentPieceId(e.target.value)}
                    >
                      <option value="All">All Specific Equipment</option>
                      {/* Grouping by manufacturer */}
                      {Array.from(new Set(equipmentLibrary.map(p => p.manufacturer))).sort().map((m: string) => (
                        <optgroup key={m} label={m.toUpperCase()}>
                          {equipmentLibrary.filter(p => p.manufacturer === m).map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  
                  {/* General Equipment Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">General Equipment</label>
                      <button 
                        onClick={() => { setIsAddingGeneralGear(!isAddingGeneralGear); setEditingGeneralGear(null); setNewGeneralGearInput(''); setNewGeneralGearImage(undefined); setNewGeneralGearTags([]); }}
                        className="text-[8px] font-black uppercase text-blue-500 hover:text-white"
                      >
                        {isAddingGeneralGear ? 'Cancel' : '+ Add Category'}
                      </button>
                    </div>

                    {isAddingGeneralGear && (
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-1 duration-200">
                        <input 
                          autoFocus
                          placeholder="Category Name"
                          value={newGeneralGearInput}
                          onChange={e => setNewGeneralGearInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCommitGeneralGear()}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white outline-none"
                        />
                        <TagManager tags={newGeneralGearTags} onUpdate={setNewGeneralGearTags} placeholder="Category Tags..." />
                        <div className="flex gap-2">
                           <button 
                            type="button"
                            onClick={() => generalGearImageRef.current?.click()}
                            className={`flex-1 py-2 rounded-lg font-black uppercase text-[8px] border transition-all ${newGeneralGearImage ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                           >
                             {newGeneralGearImage ? 'Photo Attached' : 'Add Ref Photo'}
                           </button>
                           <input type="file" ref={generalGearImageRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, setNewGeneralGearImage)} />
                           <button 
                            onClick={handleCommitGeneralGear}
                            className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all"
                           >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </button>
                        </div>
                      </div>
                    )}

                    <div className="relative" ref={generalDropdownRef}>
                      <button 
                        onClick={() => setIsGeneralDropdownOpen(!isGeneralDropdownOpen)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:outline-none flex items-center justify-between transition-all hover:border-slate-600 shadow-lg group"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const selected = generalEquipmentTypes.find(g => g.name === filterGeneralEquipment);
                            return selected?.imageUrl ? (
                              <img src={selected.imageUrl} className="w-8 h-8 rounded-lg object-cover border border-slate-700/50 transition-transform group-hover:scale-110" alt="" />
                            ) : null;
                          })()}
                          <span className="font-black uppercase tracking-widest text-[10px]">{filterGeneralEquipment === 'All' ? 'All General Gear' : filterGeneralEquipment}</span>
                        </div>
                        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isGeneralDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isGeneralDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] max-h-[350px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                          <button 
                            onClick={() => { setFilterGeneralEquipment('All'); setIsGeneralDropdownOpen(false); }}
                            className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${filterGeneralEquipment === 'All' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                          >
                            <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 font-black text-slate-600">ALL</div>
                            All General Gear
                          </button>
                          {generalEquipmentTypes.map(type => (
                            <div 
                              key={type.name}
                              className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group/item ${filterGeneralEquipment === type.name ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                              onClick={() => { setFilterGeneralEquipment(type.name); setIsGeneralDropdownOpen(false); }}
                            >
                              <div className="flex items-center gap-4 truncate">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                                  {type.imageUrl ? (
                                    <img src={type.imageUrl} className="w-full h-full object-cover transition-transform group-hover/item:scale-125" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-slate-800">?</div>
                                  )}
                                </div>
                                <div className="flex flex-col truncate">
                                  <span className="truncate">{type.name}</span>
                                  {type.tags && type.tags.length > 0 && (
                                    <div className="flex gap-1 overflow-hidden mt-0.5">
                                      {type.tags.map(t => <span key={t} className="text-[6px] bg-slate-950 px-1 rounded opacity-50">{t}</span>)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button 
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
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Muscle Group</label>
                        <button onClick={() => setActiveListManager('Muscles')} className="p-1 text-slate-500 hover:text-blue-500 transition-colors">⚙️</button>
                      </div>
                      <select 
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-400 focus:outline-none w-full"
                        value={filterMuscle}
                        onChange={(e) => setFilterMuscle(e.target.value)}
                      >
                        <option value="All">All Muscles</option>
                        {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Level</label>
                            <button onClick={() => setActiveListManager('Levels')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                          </div>
                          <select 
                            className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-400 focus:outline-none w-full"
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                          >
                            <option value="All">All Levels</option>
                            {difficultyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Move</label>
                            <button onClick={() => setActiveListManager('Moves')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                          </div>
                          <select 
                            className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-400 focus:outline-none w-full"
                            value={filterPattern}
                            onChange={(e) => setFilterPattern(e.target.value)}
                          >
                            <option value="All">All Moves</option>
                            {movementPatterns.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Association</label>
                        <button onClick={() => setActiveListManager('Associations')} className="text-[8px] text-slate-500 hover:text-blue-500">⚙️</button>
                      </div>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-400 focus:outline-none"
                        value={filterAssociation}
                        onChange={(e) => setFilterAssociation(e.target.value)}
                      >
                        <option value="All">All Associations</option>
                        {exerciseAssociations.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredLibrary.map(ex => (
                    <button 
                      key={ex.id}
                      onClick={() => addExerciseToNewBlock(ex)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-900/50 border border-transparent hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group flex gap-3 items-center"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 flex-shrink-0 relative group-hover:scale-105 transition-transform">
                        {ex.mediaUrl ? (
                          <>
                            {ex.mediaType === 'video' ? (
                              <video src={ex.mediaUrl} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                            ) : (
                              <img src={ex.mediaUrl} className="w-full h-full object-cover" />
                            )}
                            {ex.mediaType === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-bold text-slate-200 truncate">{ex.name}</div>
                          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${ex.difficulty === 'Beginner' ? 'bg-emerald-500' : ex.difficulty === 'Intermediate' ? 'bg-blue-500' : 'bg-red-500'}`} title={ex.difficulty}></span>
                        </div>
                        <div className="text-[8px] font-black uppercase text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                          <span className="text-blue-400">{ex.association}</span>
                          <span className="text-slate-600">•</span>
                          <span>{ex.primaryMuscle}</span>
                          {ex.tags && ex.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-emerald-500 opacity-80">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Saved Block Architectures</p>
                {blockTemplates.map(template => (
                  <div key={template.id} className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-black uppercase text-white text-sm">{template.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.tags?.map(t => <span key={t} className="text-[6px] font-black bg-slate-950 text-indigo-400 px-1 rounded uppercase">{t}</span>)}
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${template.type === 'Superset' ? 'bg-blue-500 text-white' : template.type === 'Circuit' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {template.type}
                      </span>
                    </div>
                    <div className="space-y-1 mb-4">
                      {template.exercises.map((ex, idx) => {
                        const base = exerciseLibrary.find(e => e.id === ex.exerciseId);
                        return <div key={idx} className="text-[10px] text-slate-500">• {base?.name}</div>;
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addTemplateToWorkout(template)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg"
                      >
                        Add to Protocol
                      </button>
                      <button 
                        onClick={() => {
                          const next = blockTemplates.filter(t => t.id !== template.id);
                          onUpdateBlockLibrary(next);
                        }}
                        className="p-2 text-slate-700 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {blockTemplates.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-600 text-xs font-medium">No templates saved. Save a block from your strategy board to see it here.</p>
                  </div>
                )}
              </div>
            )}
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

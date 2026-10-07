
import React, { useState, useEffect, useMemo } from 'react';
import { Workout, WorkoutLog, AIRecommendation, Exercise, Athlete, Microcycle, Mesocycle, Macrocycle, WellnessLog, Questionnaire, QuestionnaireAssignment, BlockTemplate, EquipmentPiece, GeneralEquipment, PrescribedPrincipleAssignment, Personnel, PrescribedLearningAssignment } from './types';
import { Dashboard } from './components/Dashboard';
import { WorkoutEditor } from './components/WorkoutEditor';
import { WorkoutLogger } from './components/WorkoutLogger';
import { ExerciseCreator } from './components/ExerciseCreator';
import { Roster } from './components/Roster';
import { TeamManager } from './components/TeamManager';
import { CalendarView } from './components/CalendarView';
import { AttendanceTracker } from './components/AttendanceTracker';
import { MicrocycleLibrary } from './components/MicrocycleLibrary';
import { MicrocycleEditor } from './components/MicrocycleEditor';
import { MesocycleLibrary } from './components/MesocycleLibrary';
import { MesocycleEditor } from './components/MesocycleEditor';
import { MacrocycleLibrary } from './components/MacrocycleLibrary';
import { MacrocycleEditor } from './components/MacrocycleEditor';
import { MindMapper } from './components/MindMapper';
import { VisualProtocolDesigner } from './components/VisualProtocolDesigner';
import { WellnessTracker } from './components/WellnessTracker';
import { CoachingHub } from './components/CoachingHub';
import { VictorLiveCoach } from './components/VictorLiveCoach';
import { getWorkoutRecommendation } from './geminiService';
import { SAMPLE_WORKOUTS, SAMPLE_LOGS, SAMPLE_ATHLETES, SAMPLE_MICROCYCLES, GET_INITIAL_TEAM } from './sampleData';
import { INITIAL_EXERCISES, INITIAL_BLOCK_TEMPLATES, EQUIPMENT_TYPES, INITIAL_MUSCLE_GROUPS, INITIAL_DIFFICULTY_LEVELS, INITIAL_MOVEMENT_PATTERNS, INITIAL_EXERCISE_ASSOCIATIONS } from './constants';

const INITIAL_WORKOUT_STYLES = [
  'Velocity Based Training',
  'Conjugate Strength',
  'Super Slow',
  'High Intensity Interval Training',
  'Long Slow Distance Cardiovascular',
  'High Intensity Training',
  'Dog Crap Training',
  'Olympic Lifting'
];

const INITIAL_EQUIPMENT_PIECES: EquipmentPiece[] = [
  { id: 'eq-1', name: 'Ohio Barbell', manufacturer: 'Rogue', category: 'Barbell', tags: ['STRENGTH', 'FREE_WEIGHT'] },
  { id: 'eq-2', name: 'Competition Plates', manufacturer: 'Eleiko', category: 'Barbell', tags: ['OLYMPIC', 'FREE_WEIGHT'] },
  { id: 'eq-3', name: 'Iron Pro Kettlebell', manufacturer: 'Kettlebell Kings', category: 'Kettlebell', tags: ['BALLISTIC', 'FUNCTIONAL'] },
  { id: 'eq-4', name: 'Classic Reformer', manufacturer: 'Gratz', category: 'Reformer', tags: ['PILATES', 'CLASSICAL'] },
  { id: 'eq-5', name: 'A2 Reformer', manufacturer: 'Balanced Body', category: 'Reformer', tags: ['PILATES', 'CONTEMPORARY'] },
  { id: 'eq-6', name: 'Urethane Dumbbells', manufacturer: 'Iron Grip', category: 'Dumbbell', tags: ['FREE_WEIGHT', 'HYPERTROPHY'] }
];

const EQUIPMENT_IMAGES: Record<string, string> = {
  'Barbell': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop',
  'Dumbbell': 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=200&auto=format&fit=crop',
  'Kettlebell': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=200&auto=format&fit=crop',
  'Reformer': 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=200&auto=format&fit=crop',
  'Bodyweight': 'https://images.unsplash.com/photo-1598971639058-aba7c12af9c0?q=80&w=200&auto=format&fit=crop',
  'Medicine Ball': 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=200&auto=format&fit=crop',
  'Bands': 'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?q=80&w=200&auto=format&fit=crop',
  'TRX': 'https://images.unsplash.com/photo-1544216717-3bbf52512659?q=80&w=200&auto=format&fit=crop',
  'Machine': 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=200&auto=format&fit=crop',
  'Cable': 'https://images.unsplash.com/photo-1591940742878-13aba4b7a35e?q=80&w=200&auto=format&fit=crop',
  'Cadillac': 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=200&auto=format&fit=crop',
  'Wunda Chair': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&auto=format&fit=crop',
  'Stability Ball': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=200&auto=format&fit=crop'
};

const INITIAL_SPORTS = ['Boxing', 'Sprinting', 'Basketball', 'American Football', 'Soccer', 'Swimming', 'Tennis', 'MMA', 'CrossFit', 'Olympic Weightlifting', 'Rugby', 'Volleyball'];
const INITIAL_GOALS = ['Hand Speed', 'Recovery', 'Explosive Power', 'Vertical Jump', 'Agility', 'Max Strength', 'Aerobic Capacity', 'Hypertrophy', 'Injury Prevention', 'Core Stability'];
const INITIAL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite', 'Pro'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'build' | 'coaching' | 'ai' | 'team' | 'readiness' | 'calendar'>('dashboard');
  const [buildSubTab, setBuildSubTab] = useState<'workouts' | 'designer'>('workouts');
  const [designMode, setDesignMode] = useState<'workout' | 'visual' | 'cycle' | 'meso' | 'macro' | 'mindmap'>('workout');
  
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [teamMembers, setTeamMembers] = useState<Personnel[]>([]);
  const [activeAthleteId, setActiveAthleteId] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [microcycles, setMicrocycles] = useState<Microcycle[]>([]);
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>([]);
  const [macrocycles, setMacrocycles] = useState<Macrocycle[]>([]);
  const [blockTemplates, setBlockTemplates] = useState<BlockTemplate[]>([]);
  const [equipmentPieces, setEquipmentPieces] = useState<EquipmentPiece[]>([]);
  const [generalEquipmentList, setGeneralEquipmentList] = useState<GeneralEquipment[]>([]);
  const [prescribedPrinciples, setPrescribedPrinciples] = useState<PrescribedPrincipleAssignment[]>([]);
  const [prescribedLearning, setPrescribedLearning] = useState<PrescribedLearningAssignment[]>([]);

  // Dynamic Dropdown Lists
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);
  const [movementPatterns, setMovementPatterns] = useState<string[]>([]);
  const [exerciseAssociations, setExerciseAssociations] = useState<string[]>([]);
  
  // Readiness Expansion State
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [assignments, setAssignments] = useState<QuestionnaireAssignment[]>([]);
  
  const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>(undefined);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [activeSession, setActiveSession] = useState<Workout | null>(null);
  
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Microcycle | undefined>(undefined);
  const [isEditingMeso, setIsEditingMeso] = useState(false);
  const [editingMeso, setEditingMeso] = useState<Mesocycle | undefined>(undefined);
  const [isEditingMacro, setIsEditingMacro] = useState(false);
  const [editingMacro, setEditingMacro] = useState<Macrocycle | undefined>(undefined);

  const [sport, setSport] = useState('');
  const [availableSports, setAvailableSports] = useState<string[]>(INITIAL_SPORTS);
  const [isAddingSport, setIsAddingSport] = useState(false);
  const [tempSport, setTempSport] = useState('');

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [availableGoals, setAvailableGoals] = useState<string[]>(INITIAL_GOALS);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([INITIAL_WORKOUT_STYLES[0]]);
  const [availableStyles, setAvailableStyles] = useState<string[]>(INITIAL_WORKOUT_STYLES);
  const [level, setLevel] = useState(INITIAL_LEVELS[1]);
  const [availableLevels, setAvailableLevels] = useState<string[]>(INITIAL_LEVELS);

  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const allExercises = useMemo(() => [...INITIAL_EXERCISES, ...customExercises], [customExercises]);
  const activeAthlete = useMemo(() => athletes.find(a => a.id === activeAthleteId) || null, [athletes, activeAthleteId]);
  const filteredLogs = useMemo(() => logs.filter(l => l.athleteId === activeAthleteId), [logs, activeAthleteId]);

  useEffect(() => {
    const savedAthletes = localStorage.getItem('ea_athletes');
    const savedTeam = localStorage.getItem('ea_team_members');
    const savedWorkouts = localStorage.getItem('ea_workouts');
    const savedLogs = localStorage.getItem('ea_logs');
    const savedWellness = localStorage.getItem('ea_wellness');
    const savedCustomEx = localStorage.getItem('ea_custom_exercises');
    const savedCycles = localStorage.getItem('ea_cycles');
    const savedMesos = localStorage.getItem('ea_mesocycles');
    const savedMacros = localStorage.getItem('ea_macrocycles');
    const savedSports = localStorage.getItem('ea_available_sports');
    const savedQuests = localStorage.getItem('ea_questionnaires');
    const savedAssigns = localStorage.getItem('ea_assignments');
    const savedBlocks = localStorage.getItem('ea_block_templates');
    const savedEquipment = localStorage.getItem('ea_equipment_pieces');
    const savedGeneralEquipment = localStorage.getItem('ea_general_equipment');
    const savedPrinciples = localStorage.getItem('ea_prescribed_principles');
    const savedLearning = localStorage.getItem('ea_prescribed_learning');

    // Dynamic Lists Persistence
    const savedMuscles = localStorage.getItem('ea_muscles');
    const savedDiffs = localStorage.getItem('ea_diffs');
    const savedPatterns = localStorage.getItem('ea_patterns');
    const savedAssociations = localStorage.getItem('ea_associations');
    
    if (savedAthletes) setAthletes(JSON.parse(savedAthletes));
    else setAthletes(SAMPLE_ATHLETES);

    if (savedTeam) setTeamMembers(JSON.parse(savedTeam));
    else setTeamMembers(GET_INITIAL_TEAM());

    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
    else setWorkouts(SAMPLE_WORKOUTS);

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    else setLogs(SAMPLE_LOGS);

    if (savedWellness) setWellnessLogs(JSON.parse(savedWellness));
    if (savedCustomEx) setCustomExercises(JSON.parse(savedCustomEx));
    if (savedCycles) setMicrocycles(JSON.parse(savedCycles));
    else setMicrocycles(SAMPLE_MICROCYCLES);

    if (savedMesos) setMesocycles(JSON.parse(savedMesos));
    if (savedMacros) setMacrocycles(JSON.parse(savedMacros));
    if (savedSports) setAvailableSports(JSON.parse(savedSports));
    if (savedQuests) setQuestionnaires(JSON.parse(savedQuests));
    if (savedAssigns) setAssignments(JSON.parse(savedAssigns));
    if (savedPrinciples) setPrescribedPrinciples(JSON.parse(savedPrinciples));
    if (savedLearning) setPrescribedLearning(JSON.parse(savedLearning));

    if (savedEquipment) setEquipmentPieces(JSON.parse(savedEquipment));
    else setEquipmentPieces(INITIAL_EQUIPMENT_PIECES);

    if (savedGeneralEquipment) {
      setGeneralEquipmentList(JSON.parse(savedGeneralEquipment));
    } else {
      const initial: GeneralEquipment[] = [...new Set([...EQUIPMENT_TYPES, 'Band', 'Ball', 'Medicine Ball', 'Dumbbell'])].map(name => ({ 
        name,
        imageUrl: EQUIPMENT_IMAGES[name] || undefined,
        tags: []
      }));
      setGeneralEquipmentList(initial);
    }

    if (savedBlocks) {
      setBlockTemplates(JSON.parse(savedBlocks));
    } else {
      setBlockTemplates(INITIAL_BLOCK_TEMPLATES);
    }

    setMuscleGroups(savedMuscles ? JSON.parse(savedMuscles) : INITIAL_MUSCLE_GROUPS);
    setDifficultyLevels(savedDiffs ? JSON.parse(savedDiffs) : INITIAL_DIFFICULTY_LEVELS);
    setMovementPatterns(savedPatterns ? JSON.parse(savedPatterns) : INITIAL_MOVEMENT_PATTERNS);
    setExerciseAssociations(savedAssociations ? JSON.parse(savedAssociations) : INITIAL_EXERCISE_ASSOCIATIONS);
  }, []);

  useEffect(() => {
    localStorage.setItem('ea_athletes', JSON.stringify(athletes));
    localStorage.setItem('ea_team_members', JSON.stringify(teamMembers));
    localStorage.setItem('ea_workouts', JSON.stringify(workouts));
    localStorage.setItem('ea_logs', JSON.stringify(logs));
    localStorage.setItem('ea_wellness', JSON.stringify(wellnessLogs));
    localStorage.setItem('ea_custom_exercises', JSON.stringify(customExercises));
    localStorage.setItem('ea_cycles', JSON.stringify(microcycles));
    localStorage.setItem('ea_mesocycles', JSON.stringify(mesocycles));
    localStorage.setItem('ea_macrocycles', JSON.stringify(macrocycles));
    localStorage.setItem('ea_available_sports', JSON.stringify(availableSports));
    localStorage.setItem('ea_questionnaires', JSON.stringify(questionnaires));
    localStorage.setItem('ea_assignments', JSON.stringify(assignments));
    localStorage.setItem('ea_block_templates', JSON.stringify(blockTemplates));
    localStorage.setItem('ea_equipment_pieces', JSON.stringify(equipmentPieces));
    localStorage.setItem('ea_general_equipment', JSON.stringify(generalEquipmentList));
    localStorage.setItem('ea_prescribed_principles', JSON.stringify(prescribedPrinciples));
    localStorage.setItem('ea_prescribed_learning', JSON.stringify(prescribedLearning));

    localStorage.setItem('ea_muscles', JSON.stringify(muscleGroups));
    localStorage.setItem('ea_diffs', JSON.stringify(difficultyLevels));
    localStorage.setItem('ea_patterns', JSON.stringify(movementPatterns));
    localStorage.setItem('ea_associations', JSON.stringify(exerciseAssociations));
  }, [athletes, teamMembers, workouts, logs, wellnessLogs, customExercises, microcycles, mesocycles, macrocycles, availableSports, questionnaires, assignments, blockTemplates, equipmentPieces, generalEquipmentList, muscleGroups, difficultyLevels, movementPatterns, exerciseAssociations, prescribedPrinciples, prescribedLearning]);

  const handleAddAthlete = (newAthlete: Omit<Athlete, 'id' | 'joinedAt'>) => {
    const athlete: Athlete = { ...newAthlete, id: Math.random().toString(36).substr(2, 9), joinedAt: Date.now() };
    setAthletes([...athletes, athlete]);
  };

  const handleAddPersonnel = (newMember: Omit<Personnel, 'id' | 'joinedAt'>) => {
    const member: Personnel = { ...newMember, id: Math.random().toString(36).substr(2, 9), joinedAt: Date.now() };
    setTeamMembers([...teamMembers, member]);
    if (newMember.role === 'Athlete') {
      const athleteExists = athletes.find(a => a.name === newMember.name);
      if (!athleteExists) {
        handleAddAthlete({ name: newMember.name, sport: 'Multi-Sport', goal: newMember.bio });
      }
    }
  };

  const handleDeleteAthlete = (id: string) => {
    setAthletes(athletes.filter(a => a.id !== id));
    setLogs(logs.filter(l => l.athleteId !== id));
    setWellnessLogs(wellnessLogs.filter(w => w.athleteId !== id));
    setPrescribedPrinciples(prescribedPrinciples.filter(p => p.athleteId !== id));
    if (activeAthleteId === id) setActiveAthleteId(null);
  };

  const handleSaveBlock = (template: BlockTemplate) => {
    setBlockTemplates(prev => [...prev, template]);
  };

  const handleUpdateBlockLibrary = (newList: BlockTemplate[]) => {
    setBlockTemplates(newList);
  };

  const handleAddEquipment = (piece: Omit<EquipmentPiece, 'id'>) => {
    const newPiece: EquipmentPiece = { ...piece, id: Math.random().toString(36).substr(2, 9) };
    setEquipmentPieces(prev => [...prev, newPiece]);
  };

  const handleBatchAddEquipment = (pieces: Omit<EquipmentPiece, 'id'>[]) => {
    const newPieces: EquipmentPiece[] = pieces.map(p => ({ ...p, id: Math.random().toString(36).substr(2, 9) }));
    setEquipmentPieces(prev => [...prev, ...newPieces]);
  };

  const handleAddGeneralEquipmentType = (type: string, imageUrl?: string, tags: string[] = []) => {
    if (!generalEquipmentList.find(g => g.name === type)) {
      const newGE: GeneralEquipment = { name: type, imageUrl, tags };
      setGeneralEquipmentList(prev => [...prev, newGE].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const handleUpdateGeneralEquipment = (oldName: string, updated: GeneralEquipment) => {
    setGeneralEquipmentList(prev => {
      const next = prev.map(g => g.name === oldName ? updated : g);
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    if (oldName !== updated.name) {
      setCustomExercises(prev => prev.map(ex => ex.equipment === oldName ? { ...ex, equipment: updated.name } : ex));
    }
  };

  const handleLogTeamAttendance = (athleteIds: string[], workoutId: string, date: number) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;
    const newLogs: WorkoutLog[] = athleteIds.map(aId => ({
      id: Math.random().toString(36).substr(2, 9),
      athleteId: aId,
      workoutId: workoutId,
      workoutName: workout.name,
      date: date,
      blocks: workout.blocks, 
      durationMinutes: 60,
      intensity: 7,
      totalVolume: 0,
      personalBestsAchieved: []
    }));
    setLogs(prev => [...newLogs, ...prev]);
  };

  const handleSaveWellness = (log: Omit<WellnessLog, 'id'>) => {
    const newLog: WellnessLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    setWellnessLogs([newLog, ...wellnessLogs]);
  };

  const saveWorkout = (w: Workout) => {
    setWorkouts(prev => {
      const exists = prev.find(item => item.id === w.id);
      if (exists) return prev.map(item => item.id === w.id ? w : item);
      return [...prev, w];
    });
    setBuildSubTab('workouts');
    setEditingWorkout(undefined);
  };

  const saveMicrocycle = (c: Microcycle) => {
    setMicrocycles(prev => {
      const exists = prev.find(item => item.id === c.id);
      if (exists) return prev.map(item => item.id === c.id ? c : item);
      return [...prev, c];
    });
    setIsEditingCycle(false);
    setEditingCycle(undefined);
  };

  const saveMesocycle = (m: Mesocycle) => {
    setMesocycles(prev => {
      const exists = prev.find(item => item.id === m.id);
      if (exists) return prev.map(item => item.id === m.id ? m : item);
      return [...prev, m];
    });
    setIsEditingMeso(false);
    setEditingMeso(undefined);
  };

  const saveMacrocycle = (ma: Macrocycle) => {
    setMacrocycles(prev => {
      const exists = prev.find(item => item.id === ma.id);
      if (exists) return prev.map(item => item.id === ma.id ? ma : item);
      return [...prev, ma];
    });
    setIsEditingMacro(false);
    setEditingMacro(undefined);
  };

  const handlePrescribePrinciple = (principleId: string, athleteIds: string[]) => {
    const newAssignments: PrescribedPrincipleAssignment[] = athleteIds.map(aId => ({
      id: Math.random().toString(36).substr(2, 9),
      principleId,
      athleteId: aId,
      assignedAt: Date.now()
    }));
    setPrescribedPrinciples(prev => [...prev, ...newAssignments]);
  };

  const handlePrescribeLearning = (principleId: string, personnelIds: string[]) => {
    const newAssignments: PrescribedLearningAssignment[] = personnelIds.map(pId => ({
      id: Math.random().toString(36).substr(2, 9),
      principleId,
      personnelId: pId,
      assignedAt: Date.now()
    }));
    setPrescribedLearning(prev => [...prev, ...newAssignments]);
  };

  const handleGenerateSplit = async () => {
    const currentSport = sport || activeAthlete?.sport || '';
    const missionString = selectedGoals.length > 0 ? selectedGoals.join(', ') : (activeAthlete?.goal || '');
    if (!currentSport || !missionString) return alert('Please define sport and training objectives first.');
    setIsGenerating(true);
    try {
      const stylesString = selectedStyles.join(', ');
      const rec = await getWorkoutRecommendation(missionString, currentSport, stylesString, level, allExercises);
      setAiRec(rec);
    } catch (e) {
      console.error(e);
      alert('Victor encountered a neural uplink error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNewSport = () => {
    if (tempSport.trim()) {
      const normalized = tempSport.trim();
      if (!availableSports.includes(normalized)) {
        const nextSports = [...availableSports, normalized].sort();
        setAvailableSports(nextSports);
      }
      setSport(normalized);
      setTempSport('');
      setIsAddingSport(false);
    }
  };

  const toggleGoal = (g: string) => setSelectedGoals(prev => prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]);
  const toggleStyle = (s: string) => setSelectedStyles(prev => prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]);

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-4">
      <header className="px-6 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-blue-600 p-2 rounded-lg skew-x-[-12deg]">
                <span className="text-white font-black">EA</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase hidden sm:block">Elemental Athlete</h1>
            </div>
            
            {activeAthlete && (
              <div className="flex items-center gap-3 pl-6 border-l border-slate-800 animate-in slide-in-from-left-4 duration-300">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-blue-900/30 border border-blue-500/50 flex items-center justify-center">
                  {activeAthlete.avatarUrl ? <img src={activeAthlete.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-blue-400">{activeAthlete.name.charAt(0)}</span>}
                </div>
                <div className="leading-none">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Subject</p>
                  <p className="text-sm font-black uppercase text-white">{activeAthlete.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex gap-8">
            <button onClick={() => setActiveTab('dashboard')} className={`font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>Intelligence</button>
            <button onClick={() => setActiveTab('readiness')} className={`font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'readiness' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>Readiness</button>
            <button onClick={() => setActiveTab('attendance')} className={`font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'attendance' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>Deployment</button>
            <button onClick={() => setActiveTab('build')} className={`font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'build' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>Architect</button>
            <button onClick={() => setActiveTab('coaching')} className={`font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'coaching' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>Coaching</button>
            <button onClick={() => setActiveTab('ai')} className={`font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'ai' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>Victor AI</button>
          </div>

          <div className="flex gap-2">
             <button onClick={() => { setActiveTab('build'); setBuildSubTab('designer'); setDesignMode('visual'); }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-full text-xs transition-all shadow-lg shadow-blue-500/20">+ Design</button>
          </div>
        </div>

        <div className="flex items-center gap-8 justify-center border-t border-slate-800/50 pt-4">
          <button 
            onClick={() => setActiveTab('team')} 
            className={`flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] transition-all ${activeTab === 'team' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Command: Team Manager
          </button>
          <button 
            onClick={() => setActiveTab('calendar')} 
            className={`flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] transition-all ${activeTab === 'calendar' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Tactical: Calendar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            logs={filteredLogs} 
            wellnessLogs={wellnessLogs}
            allExercises={allExercises} 
            athletes={athletes}
            activeAthleteId={activeAthleteId}
            onSelectAthlete={setActiveAthleteId}
            onAddAthlete={handleAddAthlete}
            onDeleteAthlete={handleDeleteAthlete}
            prescribedPrinciples={prescribedPrinciples.filter(p => p.athleteId === activeAthleteId)}
          />
        )}

        {activeTab === 'team' && (
          <TeamManager 
            teamMembers={teamMembers}
            onAddMember={handleAddPersonnel}
            onDeleteMember={(id) => setTeamMembers(prev => prev.filter(m => m.id !== id))}
            onSelectMember={(id) => {
              const member = teamMembers.find(m => m.id === id);
              if (member?.role === 'Athlete') {
                const athlete = athletes.find(a => a.name === member.name);
                if (athlete) {
                  setActiveAthleteId(athlete.id);
                  setActiveTab('dashboard');
                }
              }
            }}
            activeMemberId={activeAthleteId}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            logs={logs}
            athletes={athletes}
            workouts={workouts}
            activeAthleteId={activeAthleteId}
          />
        )}

        {activeTab === 'readiness' && (
          <WellnessTracker 
            athlete={activeAthlete}
            athletes={athletes}
            onSave={handleSaveWellness}
            onSelectAthlete={setActiveAthleteId}
            logs={wellnessLogs.filter(w => w.athleteId === activeAthleteId)}
            questionnaires={questionnaires}
            onSaveQuestionnaire={(q) => setQuestionnaires([...questionnaires, q])}
            onAssignQuestionnaire={(a) => setAssignments([...assignments, a])}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTracker 
            athletes={athletes}
            workouts={workouts}
            logs={logs}
            onLogAttendance={handleLogTeamAttendance}
          />
        )}

        {activeTab === 'build' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-4xl font-black uppercase text-white tracking-tighter">Protocol Architect</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Design training logic and long-term phases</p>
              </div>
              <div className="bg-slate-900 p-1 rounded-2xl flex border border-slate-800 w-full md:w-auto shadow-xl">
                <button onClick={() => setBuildSubTab('workouts')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${buildSubTab === 'workouts' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>Vault</button>
                <button onClick={() => { setBuildSubTab('designer'); setEditingWorkout(undefined); }} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${buildSubTab === 'designer' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>Blueprint</button>
              </div>
            </div>

            {buildSubTab === 'workouts' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts.map(w => (
                  <div key={w.id} className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all flex flex-col shadow-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-black uppercase text-white tracking-tighter group-hover:text-blue-400 transition-colors">{w.name}</h3>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
                        {w.tags?.map(tag => <span key={tag} className="text-[7px] font-black bg-slate-950 text-blue-500 px-1 py-0.5 rounded border border-slate-800 uppercase">{tag}</span>)}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2">{w.description}</p>
                    <div className="flex gap-3 mt-auto">
                      <button onClick={() => activeAthleteId ? setActiveSession(w) : alert('Select athlete first')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-4 rounded-2xl shadow-lg shadow-blue-600/20">Deploy</button>
                      <button onClick={() => { setEditingWorkout(w); setBuildSubTab('designer'); setDesignMode('workout'); }} className="p-4 bg-slate-800 rounded-2xl text-slate-500 hover:text-white border border-slate-700/50"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex justify-center overflow-x-auto pb-4">
                  <div className="inline-flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                    <button onClick={() => setDesignMode('visual')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'visual' ? 'bg-slate-900 text-blue-500 shadow-xl' : 'text-slate-500 hover:text-white'}`}>Visual architect</button>
                    <button onClick={() => setDesignMode('workout')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'workout' ? 'bg-slate-900 text-blue-500 shadow-xl' : 'text-slate-500 hover:text-white'}`}>Tactical List</button>
                    <button onClick={() => setDesignMode('cycle')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'cycle' ? 'bg-slate-900 text-blue-500 shadow-xl' : 'text-slate-500 hover:text-white'}`}>Microcycle</button>
                    <button onClick={() => setDesignMode('meso')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'meso' ? 'bg-slate-900 text-indigo-500 shadow-xl' : 'text-slate-500 hover:text-white'}`}>Mesocycle</button>
                    <button onClick={() => setDesignMode('macro')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode === 'macro' ? 'bg-slate-900 text-purple-500 shadow-xl' : 'text-slate-500 hover:text-white'}`}>Macrocycle</button>
                  </div>
                </div>
                {designMode === 'workout' && <WorkoutEditor 
                  onSave={saveWorkout} onCancel={() => { setEditingWorkout(undefined); setBuildSubTab('workouts'); }} exerciseLibrary={allExercises} initialWorkout={editingWorkout} onCreateCustom={() => setIsCreatingExercise(true)} blockTemplates={blockTemplates} onUpdateBlockLibrary={handleUpdateBlockLibrary} equipmentLibrary={equipmentPieces} onRegisterEquipment={handleAddEquipment} onBatchRegisterEquipment={handleBatchAddEquipment} generalEquipmentTypes={generalEquipmentList} onAddGeneralEquipmentType={handleAddGeneralEquipmentType} onUpdateGeneralEquipment={handleUpdateGeneralEquipment}
                  muscleGroups={muscleGroups} setMuscleGroups={setMuscleGroups}
                  difficultyLevels={difficultyLevels} setDifficultyLevels={setDifficultyLevels}
                  movementPatterns={movementPatterns} setMovementPatterns={setMovementPatterns}
                  exerciseAssociations={exerciseAssociations} setExerciseAssociations={setExerciseAssociations}
                />}
                {designMode === 'visual' && <VisualProtocolDesigner onSave={saveWorkout} onCancel={() => setBuildSubTab('workouts')} onSaveBlock={handleSaveBlock} />}
                {designMode === 'cycle' && (isEditingCycle ? <MicrocycleEditor workouts={workouts} onSave={saveMicrocycle} onCancel={() => setIsEditingCycle(false)} initialCycle={editingCycle} /> : <MicrocycleLibrary microcycles={microcycles} workouts={workouts} onAdd={() => { setEditingCycle(undefined); setIsEditingCycle(true); }} onEdit={(c) => { setEditingCycle(c); setIsEditingCycle(true); }} onDelete={(id) => setMicrocycles(prev => prev.filter(c => c.id !== id))} />)}
                {designMode === 'meso' && (isEditingMeso ? <MesocycleEditor microcycles={microcycles} onSave={saveMesocycle} onCancel={() => setIsEditingMeso(false)} initialMeso={editingMeso} /> : <MesocycleLibrary mesocycles={mesocycles} microcycles={microcycles} onAdd={() => { setEditingMeso(undefined); setIsEditingMeso(true); }} onEdit={(m) => { setEditingMeso(m); setIsEditingMeso(true); }} onDelete={(id) => setMesocycles(prev => prev.filter(m => m.id !== id))} />)}
                {designMode === 'macro' && (isEditingMacro ? <MacrocycleEditor mesocycles={mesocycles} onSave={saveMacrocycle} onCancel={() => setIsEditingMacro(false)} initialMacro={editingMacro} /> : <MacrocycleLibrary macrocycles={macrocycles} mesocycles={mesocycles} onAdd={() => { setEditingMacro(undefined); setIsEditingMacro(true); }} onEdit={(ma) => { setEditingMacro(ma); setIsEditingMacro(true); }} onDelete={(id) => setMacrocycles(prev => prev.filter(ma => ma.id !== id))} />)}
                {designMode === 'mindmap' && <MindMapper />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'coaching' && <CoachingHub athletes={athletes} personnel={teamMembers} onPrescribe={handlePrescribePrinciple} onPrescribeLearning={handlePrescribeLearning} />}
        {activeTab === 'ai' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-5xl font-black uppercase text-white tracking-tighter mb-4 italic">Victor Live Coach</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Strategic Protocol Synthesis via Neural Uplink</p>
            </div>
            
            <VictorLiveCoach 
              onSaveExercise={(ex) => setCustomExercises(prev => [...prev, ex])}
              onSaveBlock={(tmpl) => handleSaveBlock(tmpl)}
              onSaveMicrocycle={(mc) => saveMicrocycle(mc)}
              onSaveMesocycle={(m) => saveMesocycle(m)}
              onSaveMacrocycle={(ma) => saveMacrocycle(ma)}
            />
          </div>
        )}
        {activeTab === 'roster' && <Roster athletes={athletes} activeAthleteId={activeAthleteId} onSelectAthlete={(id) => { setActiveAthleteId(id); setActiveTab('dashboard'); }} onAddAthlete={handleAddAthlete} onDeleteAthlete={handleDeleteAthlete} />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex justify-around p-4 z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-slate-500'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span className="text-[9px] font-black uppercase">Stat</span></button>
        <button onClick={() => setActiveTab('readiness')} className={`flex flex-col items-center gap-1 ${activeTab === 'readiness' ? 'text-blue-500' : 'text-slate-500'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg><span className="text-[9px] font-black uppercase">Bio</span></button>
        <button onClick={() => setActiveTab('build')} className={`flex flex-col items-center gap-1 ${activeTab === 'build' ? 'text-blue-500' : 'text-slate-500'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" /></svg><span className="text-[9px] font-black uppercase">Build</span></button>
        <button onClick={() => setActiveTab('coaching')} className={`flex flex-col items-center gap-1 ${activeTab === 'coaching' ? 'text-blue-500' : 'text-slate-500'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg><span className="text-[9px] font-black uppercase">Coach</span></button>
        <button onClick={() => setActiveTab('team')} className={`flex flex-col items-center gap-1 ${activeTab === 'team' ? 'text-blue-500' : 'text-slate-500'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg><span className="text-[9px] font-black uppercase">Team</span></button>
      </nav>

      {activeSession && activeAthleteId && (
        <WorkoutLogger 
          workout={activeSession}
          onCancel={() => setActiveSession(null)}
          exerciseLibrary={allExercises}
          onComplete={(log) => {
            const completeLog: WorkoutLog = { ...log, athleteId: activeAthleteId };
            setLogs([completeLog, ...logs]);
            setActiveSession(null);
            setActiveTab('dashboard');
          }}
        />
      )}

      {isCreatingExercise && (
        <ExerciseCreator 
          onCancel={() => setIsCreatingExercise(false)}
          onSave={(ex) => {
            setCustomExercises([...customExercises, ex]);
            setIsCreatingExercise(false);
          }}
          generalEquipmentList={generalEquipmentList}
          onAddGeneralEquipmentType={handleAddGeneralEquipmentType}
          onUpdateGeneralEquipment={handleUpdateGeneralEquipment}
          equipmentLibrary={equipmentPieces}
          onRegisterEquipment={handleAddEquipment}
          muscleGroups={muscleGroups} setMuscleGroups={setMuscleGroups}
          difficultyLevels={difficultyLevels} setDifficultyLevels={setDifficultyLevels}
          movementPatterns={movementPatterns} setMovementPatterns={setMovementPatterns}
          exerciseAssociations={exerciseAssociations} setExerciseAssociations={setExerciseAssociations}
        />
      )}
    </div>
  );
};

export default App;

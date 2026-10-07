
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type MovementPattern = 'Push' | 'Pull' | 'Squat' | 'Hinge' | 'Lunge' | 'Core' | 'Carry' | 'Cardio' | 'Articulation' | 'Integration';
export type Equipment = string;
export type ExerciseAssociation = 'Pilates' | 'VBT' | 'Calisthenics' | 'Traditional' | 'Olympic' | 'Plyometric' | 'Conjugate Strength' | 'Complex Training' | 'French Contrast' | 'Dog Crap Training' | 'Bodybuilding' | 'HiiT Training' | 'HIT Training';

export type PersonnelRole = 'Coach' | 'Athlete' | 'Medical' | 'Vision' | 'Psychology' | 'Movement' | 'Combat';

export interface GeneralEquipment {
  name: string;
  imageUrl?: string;
  tags?: string[];
}

export interface EquipmentPiece {
  id: string;
  name: string;
  manufacturer: string;
  category: Equipment;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Strength' | 'Hypertrophy' | 'Power' | 'Endurance' | 'Mobility';
  association: ExerciseAssociation;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: Equipment;
  specificEquipmentId?: string;
  difficulty: Difficulty;
  movementPattern: MovementPattern;
  instructions: string[];
  videoUrl: string; // Legacy field
  mediaUrl?: string; // Main image/video
  mediaUrlSetup?: string; // Additional setup view
  mediaUrlFinish?: string; // Additional finish view
  mediaType?: 'image' | 'video';
  setupImageUrl?: string; // Visual start position
  finishImageUrl?: string; // Visual peak/finish position
  description: string;
  tags?: string[];
}

export interface SessionPB {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
}

export interface SetLog {
  reps: number;
  weight: number;
  type?: string;
  distance?: number;
  duration?: number;
  completed: boolean;
}

export interface ExerciseInstance {
  id: string;
  exerciseId: string;
  sets: SetLog[];
  restPeriodSeconds: number;
  notes?: string;
}

export type BlockType = 'Straight' | 'Superset' | 'Circuit';

export interface WorkoutBlock {
  id: string;
  name: string;
  type: BlockType;
  exercises: ExerciseInstance[];
  tags?: string[];
}

export interface BlockTemplate {
  id: string;
  name: string;
  type: BlockType;
  exercises: Omit<ExerciseInstance, 'id'>[]; 
  tags?: string[];
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  blocks: WorkoutBlock[];
  createdAt: number;
  tags?: string[];
}

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  goal: string;
  groupId?: string;
  joinedAt: number;
  avatarUrl?: string;
  role?: PersonnelRole;
}

export interface Personnel {
  id: string;
  name: string;
  role: PersonnelRole;
  specialty: string;
  bio: string;
  joinedAt: number;
  avatarUrl?: string;
  tags?: string[];
}

export interface WorkoutLog {
  id: string;
  athleteId: string;
  workoutId: string;
  workoutName: string;
  date: number;
  blocks: WorkoutBlock[];
  durationMinutes: number;
  intensity: number;
  totalVolume: number;
  personalBestsAchieved: string[]; // Legacy
  sessionPBs?: SessionPB[]; // New structured data
}

export interface WellnessLog {
  id: string;
  athleteId: string;
  date: number;
  sleepHours: number;
  sleepQuality: number;
  soreness: number;
  stress: number;
  fatigue: number;
  notes: string;
}

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: number;
}

export interface Questionnaire {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  createdAt: number;
}

export interface QuestionnaireAssignment {
  id: string;
  questionnaireId: string;
  targetType: 'Individual' | 'Group' | 'All';
  targetIds: string[];
  assignedAt: number;
}

export interface PrescribedPrincipleAssignment {
  id: string;
  principleId: string;
  athleteId: string;
  assignedAt: number;
}

export interface PrescribedLearningAssignment {
  id: string;
  principleId: string;
  personnelId: string;
  assignedAt: number;
}

export interface AIRecommendation {
  title: string;
  reasoning: string;
  workout: Omit<Workout, 'id' | 'createdAt'>;
}

export interface MicrocycleDay {
  dayNumber: number;
  workoutId: string | 'Rest';
}

export interface Microcycle {
  id: string;
  name: string;
  description: string;
  goal: string;
  days: MicrocycleDay[];
  createdAt: number;
}

export interface Mesocycle {
  id: string;
  name: string;
  description: string;
  microcycleIds: string[];
  createdAt: number;
}

export interface Macrocycle {
  id: string;
  name: string;
  description: string;
  mesocycleIds: string[];
  createdAt: number;
}

export interface BoardConnection {
  fromId: string;
  toId: string;
}

/* Added missing exported types for readiness and coaching hub */

export type QuestionCategory = 'Sleep' | 'Stress' | 'Soreness' | 'Nutrition' | 'Mental' | 'Nervous System' | 'Injury';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  responseType: 'Scale1-10' | 'YesNo' | 'Text' | 'MultipleChoice';
  options?: string[];
}

export type BookCategory = 'Physiology' | 'Biomechanics' | 'Periodization' | 'Nutrition' | 'Psychology' | 'Pilates Theory';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  year: number;
  difficulty: string;
  content: string;
  coverUrl: string;
  summary?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number; // 1-10
}

export interface QuizSession {
  topic: string;
  questions: QuizQuestion[];
  currentIdx: number;
  score: number;
  knowledgeLevel: number;
}

/* Added missing exported types for mind mapper */

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  type: 'root' | 'theme' | 'drill';
}

export interface MindMapEdge {
  fromId: string;
  toId: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

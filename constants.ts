
import { Exercise, BlockTemplate, Equipment, MovementPattern, ExerciseAssociation, Question, QuestionCategory, Book, BookCategory } from './types';

export const INITIAL_MUSCLE_GROUPS = [
  'Abs', 'Back', 'Biceps', 'Calves', 'Chest', 'Core', 'Feet', 'Forearms', 
  'Glutes', 'Hands', 'Hamstrings', 'Hips', 'Lower Leg', 'Quads', 
  'Rotator Cuff', 'Shoulders', 'Spine', 'Triceps', 'Full Body'
].sort();

export const INITIAL_DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const INITIAL_MOVEMENT_PATTERNS = ['Push', 'Pull', 'Squat', 'Hinge', 'Lunge', 'Core', 'Carry', 'Cardio', 'Articulation', 'Integration'];

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  'Sleep', 'Stress', 'Soreness', 'Nutrition', 'Mental', 'Nervous System', 'Injury'
];

export const BOOK_CATEGORIES: BookCategory[] = [
  'Physiology', 'Biomechanics', 'Periodization', 'Nutrition', 'Psychology', 'Pilates Theory'
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Supertraining',
    author: 'Yuri Verkhoshansky',
    category: 'Physiology',
    year: 2009,
    difficulty: 'Advanced',
    content: 'Special strength training is the core of this text. It covers the methodology of explosive force production and the shock method (plyometrics). Detailed analysis of the adaptive process in athletes...',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'book-2',
    title: 'Science and Practice of Strength Training',
    author: 'Vladimir Zatsiorsky',
    category: 'Biomechanics',
    year: 2006,
    difficulty: 'Advanced',
    content: 'The three-effort method: maximal effort, dynamic effort, and repeated effort. Biomechanical principles of human movement under load...',
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'book-3',
    title: 'Return to Life Through Contrology',
    author: 'Joseph Pilates',
    category: 'Pilates Theory',
    year: 1945,
    difficulty: 'Fundamental',
    content: 'The original principles of core stability, spinal health, and the integration of mind and body through rhythmic movement...',
    coverUrl: 'https://images.unsplash.com/photo-1535905411545-19996f7955c1?auto=format&fit=crop&q=80&w=400'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  { id: 'q-01', text: 'Rate your sleep quality from last night.', category: 'Sleep', responseType: 'Scale1-10' },
  { id: 'q-02', text: 'How many hours of actual sleep did you achieve?', category: 'Sleep', responseType: 'Scale1-10' },
  { id: 'q-03', text: 'Rate your level of overall muscle soreness.', category: 'Soreness', responseType: 'Scale1-10' },
  { id: 'q-04', text: 'Rate your current mental stress level.', category: 'Stress', responseType: 'Scale1-10' },
  { id: 'q-05', text: 'Rate your perceived physical fatigue.', category: 'Nervous System', responseType: 'Scale1-10' },
  { id: 'q-06', text: 'Are you experiencing any localized sharp pain?', category: 'Injury', responseType: 'YesNo' },
  { id: 'q-07', text: 'Did you meet your hydration targets yesterday?', category: 'Nutrition', responseType: 'YesNo' },
  { id: 'q-08', text: 'Rate your eagerness to train today.', category: 'Mental', responseType: 'Scale1-10' },
  { id: 'q-09', text: 'Did you consume alcohol in the last 24 hours?', category: 'Nutrition', responseType: 'YesNo' },
  { id: 'q-10', text: 'Describe any specific biomechanical restrictions.', category: 'Soreness', responseType: 'Text' },
  { id: 'q-11', text: 'Rate your morning resting heart rate stability.', category: 'Nervous System', responseType: 'Scale1-10' },
  { id: 'q-12', text: 'How was your mood upon waking?', category: 'Mental', responseType: 'MultipleChoice', options: ['Elevated', 'Stable', 'Suppressed', 'Highly Irritable'] }
];

export const INITIAL_EXERCISE_ASSOCIATIONS = [
  'Pilates', 'VBT', 'Calisthenics', 'Traditional', 'Olympic', 'Plyometric',
  'Conjugate Strength', 'Complex Training', 'French Contrast', 'Dog Crap Training',
  'Bodybuilding', 'HiiT Training', 'HIT Training'
];

export const SESSION_OBJECTIVES = [
  'Hypertrophy', 'Strength', 'Power', 'Speed', 'Agility', 
  'Muscular Endurance', 'Core Control', 'Proprioception', 
  'Weight loss', 'Mobility', 'Recovery', 'Core'
].sort();

export interface CoachingPrinciple {
  id: string;
  title: string;
  category: 'Tactical' | 'Technical' | 'Biological' | 'Mental';
  summary: string;
  details: string[];
}

export interface EducationalArticle {
  id: string;
  title: string;
  author: string;
  readTime: string;
  tags: string[];
  content: string;
}

export interface IntelBookmark {
  id: string;
  title: string;
  url: string;
  icon: string;
}

export const TACTICAL_BOOKMARKS: IntelBookmark[] = [
  { id: 'bm-1', title: 'YouTube Performance', url: 'https://www.youtube.com/embed?listType=search&list=athletic+performance+training', icon: '📺' },
  { id: 'bm-2', title: 'Google Scholar', url: 'https://scholar.google.com', icon: '🎓' },
  { id: 'bm-3', title: 'PubMed Science', url: 'https://pubmed.ncbi.nlm.nih.gov', icon: '🔬' },
  { id: 'bm-4', title: 'Westside Barbell', url: 'https://www.westside-barbell.com', icon: '⚔️' },
  { id: 'bm-5', title: 'NSCA Articles', url: 'https://www.nsca.com', icon: '📰' }
];

export interface CoachingVideo {
  id: string;
  title: string;
  category: 'Technique' | 'Strategy' | 'Recovery' | 'Biometrics';
  embedUrl: string;
  thumbnail: string;
  duration: string;
}

export const COACHING_PRINCIPLES: CoachingPrinciple[] = [
  {
    id: 'cp-01',
    title: 'The Neutral Spine Protocol',
    category: 'Technical',
    summary: 'Maintaining a stable axial skeleton during high-force production.',
    details: [
      'Rib-to-hip connection active.',
      'Avoid excessive anterior pelvic tilt under load.',
      'Chin tucked to maintain cervical alignment.'
    ]
  },
  {
    id: 'cp-02',
    title: 'Rate of Force Development (RFD)',
    category: 'Tactical',
    summary: 'Maximizing the velocity of the first 100-200ms of a movement.',
    details: [
      'Intent must be 100% maximal effort.',
      'Utilize stretch-shortening cycle (SSC).',
      'Optimize neural drive through high-intensity primers.'
    ]
  },
  {
    id: 'cp-03',
    title: 'Pelvic Floor Integration',
    category: 'Biological',
    summary: 'Synchronizing deep core pressure with breath work.',
    details: [
      'Exhale on the exertion phase.',
      'Lift from the base before spinal flexion.',
      'Maintain intra-abdominal pressure without "bearing down".'
    ]
  }
];

export const COACH_EDUCATION: EducationalArticle[] = [
  {
    id: 'art-01',
    title: 'Classical Pilates for Modern Power Athletes',
    author: 'Victor',
    readTime: '8 min',
    tags: ['Pilates', 'Strength', 'Injury Prevention'],
    content: 'Pilates is often misunderstood as a "stretch" class. For the elite athlete, it is a system of high-tension core control and spinal articulation that directly translates to transfer of power in the field.'
  },
  {
    id: 'art-02',
    title: 'VBT: Beyond the Barbell Velocity',
    author: 'Victor',
    readTime: '12 min',
    tags: ['VBT', 'Data', 'Periodization'],
    content: 'Velocity Based Training (VBT) is the ultimate tool for autoregulation. Instead of chasing a 1RM that fluctuates daily, we chase the speed of the movement to ensure the nervous system is being trained at the correct intensity.'
  },
  {
    id: 'art-03',
    title: 'The Conjugate Method in Field Sports',
    author: 'Victor',
    readTime: '15 min',
    tags: ['Conjugate', 'Max Effort', 'Power'],
    content: 'Applying Westside principles to non-powerlifters requires a shift in accessory choice. Focus on unilateral explosive movements and lateral stability to bridge the gap between max effort and game day.'
  }
];

export const COACH_VIDEOS: CoachingVideo[] = [
  {
    id: 'vid-01',
    title: 'Velocity Profiling for Sprints',
    category: 'Biometrics',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=400',
    duration: '14:20'
  },
  {
    id: 'vid-02',
    title: 'Reformer Classical Order Analysis',
    category: 'Technique',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400',
    duration: '22:15'
  },
  {
    id: 'vid-03',
    title: 'French Contrast Deployment',
    category: 'Strategy',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
    duration: '09:45'
  }
];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'conj-01', name: 'Max Effort Box Squat', category: 'Strength', association: 'Conjugate Strength', primaryMuscle: 'Hips', secondaryMuscles: ['Glutes', 'Hamstrings', 'Back'],
    equipment: 'Barbell', difficulty: 'Advanced', movementPattern: 'Squat',
    instructions: ['Sit back onto a box slightly below parallel', 'Release hip flexors briefly while maintaining trunk tension', 'Explode off the box', 'Use wide stance to target hips/posterior chain'],
    description: 'The foundation of the Conjugate max effort lower body day. Develops starting strength.', videoUrl: '',
    mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400', mediaType: 'image'
  },
  {
    id: 'conj-02', name: 'Dynamic Effort Speed Pulls', category: 'Power', association: 'Conjugate Strength', primaryMuscle: 'Back', secondaryMuscles: ['Hips', 'Glutes', 'Hands'],
    equipment: 'Barbell', difficulty: 'Intermediate', movementPattern: 'Hinge',
    instructions: ['Use 50-60% of 1RM', 'Attach bands or chains for accommodating resistance', 'Pull as explosively as possible from the floor', 'Maintain perfect technical integrity'],
    description: 'Used to increase the rate of force development (RFD) in the deadlift.', videoUrl: '',
    mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400', mediaType: 'image'
  }
];

export const INITIAL_BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: 'tmpl-pilates-foundation',
    name: 'Classical Mat Opener',
    type: 'Straight',
    exercises: [
      { exerciseId: 'mat-01', restPeriodSeconds: 0, sets: [{ reps: 1, weight: 0, completed: false }] },
      { exerciseId: 'mat-02', restPeriodSeconds: 0, sets: [{ reps: 5, weight: 0, completed: false }] }
    ]
  }
];

export const CATEGORIES = ['Strength', 'Hypertrophy', 'Power', 'Endurance', 'Mobility'];
export const EQUIPMENT_TYPES: Equipment[] = ['Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Bodyweight', 'Bands', 'Cable', 'Reformer', 'Cadillac', 'Wunda Chair', 'Ladder Barrel', 'Spine Corrector', 'Pedi-Pole', 'Stability Ball', 'TRX', 'Rings', 'BOSU', 'Sandbag', 'Sliders'];

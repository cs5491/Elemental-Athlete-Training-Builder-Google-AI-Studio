
import { Workout, WorkoutLog, Athlete, Microcycle, Personnel } from './types';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const SAMPLE_ATHLETES: Athlete[] = [
  {
    id: 'athlete-1',
    name: 'Jaxson Reed',
    sport: 'American Football',
    goal: 'Explosive Power',
    joinedAt: now - (30 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'athlete-2',
    name: 'Sarah Chen',
    sport: 'Basketball',
    goal: 'Vertical Jump & Agility',
    joinedAt: now - (15 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'athlete-3',
    name: 'Elena Rodriguez',
    sport: 'Tennis',
    goal: 'Lateral Speed & Stamina',
    joinedAt: now - (45 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'athlete-4',
    name: 'Marcus Thorne',
    sport: 'MMA',
    goal: 'Strike Power & Grappling Endurance',
    joinedAt: now - (60 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const SAMPLE_PERSONNEL: Personnel[] = [
  {
    id: 'p-1',
    name: 'Victor',
    role: 'Coach',
    specialty: 'Neural Biomechanics',
    bio: 'Lead Architect of the Elemental protocols. Specialized in the intersection of high-force production and spinal integrity.',
    joinedAt: now - (365 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'p-2',
    name: 'Dr. Aris Thorne',
    role: 'Medical',
    specialty: 'Sports Physiotherapy',
    bio: 'Specialist in rapid recovery and joint articulation. Manages the injury prevention sub-routines.',
    joinedAt: now - (200 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'p-3',
    name: 'Lena Optic',
    role: 'Vision',
    specialty: 'Cognitive Performance',
    bio: 'Trains hand-eye coordination and peripheral processing speed for high-velocity environments.',
    joinedAt: now - (150 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'p-4',
    name: 'Kai Zen',
    role: 'Psychology',
    specialty: 'Flow State Management',
    bio: 'Psychological performance lead. Focuses on pre-competition arousal levels and stress resilience.',
    joinedAt: now - (100 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'p-5',
    name: 'Mina Flow',
    role: 'Movement',
    specialty: 'Classical Pilates Master',
    bio: 'Oversees core integration and functional mobility using the Gratz and Balanced Body apparatus library.',
    joinedAt: now - (80 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'p-6',
    name: 'Sifu Ren',
    role: 'Combat',
    specialty: 'Striking Mechanics',
    bio: 'Lead combat specialist. Analyzes kinetic linking and power transfer for professional fight teams.',
    joinedAt: now - (120 * day),
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

// Helper to get all personnel including athletes converted to the generic Personnel type
export const GET_INITIAL_TEAM = (): Personnel[] => {
  const athletePersonnel: Personnel[] = SAMPLE_ATHLETES.map(a => ({
    id: a.id,
    name: a.name,
    role: 'Athlete',
    specialty: a.sport,
    bio: a.goal,
    joinedAt: a.joinedAt,
    avatarUrl: a.avatarUrl
  }));
  return [...SAMPLE_PERSONNEL, ...athletePersonnel];
};

export const SAMPLE_WORKOUTS: Workout[] = [
  {
    id: 'sample-1',
    name: 'Explosive Power Alpha',
    description: 'Focus on triple extension and raw force production. High neurological demand.',
    createdAt: now - (10 * day),
    blocks: [
      {
        id: 'block-1',
        name: 'Olympic Opener',
        type: 'Straight',
        exercises: [
          {
            id: 'inst-1',
            exerciseId: '7',
            restPeriodSeconds: 180,
            notes: 'Focus on fast elbows during the catch.',
            sets: [
              { weight: 135, reps: 3, completed: true },
              { weight: 155, reps: 3, completed: true },
              { weight: 185, reps: 2, completed: true }
            ]
          }
        ]
      },
      {
        id: 'block-2',
        name: 'Main Strength',
        type: 'Straight',
        exercises: [
          {
            id: 'inst-2',
            exerciseId: '1',
            restPeriodSeconds: 120,
            notes: 'Explosive ascent.',
            sets: [
              { weight: 225, reps: 5, completed: true },
              { weight: 275, reps: 5, completed: true },
              { weight: 315, reps: 3, completed: true }
            ]
          }
        ]
      }
    ]
  }
];

export const SAMPLE_MICROCYCLES: Microcycle[] = [
  {
    id: 'micro-1',
    name: 'Pre-Season Force Dev',
    description: 'High frequency strength and power development for field athletes.',
    goal: 'Max Power',
    createdAt: now,
    days: [
      { dayNumber: 1, workoutId: 'sample-1' },
      { dayNumber: 2, workoutId: 'Rest' },
      { dayNumber: 3, workoutId: 'Rest' },
      { dayNumber: 4, workoutId: 'Rest' },
      { dayNumber: 5, workoutId: 'sample-1' },
      { dayNumber: 6, workoutId: 'Rest' },
      { dayNumber: 7, workoutId: 'Rest' }
    ]
  }
];

export const SAMPLE_LOGS: WorkoutLog[] = [
  {
    id: 'log-1',
    athleteId: 'athlete-1',
    workoutId: 'sample-1',
    workoutName: 'Explosive Power Alpha',
    date: now - (1 * day),
    durationMinutes: 65,
    intensity: 8,
    blocks: SAMPLE_WORKOUTS[0].blocks,
    totalVolume: 5000,
    personalBestsAchieved: []
  }
];

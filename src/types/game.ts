export type GradeLevel =
  | 'kindergarten'
  | 'grade1'
  | 'grade2'
  | 'grade3'
  | 'grade4'
  | 'grade5'
  | 'grade6'
  | 'grade7'
  | 'grade8'
  | 'grade9';

export type WorldId = 'world1' | 'world2' | 'world3' | 'world4' | 'world5';

export interface SpellingWord {
  id: string;
  word: string; // e.g. "APPLE"
  grade: GradeLevel;
  category: string;
  hint: string;
  exampleSentence: string;
  phonicsClue: string;
  emojiIcon: string;
  illustrationTheme: 'fruit' | 'creature' | 'object' | 'nature' | 'celestial' | 'vehicle' | 'gem';
  custom?: boolean;
}

export interface AttemptRecord {
  id: string;
  word: string;
  grade: GradeLevel;
  attemptsCount: number;
  isFirstTry: boolean;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  timeSpentSec: number;
}

export interface DailySummary {
  dateStr: string;
  wordsPracticed: number;
  wordsMastered: number;
  accuracyRate: number; // percentage 0-100
  minutesSpent: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
}

export interface PlayerStats {
  profiles: ChildProfile[];
  activeProfileId: string;
  coins: number;
  stars: number;
  totalWordsMastered: number;
  currentStreak: number;
  lastActiveDate: string;
  unlockedWorlds: WorldId[];
  attemptsHistory: AttemptRecord[];
  customWords: SpellingWord[];
  activeGrade: GradeLevel;
  currentWorld: WorldId;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  keyboardLayout: 'qwerty' | 'alphabetical';
  caseMode: 'uppercase' | 'lowercase';
  companionId: 'toad' | 'yoshi' | 'star' | 'dino';
}

export interface WorldConfig {
  id: WorldId;
  worldNumber: number;
  name: string;
  subtitle: string;
  recommendedGrade: GradeLevel;
  bgGradient: string;
  groundGradient: string;
  brickStyle: string;
  icon: string;
  starsRequired: number;
}

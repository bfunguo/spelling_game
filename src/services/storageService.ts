import { AttemptRecord, DailySummary, GradeLevel, PlayerStats, SpellingWord, WorldId } from '../types/game';

const STORAGE_KEY = 'super_spell_quest_save_v1';

export const DEFAULT_STATS: PlayerStats = {
  coins: 40,
  stars: 3,
  totalWordsMastered: 8,
  currentStreak: 2,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedWorlds: ['world1', 'world2'],
  attemptsHistory: [
    // Pre-populate realistic sample history for parent dashboard to demonstrate immediately
    {
      id: 'sample-1',
      word: 'CAT',
      grade: 'kindergarten',
      attemptsCount: 1,
      isFirstTry: true,
      timestamp: Date.now() - 86400000 * 2,
      dateStr: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      timeSpentSec: 6,
    },
    {
      id: 'sample-2',
      word: 'SUN',
      grade: 'kindergarten',
      attemptsCount: 1,
      isFirstTry: true,
      timestamp: Date.now() - 86400000 * 2,
      dateStr: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      timeSpentSec: 5,
    },
    {
      id: 'sample-3',
      word: 'STAR',
      grade: 'kindergarten',
      attemptsCount: 2,
      isFirstTry: false,
      timestamp: Date.now() - 86400000 * 1,
      dateStr: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      timeSpentSec: 12,
    },
    {
      id: 'sample-4',
      word: 'DOG',
      grade: 'kindergarten',
      attemptsCount: 1,
      isFirstTry: true,
      timestamp: Date.now() - 86400000 * 1,
      dateStr: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      timeSpentSec: 7,
    },
    {
      id: 'sample-5',
      word: 'APPLE',
      grade: 'grade1',
      attemptsCount: 1,
      isFirstTry: true,
      timestamp: Date.now() - 3600000 * 3,
      dateStr: new Date().toISOString().split('T')[0],
      timeSpentSec: 9,
    },
    {
      id: 'sample-6',
      word: 'WATER',
      grade: 'grade1',
      attemptsCount: 2,
      isFirstTry: false,
      timestamp: Date.now() - 3600000 * 2,
      dateStr: new Date().toISOString().split('T')[0],
      timeSpentSec: 14,
    },
  ],
  customWords: [],
  activeGrade: 'grade1',
  currentWorld: 'world1',
  soundEnabled: true,
  voiceEnabled: true,
  keyboardLayout: 'qwerty',
  caseMode: 'uppercase',
  companionId: 'toad',
};

export class StorageService {
  public static loadStats(): PlayerStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STATS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATS, ...parsed };
    } catch {
      return DEFAULT_STATS;
    }
  }

  public static saveStats(stats: PlayerStats): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public static recordAttempt(
    stats: PlayerStats,
    word: string,
    grade: GradeLevel,
    attemptsCount: number,
    isFirstTry: boolean,
    timeSpentSec: number
  ): PlayerStats {
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: AttemptRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      word,
      grade,
      attemptsCount,
      isFirstTry,
      timestamp: Date.now(),
      dateStr: todayStr,
      timeSpentSec,
    };

    // Calculate streak
    let streak = stats.currentStreak;
    if (stats.lastActiveDate !== todayStr) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (stats.lastActiveDate === yesterday) {
        streak += 1;
      } else if (stats.lastActiveDate === '') {
        streak = 1;
      }
    }

    const updated: PlayerStats = {
      ...stats,
      coins: stats.coins + (isFirstTry ? 10 : 5),
      stars: isFirstTry ? stats.stars + 1 : stats.stars,
      totalWordsMastered: stats.totalWordsMastered + 1,
      currentStreak: streak,
      lastActiveDate: todayStr,
      attemptsHistory: [newRecord, ...stats.attemptsHistory].slice(0, 100), // retain last 100
    };

    this.saveStats(updated);
    return updated;
  }

  public static getDailySummaries(history: AttemptRecord[]): DailySummary[] {
    const map = new Map<string, { attempts: number; firstTries: number; timeSec: number }>();

    history.forEach((rec) => {
      const existing = map.get(rec.dateStr) || { attempts: 0, firstTries: 0, timeSec: 0 };
      existing.attempts += 1;
      if (rec.isFirstTry) existing.firstTries += 1;
      existing.timeSec += rec.timeSpentSec || 10;
      map.set(rec.dateStr, existing);
    });

    const summaries: DailySummary[] = [];
    map.forEach((val, dateStr) => {
      summaries.push({
        dateStr,
        wordsPracticed: val.attempts,
        wordsMastered: val.firstTries,
        accuracyRate: Math.round((val.firstTries / Math.max(1, val.attempts)) * 100),
        minutesSpent: Math.max(1, Math.round(val.timeSec / 60)),
      });
    });

    return summaries.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }

  public static addCustomWord(stats: PlayerStats, newWord: SpellingWord): PlayerStats {
    const updated: PlayerStats = {
      ...stats,
      customWords: [newWord, ...stats.customWords],
    };
    this.saveStats(updated);
    return updated;
  }

  public static deleteCustomWord(stats: PlayerStats, id: string): PlayerStats {
    const updated: PlayerStats = {
      ...stats,
      customWords: stats.customWords.filter((w) => w.id !== id),
    };
    this.saveStats(updated);
    return updated;
  }
}

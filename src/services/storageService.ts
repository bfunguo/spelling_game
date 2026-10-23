import { AttemptRecord, ChildProfile, DailySummary, GradeLevel, PlayerStats, SpellingWord, WorldId } from '../types/game';

const STORAGE_KEY = 'super_spell_quest_save_v2';
const LEGACY_STORAGE_KEY = 'super_spell_quest_save_v1';

export const DEFAULT_PROFILES: ChildProfile[] = [
  {
    id: 'profile_alyssa',
    name: 'Alyssa',
    avatar: '👧',
    coins: 0,
    stars: 0,
    totalWordsMastered: 0,
    currentStreak: 0,
    attemptsHistory: [],
    activeGrade: 'grade1',
    currentWorld: 'world1',
  },
  {
    id: 'profile_aiden',
    name: 'Aiden',
    avatar: '👦',
    coins: 0,
    stars: 0,
    totalWordsMastered: 0,
    currentStreak: 0,
    attemptsHistory: [],
    activeGrade: 'kindergarten',
    currentWorld: 'world1',
  },
];

export const DEFAULT_STATS: PlayerStats = {
  profiles: DEFAULT_PROFILES,
  activeProfileId: 'profile_alyssa',
  coins: 0,
  stars: 0,
  totalWordsMastered: 0,
  currentStreak: 0,
  lastActiveDate: '',
  unlockedWorlds: ['world1', 'world2'],
  attemptsHistory: [],
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
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      if (!raw) return DEFAULT_STATS;
      const parsed = JSON.parse(raw);
      const loaded: PlayerStats = { ...DEFAULT_STATS, ...parsed };

      // Fallback/Upgrade: If profiles is missing or only contains old placeholder
      const hasOldPlaceholder =
        !loaded.profiles ||
        !Array.isArray(loaded.profiles) ||
        loaded.profiles.length === 0 ||
        (loaded.profiles.length === 1 && loaded.profiles[0].name === 'Super Adventurer');

      if (hasOldPlaceholder) {
        loaded.profiles = DEFAULT_PROFILES;
        loaded.activeProfileId = 'profile_alyssa';
      }

      // Ensure Alyssa and Aiden sample progression starts at 0
      if (loaded.profiles && Array.isArray(loaded.profiles)) {
        loaded.profiles = loaded.profiles.map((p) => {
          if (p.id === 'profile_alyssa' || p.id === 'profile_aiden') {
            if (p.coins === 40 || p.coins === 25 || p.stars === 3 || p.stars === 2) {
              return {
                ...p,
                coins: 0,
                stars: 0,
                totalWordsMastered: 0,
                currentStreak: 0,
                attemptsHistory: [],
              };
            }
          }
          return p;
        });
      }

      // Clear legacy sample attempts and reset mock numbers if present
      if (loaded.coins === 40 || loaded.coins === 25) {
        loaded.coins = 0;
        loaded.stars = 0;
        loaded.totalWordsMastered = 0;
        loaded.currentStreak = 0;
      }
      if (loaded.attemptsHistory) {
        loaded.attemptsHistory = loaded.attemptsHistory.filter((a) => !a.id.startsWith('sample-'));
      }

      if (!loaded.activeProfileId || !loaded.profiles.some((p) => p.id === loaded.activeProfileId)) {
        loaded.activeProfileId = loaded.profiles[0]?.id || DEFAULT_PROFILES[0].id;
      }

      // Sync active profile's initial zero numbers if freshly sanitized
      const activeProf = loaded.profiles.find((p) => p.id === loaded.activeProfileId);
      if (activeProf && (activeProf.coins === 0 && activeProf.stars === 0)) {
        loaded.coins = activeProf.coins ?? 0;
        loaded.stars = activeProf.stars ?? 0;
        loaded.totalWordsMastered = activeProf.totalWordsMastered ?? 0;
        loaded.currentStreak = activeProf.currentStreak ?? 0;
        loaded.attemptsHistory = activeProf.attemptsHistory || [];
      }

      return loaded;
    } catch {
      return DEFAULT_STATS;
    }
  }

  public static saveStats(stats: PlayerStats): void {
    try {
      // Sync active profile's progress counters into the profiles list
      if (stats.profiles && stats.profiles.length > 0 && stats.activeProfileId) {
        stats.profiles = stats.profiles.map((p) => {
          if (p.id === stats.activeProfileId) {
            return {
              ...p,
              coins: stats.coins,
              stars: stats.stars,
              totalWordsMastered: stats.totalWordsMastered,
              currentStreak: stats.currentStreak,
              attemptsHistory: stats.attemptsHistory,
              activeGrade: stats.activeGrade,
              currentWorld: stats.currentWorld,
            };
          }
          return p;
        });
      }
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

  public static createProfile(stats: PlayerStats, name: string, avatar: string): PlayerStats {
    const newId = `profile_${Date.now()}`;
    const newProfile: ChildProfile = {
      id: newId,
      name: name.trim() || 'New Explorer',
      avatar: avatar || '⭐',
      coins: 0,
      stars: 0,
      totalWordsMastered: 0,
      currentStreak: 0,
      attemptsHistory: [],
      activeGrade: stats.activeGrade,
      currentWorld: 'world1',
    };

    // Save current active profile's progress before switching to new one
    const updatedProfiles = stats.profiles.map((p) => {
      if (p.id === stats.activeProfileId) {
        return {
          ...p,
          coins: stats.coins,
          stars: stats.stars,
          totalWordsMastered: stats.totalWordsMastered,
          currentStreak: stats.currentStreak,
          attemptsHistory: stats.attemptsHistory,
          activeGrade: stats.activeGrade,
          currentWorld: stats.currentWorld,
        };
      }
      return p;
    });

    const updated: PlayerStats = {
      ...stats,
      profiles: [...updatedProfiles, newProfile],
      activeProfileId: newId,
      coins: 0,
      stars: 0,
      totalWordsMastered: 0,
      currentStreak: 0,
      attemptsHistory: [],
    };
    this.saveStats(updated);
    return updated;
  }

  public static removeProfile(stats: PlayerStats, profileId: string): PlayerStats {
    if (stats.profiles.length <= 1) return stats;
    const remaining = stats.profiles.filter((p) => p.id !== profileId);
    let nextActiveId = stats.activeProfileId;
    let nextCoins = stats.coins;
    let nextStars = stats.stars;
    let nextMastered = stats.totalWordsMastered;
    let nextStreak = stats.currentStreak;
    let nextHistory = stats.attemptsHistory;
    let nextGrade = stats.activeGrade;
    let nextWorld = stats.currentWorld;

    if (stats.activeProfileId === profileId) {
      const nextTarget = remaining[0];
      nextActiveId = nextTarget.id;
      nextCoins = nextTarget.coins ?? 0;
      nextStars = nextTarget.stars ?? 0;
      nextMastered = nextTarget.totalWordsMastered ?? 0;
      nextStreak = nextTarget.currentStreak ?? 0;
      nextHistory = nextTarget.attemptsHistory ?? [];
      nextGrade = nextTarget.activeGrade ?? stats.activeGrade;
      nextWorld = nextTarget.currentWorld ?? stats.currentWorld;
    }

    const updated: PlayerStats = {
      ...stats,
      profiles: remaining,
      activeProfileId: nextActiveId,
      coins: nextCoins,
      stars: nextStars,
      totalWordsMastered: nextMastered,
      currentStreak: nextStreak,
      attemptsHistory: nextHistory,
      activeGrade: nextGrade,
      currentWorld: nextWorld,
    };
    this.saveStats(updated);
    return updated;
  }

  public static switchProfile(stats: PlayerStats, profileId: string): PlayerStats {
    const target = stats.profiles.find((p) => p.id === profileId);
    if (!target) return stats;

    // Save current active profile's progress
    const updatedProfiles = stats.profiles.map((p) => {
      if (p.id === stats.activeProfileId) {
        return {
          ...p,
          coins: stats.coins,
          stars: stats.stars,
          totalWordsMastered: stats.totalWordsMastered,
          currentStreak: stats.currentStreak,
          attemptsHistory: stats.attemptsHistory,
          activeGrade: stats.activeGrade,
          currentWorld: stats.currentWorld,
        };
      }
      return p;
    });

    const updated: PlayerStats = {
      ...stats,
      profiles: updatedProfiles,
      activeProfileId: profileId,
      coins: target.coins ?? 0,
      stars: target.stars ?? 0,
      totalWordsMastered: target.totalWordsMastered ?? 0,
      currentStreak: target.currentStreak ?? 0,
      attemptsHistory: target.attemptsHistory ?? [],
      activeGrade: target.activeGrade ?? stats.activeGrade,
      currentWorld: target.currentWorld ?? stats.currentWorld,
    };
    this.saveStats(updated);
    return updated;
  }

  public static resetProfileProgress(stats: PlayerStats, profileId: string): PlayerStats {
    const isCurrentActive = stats.activeProfileId === profileId;
    const updatedProfiles = stats.profiles.map((p) => {
      if (p.id === profileId) {
        return {
          ...p,
          coins: 0,
          stars: 0,
          totalWordsMastered: 0,
          currentStreak: 0,
          attemptsHistory: [],
        };
      }
      return p;
    });

    const updated: PlayerStats = {
      ...stats,
      profiles: updatedProfiles,
      ...(isCurrentActive
        ? {
            coins: 0,
            stars: 0,
            totalWordsMastered: 0,
            currentStreak: 0,
            attemptsHistory: [],
          }
        : {}),
    };
    this.saveStats(updated);
    return updated;
  }

  public static resetProgress(stats: PlayerStats): PlayerStats {
    return this.resetProfileProgress(stats, stats.activeProfileId);
  }
}

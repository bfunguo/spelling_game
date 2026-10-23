import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Settings,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sliders,
  Volume2,
  Users,
} from 'lucide-react';
import { DailySummary, GradeLevel, PlayerStats, SpellingWord } from '../types/game';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundEffects';

interface ParentDashboardProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'words' | 'custom' | 'profiles' | 'settings'>('progress');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('⭐');
  const [customWordInput, setCustomWordInput] = useState('');
  const [customHintInput, setCustomHintInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState<'School' | 'Everyday' | 'Adventure'>('School');
  const [customGradeInput, setCustomGradeInput] = useState<GradeLevel>(stats.activeGrade);
  const [isPinUnlocked, setIsPinUnlocked] = useState(true); // default open or gate with 1-click math question
  const [pinChallengeSolved, setPinChallengeSolved] = useState(true);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  // Daily summaries
  const dailySummaries = StorageService.getDailySummaries(stats.attemptsHistory);

  // Computed metrics
  const totalAttempts = stats.attemptsHistory.length;
  const firstTrySuccesses = stats.attemptsHistory.filter((a) => a.isFirstTry).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((firstTrySuccesses / totalAttempts) * 100) : 100;

  // Words needing practice (more than 1 attempt)
  const trickyWords = Array.from(
    new Set(
      stats.attemptsHistory
        .filter((a) => !a.isFirstTry || a.attemptsCount > 1)
        .map((a) => a.word)
    )
  );

  // Words mastered cleanly
  const masteredWords = Array.from(
    new Set(
      stats.attemptsHistory
        .filter((a) => a.isFirstTry)
        .map((a) => a.word)
    )
  );

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = customWordInput.trim().toUpperCase();
    if (!cleanWord || cleanWord.length < 2) return;

    const newSpellingWord: SpellingWord = {
      id: `custom_${Date.now()}`,
      word: cleanWord,
      grade: customGradeInput,
      category: customCategoryInput,
      hint: customHintInput.trim() || `Practice word: ${cleanWord}`,
      exampleSentence: `Can you spell ${cleanWord}?`,
      phonicsClue: `Spell letter by letter: ${cleanWord.split('').join(' - ')}`,
      emojiIcon: '⭐',
      illustrationTheme: 'object',
      custom: true,
    };

    const updated = StorageService.addCustomWord(stats, newSpellingWord);
    onUpdateStats(updated);
    setCustomWordInput('');
    setCustomHintInput('');
    soundService.play1Up();
  };

  const handleDeleteCustomWord = (id: string) => {
    const updated = StorageService.deleteCustomWord(stats, id);
    onUpdateStats(updated);
  };

  const handleGradeChange = (grade: GradeLevel) => {
    const updated: PlayerStats = { ...stats, activeGrade: grade };
    StorageService.saveStats(updated);
    onUpdateStats(updated);
  };

  const handleKeyboardToggle = (layout: 'qwerty' | 'alphabetical') => {
    const updated: PlayerStats = { ...stats, keyboardLayout: layout };
    StorageService.saveStats(updated);
    onUpdateStats(updated);
  };

  const handleCaseToggle = (caseMode: 'uppercase' | 'lowercase') => {
    const updated: PlayerStats = { ...stats, caseMode };
    StorageService.saveStats(updated);
    onUpdateStats(updated);
  };

  const handleVoiceToggle = () => {
    const nextVoice = !stats.voiceEnabled;
    soundService.setVoiceEnabled(nextVoice);
    const updated: PlayerStats = { ...stats, voiceEnabled: nextVoice };
    StorageService.saveStats(updated);
    onUpdateStats(updated);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    const updated = StorageService.createProfile(stats, newProfileName, newProfileAvatar);
    onUpdateStats(updated);
    setNewProfileName('');
    soundService.play1Up();
  };

  const handleSwitchProfile = (id: string) => {
    const updated = StorageService.switchProfile(stats, id);
    onUpdateStats(updated);
  };

  const handleRemoveProfile = (id: string) => {
    if (!stats.profiles || stats.profiles.length <= 1) return;
    const updated = StorageService.removeProfile(stats, id);
    onUpdateStats(updated);
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all progress (coins, stars, mastery history) for this profile?")) {
      const updated = StorageService.resetProgress(stats);
      onUpdateStats(updated);
      soundService.playGentleOops();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border-4 border-slate-900 shadow-2xl p-4 sm:p-7 my-auto text-slate-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Parent Progress Tracker
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Elementary Curriculum Standards</span>
                <span aria-hidden="true">·</span>
                <span>Daily Learning Analytics</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            aria-label="Close Parent Tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl mb-4 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'progress'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Daily Progress</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('words')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'words'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Word Mastery ({masteredWords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Custom Word Lists</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profiles')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profiles'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Child Profiles ({stats.profiles?.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Curriculum & Controls</span>
          </button>
        </div>

        {/* Tab 1: Daily Progress */}
        {activeTab === 'progress' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* 4-Box Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-indigo-900 tabular-nums">
                  {overallAccuracy}%
                </div>
                <div className="text-xs font-semibold text-indigo-700 mt-0.5">
                  1st Try Accuracy
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-emerald-900 tabular-nums">
                  {stats.totalWordsMastered}
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  Words Mastered
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-amber-900 tabular-nums">
                  {stats.currentStreak} Days
                </div>
                <div className="text-xs font-semibold text-amber-700 mt-0.5">
                  Daily Streak 🔥
                </div>
              </div>

              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-sky-900 tabular-nums">
                  {stats.stars} ⭐
                </div>
                <div className="text-xs font-semibold text-sky-700 mt-0.5">
                  Power Stars
                </div>
              </div>
            </div>

            {/* Daily History Table / Visual Bar */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Daily Practice Log & Improvement</span>
              </h3>

              {dailySummaries.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No practice sessions recorded yet. Start spelling to see daily charts!
                </p>
              ) : (
                <div className="space-y-3">
                  {dailySummaries.map((summary) => (
                    <div
                      key={summary.dateStr}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-[85px]">
                        <span className="font-bold text-slate-900">{summary.dateStr}</span>
                        <div className="text-[11px] text-slate-500">
                          {summary.minutesSpent} min practice
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="flex-1 max-w-[200px] hidden sm:block">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Accuracy</span>
                          <span className="font-bold">{summary.accuracyRate}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              summary.accuracyRate >= 80
                                ? 'bg-emerald-500'
                                : summary.accuracyRate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${summary.accuracyRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-bold text-slate-800">
                            {summary.wordsPracticed} words
                          </div>
                          <div className="text-[11px] text-emerald-600 font-semibold">
                            {summary.wordsMastered} on first try
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Word Mastery Breakdown */}
        {activeTab === 'words' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Mastered Section */}
            <div>
              <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mastered Words ({masteredWords.length})</span>
              </h3>
              {masteredWords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No mastered words yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {masteredWords.map((word) => (
                    <span
                      key={word}
                      className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-bold"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tricky Words Section */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Words To Practise More ({trickyWords.length})</span>
              </h3>
              {trickyWords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Awesome! No tricky words currently flagged for review.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trickyWords.map((word) => (
                    <span
                      key={word}
                      className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Custom Word Lists */}
        {activeTab === 'custom' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Add Words for Child's Upcoming School Test
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Enter your child's weekly elementary spelling list so they can practise them in the Mario adventure!
              </p>

              <form onSubmit={handleAddCustomWord} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Word (e.g. FRIEND, MONDAY)
                    </label>
                    <input
                      type="text"
                      value={customWordInput}
                      onChange={(e) => setCustomWordInput(e.target.value.toUpperCase())}
                      placeholder="TYPE WORD"
                      maxLength={15}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      value={customGradeInput}
                      onChange={(e) => setCustomGradeInput(e.target.value as GradeLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="kindergarten">Kindergarten</option>
                      <option value="grade1">Grade 1</option>
                      <option value="grade2">Grade 2</option>
                      <option value="grade3">Grade 3</option>
                      <option value="grade4">Grade 4</option>
                      <option value="grade5">Grade 5</option>
                      <option value="grade6">Grade 6</option>
                      <option value="grade7">Grade 7</option>
                      <option value="grade8">Grade 8</option>
                      <option value="grade9">Grade 9</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Child-friendly Hint or Clue
                  </label>
                  <input
                    type="text"
                    value={customHintInput}
                    onChange={(e) => setCustomHintInput(e.target.value)}
                    placeholder="e.g. Someone you love spending playtime with"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customWordInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Practice Game</span>
                </button>
              </form>
            </div>

            {/* List of Custom Words */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Custom Added Words ({stats.customWords.length})
              </h4>
              {stats.customWords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No custom words added yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.customWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{word.word}</span>
                        <span className="ml-2 text-xs text-slate-500">({word.hint})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomWord(word.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Remove word"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Child Profiles */}
        {activeTab === 'profiles' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-indigo-900 mb-1">Child Profiles</h3>
              <p className="text-xs text-indigo-700 mb-3">
                Create separate profiles for multiple children so each child tracks their own coins, stars, streak, and spelling progress.
              </p>

              {/* Create Profile Form */}
              <form onSubmit={handleCreateProfile} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border border-indigo-200">
                <select
                  value={newProfileAvatar}
                  onChange={(e) => setNewProfileAvatar(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 cursor-pointer"
                >
                  {['⭐', '🦖', '🦄', '🚀', '🐱', '🦊', '🦁', '🐼', '🐸', '🐨'].map((av) => (
                    <option key={av} value={av}>{av} Avatar</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Child's Name..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newProfileName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow"
                >
                  Create Profile
                </button>
              </form>
            </div>

            {/* Profiles List */}
            <div className="space-y-2">
              {(stats.profiles || [{ id: stats.activeProfileId || 'profile_1', name: 'Super Adventurer', avatar: '⭐' }]).map((profile) => {
                const isActive = profile.id === (stats.activeProfileId || 'profile_1');
                return (
                  <div
                    key={profile.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl">
                        {profile.avatar || '⭐'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{profile.name}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isActive ? `Coins: ${stats.coins} | Stars: ${stats.stars} ⭐` : 'Tap to switch profile'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleSwitchProfile(profile.id)}
                          className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                        >
                          Switch
                        </button>
                      )}
                      {(stats.profiles || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProfile(profile.id)}
                          className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-colors cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Curriculum Standards & Child Preferences */}
        {activeTab === 'settings' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Active Grade Selector */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label htmlFor="active-grade-select" className="block text-sm font-bold text-slate-900">
                    Curriculum Standard (Active Grade Level)
                  </label>
                  <p className="text-xs text-slate-500">
                    Select your student's learning standard from Kindergarten up to Grade 9.
                  </p>
                </div>
                <select
                  id="active-grade-select"
                  value={stats.activeGrade}
                  onChange={(e) => handleGradeChange(e.target.value as GradeLevel)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold bg-white text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="kindergarten">Kindergarten (CVC & Sight)</option>
                  <option value="grade1">Grade 1 (Blends & Digraphs)</option>
                  <option value="grade2">Grade 2 (Compound Words)</option>
                  <option value="grade3">Grade 3 (Prefixes & Science)</option>
                  <option value="grade4">Grade 4 (Multi-Syllable)</option>
                  <option value="grade5">Grade 5 (STEM & Roots)</option>
                  <option value="grade6">Grade 6 (Inquiry & Context)</option>
                  <option value="grade7">Grade 7 (Academic Vocabulary)</option>
                  <option value="grade8">Grade 8 (High Frequency & Rhetoric)</option>
                  <option value="grade9">Grade 9 (Advanced & Literature)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'kindergarten', label: 'Kindergarten', sub: 'CVC & Sight' },
                  { id: 'grade1', label: 'Grade 1', sub: 'Blends & Digraphs' },
                  { id: 'grade2', label: 'Grade 2', sub: 'Compound Words' },
                  { id: 'grade3', label: 'Grade 3', sub: 'Prefixes & Science' },
                  { id: 'grade4', label: 'Grade 4', sub: 'Multi-Syllable' },
                  { id: 'grade5', label: 'Grade 5', sub: 'STEM & Roots' },
                  { id: 'grade6', label: 'Grade 6', sub: 'Inquiry & Context' },
                  { id: 'grade7', label: 'Grade 7', sub: 'Academic Vocab' },
                  { id: 'grade8', label: 'Grade 8', sub: 'Rhetoric & Logic' },
                  { id: 'grade9', label: 'Grade 9', sub: 'Advanced Literature' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGradeChange(g.id as GradeLevel)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      stats.activeGrade === g.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm font-bold ring-2 ring-indigo-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="text-xs font-bold">{g.label}</div>
                    <div className={`text-[10px] truncate ${stats.activeGrade === g.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {g.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Layout */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Touch Keyboard Layout</h4>
                <p className="text-xs text-slate-500">
                  Alphabetical (A-Z) is ideal for toddlers/kindergarten; QWERTY prepares for typing.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleKeyboardToggle('alphabetical')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    stats.keyboardLayout === 'alphabetical'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  ABC (A-Z)
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyboardToggle('qwerty')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    stats.keyboardLayout === 'qwerty'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  QWERTY
                </button>
              </div>
            </div>

            {/* Case Mode */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Letter Case</h4>
                <p className="text-xs text-slate-500">
                  Switch display between UPPERCASE (BLOCK) and lowercase letters.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCaseToggle('uppercase')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    stats.caseMode === 'uppercase'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  UPPER (ABC)
                </button>
                <button
                  type="button"
                  onClick={() => handleCaseToggle('lowercase')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    stats.caseMode === 'lowercase'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  lower (abc)
                </button>
              </div>
            </div>

            {/* Voice Guidance */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Pronounce Words Aloud (TTS)</h4>
                <p className="text-xs text-slate-500">
                  Uses speech synthesis so children hear the word pronounced naturally.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  stats.voiceEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {stats.voiceEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Reset Progress Section */}
            <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-rose-900">Reset Child's Progress</h4>
                <p className="text-xs text-rose-700">
                  Clear all coins, stars, streak, and word history for this profile.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetProgress}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
              >
                Reset Progress
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};

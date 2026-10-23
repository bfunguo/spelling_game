/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { GradeLevel, PlayerStats, SpellingWord, WorldId } from './types/game';
import { ELEMENTARY_WORDS, WORLDS_CONFIG, COMPANIONS } from './data/curriculumWords';
import { StorageService } from './services/storageService';
import { soundService } from './services/soundEffects';
import { PlatformerHeader } from './components/PlatformerHeader';
import { WordVisualCard } from './components/WordVisualCard';
import { TouchKeyboard } from './components/TouchKeyboard';
import { MarioCompanion } from './components/MarioCompanion';
import { ParentDashboard } from './components/ParentDashboard';
import { WorldSelectMap } from './components/WorldSelectMap';
import { VictoryModal } from './components/VictoryModal';
import { fireVictoryConfetti } from './components/AudioVisuals';
import marioGrasslandBg from './assets/images/mario_world_grassland_1790692639852.jpg';
import { FOOTER_CONFIG } from './config/footerConfig';

const WORDS_PER_STAGE = 5;

export default function App() {
  // Load saved stats
  const [stats, setStats] = useState<PlayerStats>(() => StorageService.loadStats());

  // Game state
  const [currentWordIndexInStage, setCurrentWordIndexInStage] = useState(0);
  const [stageNumber, setStageNumber] = useState(1);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [wordAttempts, setWordAttempts] = useState(0);
  const [wordStartTime, setWordStartTime] = useState<number>(Date.now());
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPhonicsClue, setShowPhonicsClue] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [stageCompletedWords, setStageCompletedWords] = useState<string[]>([]);
  const [hiddenLetters, setHiddenLetters] = useState<string[]>([]);

  // Modals & UI
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showStageVictory, setShowStageVictory] = useState(false);
  const [companionMood, setCompanionMood] = useState<'idle' | 'happy' | 'celebrating' | 'thinking' | 'encouraging'>('idle');
  const [companionDialogue, setCompanionDialogue] = useState<string>("Tap the picture to hear it!");

  // Sync sound settings with service
  useEffect(() => {
    soundService.setSoundEnabled(stats.soundEnabled);
    soundService.setVoiceEnabled(stats.voiceEnabled);
  }, [stats.soundEnabled, stats.voiceEnabled]);

  // Current World Config
  const currentWorld = useMemo(() => {
    return WORLDS_CONFIG.find((w) => w.id === stats.currentWorld) || WORLDS_CONFIG[0];
  }, [stats.currentWorld]);

  // Active Word List: filtered by active grade + custom words (randomized/shuffled when grade changes)
  const activeWordPool = useMemo(() => {
    const defaultWords = ELEMENTARY_WORDS.filter((w) => w.grade === stats.activeGrade);
    const customForGrade = stats.customWords.filter((w) => w.grade === stats.activeGrade);
    const pool = [...customForGrade, ...defaultWords];
    const basePool = pool.length > 0 ? pool : ELEMENTARY_WORDS;

    const shuffled = [...basePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [stats.activeGrade, stats.customWords]);

  // Reset stage & index when active grade changes
  useEffect(() => {
    setCurrentWordIndexInStage(0);
    setStageNumber(1);
    setStageCompletedWords([]);
  }, [stats.activeGrade]);

  // Current Word
  const currentWord: SpellingWord = useMemo(() => {
    const idx = (currentWordIndexInStage + (stageNumber - 1) * WORDS_PER_STAGE) % activeWordPool.length;
    return activeWordPool[idx] || activeWordPool[0];
  }, [activeWordPool, currentWordIndexInStage, stageNumber]);

  // Reset letter slots when current word changes
  useEffect(() => {
    setUserLetters([]);
    setHiddenLetters([]);
    setIsSuccess(false);
    setIsError(false);
    setShowPhonicsClue(false);

    // Hint Calculation: 35% of total letter count, rounded up
    const maxHints = Math.ceil(currentWord.word.length * 0.35);
    setHintsRemaining(maxHints);

    setWordAttempts(0);
    setWordStartTime(Date.now());
    setCompanionMood('idle');
    setCompanionDialogue("Tap the picture to hear it!");

    // Auto-pronounce word for kids when it appears
    if (stats.voiceEnabled) {
      const timer = setTimeout(() => {
        soundService.speakWord(currentWord.word);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentWord.id, currentWord.word, stats.voiceEnabled]);

  // Handle Letter Submission Check
  const handleLetterInput = useCallback(
    (letter: string) => {
      if (isSuccess || showParentDashboard || showWorldMap || showStageVictory) return;

      const upperLetter = letter.toUpperCase();
      const targetWord = currentWord.word.toUpperCase();
      const nextIndex = userLetters.length;

      if (nextIndex >= targetWord.length) return;

      // Ignore if key is already hidden due to an incorrect guess
      if (hiddenLetters.includes(upperLetter)) return;

      const expectedLetter = targetWord[nextIndex];

      // Check if this specific letter was correct
      if (upperLetter === expectedLetter) {
        soundService.playJump();
        setCompanionMood('happy');

        // Reset on Success: restore visibility to all hidden keyboard keys
        setHiddenLetters([]);

        const updatedLetters = [...userLetters, upperLetter];
        setUserLetters(updatedLetters);

        // Check if word completed
        if (updatedLetters.length === targetWord.length) {
          // WORD COMPLETED SUCCESSFULLY!
          setIsSuccess(true);
          soundService.playCorrectWord();
          fireVictoryConfetti();
          setCompanionMood('celebrating');

          const timeSpent = Math.max(2, Math.round((Date.now() - wordStartTime) / 1000));
          const isFirstTry = wordAttempts === 0;

          // Record in persistent storage
          const updatedStats = StorageService.recordAttempt(
            stats,
            currentWord.word,
            currentWord.grade,
            wordAttempts + 1,
            isFirstTry,
            timeSpent
          );
          setStats(updatedStats);

          // Add to stage completed words
          const nextCompleted = [...stageCompletedWords, currentWord.word];
          setStageCompletedWords(nextCompleted);

          // Advance to next word or stage victory after short celebration
          setTimeout(() => {
            if (currentWordIndexInStage + 1 >= WORDS_PER_STAGE) {
              // STAGE COMPLETE!
              setShowStageVictory(true);
            } else {
              setCurrentWordIndexInStage((prev) => prev + 1);
            }
          }, 1400);
        }
      } else {
        // Incorrect Guess Handling: immediately hide that specific key
        // Lock & Retry Loop: keep incorrect keys hidden and force user to continue guessing
        soundService.playGentleOops();
        setIsError(true);
        setWordAttempts((prev) => prev + 1);
        setCompanionMood('encouraging');
        setHiddenLetters((prev) => (prev.includes(upperLetter) ? prev : [...prev, upperLetter]));

        setTimeout(() => {
          setIsError(false);
        }, 400);
      }
    },
    [
      isSuccess,
      showParentDashboard,
      showWorldMap,
      showStageVictory,
      currentWord,
      userLetters,
      hiddenLetters,
      wordStartTime,
      wordAttempts,
      stats,
      stageCompletedWords,
      currentWordIndexInStage,
    ]
  );

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (isSuccess || userLetters.length === 0) return;
    setUserLetters((prev) => prev.slice(0, -1));
    setHiddenLetters([]);
    setIsError(false);
  }, [isSuccess, userLetters]);

  // Handle Clear / Reset
  const handleClear = useCallback(() => {
    if (isSuccess) return;
    setUserLetters([]);
    setHiddenLetters([]);
    setIsError(false);
  }, [isSuccess]);

  // Handle Hint Request: Reveal one correct letter per hint used, decrementing remaining hints
  const handleHintRequest = useCallback(() => {
    if (isSuccess || hintsRemaining <= 0) return;
    const targetWord = currentWord.word.toUpperCase();
    const nextIdx = userLetters.length;

    if (nextIdx < targetWord.length) {
      const correctNextLetter = targetWord[nextIdx];
      setHintsRemaining((prev) => Math.max(0, prev - 1));
      handleLetterInput(correctNextLetter);
    }
  }, [isSuccess, hintsRemaining, currentWord, userLetters, handleLetterInput]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if parent modal or text input is active
      if (showParentDashboard || showWorldMap || showStageVictory) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleLetterInput(e.key);
      } else if (e.key === ' ') {
        e.preventDefault();
        soundService.speakWord(currentWord.word);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showParentDashboard,
    showWorldMap,
    showStageVictory,
    handleBackspace,
    handleLetterInput,
    currentWord,
  ]);

  // Stage Advance
  const handleNextStage = () => {
    setShowStageVictory(false);
    setStageCompletedWords([]);
    setCurrentWordIndexInStage(0);
    setStageNumber((prev) => prev + 1);
  };

  // World Selection
  const handleSelectWorld = (worldId: WorldId, recommendedGrade: GradeLevel) => {
    const updatedStats: PlayerStats = {
      ...stats,
      currentWorld: worldId,
      activeGrade: recommendedGrade,
    };
    StorageService.saveStats(updatedStats);
    setStats(updatedStats);
    setCurrentWordIndexInStage(0);
    setStageCompletedWords([]);
    setShowWorldMap(false);
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const next = !stats.soundEnabled;
    soundService.setSoundEnabled(next);
    const updated: PlayerStats = { ...stats, soundEnabled: next };
    StorageService.saveStats(updated);
    setStats(updated);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden bg-sky-400">
      {/* Platformer Background Scene */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Sky with gradient fallback */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentWorld.bgGradient} opacity-95`} />

        {/* Mario Grassland Background Image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-bottom opacity-35 mix-blend-multiply"
          style={{ backgroundImage: `url(${marioGrasslandBg})` }}
        />

        {/* Mario Style Floating Animated Clouds */}
        <div className="absolute top-12 left-10 text-white/50 text-6xl animate-mario-float select-none">
          ☁️
        </div>
        <div
          className="absolute top-24 right-16 text-white/50 text-5xl animate-mario-float select-none"
          style={{ animationDelay: '1.5s' }}
        >
          ☁️
        </div>
      </div>

      {/* Top HUD Header */}
      <PlatformerHeader
        worldName={currentWorld.name}
        worldNumber={currentWorld.worldNumber}
        currentWordIndex={currentWordIndexInStage}
        totalWordsInStage={WORDS_PER_STAGE}
        coins={stats.coins}
        stars={stats.stars}
        streak={stats.currentStreak}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenMap={() => setShowWorldMap(true)}
        onOpenParents={() => setShowParentDashboard(true)}
      />

      {/* Main Interactive Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-4 max-w-4xl mx-auto w-full">
        {/* Companion Guide with Speech Bubble */}
        <div className="w-full mb-3">
          <MarioCompanion
            message={companionDialogue}
            mood={companionMood}
            companionName={COMPANIONS[0].name}
            pronounceText={currentWord.word}
            onCompanionClick={() => {
              soundService.speakSentence("Tap the picture to hear it!");
            }}
          />
        </div>

        {/* Word Card & Question Block */}
        <div className="w-full mb-4">
          <WordVisualCard
            currentWord={currentWord}
            userLetters={userLetters}
            isSuccess={isSuccess}
            isError={isError}
            showPhonicsClue={showPhonicsClue}
            onToggleClue={() => setShowPhonicsClue(!showPhonicsClue)}
            caseMode={stats.caseMode}
          />
        </div>

        {/* Touch Friendly On-Screen Keyboard */}
        <div className="w-full">
          <TouchKeyboard
            onLetterPress={handleLetterInput}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onHintRequest={handleHintRequest}
            onSpeakRequest={() => soundService.speakWord(currentWord.word)}
            layout={stats.keyboardLayout}
            caseMode={stats.caseMode}
            hintsRemaining={hintsRemaining}
            hiddenLetters={hiddenLetters}
          />
        </div>
      </main>

      {/* Platformer Ground Platform (Mario Brick & Grass Footer) */}
      <footer className="relative z-10 w-full mt-4 select-none">
        {/* Lush green grass rim with platformer edge */}
        <div className="h-4 w-full bg-emerald-500 border-t-4 border-emerald-400 shadow-md" />

        {/* Platformer Ground Bricks */}
        <div className="w-full bg-amber-800 border-t-4 border-amber-950 py-2.5 px-4 text-center">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-amber-200 font-bold">
            <span className="flex items-center gap-1.5">
              <span>🍄 {FOOTER_CONFIG.gameTitle}</span>
              <span aria-hidden="true">·</span>
              <span>{FOOTER_CONFIG.curriculumText}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowParentDashboard(true)}
              className="text-amber-100 hover:text-white underline cursor-pointer"
            >
              {FOOTER_CONFIG.parentHubButtonText}
            </button>
          </div>
        </div>
      </footer>

      {/* World Select Map Modal */}
      {showWorldMap && (
        <WorldSelectMap
          currentWorldId={stats.currentWorld}
          unlockedWorlds={stats.unlockedWorlds}
          userStars={stats.stars}
          onSelectWorld={handleSelectWorld}
          onClose={() => setShowWorldMap(false)}
        />
      )}

      {/* Parent Progress Dashboard Modal */}
      {showParentDashboard && (
        <ParentDashboard
          stats={stats}
          onUpdateStats={setStats}
          onClose={() => setShowParentDashboard(false)}
        />
      )}

      {/* Stage Clear Victory Celebration Modal */}
      {showStageVictory && (
        <VictoryModal
          stageNumber={stageNumber}
          worldName={currentWorld.name}
          coinsEarned={50}
          starsEarned={1}
          wordsSpelled={stageCompletedWords}
          onContinue={handleNextStage}
        />
      )}
    </div>
  );
}

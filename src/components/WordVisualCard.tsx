import React, { useState } from 'react';
import { Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { SpellingWord } from '../types/game';
import { soundService } from '../services/soundEffects';
import questionBlockImg from '../assets/images/mario_quest_block_1790692679226.jpg';

interface WordVisualCardProps {
  currentWord: SpellingWord;
  userLetters: string[];
  isSuccess: boolean;
  isError: boolean;
  showPhonicsClue: boolean;
  onToggleClue: () => void;
  caseMode: 'uppercase' | 'lowercase';
}

export const WordVisualCard: React.FC<WordVisualCardProps> = ({
  currentWord,
  userLetters,
  isSuccess,
  isError,
  showPhonicsClue,
  onToggleClue,
  caseMode,
}) => {
  const [questImgError, setQuestImgError] = useState(false);
  const targetWord = currentWord.word.toUpperCase();
  const targetLetters = targetWord.split('');

  const handleSpeakWord = () => {
    soundService.speakWord(currentWord.word);
  };

  // Dynamic slot sizing to ensure all letters fit on a single line
  const getSlotStyle = (length: number) => {
    if (length >= 13) {
      return 'w-6 h-8 sm:w-8 sm:h-9 rounded-lg border-2 text-[11px] sm:text-xs shrink-0';
    }
    if (length >= 9) {
      return 'w-7 h-9 sm:w-9 sm:h-10 rounded-xl border-2 sm:border-3 text-xs sm:text-sm shrink-0';
    }
    if (length >= 6) {
      return 'w-8 h-10 sm:w-10 sm:h-11 rounded-xl border-2 sm:border-3 text-xs sm:text-sm shrink-0';
    }
    return 'w-9 h-11 sm:w-11 sm:h-12 rounded-xl border-3 text-sm sm:text-base shrink-0';
  };

  return (
    <div className="relative w-full max-w-2xl sm:max-w-3xl mx-auto flex flex-col items-center">
      {/* Mario Floating Question Block & Word Visual Banner */}
      <div
        className={`relative w-full bg-amber-50 rounded-3xl border-4 border-amber-900 shadow-2xl p-4 sm:p-6 transition-all duration-300 ${
          isError ? 'animate-[shake_0.4s_ease-in-out]' : ''
        } ${isSuccess ? 'ring-8 ring-yellow-400 bg-yellow-50' : ''}`}
      >
        {/* Mario Block Screws / Rivets in corners */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />

        {/* Category & Word Level Kicker */}
        <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-2 px-1">
          <div className="flex items-center gap-1.5 bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-400">
            <span>{currentWord.category}</span>
            <span>·</span>
            <span>{currentWord.word.length} Letters</span>
          </div>

          <button
            type="button"
            onClick={onToggleClue}
            className="flex items-center gap-1 text-amber-800 hover:text-amber-950 font-semibold cursor-pointer underline text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showPhonicsClue ? 'Hide Clue' : 'Need Clue?'}</span>
          </button>
        </div>

        {/* Central Illustration Display Area */}
        <div className="relative my-2 py-4 px-6 bg-gradient-to-b from-sky-100 to-sky-50 rounded-2xl border-3 border-amber-800/40 flex flex-col items-center justify-center overflow-visible">
          {/* Subtle clouds background */}
          <div className="absolute top-2 left-4 text-sky-200 select-none text-2xl opacity-60">☁️</div>
          <div className="absolute top-3 right-6 text-sky-200 select-none text-2xl opacity-60">☁️</div>

          {/* Big, Vibrant Word Icon / Emoji */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={handleSpeakWord}
              title="Click to hear word pronunciation!"
              className="group relative cursor-pointer focus:outline-none transition-transform active:scale-95"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-3 border-amber-900 shadow-lg flex items-center justify-center text-5xl sm:text-6xl group-hover:scale-105 transition-all">
                {currentWord.emojiIcon}
              </div>

              {/* Sound indicator badge */}
              <div className="absolute -bottom-2 -right-2 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow-md border-2 border-white flex items-center justify-center group-hover:animate-bounce">
                <Volume2 className="w-4 h-4" />
              </div>
            </button>

            {/* Tap to listen audio prompt */}
            <p className="mt-3 text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <span>Tap picture to hear word</span>
            </p>
          </div>

          {/* Phonics / Meaning Hint Accordion */}
          {showPhonicsClue && (
            <div className="mt-3 w-full bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 text-center text-xs sm:text-sm font-medium text-amber-900 shadow-sm animate-fadeIn">
              <p className="font-bold text-amber-950">💡 Hint: {currentWord.hint}</p>
              <p className="mt-1 text-amber-800 italic text-xs">"{currentWord.exampleSentence}"</p>
              <p className="mt-1 text-emerald-800 font-bold text-xs">{currentWord.phonicsClue}</p>
            </div>
          )}

          {/* Floating Coin on Success */}
          {isSuccess && (
            <div className="absolute -top-6 inset-x-0 pointer-events-none flex items-center justify-center z-30 overflow-visible">
              <div className="animate-coin-pop flex flex-col items-center select-none">
                <span className="text-6xl drop-shadow-lg">🪙</span>
                <span className="font-black text-amber-700 text-xs sm:text-sm bg-yellow-200/95 px-2.5 py-0.5 rounded-full border-2 border-yellow-500 shadow-md mt-1">
                  +10 COINS!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Letter Boxes Container (Mario Style Brick / Gold Blocks) */}
        <div className="mt-3 w-full overflow-visible">
          <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-1.5 w-full overflow-visible px-1 py-3 sm:py-4">
            {targetLetters.map((targetLetter, index) => {
              const userLetter = userLetters[index];
              const isCurrentFocus = userLetters.length === index && !isSuccess;
              const isFilled = !!userLetter;
              const displayChar = userLetter
                ? (caseMode === 'lowercase' ? userLetter.toLowerCase() : userLetter)
                : '';

              return (
                <div
                  key={index}
                  className={`relative ${getSlotStyle(targetLetters.length)} flex items-center justify-center font-bold transition-all select-none ${
                    isSuccess
                      ? 'bg-amber-400 border-amber-700 text-amber-950 shadow-md animate-letter-bounce z-10'
                      : isFilled
                      ? 'bg-white border-amber-900 text-slate-900 shadow-sm'
                      : isCurrentFocus
                      ? 'bg-yellow-100 border-yellow-500 shadow-md ring-2 ring-yellow-300 animate-pulse'
                      : 'bg-amber-100/70 border-dashed border-amber-600 text-amber-400'
                  }`}
                  style={{
                    animationDelay: isSuccess ? `${index * 60}ms` : undefined,
                  }}
                >
                  {isFilled ? (
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight">
                      {displayChar}
                    </span>
                  ) : (
                    <span className="text-amber-500 font-bold text-xs sm:text-sm">_</span>
                  )}

                  {/* Question mark emblem for unfilled blocks */}
                  {!isFilled && !isCurrentFocus && (
                    <span className="text-amber-400/50 text-[8px] sm:text-[9px] absolute top-0.5 right-1 font-bold">
                      ?
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback status subtext */}
          <div className="mt-3 text-center min-h-[22px]">
            {isSuccess ? (
              <span className="text-emerald-700 font-extrabold text-base flex items-center justify-center gap-1">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>SUPER! +10 COINS!</span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </span>
            ) : isError ? (
              <span className="text-rose-600 font-bold text-sm">
                Almost! Check the letters and try again!
              </span>
            ) : (
              <span className="text-slate-500 text-xs font-semibold">
                Type the letters using the keyboard below or your physical keyboard
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Delete, Lightbulb, Volume2, RotateCcw } from 'lucide-react';
import { soundService } from '../services/soundEffects';

interface TouchKeyboardProps {
  onLetterPress: (letter: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onHintRequest: () => void;
  onSpeakRequest: () => void;
  hiddenLetters?: string[];
  disabledLetters?: string[];
  layout?: 'qwerty' | 'alphabetical';
  caseMode?: 'uppercase' | 'lowercase';
  hintsRemaining?: number;
}

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const ABC_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
];

export const TouchKeyboard: React.FC<TouchKeyboardProps> = ({
  onLetterPress,
  onBackspace,
  onClear,
  onHintRequest,
  onSpeakRequest,
  hiddenLetters = [],
  layout = 'qwerty',
  caseMode = 'uppercase',
  hintsRemaining = 3,
}) => {
  const rows = layout === 'qwerty' ? QWERTY_ROWS : ABC_ROWS;

  const handleKeyPress = (letter: string) => {
    if (hiddenLetters.includes(letter.toUpperCase())) return;
    soundService.playKeyTap();
    onLetterPress(letter);
  };

  const handleBackspace = () => {
    soundService.playKeyTap();
    onBackspace();
  };

  const handleClear = () => {
    soundService.playKeyTap();
    onClear();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 py-3 bg-amber-100/90 backdrop-blur-sm rounded-3xl border-4 border-amber-900 shadow-xl select-none">
      {/* Quick Action Bar (Speak, Hint, Clear) */}
      <div className="flex items-center justify-between gap-2 px-2 pb-2 mb-1 border-b border-amber-300">
        <button
          type="button"
          onClick={onSpeakRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl shadow-sm border-b-2 border-sky-800 transition-all text-sm cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Say Word</span>
        </button>

        <button
          type="button"
          onClick={onHintRequest}
          disabled={hintsRemaining <= 0}
          aria-disabled={hintsRemaining <= 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl shadow-sm border-b-2 transition-all text-sm ${
            hintsRemaining <= 0
              ? 'bg-amber-200/60 text-amber-800/50 border-amber-300/60 cursor-not-allowed opacity-60'
              : 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 border-amber-700 cursor-pointer'
          }`}
        >
          <Lightbulb className={`w-4 h-4 ${hintsRemaining <= 0 ? 'text-amber-800/40' : 'text-amber-900'}`} />
          <span>Hint ({hintsRemaining})</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          title="Clear all letters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-center">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 sm:gap-1.5 justify-center w-full">
            {row.map((letter) => {
              const displayLetter = caseMode === 'lowercase' ? letter.toLowerCase() : letter;
              const isHidden = hiddenLetters.includes(letter.toUpperCase());
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isHidden}
                  tabIndex={isHidden ? -1 : 0}
                  aria-hidden={isHidden}
                  onClick={() => {
                    if (!isHidden) handleKeyPress(letter);
                  }}
                  style={{
                    visibility: isHidden ? 'hidden' : 'visible',
                  }}
                  className={`mario-key h-11 sm:h-13 min-w-[32px] sm:min-w-[46px] flex-1 max-w-[54px] rounded-xl font-bold text-lg sm:text-2xl text-slate-800 flex items-center justify-center cursor-pointer shadow active:translate-y-0.5 transition-all duration-150 ${
                    isHidden ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100'
                  }`}
                >
                  {displayLetter}
                </button>
              );
            })}

            {/* If last row of QWERTY, append Backspace key */}
            {layout === 'qwerty' && rowIdx === 2 && (
              <button
                type="button"
                onClick={handleBackspace}
                aria-label="Delete last letter"
                className="h-11 sm:h-13 px-3 sm:px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl border-b-4 border-rose-800 shadow flex items-center justify-center active:translate-y-0.5 cursor-pointer shrink-0"
              >
                <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>
        ))}

        {/* If ABC layout, dedicated bottom row for Backspace */}
        {layout === 'alphabetical' && (
          <div className="flex justify-center w-full pt-1">
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Delete last letter"
              className="h-11 sm:h-12 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl border-b-4 border-rose-800 shadow flex items-center gap-2 cursor-pointer active:translate-y-0.5"
            >
              <Delete className="w-5 h-5" />
              <span className="text-sm font-bold">Erase Letter</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

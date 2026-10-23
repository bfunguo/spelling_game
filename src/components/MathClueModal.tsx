import React, { useState, useEffect, useRef } from 'react';
import { Lock, Sparkles, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { soundService } from '../services/soundEffects';

interface MathClueModalProps {
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  submitButtonText?: string;
  successMessage?: string;
}

export const MathClueModal: React.FC<MathClueModalProps> = ({
  onSuccess,
  onClose,
  title = 'Unlock Phonics Clue',
  subtitle = 'Multiply the two numbers to reveal the clue!',
  badgeText = 'Math Gate · Single Digit',
  submitButtonText = 'Unlock Clue',
  successMessage = 'Correct! Unlocking...',
}) => {
  // Generate randomized single-digit multiplication factors (2 to 9)
  const generateProblem = () => {
    // Single digit numbers (2 through 9) provide meaningful multiplication challenge
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { num1: a, num2: b, answer: a * b };
  };

  const [problem, setProblem] = useState(generateProblem);
  const [userInput, setUserInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleReroll = () => {
    soundService.playKeyTap();
    setProblem(generateProblem());
    setUserInput('');
    setIsError(false);
    setErrorMessage('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleDigitPress = (digit: string) => {
    soundService.playKeyTap();
    setIsError(false);
    setErrorMessage('');
    if (userInput.length < 3) {
      setUserInput((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    soundService.playKeyTap();
    setIsError(false);
    setErrorMessage('');
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundService.playKeyTap();
    setIsError(false);
    setErrorMessage('');
    setUserInput('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const parsed = parseInt(userInput.trim(), 10);
    if (parsed === problem.answer) {
      // Correct!
      setIsSuccess(true);
      setIsError(false);
      setErrorMessage('');
      soundService.playCoin();

      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      // Incorrect
      setIsError(true);
      soundService.playGentleOops();
      setErrorMessage(`Not quite! ${problem.num1} × ${problem.num2} is not ${parsed}. Try again!`);
      setUserInput('');
      inputRef.current?.focus();

      setTimeout(() => {
        setIsError(false);
      }, 700);
    }
  };

  // Keyboard shortcut for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl border-4 border-amber-900 shadow-2xl p-5 sm:p-6 text-center transition-transform ${
          isError ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Corner Screws / Rivets */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-900 shadow-inner" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-800 text-amber-950 flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-95"
          title="Cancel"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="w-14 h-14 mx-auto -mt-10 rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-400 border-3 border-amber-900 shadow-lg flex items-center justify-center">
          {isSuccess ? (
            <Check className="w-8 h-8 text-emerald-800 animate-bounce" />
          ) : (
            <Lock className="w-7 h-7 text-amber-950" />
          )}
        </div>

        <div className="mt-2.5">
          <div className="inline-block px-3 py-0.5 bg-amber-200 rounded-full border border-amber-400 text-[10px] font-black text-amber-900 uppercase tracking-widest">
            {badgeText}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {title}
          </h3>
          <p className="text-xs font-semibold text-amber-800 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Big Math Equation Box */}
        <div className="my-4 bg-white rounded-2xl border-3 border-amber-800/60 p-4 shadow-inner flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl font-black text-amber-950 font-mono">
            <span className="w-10 sm:w-12 h-12 sm:h-14 bg-amber-100 rounded-xl border-2 border-amber-400 flex items-center justify-center shadow-sm">
              {problem.num1}
            </span>
            <span className="text-amber-600 text-2xl sm:text-3xl">×</span>
            <span className="w-10 sm:w-12 h-12 sm:h-14 bg-amber-100 rounded-xl border-2 border-amber-400 flex items-center justify-center shadow-sm">
              {problem.num2}
            </span>
            <span className="text-amber-600 text-2xl sm:text-3xl">=</span>
            <div
              className={`min-w-[60px] sm:min-w-[72px] h-12 sm:h-14 px-2 rounded-xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-sm transition-all ${
                isSuccess
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                  : isError
                  ? 'bg-rose-100 border-rose-500 text-rose-800 ring-2 ring-rose-400'
                  : userInput
                  ? 'bg-yellow-50 border-amber-600 text-amber-950 ring-2 ring-yellow-400'
                  : 'bg-slate-100 border-dashed border-slate-400 text-slate-400'
              }`}
            >
              {userInput || '?'}
            </div>
          </div>

          {/* Hidden input for physical keyboard entry */}
          <form onSubmit={handleSubmit} className="w-full mt-2">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 3) {
                  setUserInput(val);
                  setIsError(false);
                  setErrorMessage('');
                }
              }}
              placeholder="Type answer..."
              className="w-full text-center text-sm font-bold py-1.5 px-3 rounded-lg border border-amber-300 bg-amber-50/50 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </form>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mt-2 text-xs font-bold text-rose-600 flex items-center justify-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mt-2 text-xs font-black text-emerald-700 flex items-center justify-center gap-1 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>{successMessage}</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Touch Friendly On-Screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-10 sm:h-11 bg-white hover:bg-yellow-50 active:bg-yellow-100 border-2 border-amber-800/80 rounded-xl font-black text-lg text-amber-950 shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-10 sm:h-11 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border-2 border-amber-700 rounded-xl font-bold text-xs text-amber-900 shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
            title="Clear"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-10 sm:h-11 bg-white hover:bg-yellow-50 active:bg-yellow-100 border-2 border-amber-800/80 rounded-xl font-black text-lg text-amber-950 shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-10 sm:h-11 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border-2 border-amber-700 rounded-xl font-bold text-xs text-amber-900 shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
            title="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Bottom Actions: New Question & Submit */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReroll}
            className="px-3 py-2.5 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 border-2 border-amber-700 text-amber-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="Generate a different multiplication problem"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Question</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!userInput.trim() || isSuccess}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-sm text-white border-2 transition-all flex items-center justify-center gap-1.5 shadow-md active:translate-y-0.5 cursor-pointer ${
              !userInput.trim() || isSuccess
                ? 'bg-slate-400 border-slate-500 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{submitButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MathGateModal = MathClueModal;

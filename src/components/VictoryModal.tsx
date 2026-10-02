import React, { useEffect } from 'react';
import { Sparkles, Trophy, ArrowRight, Star } from 'lucide-react';
import { soundService } from '../services/soundEffects';
import { fireVictoryConfetti } from './AudioVisuals';
import goldenStarImg from '../assets/images/mario_golden_star_1790692666980.jpg';

interface VictoryModalProps {
  stageNumber: number;
  worldName: string;
  coinsEarned: number;
  starsEarned: number;
  wordsSpelled: string[];
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stageNumber,
  worldName,
  coinsEarned,
  starsEarned,
  wordsSpelled,
  onContinue,
}) => {
  const [starImgError, setStarImgError] = React.useState(false);

  useEffect(() => {
    soundService.playLevelClear();
    fireVictoryConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl border-4 border-amber-900 shadow-2xl p-6 text-center my-auto">
        {/* Mario Flagpole / Star Trophy Icon */}
        <div className="w-24 h-24 mx-auto -mt-12 rounded-3xl bg-amber-400 border-4 border-amber-900 shadow-xl flex items-center justify-center overflow-hidden animate-bounce">
          {!starImgError ? (
            <img
              src={goldenStarImg}
              alt="Golden Star"
              referrerPolicy="no-referrer"
              onError={() => setStarImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">⭐</span>
          )}
        </div>

        {/* Victory Title */}
        <div className="mt-4">
          <div className="inline-block px-3 py-1 bg-amber-200 rounded-full border border-amber-400 text-xs font-black text-amber-900 uppercase tracking-widest mb-1">
            STAGE {stageNumber} CLEAR!
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SUPER SPELLER!
          </h2>
          <p className="text-sm font-semibold text-amber-800">
            You completed the spelling quest in {worldName}!
          </p>
        </div>

        {/* Rewards Box */}
        <div className="my-5 grid grid-cols-2 gap-3 bg-white/80 border-2 border-amber-800/40 rounded-2xl p-3 shadow-inner">
          <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-xl border border-yellow-200">
            <span className="text-3xl animate-mario-float">🪙</span>
            <span className="text-lg font-black text-amber-900 mt-1 tabular-nums">
              +{coinsEarned}
            </span>
            <span className="text-[11px] font-bold text-amber-700">Bonus Coins</span>
          </div>

          <div className="flex flex-col items-center p-2 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-3xl">⭐</span>
            <span className="text-lg font-black text-amber-900 mt-1 tabular-nums">
              +{starsEarned}
            </span>
            <span className="text-[11px] font-bold text-amber-700">Power Star</span>
          </div>
        </div>

        {/* Words Completed in this round */}
        <div className="mb-5 text-left bg-amber-200/50 rounded-xl p-3 border border-amber-300">
          <div className="text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Words Mastered This Stage:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {wordsSpelled.map((w, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white rounded-md text-xs font-extrabold text-slate-800 border border-amber-300"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={() => {
            soundService.playJump();
            onContinue();
          }}
          className="w-full py-3.5 mario-btn-green rounded-2xl text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <span>Next Adventure!</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

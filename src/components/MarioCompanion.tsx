import React, { useState } from 'react';
import { Volume2, Sparkles, MessageCircle } from 'lucide-react';
import { soundService } from '../services/soundEffects';
import companionGuideImg from '../assets/images/mario_companion_guide_1790692655176.jpg';

interface MarioCompanionProps {
  message: string;
  mood: 'idle' | 'happy' | 'celebrating' | 'thinking' | 'encouraging';
  companionName?: string;
  onCompanionClick?: () => void;
  pronounceText?: string;
}

export const MarioCompanion: React.FC<MarioCompanionProps> = ({
  message,
  mood,
  companionName = 'Pip the Mushroom',
  onCompanionClick,
  pronounceText,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.speakSentence("Tap the picture to hear it!");
  };

  const getMoodStyle = () => {
    switch (mood) {
      case 'celebrating':
        return 'animate-bounce scale-110';
      case 'happy':
        return 'scale-105';
      case 'thinking':
        return 'rotate-[-3deg]';
      case 'encouraging':
        return 'scale-100';
      default:
        return 'animate-mario-float';
    }
  };

  return (
    <div className="flex items-end gap-3 max-w-lg mx-auto px-4 py-2 select-none">
      {/* Companion Character Avatar */}
      <button
        type="button"
        onClick={() => {
          soundService.playJump();
          if (onCompanionClick) onCompanionClick();
        }}
        title="Tap me to jump!"
        className={`relative shrink-0 focus:outline-none transition-transform duration-200 cursor-pointer ${getMoodStyle()}`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-4 border-amber-900 bg-amber-400 shadow-md flex items-center justify-center">
          {!imgError ? (
            <img
              src={companionGuideImg}
              alt={companionName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-red-500 flex items-center justify-center text-3xl">
              🍄
            </div>
          )}
        </div>
        {mood === 'celebrating' && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-950 p-1 rounded-full shadow-md animate-spin">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </button>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-white border-3 border-amber-900 rounded-2xl px-4 py-3 shadow-md">
        {/* Pointer triangle */}
        <div
          className="absolute -left-3 bottom-4 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent z-10"
        />
        <div
          className="absolute -left-4 bottom-3.5 w-0 h-0 border-t-[9px] border-t-transparent border-r-[15px] border-r-amber-900 border-b-[9px] border-b-transparent"
        />

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-amber-800 tracking-wide uppercase">
              {companionName}
            </div>
            <p className="text-slate-800 font-semibold text-sm sm:text-base leading-snug">
              Tap the picture to hear it!
            </p>
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0"
            title="Listen to companion"
            aria-label="Speak companion message"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

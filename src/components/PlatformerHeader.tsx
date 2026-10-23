import React from 'react';
import { Volume2, VolumeX, Shield, Map, Flame } from 'lucide-react';
import { soundService } from '../services/soundEffects';
import { PWAInstallButton } from './PWAInstallButton';

interface PlatformerHeaderProps {
  worldName: string;
  worldNumber: number;
  currentWordIndex: number;
  totalWordsInStage: number;
  coins: number;
  stars: number;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenMap: () => void;
  onOpenParents: () => void;
}

export const PlatformerHeader: React.FC<PlatformerHeaderProps> = ({
  worldName,
  worldNumber,
  currentWordIndex,
  totalWordsInStage,
  coins,
  stars,
  streak,
  soundEnabled,
  onToggleSound,
  onOpenMap,
  onOpenParents,
}) => {
  return (
    <header className="w-full bg-slate-900/90 text-white border-b-4 border-amber-900 shadow-lg px-3 sm:px-6 py-2.5 backdrop-blur-md sticky top-0 z-30 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {/* Left: World Indicator & Stage Progress */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-amber-950 font-black rounded-xl text-xs sm:text-sm border-b-3 border-amber-800 shadow cursor-pointer transition-all"
            title="Open World Map"
          >
            <Map className="w-4 h-4" />
            <span className="hidden xs:inline">Map</span>
          </button>

          <div>
            <div className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider">
              World {worldNumber}-1
            </div>
            <div className="text-xs sm:text-sm font-black truncate max-w-[130px] sm:max-w-[200px]">
              {worldName}
            </div>
          </div>
        </div>

        {/* Center: Stage Progress Blocks */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
          <span className="text-[11px] sm:text-xs font-bold text-slate-300 mr-1">
            Word {currentWordIndex + 1}/{totalWordsInStage}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalWordsInStage }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md border text-[9px] flex items-center justify-center font-bold transition-all ${
                  i < currentWordIndex
                    ? 'bg-emerald-500 border-emerald-300 text-white shadow-sm'
                    : i === currentWordIndex
                    ? 'bg-yellow-400 border-yellow-200 text-yellow-950 animate-pulse'
                    : 'bg-slate-700 border-slate-600 text-slate-500'
                }`}
              >
                {i < currentWordIndex ? '✓' : '?'}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Coins, Stars, Streak, Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coin Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full font-black text-xs sm:text-sm text-yellow-300 tabular-nums">
            <span className="text-base animate-mario-float">🪙</span>
            <span>{coins}</span>
          </div>

          {/* Star Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-full font-black text-xs sm:text-sm text-amber-300 tabular-nums">
            <span className="text-base">⭐</span>
            <span>{stars}</span>
          </div>

          {/* Streak Flame */}
          {streak > 0 && (
            <div
              className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 rounded-full font-bold text-xs text-rose-300"
              title="Consecutive daily practice streak"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>{streak}d</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* PWA Install Button (auto-hides when installed or running as standalone app) */}
          <PWAInstallButton />

          {/* Parent Zone Button */}
          <button
            type="button"
            onClick={onOpenParents}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs border-b-2 border-indigo-900 shadow cursor-pointer transition-all"
            title="Open Parent Dashboard (Math Gate Protected)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Parents</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Lock, Star, ChevronRight, X, Trophy } from 'lucide-react';
import { WorldConfig, WorldId, GradeLevel } from '../types/game';
import { WORLDS_CONFIG } from '../data/curriculumWords';
import { soundService } from '../services/soundEffects';
import marioGrasslandBg from '../assets/images/mario_world_grassland_1790692639852.jpg';
import desertDunesBg from '../assets/images/desert_dunes_world_1792782312862.jpg';
import coralCoveBg from '../assets/images/coral_cove_world_1792782313269.jpg';
import starfallHeightsBg from '../assets/images/starfall_heights_world_1792782313634.jpg';
import castleChampionsBg from '../assets/images/castle_champions_world_1792782314097.jpg';

const WORLD_BG_MAP: Record<WorldId, string> = {
  world1: marioGrasslandBg,
  world2: desertDunesBg,
  world3: coralCoveBg,
  world4: starfallHeightsBg,
  world5: castleChampionsBg,
};

interface WorldSelectMapProps {
  currentWorldId: WorldId;
  unlockedWorlds: WorldId[];
  userStars: number;
  onSelectWorld: (worldId: WorldId, recommendedGrade: GradeLevel) => void;
  onClose: () => void;
}

export const WorldSelectMap: React.FC<WorldSelectMapProps> = ({
  currentWorldId,
  unlockedWorlds,
  userStars,
  onSelectWorld,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-amber-50 rounded-3xl border-4 border-amber-900 shadow-2xl p-4 sm:p-6 my-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b-2 border-amber-300 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🗺️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                World Map Adventure
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-800">
                Collect stars by spelling words to unlock new kingdoms!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer"
            aria-label="Close World Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center justify-between bg-amber-200/70 border border-amber-400 rounded-2xl px-4 py-2.5 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-800" />
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              Total Adventure Stars Earned:
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-black text-amber-950 text-base sm:text-lg">
            <span>⭐</span>
            <span>{userStars} Stars</span>
          </div>
        </div>

        {/* Worlds Grid List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {WORLDS_CONFIG.map((world: WorldConfig) => {
            const isUnlocked = unlockedWorlds.includes(world.id) || userStars >= world.starsRequired;
            const isCurrent = currentWorldId === world.id;

            return (
              <div
                key={world.id}
                onClick={() => {
                  if (isUnlocked) {
                    soundService.playJump();
                    onSelectWorld(world.id, world.recommendedGrade);
                    onClose();
                  } else {
                    soundService.playGentleOops();
                  }
                }}
                className={`relative rounded-2xl border-3 p-3 sm:p-4 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isCurrent
                    ? 'bg-yellow-100 border-amber-500 shadow-md ring-3 ring-amber-300'
                    : isUnlocked
                    ? 'bg-white hover:bg-amber-50 border-amber-800 shadow-sm'
                    : 'bg-slate-100 border-slate-300 opacity-70 cursor-not-allowed'
                }`}
              >
                {/* World Artwork Thumbnail & Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-2xl border-2 border-amber-800 shrink-0 relative overflow-hidden shadow-sm bg-slate-900 flex items-center justify-center">
                    <img
                      src={WORLD_BG_MAP[world.id]}
                      alt={world.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${
                        isUnlocked ? 'group-hover:scale-105' : 'grayscale opacity-40'
                      }`}
                    />
                    <div className="relative z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-lg sm:text-xl drop-shadow">
                      {isUnlocked ? world.icon : '🔒'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-800 text-white uppercase">
                        World {world.worldNumber}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-bold text-amber-700">
                          (Current World)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {world.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-600">
                      {world.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Status */}
                <div className="flex items-center gap-2">
                  {!isUnlocked ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1.5 rounded-xl">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Need {world.starsRequired} ⭐</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1 shadow cursor-pointer"
                    >
                      <span>Play</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="mt-4 pt-3 border-t border-amber-200 text-center">
          <p className="text-xs text-amber-800 font-semibold">
            Tip: Complete all 5 words in a stage with first-try accuracy to earn bonus Power Stars!
          </p>
        </div>
      </div>
    </div>
  );
};

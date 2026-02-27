"use client";

import { cn } from "@/lib/utils";

interface PixelHeroProps {
  level: number;
  mana: number;
  manaMax: number;
  streak: number;
  buffs?: string[];
  debuffs?: string[];
  className?: string;
}

export function PixelHero({ level, mana, manaMax, streak, buffs = [], debuffs = [], className }: PixelHeroProps) {
  const manaPct = manaMax > 0 ? mana / manaMax : 0.5;
  const isLowMana = manaPct < 0.3;
  const isHighMana = manaPct > 0.7;
  const isStreaking = streak >= 3;
  const hasSmokeDebuff = debuffs.includes("smoke");
  const hasWorkoutBuff = buffs.includes("workout");
  const hasNatureBuff = buffs.includes("nature");
  const hasSleepDebuff = debuffs.includes("bad_sleep");

  const hatColor = level >= 15 ? "#FFD700" : level >= 10 ? "#8B5CF6" : level >= 7 ? "#3B82F6" : "#6B7280";
  const bodyAnimation = isStreaking ? "animate-bounce-slow" : isLowMana ? "" : "animate-breathe";

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Status effects floating above */}
      <div className="mb-1 flex items-center gap-1">
        {isStreaking && <span className="animate-pulse text-xs">🔥</span>}
        {hasWorkoutBuff && <span className="animate-bounce text-xs">💪</span>}
        {hasNatureBuff && <span className="text-xs">🌴</span>}
        {hasSmokeDebuff && <SmokeCloud />}
        {hasSleepDebuff && <span className="text-xs">💤</span>}
      </div>

      {/* Pixel character */}
      <div className={cn("relative", bodyAnimation)}>
        <svg width="48" height="64" viewBox="0 0 48 64" className="drop-shadow-lg">
          {/* Hat */}
          <rect x="14" y="2" width="20" height="4" fill={hatColor} />
          <rect x="12" y="6" width="24" height="4" fill={hatColor} />
          {level >= 10 && <rect x="22" y="0" width="4" height="4" fill="#FFD700" />}

          {/* Head */}
          <rect x="14" y="10" width="20" height="16" fill="#F5D0A9" />
          {/* Eyes */}
          <rect x="18" y="16" width="3" height="3" fill={isLowMana ? "#888" : "#2D1B00"} />
          <rect x="27" y="16" width="3" height="3" fill={isLowMana ? "#888" : "#2D1B00"} />
          {/* Eye shine */}
          {isHighMana && <>
            <rect x="19" y="16" width="1" height="1" fill="white" />
            <rect x="28" y="16" width="1" height="1" fill="white" />
          </>}
          {/* Mouth */}
          {isLowMana ? (
            <rect x="20" y="22" width="8" height="1" fill="#8B4513" />
          ) : (
            <>
              <rect x="20" y="21" width="8" height="1" fill="#8B4513" />
              <rect x="21" y="22" width="6" height="1" fill="#8B4513" />
            </>
          )}

          {/* Body / shirt */}
          <rect x="12" y="26" width="24" height="16" fill={hasSmokeDebuff ? "#555" : "#8B5CF6"} />
          <rect x="14" y="28" width="4" height="2" fill={hasSmokeDebuff ? "#666" : "#A78BFA"} />
          {/* Arms */}
          <rect x="6" y="28" width="6" height="12" fill="#F5D0A9" />
          <rect x="36" y="28" width="6" height="12" fill="#F5D0A9" />
          {hasWorkoutBuff && <>
            <rect x="4" y="28" width="2" height="8" fill="#EF4444" opacity="0.6" />
            <rect x="42" y="28" width="2" height="8" fill="#EF4444" opacity="0.6" />
          </>}

          {/* Legs */}
          <rect x="14" y="42" width="8" height="14" fill="#1E293B" />
          <rect x="26" y="42" width="8" height="14" fill="#1E293B" />
          {/* Shoes */}
          <rect x="12" y="56" width="10" height="4" fill="#92400E" />
          <rect x="26" y="56" width="10" height="4" fill="#92400E" />

          {/* Streak glow */}
          {isStreaking && (
            <rect x="0" y="0" width="48" height="64" fill="url(#streakGlow)" opacity="0.15" />
          )}

          <defs>
            <radialGradient id="streakGlow">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        {/* Level badge */}
        <div className="absolute -bottom-1 -right-2 rounded-full bg-gold px-1.5 py-0.5 text-[8px] font-bold text-bg-deep shadow">
          {level}
        </div>
      </div>

      {/* Mana bar under character */}
      <div className="mt-2 h-1.5 w-12 rounded-full bg-bg-deep">
        <div
          className={cn("h-full rounded-full transition-all", isLowMana ? "bg-hp" : "bg-mana")}
          style={{ width: `${manaPct * 100}%` }}
        />
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function SmokeCloud() {
  return (
    <div className="relative">
      <span className="text-xs opacity-60">💨</span>
      <span className="absolute -top-1 left-1 text-[8px] opacity-30 animate-ping">💨</span>
    </div>
  );
}

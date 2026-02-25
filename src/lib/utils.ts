import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number): string {
  return value < 1 ? value.toFixed(1) : Math.round(value).toString();
}

export function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const midnight = new Date(msk);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const diff = midnight.getTime() - msk.getTime();
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'text-gray-300';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-gradient-gold';
    default: return 'text-gray-300';
  }
}

export function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case 'common': return 'border-gray-600';
    case 'uncommon': return 'border-green-600';
    case 'rare': return 'border-blue-600';
    case 'epic': return 'border-purple-600';
    case 'legendary': return 'border-yellow-500';
    default: return 'border-gray-600';
  }
}

export function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case 'common': return 'Обычная';
    case 'uncommon': return 'Необычная';
    case 'rare': return 'Редкая';
    case 'epic': return 'Эпическая';
    case 'legendary': return 'Легендарная';
    default: return 'Обычная';
  }
}

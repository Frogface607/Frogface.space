import type { Story } from './types';
import { DEMO_STORY } from './demo-story';

// All available stories
const ALL_STORIES: Story[] = [DEMO_STORY];

/**
 * Register a new story in the catalog
 */
export function registerStory(story: Story): void {
  if (!ALL_STORIES.find((s) => s.id === story.id)) {
    ALL_STORIES.push(story);
  }
}

/**
 * Get the current Moscow date as YYYY-MM-DD
 */
function getMoscowDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Moscow' });
}

/**
 * Get today's story based on Moscow date rotation
 */
export function getTodayStory(): Story {
  if (ALL_STORIES.length === 0) return DEMO_STORY;
  if (ALL_STORIES.length === 1) return ALL_STORIES[0];

  const dateStr = getMoscowDate();
  const daysSinceEpoch = Math.floor(
    new Date(dateStr + 'T00:00:00Z').getTime() / 86400000
  );
  const index = daysSinceEpoch % ALL_STORIES.length;
  return ALL_STORIES[index];
}

/**
 * Get a story by ID
 */
export function getStoryById(id: string): Story | undefined {
  return ALL_STORIES.find((s) => s.id === id);
}

/**
 * Get all stories (for catalog/archive)
 */
export function getAllStories(): Story[] {
  return [...ALL_STORIES];
}

/**
 * Get story count
 */
export function getStoryCount(): number {
  return ALL_STORIES.length;
}

/**
 * Story registration — import this to load all stories into the catalog.
 */
import { registerStory } from './story-catalog';
import { STORY_SHADOWS } from './story-shadows';
import { STORY_DIGITAL } from './story-digital';

registerStory(STORY_SHADOWS);
registerStory(STORY_DIGITAL);

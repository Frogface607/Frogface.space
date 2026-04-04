# Life OS RPG Dashboard -- Deep Research

## 1. STAT FORMULAS: Real Data to RPG Stats

### GOLD (MRR) -- Revenue from Supabase
```
Source: Supabase payments/subscriptions tables
Formula: SUM(active_subscriptions.amount) per month
Display: "178,000 G" with trend arrow
Tiers: Bronze (<100K), Silver (100-300K), Gold (300-500K), Diamond (500K+)
```
- Query `payments` table monthly, show real-time MRR
- Gold coins animate when new payment arrives (webhook trigger)
- Historical chart = "Treasury Log"

### XP (Experience Points) -- Activity-Derived
```
Sources: git commits, task completions, deployments, content published
Formula:
  commit        = 10 XP (+ 5 per 100 lines changed, cap 50)
  task_complete  = 25 XP (normal), 50 XP (hard), 100 XP (epic)
  deploy_prod    = 75 XP
  deploy_preview = 25 XP
  content_post   = 40 XP

Level curve (exponential): XP_needed = floor(100 * 1.15^level)
  Level 1:  100 XP
  Level 5:  201 XP
  Level 10: 405 XP
  Level 20: 1,637 XP
  Level 50: 108,366 XP
```
- Use GitHub API webhooks or periodic git log scraping
- Supabase `activity_log` table: `{type, xp_value, timestamp, metadata}`
- Level-up triggers celebratory animation + sound

### MANA (Energy) -- Daily Self-Report + Derived
```
Sources: daily check-in (1-10 scale), sleep data, calendar density
Formula:
  base_mana     = check_in_score * 10  (0-100)
  sleep_bonus   = (hours - 6) * 5      (capped +/- 20)
  calendar_drain = -3 per meeting over 2
  streak_bonus   = consecutive_checkin_days * 2 (cap 20)

  total_mana = clamp(base_mana + sleep_bonus + calendar_drain + streak_bonus, 0, 120)
```
- Morning check-in: quick 3-tap UI (energy, mood, focus)
- Mana bar depletes visually through the day
- "Mana potion" = rest/walk/sun registered via button

### HP (Health/Streak) -- Consistency Tracker
```
Formula:
  base_hp         = 100
  streak_days     = consecutive days with >= 1 meaningful action
  hp              = min(100, 20 + streak_days * 8)

  Miss a day:     HP drops by 25
  Miss 2 days:    HP drops to 30 (danger zone, red pulse)
  Miss 3+ days:   HP = 10 (critical, "near death" UI state)
  Recovery:       +15 HP per active day after break
```
- "Meaningful action" = at least 1 commit OR 1 completed task OR check-in
- Visual: heart container system (like Zelda), not just a bar
- Critical HP triggers "Phoenix Down" prompt: simplified recovery quest

### SKILL LEVELS -- Real Skill Progression
```
Skills tracked (with XP sub-pools):
  Coding:     commits, PRs merged, bugs fixed
  Marketing:  posts published, campaigns launched, leads generated
  Design:     designs created, brand assets, UI components
  Leadership: decisions made, team interactions, delegation events
  Business:   revenue milestones, deals closed, partnerships

Level per skill: skill_xp / (100 * 1.2^skill_level)
Cap: Level 99 per skill
```

---

## 2. VISUAL PATTERNS -- What Works

### Persona 5 Style (Best-in-class RPG UI)
- **Angular, bold geometry** -- slanted boxes, aggressive diagonals
- **High contrast** -- red/black/white with halftone textures
- **Character silhouettes** -- stylized avatar always visible
- **Transitions are the UI** -- every menu change is animated, nothing is static
- **Key lesson:** UI itself IS the game feel. Motion > decoration

### Disco Elysium -- Thought Cabinet
- **Skills as personalities** -- each skill has a portrait, name, and voice
- **Thought Cabinet** -- limited slots (12), you "internalize" thoughts over time
- **Hidden until explored** -- you don't know what a thought does until you research it
- **Trade-offs everywhere** -- every bonus comes with a penalty
- **Key lesson:** Stats should feel like they have CHARACTER, not just numbers

### Final Fantasy -- Classic Stats Display
- **Horizontal bars** with exact numbers alongside
- **Color coding per stat type** (HP=green, MP=blue, etc.)
- **Party view** -- see multiple "characters" (projects?) side by side
- **Equipment screen** -- items that modify stats (tools/habits = equipment)
- **Key lesson:** Clean, readable, information-dense layouts work

### Skill Tree Patterns (from research)
- **beautiful-skill-tree** (React lib): npm package, 3-step integration, localStorage persistence
- **D3.js trees**: SVG-based, viewBox for camera/zoom, full customization
- **Branch types**: Linear (must complete in order), Branching (choose path), Hub (central node radiating out)
- **Key lesson:** Skill trees need PREREQUISITES to feel meaningful, not just checkboxes

---

## 3. WHAT MAKES IT FEEL LIKE A GAME (Not a Task Tracker)

### The Dual Loop System
**Inner Loop (daily, 5-15 min):**
- Morning check-in (set mana)
- See today's quests (3-5 tasks max)
- Complete quest -> instant XP animation + sound
- End of day: stats summary, streak check

**Outer Loop (weekly/monthly):**
- Level-up celebrations
- New skill tree nodes unlock
- Boss battles (project milestones)
- Seasonal events ("Q2 Campaign", "Summer Sprint")
- Rank progression with titles

### Dopamine Triggers (backed by research)
1. **Variable rewards** -- random bonus XP events ("Critical Hit! 2x XP")
2. **Loss aversion** -- streak system, HP decay on inactivity
3. **Progress visualization** -- XP bar always visible, always moving
4. **Endowed progress** -- start at Level 1, not Level 0. Show 10% pre-filled on new quests
5. **Near-miss effect** -- "47/50 XP to next level!" shown prominently
6. **Social proof** -- leaderboard with past self ("You vs Last Week")
7. **Collection mechanics** -- achievements, badges, thought cabinet
8. **Anticipation** -- show NEXT unlock dimmed/locked

### What Kills the Game Feel
- Too many stats (keep to 5 core + skills)
- No animations (everything must MOVE)
- Pure task tracking with RPG skin (stats must MEAN something)
- No consequences for inaction (HP decay is critical)
- Grinding without progression milestones
- Manual data entry for everything (automate from real sources)

---

## 4. SPECIFIC UI/UX PATTERNS FOR THE DASHBOARD

### Main Screen: "Command Center"
```
+------------------------------------------+
|  [Avatar]  FROGFACE  Lv.23  |  178K G    |
|  ████████████░░ 847/1000 XP              |
+------------------------------------------+
|                    |                       |
|   TODAY'S QUESTS   |   CORE STATS         |
|   [ ] Deploy v2   |   HP  ♥♥♥♥♥♥♥♥♡♡    |
|   [ ] Write post  |   MP  ████████░░ 82  |
|   [x] Code review |   STR ██████░░░░ 61  |
|   [ ] Edison menu |   INT █████████░ 89  |
|                    |   CHA ████░░░░░░ 41  |
+------------------------------------------+
|          ACTIVE PROJECTS (BOSSES)         |
|  [MyReply ████░░ 40%] [Edison ██████ 80%]|
+------------------------------------------+
```

### Skill Tree Screen
- Central node = "FROGFACE" (your character)
- 5 branches radiating: Code, Design, Marketing, Leadership, Business
- Each branch: 10 nodes from basic to advanced
- Locked nodes shown as dark silhouettes
- Click node -> see requirements + current progress
- Glow effect on nodes close to unlocking

### Stats Detail Screen (Character Sheet)
- D&D-style layout: left = avatar + core stats, right = skills + equipment
- "Equipment" = active tools (Cursor, Supabase, Vercel, etc.)
- "Buffs/Debuffs" = current streaks, active habits, sleep quality
- "Thought Cabinet" (Disco Elysium style) = active strategies/focuses (max 6)
- "Quest Log" = current + completed tasks with XP earned

### Notifications & Celebrations
- Level up: full-screen flash + title change + particle effects
- Quest complete: XP number floats up + ding sound
- Streak milestone: special badge + "10-day streak! +50 bonus XP"
- HP critical: red vignette on screen edges, heartbeat pulse
- New skill unlocked: skill tree zooms to new node with glow

---

## 5. DATA ARCHITECTURE (Supabase Tables)

```sql
-- Core character state
character_stats: {id, user_id, level, xp, hp, mana, gold, updated_at}

-- Activity log (XP source)
activity_log: {id, user_id, type, xp_earned, metadata, created_at}
  -- type: 'commit', 'task', 'deploy', 'checkin', 'content'

-- Skills
skills: {id, user_id, skill_name, skill_xp, skill_level, updated_at}

-- Daily check-ins
daily_checkins: {id, user_id, energy, mood, focus, sleep_hours, notes, date}

-- Quests (tasks)
quests: {id, user_id, title, difficulty, xp_reward, status, project_id, due_date}

-- Achievements
achievements: {id, user_id, achievement_key, unlocked_at, metadata}

-- Thought Cabinet (active strategies)
thoughts: {id, user_id, title, description, bonus, penalty, slot, internalized_at}

-- Streak tracking
streaks: {id, user_id, streak_type, current_count, best_count, last_active_date}
```

---

## 6. TECH REFERENCES

### Libraries
- **beautiful-skill-tree** -- React skill tree component (npm)
- **D3.js** -- SVG skill trees with zoom/pan
- **Framer Motion** -- animations (level-up, XP floats, transitions)
- **Howler.js** -- sound effects (ding, level-up, critical HP heartbeat)
- **Canvas Confetti** -- celebration particles

### Inspiration Sources
- Persona 5: angular bold UI, everything animated, red/black palette
- Disco Elysium: thought cabinet, skills as personalities, hidden info
- Final Fantasy: clean stat bars, party view, equipment modifiers
- Habitica: real-life RPG pioneer (but too cutesy -- we want darker/cooler)
- Gamified Life OS (Notion): Solo Leveling theme, good stat mapping

### Key Design Principles
1. Every number must come from REAL data (no fake grind)
2. Animations on EVERY state change (the juice is the game)
3. Maximum 5 core stats visible at all times
4. Dark theme mandatory (RPG aesthetic)
5. Sound design matters (even subtle clicks)
6. Show consequences of inaction (HP decay, not just absence of reward)
7. Weekly "boss review" -- reflect on progress, set new quests

---

## Sources
- [Gamified Life OS](https://gamifiedlifeos.com/)
- [LiFE RPG Notion Template](https://www.liferpg.site/)
- [Persona 5 UI/UX Analysis](https://ridwankhan.com/the-ui-and-ux-of-persona-5-183180eb7cce)
- [Persona 5 UI Style & Substance](https://medium.com/design-bootcamp/how-persona-5s-ui-balances-both-style-and-substance-de8cb1b807ef)
- [Game UI Database - Persona 5](https://www.gameuidatabase.com/gameData.php?id=72)
- [Disco Elysium Thought Cabinet](https://discoelysium.fandom.com/wiki/Thought_Cabinet)
- [Disco Elysium RPG System Analysis](https://www.gabrielchauri.com/disco-elysium-rpg-system-analysis/)
- [Skill Trees & Gamification](https://www.gamified.uk/2015/01/29/skill-trees-gamification/)
- [31 Core Gamification Techniques](https://sa-liberty.medium.com/the-31-core-gamification-techniques-part-1-progress-achievement-mechanics-d81229732f07)
- [Dual Loops in Gamification](https://uxdesign.cc/youre-doing-gamification-wrong-dual-loops-explained-38a762c56ef4)
- [Gamification Psychology & Dopamine Loops](https://formalpsychology.com/gamification-psychology-apps-hooked/)
- [beautiful-skill-tree (GitHub)](https://github.com/andrico1234/beautiful-skill-tree)
- [D3 + Vue Skill Tree Tutorial](https://levelup.gitconnected.com/building-a-rpg-like-skill-tree-98bfdbef01de)
- [livingRPG Library](https://github.com/jtsiva/livingRPG)
- [Compulsion Loops & Dopamine](https://www.gamedeveloper.com/design/compulsion-loops-dopamine-in-games-and-gamification)

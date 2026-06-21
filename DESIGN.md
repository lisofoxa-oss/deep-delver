# Deep Delver — Design Document

## Overview
A traditional roguelike with procedural dungeons, turn-based combat, and permadeath. Inspired by Rogue, NetHack, and Brogue.

## Core Loop
1. Descend through 5 dungeon levels
2. Explore procedurally generated rooms and corridors
3. Fight monsters, collect items, gain XP
4. Find the stairs to descend deeper
5. Escape from the last level to win

## Dungeon Generation
- **Algorithm**: Room placement with iterative backtracking, connected by L-shaped corridors
- **Rooms**: 4–12 rooms per level, 4×4 to 10×10 tiles
- **Connectivity**: Rooms connected in placement order; flood-fill verification
- **Stairs**: Placed in the last room; player starts in the first room
- **Scaling**: Enemy types and stats scale with depth (1–5)
- **Seed**: Deterministic via seeded PRNG (mulberry32)

## Entities

### Player
- Starts with 30 HP, ATK 5, DEF 2
- Levels up: +4 maxHP, +1 ATK, +1 DEF per level
- Carries up to 8 items
- Can equip one weapon and one armor

### Enemies (by depth)
| Type     | Depth | HP  | ATK | DEF | XP  |
|----------|-------|-----|-----|-----|-----|
| Rat      | 1+    | 6   | 3   | 0   | 5   |
| Goblin   | 1+    | 10  | 4   | 1   | 10  |
| Skeleton | 2+    | 14  | 5   | 2   | 18  |
| Orc      | 3+    | 20  | 7   | 3   | 30  |
| Wraith   | 4+    | 18  | 8   | 1   | 35  |

Enemies gain +2 HP and +1 ATK per 2 depths.

### AI
- If adjacent: attack player
- If within 8 tiles: move toward player (pathfind greedily)
- Otherwise: random wander

## Combat
- **Damage formula**: `max(1, ATK - DEF) ± 25% variance`
- **Critical hit**: 10% chance, ×1.5 damage
- **Death**: enemies are removed; player HP ≤ 0 → death screen

## Items

### Consumables
- Health Potion: restores 15 HP
- Fire Potion: deals 12 damage (to nearest enemy)

### Weapons
| Item        | ATK bonus | Depth |
|-------------|-----------|-------|
| Dagger      | +1        | 1+    |
| Sword       | +3        | 1+    |
| Battle Axe  | +5        | 2+    |

### Armor
| Item          | DEF bonus | Depth |
|---------------|-----------|-------|
| Leather Armor | +1        | 1+    |
| Shield        | +2        | 1+    |
| Chain Mail    | +3        | 3+    |

## Field of View
- **Algorithm**: Recursive shadowcasting (8 octants)
- **Radius**: 8 tiles
- **Fog of war**: Currently visible tiles are bright; previously seen tiles are dimmed; unseen tiles are black

## Progression
- XP thresholds: 20, 30, 45, 67, 101, ... (×1.5 multiplier)
- Level cap: none (practically ~10 within 5 depths)
- Victory: reach depth 5 and take the stairs out

## Controls
| Key       | Action         |
|-----------|----------------|
| Arrow/WASD/numpad | Move / attack |
| . / 5 / Space | Wait a turn |
| g         | Pick up item   |
| i         | Toggle inventory |
| 1–8       | Select item in inventory |
| Esc       | Close inventory |

## Technical Architecture
- ES modules with Vite bundler
- Tests: Vitest (unit tests for pure logic)
- Save: localStorage (auto-save each turn)
- Sound: Web Audio API (procedural tones)
- Render: Canvas 2D with monospace font tiles

# Devlog — Deep Delver

## 2026-06-21 — Initial Implementation

### Project scaffold
- Set up Vite + Vitest project structure with ES modules
- Created `src/` layout: dungeon, entities, combat, FOV, items, inventory, renderer, UI, sound, save, input, main
- Created `tests/` for dungeon, combat, FOV

### Dungeon generation
- Implemented iterative recursive-backtracking room placement + L-corridors
- Rooms connected in placement order → guaranteed connectivity
- `isMapConnected()` flood-fill test passes
- Enemies scale with depth; items use weighted random pools
- Seeded PRNG for deterministic generation

### Entity system
- Player and enemy factories; `tryMove`, `aiTakeTurn`, `isBlockedByEnemy`
- AI: chase player within 8 tiles, otherwise random wander
- Movement: arrow keys, WASD, vi-keys (y/u/b/n), numpad full support

### FOV
- Recursive shadowcasting; initial implementation had wrong octant transforms
- **Bug**: first FOV impl only lit the player tile on open maps — dx/dy loop and octant matrix were mismatched
- **Fix**: rewrote with rot.js-style MULT matrix for octant transforms, dy fixed at `-j` per row
- All 3 FOV tests pass: radius check, wall occlusion, remembered set

### Combat & progression
- `calcDamage`: `max(1, atk - def)` with ±25% variance + 10% crit for ×1.5
- `gainXp`: progressive level-up with HP/ATK/DEF increases
- Enemy HP bars rendered for damaged enemies

### Rendering & UI
- Canvas tile renderer (16 px tiles, pixel-art rendering)
- Stat bar: HP/ATK/DEF/Level/XP/Depth
- Message log (last 4 lines)
- Overlay screens: title, death, victory, inventory
- Inventory: pick up, drop, equip weapons/armor, use consumables

### Sound
- Web Audio API tone generator
- SFX: hit, kill, playerHit, pickup, levelUp, stairs, death, heal

### Save/Load
- localStorage JSON serialization
- Auto-save after each turn; title screen checks for saved game

### Build & tests
- 21 tests all passing
- Production build: 18.23 kB JS + 0.58 kB HTML

### Remaining / known issues
- Inventory screen actions ([u]se, [e]quip, [d]rop) not yet bound via keyboard in main.js — only number keys for selection
- Tile rendering uses monospace font hack; proper bitmap tileset would be nicer
- Sound is basic square/sawtooth synthesis; no music
- Touch input not implemented (requires UI buttons for virtual d-pad)

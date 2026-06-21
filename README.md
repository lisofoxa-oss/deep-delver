# Deep Delver 🏰

A traditional roguelike dungeon crawler — procedural levels, turn-based combat, permadeath. Built with vanilla JS + Canvas 2D, no game engine.

## Play

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for itch.io

```bash
npm run build
```

This creates a `dist/` folder. Zip it:

```bash
cd dist
zip -r ../deep-delver.zip .
```

1. Go to [itch.io dashboard](https://itch.io/game/new)
2. Upload `deep-delver.zip`
3. Set **Kind of project** → HTML
4. Set **Viewport dimensions** → 1280 × 720
5. Publish!

## Controls

| Key              | Action            |
|------------------|-------------------|
| Arrow / WASD / numpad | Move / attack |
| `.` / `5` / Space    | Wait            |
| `g`              | Pick up item     |
| `i`              | Inventory        |
| `1`–`8`          | Use / equip item |

## Project Structure

```
├── index.html          # Entry point
├── src/
│   ├── main.js         # Game loop, state machine, input binding
│   ├── constants.js    # Tile types, enemy/item defs, tuning
│   ├── dungeon.js      # Procedural level generation
│   ├── entities.js     # Player, enemies, movement, AI
│   ├── combat.js       # Damage calculation, XP, leveling
│   ├── fov.js          # Recursive shadowcasting (FOV + fog)
│   ├── items.js        # Item creation, use, equip, pickup
│   ├── inventory.js    # Inventory helpers
│   ├── renderer.js     # Canvas 2D tile renderer
│   ├── ui.js           # Overlay screens (title, death, etc.)
│   ├── sound.js        # Web Audio sound effects
│   ├── save.js         # localStorage save/load
│   └── input.js        # Keyboard input manager
├── tests/
│   ├── dungeon.test.js # Map connectivity, room placement
│   ├── combat.test.js  # Damage, crits, leveling
│   └── fov.test.js     # Visibility, occlusion, memory
├── DESIGN.md           # Rules and mechanics
├── DEVLOG.md           # Development log
└── README.md           # This file
```

## Run Tests

```bash
npm test
```

21 tests covering dungeon connectivity, combat math, and FOV correctness.

## Tech Stack

- [Vite](https://vitejs.dev/) — bundler
- [Vitest](https://vitest.dev/) — unit tests
- Canvas 2D — rendering
- Web Audio API — sound
- localStorage — save/load

No external runtime dependencies. Everything is vanilla JS.

## License

MIT

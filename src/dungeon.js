import { T, MAP_W, MAP_H, MAX_ROOMS, MIN_ROOM_SIZE, MAX_ROOM_SIZE, ENEMIES, ITEMS } from './constants.js';

/**
 * Create a blank map filled with walls.
 */
export function createBlankMap() {
  const map = [];
  for (let y = 0; y < MAP_H; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      map[y][x] = T.WALL;
    }
  }
  return map;
}

/**
 * Carve a rectangular room into the map.
 */
function carveRoom(map, room) {
  for (let y = room.y; y <= room.y + room.h - 1; y++) {
    for (let x = room.x; x <= room.x + room.w - 1; x++) {
      if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
        map[y][x] = T.FLOOR;
      }
    }
  }
}

/**
 * Carve an L-shaped corridor between two points.
 */
function carveCorridor(map, x1, y1, x2, y2) {
  let cx = x1, cy = y1;
  // horizontal then vertical
  while (cx !== x2) {
    if (cx >= 0 && cx < MAP_W && cy >= 0 && cy < MAP_H) map[cy][cx] = T.FLOOR;
    cx += cx < x2 ? 1 : -1;
  }
  while (cy !== y2) {
    if (cx >= 0 && cx < MAP_W && cy >= 0 && cy < MAP_H) map[cy][cx] = T.FLOOR;
    cy += cy < y2 ? 1 : -1;
  }
}

function roomsOverlap(a, b, pad = 1) {
  return (
    a.x - pad < b.x + b.w &&
    a.x + a.w + pad > b.x &&
    a.y - pad < b.y + b.h &&
    a.y + a.h + pad > b.y
  );
}

function randomRoom(rng) {
  const w = rng.int(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
  const h = rng.int(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
  const x = rng.int(1, MAP_W - w - 1);
  const y = rng.int(1, MAP_H - h - 1);
  return { x, y, w, h };
}

function roomCenter(room) {
  return { x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) };
}

/**
 * Seedable PRNG (mulberry32).
 */
export function createRNG(seed) {
  let s = seed | 0;
  return {
    next() { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; },
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; },
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; },
  };
}

/**
 * Generate a dungeon level. Returns { map, rooms, stairsPos, entities, items }.
 * `depth` (1-based) influences enemy and item spawning.
 */
export function generateLevel(depth = 1, seed = Date.now()) {
  const rng = createRNG(seed + depth * 1000);
  const map = createBlankMap();
  const rooms = [];
  const entities = [];
  const items = [];

  // place rooms
  for (let attempt = 0; attempt < 200 && rooms.length < MAX_ROOMS; attempt++) {
    const room = randomRoom(rng);
    if (rooms.some((r) => roomsOverlap(r, room))) continue;
    carveRoom(map, room);
    rooms.push(room);
  }

  if (rooms.length < 2) {
    // fallback: at least force two rooms
    const r1 = { x: 2, y: 2, w: 6, h: 6 };
    const r2 = { x: MAP_W - 10, y: MAP_H - 10, w: 6, h: 6 };
    if (rooms.length === 0) { carveRoom(map, r1); rooms.push(r1); }
    if (rooms.length === 1) { carveRoom(map, r2); rooms.push(r2); }
  }

  // corridors between rooms (connect in order = guarantees connectivity)
  for (let i = 1; i < rooms.length; i++) {
    const a = roomCenter(rooms[i - 1]);
    const b = roomCenter(rooms[i]);
    carveCorridor(map, a.x, a.y, b.x, b.y);
    // place a door at the midpoint-ish
    const mx = Math.floor((a.x + b.x) / 2);
    const my = Math.floor((a.y + b.y) / 2);
    if (map[my] && map[my][mx] === T.FLOOR) map[my][mx] = T.DOOR;
  }

  // stairs down in the last room
  const lastCenter = roomCenter(rooms[rooms.length - 1]);
  map[lastCenter.y][lastCenter.x] = T.STAIRS_DOWN;
  const stairsPos = { x: lastCenter.x, y: lastCenter.y };

  // player start in the first room
  const startCenter = roomCenter(rooms[0]);
  const playerStart = { x: startCenter.x, y: startCenter.y };

  // spawn enemies in rooms (except first)
  for (let i = 1; i < rooms.length; i++) {
    const c = roomCenter(rooms[i]);
    // skip stairs room if too many enemies
    if (i === rooms.length - 1 && rng.next() < 0.5) continue;
    const count = rng.int(1, Math.min(3, 1 + Math.floor(depth / 2)));
    for (let e = 0; e < count; e++) {
      const ex = c.x + rng.int(-1, 1);
      const ey = c.y + rng.int(-1, 1);
      if (map[ey] && map[ey][ex] === T.FLOOR && (ex !== stairsPos.x || ey !== stairsPos.y)) {
        const type = pickEnemy(rng, depth);
        entities.push({ type, x: ex, y: ey, ...enemyStats(type, depth) });
      }
    }
  }

  // spawn items in rooms
  for (const room of rooms) {
    const c = roomCenter(room);
    if (rng.next() < 0.5) {
      const ix = c.x + rng.int(-1, 1);
      const iy = c.y + rng.int(-1, 1);
      if (map[iy] && map[iy][ix] === T.FLOOR && !entities.some(e => e.x === ix && e.y === iy)) {
        const item = pickItem(rng, depth);
        items.push({ ...item, x: ix, y: iy });
      }
    }
  }

  return { map, rooms, playerStart, stairsPos, entities, items };
}

function pickEnemy(rng, depth) {
  const pool = ['rat', 'goblin'];
  if (depth >= 2) pool.push('skeleton');
  if (depth >= 3) pool.push('orc');
  if (depth >= 4) pool.push('wraith');
  // weighted toward weaker enemies
  const weights = pool.map((_, i) => pool.length - i);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[0];
}

function enemyStats(type, depth) {
  const base = ENEMIES[type];
  const scaling = Math.floor(depth / 2);
  return {
    hp: base.hp + scaling * 2,
    maxHp: base.hp + scaling * 2,
    atk: base.atk + scaling,
    def: base.def + Math.floor(scaling / 2),
    xp: base.xp + scaling * 3,
    name: base.name,
    char: base.char,
    color: base.color,
  };
}

function pickItem(rng, depth) {
  const pool = Object.keys(ITEMS).filter((k) => {
    if (k === 'chain_mail') return depth >= 3;
    if (k === 'axe') return depth >= 2;
    if (k === 'wraith') return false; // not an item
    return true;
  });
  return { id: rng.pick(pool), ...ITEMS[rng.pick(pool)] };
}

/**
 * Flood-fill reachable tiles from (x, y). Returns number of reachable floor tiles.
 */
export function countReachableTiles(map, x, y) {
  const visited = new Set();
  const stack = [{ x, y }];
  let count = 0;
  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const k = `${x},${y}`;
    if (visited.has(k)) continue;
    if (y < 0 || y >= MAP_H || x < 0 || x >= MAP_W) continue;
    if (map[y][x] === T.WALL) continue;
    visited.add(k);
    count++;
    stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
  }
  return count;
}

/**
 * Check whether the entire map is connected (all floors reachable from one point).
 */
export function isMapConnected(map) {
  // find first floor tile
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y][x] !== T.WALL) {
        const total = countReachableTiles(map, x, y);
        let expected = 0;
        for (let yy = 0; yy < MAP_H; yy++)
          for (let xx = 0; xx < MAP_W; xx++)
            if (map[yy][xx] !== T.WALL) expected++;
        return total === expected;
      }
    }
  }
  return false;
}

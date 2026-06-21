// ── Tile types ──
export const T = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  STAIRS_DOWN: 3,
};

export const TILE_CHAR = {};
TILE_CHAR[T.WALL] = '#';
TILE_CHAR[T.FLOOR] = '.';
TILE_CHAR[T.DOOR] = '+';
TILE_CHAR[T.STAIRS_DOWN] = '>';

export const TILE_COLOR = {};
TILE_COLOR[T.WALL] = '#444';
TILE_COLOR[T.FLOOR] = '#222';
TILE_COLOR[T.DOOR] = '#963';
TILE_COLOR[T.STAIRS_DOWN] = '#ff0';

// ── Map ──
export const MAP_W = 80;
export const MAP_H = 45;
export const TILE_SIZE = 16;
export const MAX_ROOMS = 12;
export const MIN_ROOM_SIZE = 4;
export const MAX_ROOM_SIZE = 10;
export const DUNGEON_LEVELS = 5;

// ── Player ──
export const PLAYER_HP = 30;
export const PLAYER_ATK = 5;
export const PLAYER_DEF = 2;
export const XP_PER_LEVEL = 20;

// ── Enemies ──
export const ENEMIES = {
  rat:     { char: 'r', color: '#a84', hp: 6,  atk: 3, def: 0, xp: 5,  name: 'rat' },
  goblin:  { char: 'g', color: '#4a4', hp: 10, atk: 4, def: 1, xp: 10, name: 'goblin' },
  skeleton:{ char: 's', color: '#ccc', hp: 14, atk: 5, def: 2, xp: 18, name: 'skeleton' },
  orc:     { char: 'O', color: '#a60', hp: 20, atk: 7, def: 3, xp: 30, name: 'orc' },
  wraith:  { char: 'W', color: '#639', hp: 18, atk: 8, def: 1, xp: 35, name: 'wraith' },
};

// ── Items ──
export const ITEMS = {
  health_potion:  { char: '!', color: '#f44', name: 'Health Potion', heal: 15 },
  fire_potion:    { char: '!', color: '#f80', name: 'Fire Potion', damage: 12 },
  sword:          { char: '/', color: '#aaf', name: 'Sword', atk: 3 },
  dagger:         { char: '/', color: '#aaf', name: 'Dagger', atk: 1 },
  axe:            { char: '/', color: '#aaf', name: 'Battle Axe', atk: 5 },
  shield:         { char: '[', color: '#88c', name: 'Shield', def: 2 },
  leather_armor:  { char: '[', color: '#88c', name: 'Leather Armor', def: 1 },
  chain_mail:     { char: '[', color: '#88c', name: 'Chain Mail', def: 3 },
};

// ── FOV ──
export const PLAYER_SIGHT = 8;

// ── Misc ──
export const CANVAS_W = MAP_W * TILE_SIZE;
export const CANVAS_H = MAP_H * TILE_SIZE;

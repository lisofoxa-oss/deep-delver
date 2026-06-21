import { describe, it, expect } from 'vitest';
import { generateLevel, isMapConnected, createBlankMap, countReachableTiles, createRNG } from '../src/dungeon.js';
import { T } from '../src/constants.js';

describe('dungeon generation', () => {
  it('generates a level with a non-blank map', () => {
    const level = generateLevel(1, 12345);
    expect(level.map).toBeDefined();
    expect(level.map.length).toBeGreaterThan(0);
    expect(level.rooms.length).toBeGreaterThanOrEqual(2);
  });

  it('generates a connected map (all floor tiles reachable)', () => {
    const level = generateLevel(1, 9999);
    const connected = isMapConnected(level.map);
    expect(connected).toBe(true);
  });

  it('generates a connected map at each depth', () => {
    for (let d = 1; d <= 5; d++) {
      const level = generateLevel(d, 5000 + d);
      expect(isMapConnected(level.map)).toBe(true);
    }
  });

  it('places player start in the first room', () => {
    const level = generateLevel(1, 7777);
    expect(level.playerStart).toBeDefined();
    const tile = level.map[level.playerStart.y][level.playerStart.x];
    expect(tile).not.toBe(T.WALL);
  });

  it('places stairs in the last room', () => {
    const level = generateLevel(1, 3333);
    const tile = level.map[level.stairsPos.y][level.stairsPos.x];
    expect(tile).toBe(T.STAIRS_DOWN);
  });

  it('creates blank maps full of walls', () => {
    const map = createBlankMap();
    let wallCount = 0;
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === T.WALL) wallCount++;
      }
    }
    expect(wallCount).toBe(80 * 45);
  });

  it('RNG produces deterministic results with same seed', () => {
    const a = createRNG(42);
    const b = createRNG(42);
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('generates the same dungeon with same seed', () => {
    const level1 = generateLevel(1, 1234);
    const level2 = generateLevel(1, 1234);
    // compare floor tile positions (spot-check first 200 tiles)
    let same = 0;
    for (let y = 0; y < 45 && same < 200; y++) {
      for (let x = 0; x < 80 && same < 200; x++) {
        expect(level1.map[y][x]).toBe(level2.map[y][x]);
        same++;
      }
    }
  });

  it('spawns enemies and items', () => {
    const level = generateLevel(3, 5555);
    expect(level.entities.length).toBeGreaterThan(0);
  });
});

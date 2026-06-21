import { describe, it, expect } from 'vitest';
import { computeFOV } from '../src/fov.js';
import { T, MAP_W, MAP_H } from '../src/constants.js';

function makeOpenMap() {
  const map = [];
  for (let y = 0; y < MAP_H; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      map[y][x] = T.FLOOR;
    }
  }
  return map;
}

describe('FOV', () => {
  it('marks player tile as visible', () => {
    const map = makeOpenMap();
    const visible = new Set();
    const remembered = new Set();
    computeFOV(map, 10, 10, 8, visible, remembered);
    expect(visible.has('10,10')).toBe(true);
  });

  it('sees tiles within radius on an open map', () => {
    const map = makeOpenMap();
    const visible = new Set();
    const remembered = new Set();
    computeFOV(map, 20, 20, 5, visible, remembered);
    expect(visible.has('20,18')).toBe(true);
    expect(visible.has('23,20')).toBe(true);
  });

  it('does not see tiles outside radius', () => {
    const map = makeOpenMap();
    const visible = new Set();
    const remembered = new Set();
    computeFOV(map, 20, 20, 5, visible, remembered);
    expect(visible.has('20,30')).toBe(false);
    expect(visible.has('30,20')).toBe(false);
  });

  it('walls block vision', () => {
    const map = makeOpenMap();
    // build a wall at x=15
    for (let y = 0; y < MAP_H; y++) map[y][15] = T.WALL;
    const visible = new Set();
    const remembered = new Set();
    computeFOV(map, 10, 20, 10, visible, remembered);
    expect(visible.has('10,20')).toBe(true);
    // tiles behind the wall at x=15 should not be visible
    expect(visible.has('18,20')).toBe(false);
  });

  it('uses remembered set for previously seen tiles', () => {
    const map = makeOpenMap();
    const visible = new Set();
    const remembered = new Set();

    // first cast
    computeFOV(map, 10, 10, 5, visible, remembered);
    expect(remembered.has('12,10')).toBe(true);

    // second cast at different position
    visible.clear();
    computeFOV(map, 20, 10, 5, visible, remembered);
    // first position should still be in remembered
    expect(remembered.has('12,10')).toBe(true);
  });
});

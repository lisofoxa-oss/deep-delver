import { T } from './constants.js';

/**
 * Recursive shadowcasting FOV (rot.js-style).
 * Marks visible tiles from (px, py) within radius.
 */

const MULT = [
  [1, 0, 0, -1, -1, 0, 0, 1],
  [0, 1, 1, 0, 0, -1, -1, 0],
  [0, 1, -1, 0, 0, -1, 1, 0],
  [1, 0, 0, 1, -1, 0, 0, -1],
];

export function computeFOV(map, px, py, radius, visible, remembered) {
  visible.clear();
  const pk = `${px},${py}`;
  visible.add(pk);
  if (remembered) remembered.add(pk);

  for (let octant = 0; octant < 8; octant++) {
    castShadow(map, px, py, radius, 1, 1.0, 0.0,
      MULT[0][octant], MULT[1][octant], MULT[2][octant], MULT[3][octant],
      visible, remembered);
  }
}

function castShadow(map, cx, cy, radius, row, startSlope, endSlope,
  xx, xy, yx, yy, visible, remembered) {
  if (startSlope < endSlope) return;

  for (let j = row; j <= radius; j++) {
    let blocked = false;

    for (let dx = -j; dx <= 0; dx++) {
      const dy = -j;
      const mapX = cx + dx * xx + dy * xy;
      const mapY = cy + dx * yx + dy * yy;

      if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[0].length) continue;

      const leftSlope = (dx - 0.5) / (dy + 0.5);
      const rightSlope = (dx + 0.5) / (dy - 0.5);

      if (startSlope < rightSlope) continue;
      if (endSlope > leftSlope) break;

      // tile is within the current shadow arc
      if (dx * dx + dy * dy <= radius * radius) {
        const k = `${mapX},${mapY}`;
        visible.add(k);
        if (remembered) remembered.add(k);
      }

      if (map[mapY][mapX] === T.WALL) {
        if (!blocked) {
          startSlope = rightSlope;
          blocked = true;
        }
      } else {
        if (blocked) {
          castShadow(map, cx, cy, radius, j + 1, startSlope, leftSlope,
            xx, xy, yx, yy, visible, remembered);
          blocked = false;
        }
      }
    }

    if (blocked) break;
  }
}

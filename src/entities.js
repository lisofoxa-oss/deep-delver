/**
 * Create a player entity.
 */
export function createPlayer(x, y) {
  return {
    type: 'player',
    x,
    y,
    char: '@',
    color: '#ff0',
    hp: 30,
    maxHp: 30,
    atk: 5,
    def: 2,
    level: 1,
    xp: 0,
    xpNext: 20,
    weapon: null,
    armor: null,
    inventory: [],
    maxInventory: 8,
  };
}

/**
 * Create an enemy entity.
 */
export function createEnemy(type, x, y, stats) {
  return {
    type: 'enemy',
    enemyType: type,
    x,
    y,
    char: stats.char || 'e',
    color: stats.color || '#aaa',
    hp: stats.hp || 10,
    maxHp: stats.maxHp || 10,
    atk: stats.atk || 3,
    def: stats.def || 0,
    xp: stats.xp || 5,
    name: stats.name || type,
    alive: true,
  };
}

/**
 * Move an entity if the target tile is walkable.
 */
export function tryMove(entity, dx, dy, map) {
  const nx = entity.x + dx;
  const ny = entity.y + dy;
  if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return false;
  if (map[ny][nx] === 0) return false; // T.WALL
  entity.x = nx;
  entity.y = ny;
  return true;
}

/**
 * Check if a tile is blocked by a living enemy.
 */
export function isBlockedByEnemy(x, y, enemies) {
  return enemies.some((e) => e.alive && e.x === x && e.y === y);
}

/**
 * Find a living enemy at (x, y).
 */
export function enemyAt(x, y, enemies) {
  return enemies.find((e) => e.alive && e.x === x && e.y === y) || null;
}

/**
 * Simple AI: move toward the player if in range, otherwise wander.
 */
export function aiTakeTurn(enemy, player, map, enemies) {
  if (!enemy.alive) return null;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.abs(dx) + Math.abs(dy);

  if (dist <= 1) {
    // attack player
    return { action: 'attack', target: player };
  }

  if (dist <= 8) {
    // move toward player
    const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

    // try direct axis first (prefer the longer one)
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (tryMove(enemy, stepX, 0, map) && !isBlockedByEnemy(enemy.x, enemy.y, enemies)) return { action: 'move' };
      if (tryMove(enemy, 0, stepY, map) && !isBlockedByEnemy(enemy.x, enemy.y, enemies)) return { action: 'move' };
    } else {
      if (tryMove(enemy, 0, stepY, map) && !isBlockedByEnemy(enemy.x, enemy.y, enemies)) return { action: 'move' };
      if (tryMove(enemy, stepX, 0, map) && !isBlockedByEnemy(enemy.x, enemy.y, enemies)) return { action: 'move' };
    }
  }

  // random wander
  const dirs = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
  ];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  if (tryMove(enemy, dir[0], dir[1], map) && !isBlockedByEnemy(enemy.x, enemy.y, enemies)) return { action: 'move' };

  return { action: 'wait' };
}

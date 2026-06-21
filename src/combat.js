import { XP_PER_LEVEL } from './constants.js';

/**
 * Calculate damage from an attack.
 * Returns { amount, blocked, critical }.
 */
export function calcDamage(atk, def) {
  const base = Math.max(1, atk - def);
  // slight randomness ±25%
  const variation = Math.floor(base * 0.25);
  const roll = base - variation + Math.floor(Math.random() * (variation * 2 + 1));
  const isCrit = Math.random() < 0.1;
  const amount = isCrit ? Math.floor(roll * 1.5) : roll;
  return {
    amount,
    blocked: def,
    critical: isCrit,
  };
}

/**
 * Deal damage from `attacker` to `defender`.
 * Returns the damage result.
 */
export function attack(attacker, defender) {
  const atkVal = attacker.atk + (attacker.weapon ? attacker.weapon.atk || 0 : 0);
  const defVal = defender.def + (defender.armor ? defender.armor.def || 0 : 0);
  const result = calcDamage(atkVal, defVal);
  defender.hp -= result.amount;
  if (defender.hp <= 0) {
    defender.hp = 0;
    if (defender.type === 'enemy') defender.alive = false;
  }
  return result;
}

/**
 * Gain XP and check level-up.
 * Returns the number of levels gained (0 or more).
 */
export function gainXp(player, amount) {
  player.xp += amount;
  let levelsGained = 0;
  while (player.xp >= player.xpNext) {
    player.xp -= player.xpNext;
    player.xpNext = Math.floor(player.xpNext * 1.5);
    player.level++;
    player.maxHp += 4;
    player.hp = Math.min(player.hp + 4, player.maxHp);
    player.atk += 1;
    player.def += 1;
    levelsGained++;
  }
  return levelsGained;
}

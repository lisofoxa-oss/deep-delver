import { describe, it, expect } from 'vitest';
import { calcDamage, attack, gainXp } from '../src/combat.js';
import { createPlayer } from '../src/entities.js';

describe('combat', () => {
  it('calcDamage deals at least 1 damage', () => {
    for (let i = 0; i < 100; i++) {
      const result = calcDamage(1, 100);
      expect(result.amount).toBeGreaterThanOrEqual(1);
    }
  });

  it('calcDamage with high atk deals more damage than low atk', () => {
    const lows = Array.from({ length: 50 }, () => calcDamage(3, 1).amount);
    const highs = Array.from({ length: 50 }, () => calcDamage(15, 1).amount);
    const avgLow = lows.reduce((a, b) => a + b, 0) / lows.length;
    const avgHigh = highs.reduce((a, b) => a + b, 0) / highs.length;
    expect(avgHigh).toBeGreaterThan(avgLow);
  });

  it('attack reduces defender HP', () => {
    const attacker = createPlayer(0, 0);
    const defender = { type: 'enemy', hp: 20, maxHp: 20, atk: 3, def: 1, alive: true };
    const result = attack(attacker, defender);
    expect(defender.hp).toBeLessThan(20);
    expect(result.amount).toBeGreaterThanOrEqual(1);
  });

  it('attack kills defender when HP reaches 0', () => {
    const attacker = { atk: 999, def: 0, weapon: null, armor: null };
    const defender = { type: 'enemy', hp: 5, maxHp: 5, atk: 0, def: 0, alive: true };
    attack(attacker, defender);
    expect(defender.hp).toBe(0);
    expect(defender.alive).toBe(false);
  });

  it('gainXp levels up player', () => {
    const player = createPlayer(0, 0);
    player.xp = 0;
    player.xpNext = 20;
    player.level = 1;
    const levels = gainXp(player, 50);
    expect(levels).toBeGreaterThanOrEqual(2); // 20 + 30 = 50, next costs 20 then 30
    expect(player.level).toBeGreaterThan(1);
    expect(player.maxHp).toBeGreaterThan(30);
  });

  it('gainXp does not level up with small XP', () => {
    const player = createPlayer(0, 0);
    player.xp = 0;
    player.xpNext = 20;
    const levels = gainXp(player, 5);
    expect(levels).toBe(0);
    expect(player.level).toBe(1);
  });

  it('calcDamage can crit', () => {
    let crits = 0;
    for (let i = 0; i < 200; i++) {
      const result = calcDamage(10, 3);
      if (result.critical) crits++;
    }
    expect(crits).toBeGreaterThan(0);
    expect(crits).toBeLessThan(100); // 10% chance so should be <100 out of 200
  });
});

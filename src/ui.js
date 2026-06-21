import { CANVAS_W, CANVAS_H } from './constants.js';

/**
 * UI screen helpers.
 * Returns overlay line arrays for the renderer.
 */

export function titleScreen() {
  return [
    { text: 'DEEP DELVER', color: '#ff0', size: 'bold 32px monospace', lineH: 50 },
    { text: 'A Roguelike Dungeon Crawl', color: '#aaa', size: '14px monospace', lineH: 24 },
    { text: '', size: '10px monospace', lineH: 16 },
    { text: 'Navigate with arrow keys / numpad', color: '#888', size: '12px monospace', lineH: 20 },
    { text: 'Pick up items with [g]', color: '#888', size: '12px monospace', lineH: 20 },
    { text: 'Open inventory with [i]', color: '#888', size: '12px monospace', lineH: 20 },
    { text: 'Wait a turn with [.] or [5]', color: '#888', size: '12px monospace', lineH: 20 },
    { text: '', size: '10px monospace', lineH: 16 },
    { text: 'Press any key to start', color: '#4f4', size: 'bold 16px monospace', lineH: 30 },
  ];
}

export function deathScreen(stats) {
  return [
    { text: 'YOU DIED', color: '#f44', size: 'bold 32px monospace', lineH: 50 },
    { text: '', size: '10px monospace', lineH: 12 },
    { text: `Reached depth ${stats.depth} | Level ${stats.level}`, color: '#aaa', size: '14px monospace', lineH: 24 },
    { text: `Enemies slain: ${stats.kills}`, color: '#aaa', size: '14px monospace', lineH: 24 },
    { text: '', color: '#aaa', size: '14px monospace', lineH: 24 },
    { text: 'Press any key to restart', color: '#888', size: '14px monospace', lineH: 24 },
  ];
}

export function victoryScreen(stats) {
  return [
    { text: 'ESCAPED!', color: '#ff0', size: 'bold 32px monospace', lineH: 50 },
    { text: 'You fought through the depths and emerged victorious!', color: '#afa', size: '14px monospace', lineH: 24 },
    { text: '', size: '10px monospace', lineH: 12 },
    { text: `Depth ${stats.depth} | Level ${stats.level} | Kills: ${stats.kills}`, color: '#aaa', size: '14px monospace', lineH: 24 },
    { text: '', color: '#aaa', size: '14px monospace', lineH: 24 },
    { text: 'Press any key to play again', color: '#888', size: '14px monospace', lineH: 24 },
  ];
}

export function inventoryScreen(player) {
  const lines = [
    { text: '— INVENTORY —', color: '#ff0', size: 'bold 16px monospace', lineH: 28 },
    { text: '', size: '10px monospace', lineH: 8 },
  ];

  if (player.weapon) {
    lines.push({ text: `Weapon: ${player.weapon.name} (ATK+${player.weapon.atk})`, color: '#aaf', size: '12px monospace', lineH: 20 });
  } else {
    lines.push({ text: 'Weapon: (none)', color: '#666', size: '12px monospace', lineH: 20 });
  }
  if (player.armor) {
    lines.push({ text: `Armor:  ${player.armor.name} (DEF+${player.armor.def})`, color: '#88c', size: '12px monospace', lineH: 20 });
  } else {
    lines.push({ text: 'Armor:  (none)', color: '#666', size: '12px monospace', lineH: 20 });
  }
  lines.push({ text: '', size: '10px monospace', lineH: 8 });

  if (player.inventory.length === 0) {
    lines.push({ text: '(empty)', color: '#666', size: '12px monospace', lineH: 20 });
  } else {
    for (let i = 0; i < player.inventory.length; i++) {
      const item = player.inventory[i];
      const consumable = item.consumable ? ' [u]se' : item.equipable ? ' [e]quip' : '';
      lines.push({ text: `${i + 1}. ${item.name}${consumable}`, color: item.color || '#ccc', size: '12px monospace', lineH: 20 });
    }
  }

  lines.push({ text: '', size: '10px monospace', lineH: 8 });
  lines.push({ text: 'Press [i] to close | [u] use | [e] equip | [d] drop', color: '#888', size: '11px monospace', lineH: 20 });

  return lines;
}

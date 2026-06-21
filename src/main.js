import { T, MAP_W, MAP_H, PLAYER_SIGHT, PLAYER_HP, PLAYER_ATK, PLAYER_DEF, XP_PER_LEVEL, DUNGEON_LEVELS, ENEMIES, ITEMS } from './constants.js';
import { generateLevel, isMapConnected } from './dungeon.js';
import { createPlayer, createEnemy, tryMove, enemyAt, aiTakeTurn } from './entities.js';
import { computeFOV } from './fov.js';
import { attack, gainXp } from './combat.js';
import { createGroundItem, useItem, equipItem, pickupItem, dropItem } from './items.js';
import { Renderer } from './renderer.js';
import { titleScreen, deathScreen, victoryScreen, inventoryScreen } from './ui.js';
import { SFX, resumeAudio } from './sound.js';
import { saveGame, loadGame, hasSavedGame, deleteSave } from './save.js';
import { Input } from './input.js';

// ── State ──
let state = 'title'; // 'title' | 'playing' | 'dead' | 'victory' | 'inventory'
let player = null;
let enemies = [];
let items = [];
let map = [];
let visible = new Set();
let remembered = new Set();
let messages = [];
let dungeonLevel = 1;
let gameStats = { kills: 0, depth: 0, level: 0 };
const MAX_MESSAGES = 50;

const canvas = document.getElementById('gc');
const renderer = new Renderer(canvas);
const input = new Input();

// ── Helpers ──
function addMessage(text, color = '#ccc') {
  messages.push({ text, color });
  if (messages.length > MAX_MESSAGES) messages.shift();
}

function clearVisible() { visible = new Set(); }

// ── Game Init ──
function startNewGame() {
  player = createPlayer(0, 0);
  enemies = [];
  items = [];
  messages = [];
  visible = new Set();
  remembered = new Set();
  gameStats = { kills: 0, depth: 0, level: 0 };
  dungeonLevel = 1;
  generateDungeonLevel();
  addMessage('You descend into the dungeon...', '#ff0');
  state = 'playing';
}

function generateDungeonLevel() {
  const result = generateLevel(dungeonLevel);
  map = result.map;
  player.x = result.playerStart.x;
  player.y = result.playerStart.y;
  enemies = result.entities.map((e) => createEnemy(e.type, e.x, e.y, e));
  items = result.items.map((i) => createGroundItem(i, i.x, i.y));
  visible = new Set();
  remembered = new Set();
  computeFOV(map, player.x, player.y, PLAYER_SIGHT, visible, remembered);
}

// ── Turn Processing ──
function processTurn(dx, dy) {
  if (state !== 'playing') return;

  const tx = player.x + dx;
  const ty = player.y + dy;

  // check attack
  if (dx !== 0 || dy !== 0) {
    const target = enemyAt(tx, ty, enemies);
    if (target) {
      const result = attack(player, target);
      SFX.hit();
      const critText = result.critical ? ' (Critical!)' : '';
      addMessage(`You hit the ${target.name} for ${result.amount} damage!${critText}`, '#f88');
      if (!target.alive) {
        addMessage(`The ${target.name} is defeated!`, '#4f4');
        SFX.kill();
        gameStats.kills++;
        const lvls = gainXp(player, target.xp);
        if (lvls > 0) {
          addMessage(`Level up! You are now level ${player.level}!`, '#ff0');
          SFX.levelUp();
        }
      }
      endTurn();
      return;
    }
  }

  // move
  if (dx !== 0 || dy !== 0) {
    if (tryMove(player, dx, dy, map)) {
      // check stairs
      if (map[player.y][player.x] === T.STAIRS_DOWN) {
        descendStairs();
        return;
      }
    } else {
      // bumped into wall
      return;
    }
  }

  endTurn();
}

function endTurn() {
  // FOV recompute
  computeFOV(map, player.x, player.y, PLAYER_SIGHT, visible, remembered);

  // enemy turns
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const result = aiTakeTurn(enemy, player, map, enemies);
    if (result && result.action === 'attack') {
      const dmgResult = attack(enemy, player);
      SFX.playerHit();
      addMessage(`The ${enemy.name} hits you for ${dmgResult.amount}!`, '#f44');
      if (player.hp <= 0) {
        player.hp = 0;
        SFX.death();
        gameStats.depth = dungeonLevel;
        gameStats.level = player.level;
        state = 'dead';
        return;
      }
    }
  }

  // auto-save
  saveCurrentState();
}

function descendStairs() {
  if (dungeonLevel >= DUNGEON_LEVELS) {
    // victory!
    gameStats.depth = dungeonLevel;
    gameStats.level = player.level;
    state = 'victory';
    addMessage('You emerge from the depths — victorious!', '#ff0');
    SFX.stairs();
    deleteSave();
    return;
  }

  dungeonLevel++;
  addMessage(`You descend to depth ${dungeonLevel}...`, '#8af');
  SFX.stairs();
  generateDungeonLevel();
}

// ── Items & Inventory ──
function pickUpItem() {
  if (state !== 'playing') return;
  const groundIdx = items.findIndex((i) => i.x === player.x && i.y === player.y);
  if (groundIdx === -1) {
    addMessage('Nothing to pick up here.', '#666');
    return;
  }
  const groundItem = items[groundIdx];
  const result = pickupItem(player, groundItem);
  if (result.success) {
    items.splice(groundIdx, 1);
    SFX.pickup();
    addMessage(result.message, '#aaf');
  } else {
    addMessage(result.message, '#f88');
  }
}

function openInventory() {
  if (state !== 'playing') return;
  state = 'inventory';
}

function closeInventory() {
  if (state === 'inventory') state = 'playing';
}

function useInventoryItem(index) {
  if (state !== 'inventory') return;
  const item = player.inventory[index];
  if (!item) return;
  if (item.consumable) {
    const msg = useItem(item, player);
    player.inventory.splice(index, 1);
    addMessage(msg, '#afa');
    if (item.heal) SFX.heal();
    if (item.damage) addMessage('(damage items not fully implemented)', '#888');
    state = 'playing';
  }
}

function equipInventoryItem(index) {
  if (state !== 'inventory') return;
  const item = player.inventory[index];
  if (!item || !item.equipable) return;
  const old = equipItem(item, player);
  player.inventory.splice(index, 1);
  if (old) player.inventory.push(old);
  addMessage(`Equipped ${item.name}.`, '#aaf');
  state = 'playing';
}

function dropInventoryItem(index) {
  if (state !== 'inventory') return;
  const item = dropItem(player, index);
  if (item) {
    item.x = player.x;
    item.y = player.y;
    items.push(item);
    addMessage(`Dropped ${item.name}.`, '#888');
  }
  state = 'playing';
}

// ── Save/Load ──
function saveCurrentState() {
  saveGame({
    player,
    enemies,
    items,
    map,
    visible: [...visible],
    remembered: [...remembered],
    messages,
    dungeonLevel,
    gameStats,
  });
}

function loadSavedGame() {
  const data = loadGame();
  if (!data) return false;
  player = data.player;
  enemies = data.enemies;
  items = data.items;
  map = data.map;
  visible = new Set(data.visible);
  remembered = new Set(data.remembered);
  messages = data.messages;
  dungeonLevel = data.dungeonLevel;
  gameStats = data.gameStats;
  state = 'playing';
  addMessage('Game loaded.', '#888');
  return true;
}

// ── Rendering ──
function render() {
  if (state === 'title') {
    renderer.drawOverlay(titleScreen());
  } else if (state === 'playing' || state === 'inventory') {
    renderer.render({ map, player, enemies, items, visible, remembered, messages, dungeonLevel });
    renderer.drawUI(player, messages, dungeonLevel);
    if (state === 'inventory') {
      renderer.drawOverlay(inventoryScreen(player), 0.75);
    }
  } else if (state === 'dead') {
    renderer.render({ map, player, enemies, items, visible, remembered, messages, dungeonLevel });
    renderer.drawOverlay(deathScreen(gameStats));
  } else if (state === 'victory') {
    renderer.render({ map, player, enemies, items, visible, remembered, messages, dungeonLevel });
    renderer.drawOverlay(victoryScreen(gameStats));
  }
}

// ── Input Binding ──
function setupInput() {
  // movement
  const moveKeys = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    Numpad8: [0, -1], Numpad2: [0, 1], Numpad4: [-1, 0], Numpad6: [1, 0],
    Numpad7: [-1, -1], Numpad9: [1, -1], Numpad1: [-1, 1], Numpad3: [1, 1],
    y: [-1, -1], u: [1, -1], b: [-1, 1], n: [1, 1],
  };

  for (const [key, [dx, dy]] of Object.entries(moveKeys)) {
    input.onKey(key, () => processTurn(dx, dy));
  }

  // wait
  input.onKey('.', () => processTurn(0, 0));
  input.onKey('Numpad5', () => processTurn(0, 0));
  input.onKey(' ', () => processTurn(0, 0));

  // pick up
  input.onKey('g', () => pickUpItem());
  input.onKey('G', () => pickUpItem());

  // inventory
  input.onKey('i', () => {
    if (state === 'inventory') closeInventory();
    else openInventory();
  });
  input.onKey('Escape', () => {
    if (state === 'inventory') closeInventory();
  });

  // inventory actions
  input.onKey('1', () => { if (state === 'inventory') useItemOrEquip(0); });
  input.onKey('2', () => { if (state === 'inventory') useItemOrEquip(1); });
  input.onKey('3', () => { if (state === 'inventory') useItemOrEquip(2); });
  input.onKey('4', () => { if (state === 'inventory') useItemOrEquip(3); });
  input.onKey('5', () => { if (state === 'inventory') useItemOrEquip(4); });
  input.onKey('6', () => { if (state === 'inventory') useItemOrEquip(5); });
  input.onKey('7', () => { if (state === 'inventory') useItemOrEquip(6); });
  input.onKey('8', () => { if (state === 'inventory') useItemOrEquip(7); });

  // any key for screens
  input.onAnyKey((key) => {
    if (state === 'title') {
      resumeAudio();
      startNewGame();
      return;
    }
    if (state === 'dead') {
      startNewGame();
      return;
    }
    if (state === 'victory') {
      startNewGame();
      return;
    }
  });
}

function useItemOrEquip(index) {
  const item = player.inventory[index];
  if (!item) return;
  if (item.consumable) useInventoryItem(index);
  else if (item.equipable) equipInventoryItem(index);
}

// ── Game Loop ──
function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

// ── Init ──
setupInput();
gameLoop();

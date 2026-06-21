import { ITEMS } from './constants.js';

/**
 * Create a pickable item on the ground.
 */
export function createGroundItem(itemDef, x, y) {
  return {
    id: itemDef.id || Math.random().toString(36).slice(2, 6),
    x,
    y,
    char: itemDef.char || '?',
    color: itemDef.color || '#fff',
    name: itemDef.name || 'Unknown',
    consumable: !!itemDef.heal || !!itemDef.damage,
    equipable: !!itemDef.atk || !!itemDef.def,
    heal: itemDef.heal || 0,
    damage: itemDef.damage || 0,
    atk: itemDef.atk || 0,
    def: itemDef.def || 0,
  };
}

/**
 * Use a consumable item on the player. Returns a message string.
 */
export function useItem(item, player) {
  if (item.heal) {
    const healed = Math.min(item.heal, player.maxHp - player.hp);
    player.hp += healed;
    return `You drink the ${item.name}. (+${healed} HP)`;
  }
  if (item.damage) {
    // throwable — damage will be applied to target; simplified: damages first nearby enemy
    return `You throw the ${item.name}!`;
  }
  return `Nothing happens.`;
}

/**
 * Equip a weapon or armor. Returns the previously equipped item (if any) for swapping.
 */
export function equipItem(item, player) {
  let unequipped = null;
  if (item.atk) {
    unequipped = player.weapon;
    player.weapon = item;
  } else if (item.def) {
    unequipped = player.armor;
    player.armor = item;
  }
  return unequipped;
}

/**
 * Remove equipped item. Returns it.
 */
export function unequipItem(slot, player) {
  if (slot === 'weapon' && player.weapon) {
    const item = player.weapon;
    player.weapon = null;
    return item;
  }
  if (slot === 'armor' && player.armor) {
    const item = player.armor;
    player.armor = null;
    return item;
  }
  return null;
}

/**
 * Pick up an item from the ground and add to inventory.
 */
export function pickupItem(player, groundItem) {
  if (player.inventory.length >= player.maxInventory) {
    return { success: false, message: 'Inventory full!' };
  }
  player.inventory.push(groundItem);
  return { success: true, message: `You pick up the ${groundItem.name}.` };
}

/**
 * Drop an item from inventory onto the ground.
 */
export function dropItem(player, index) {
  if (index < 0 || index >= player.inventory.length) return null;
  return player.inventory.splice(index, 1)[0];
}

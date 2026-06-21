/**
 * Inventory management helpers.
 */

/**
 * Find an item in the inventory by id.
 */
export function findItem(inventory, id) {
  return inventory.find((i) => i.id === id) || null;
}

/**
 * Remove an item from inventory by index.
 */
export function removeItem(inventory, index) {
  if (index >= 0 && index < inventory.length) {
    return inventory.splice(index, 1)[0];
  }
  return null;
}

/**
 * Get total inventory weight (simple count for now).
 */
export function inventoryCount(inventory) {
  return inventory.length;
}

/**
 * Check if inventory is full.
 */
export function isFull(inventory, max) {
  return inventory.length >= max;
}

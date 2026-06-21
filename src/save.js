const SAVE_KEY = 'deep-delver-save';

/**
 * Save the game state to localStorage.
 */
export function saveGame(gameState) {
  try {
    const data = JSON.stringify(gameState);
    localStorage.setItem(SAVE_KEY, data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load the game state from localStorage.
 */
export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Check if a saved game exists.
 */
export function hasSavedGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete the saved game.
 */
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

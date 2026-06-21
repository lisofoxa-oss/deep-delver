/**
 * Keyboard input manager.
 */
export class Input {
  constructor() {
    this._handlers = new Map();
    this._onAny = null;
    this._handleKey = (e) => {
      // prevent default for game keys
      const key = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab', '\\'].includes(key)) {
        e.preventDefault();
      }
      const handler = this._handlers.get(key);
      if (handler) handler(e);
      if (this._onAny) this._onAny(key, e);
    };
    window.addEventListener('keydown', this._handleKey);
  }

  onKey(key, handler) {
    this._handlers.set(key, handler);
  }

  onAnyKey(handler) {
    this._onAny = handler;
  }

  destroy() {
    window.removeEventListener('keydown', this._handleKey);
    this._handlers.clear();
    this._onAny = null;
  }
}

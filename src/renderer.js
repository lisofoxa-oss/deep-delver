import { MAP_W, MAP_H, TILE_SIZE, CANVAS_W, CANVAS_H, T, TILE_CHAR, TILE_COLOR } from './constants.js';

/**
 * Tile-based renderer using a canvas 2D context.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Render the full game frame.
   */
  render(gameState) {
    const { map, player, enemies, items, visible, remembered, messages, dungeonLevel } = gameState;
    const ctx = this.ctx;

    // draw tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const k = `${x},${y}`;
        const tile = map[y][x];
        const isVisible = visible.has(k);
        const isRemembered = remembered.has(k);

        if (isVisible) {
          this.drawTile(x, y, tile, 1.0);
        } else if (isRemembered) {
          this.drawTile(x, y, tile, 0.35);
        } else {
          // unexplored — solid black
          ctx.fillStyle = '#000';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // draw items (visible only)
    for (const item of items) {
      const k = `${item.x},${item.y}`;
      if (visible.has(k)) {
        this.drawChar(item.x, item.y, item.char, item.color, 1.0);
      }
    }

    // draw enemies (visible only)
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const k = `${enemy.x},${enemy.y}`;
      if (visible.has(k)) {
        this.drawChar(enemy.x, enemy.y, enemy.char, enemy.color, 1.0);
        // HP bar for damaged enemies
        if (enemy.hp < enemy.maxHp) {
          this.drawHpBar(enemy.x, enemy.y, enemy.hp / enemy.maxHp, '#c44');
        }
      }
    }

    // draw player
    this.drawChar(player.x, player.y, player.char, player.color, 1.0);
  }

  drawTile(x, y, tileType, alpha) {
    const ctx = this.ctx;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const color = TILE_COLOR[tileType] || '#111';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    // draw tile character
    const ch = TILE_CHAR[tileType] || ' ';
    if (ch !== ' ') {
      ctx.fillStyle = tileType === T.WALL ? '#666' : '#555';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 1);
    }
    ctx.globalAlpha = 1;
  }

  drawChar(x, y, ch, color, alpha) {
    const ctx = this.ctx;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 1);
    ctx.globalAlpha = 1;
  }

  drawHpBar(x, y, ratio, color) {
    const ctx = this.ctx;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE - 2;
    const w = TILE_SIZE - 2;
    ctx.fillStyle = '#222';
    ctx.fillRect(px + 1, py, w, 2);
    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py, w * ratio, 2);
  }

  /**
   * Draw a UI overlay (message log, stats bar).
   */
  drawUI(player, messages, dungeonLevel) {
    const ctx = this.ctx;

    // top stat bar
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_W, 18);

    ctx.fillStyle = '#ff0';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const hpColor = player.hp < player.maxHp * 0.3 ? '#f44' : '#4f4';
    ctx.fillStyle = hpColor;
    ctx.fillText(`HP:${player.hp}/${player.maxHp}`, 4, 3);
    ctx.fillStyle = '#aaf';
    ctx.fillText(`ATK:${player.atk + (player.weapon ? player.weapon.atk || 0 : 0)}`, 130, 3);
    ctx.fillText(`DEF:${player.def + (player.armor ? player.armor.def || 0 : 0)}`, 210, 3);
    ctx.fillStyle = '#ffa';
    ctx.fillText(`Lv.${player.level}`, 290, 3);
    ctx.fillStyle = '#888';
    ctx.fillText(`XP:${player.xp}/${player.xpNext}`, 330, 3);
    ctx.fillStyle = '#8af';
    ctx.fillText(`Depth: ${dungeonLevel}`, 440, 3);
    ctx.fillStyle = '#888';
    ctx.fillText(`[i]nv  [g]et  [d]rop  [. / 5]wait`, 550, 3);

    // message log (last 4 messages)
    const msgY = CANVAS_H - 60;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, msgY, CANVAS_W, 60);
    ctx.font = '11px monospace';
    ctx.textBaseline = 'top';
    const visibleMsgs = messages.slice(-4);
    for (let i = 0; i < visibleMsgs.length; i++) {
      ctx.fillStyle = visibleMsgs[i].color || '#ccc';
      ctx.textAlign = 'left';
      ctx.fillText(visibleMsgs[i].text, 4, msgY + 4 + i * 14);
    }
  }

  /**
   * Draw an overlay screen (title, death, victory).
   */
  drawOverlay(lines, bgAlpha = 0.7) {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      ctx.fillStyle = l.color || '#fff';
      ctx.font = l.size || '16px monospace';
      ctx.fillText(l.text, CANVAS_W / 2, CANVAS_H / 2 + (i - lines.length / 2) * (l.lineH || 28));
    }
  }
}

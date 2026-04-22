/* ═══════════════════════════════════════════════════════
   phaser-game.js — MYTH 2D World (Phaser 3)
   Top-down campus exploration with WASD movement,
   zone detection, NPC proximity + E-key interaction
═══════════════════════════════════════════════════════ */

'use strict';

// Zone rectangle colors (hex ints for Phaser)
const ZONE_FILL_COLORS = {
  outdoor:  0xC8D8A8,
  building: 0xE4D8C8,
  sports:   0xC4D4B0,
  special:  0xE8D8B8,
  hidden:   0xD8C8B0,
};
const ZONE_LINE_COLORS = {
  outdoor:  0x7A9A60,
  building: 0xB8A890,
  sports:   0x7A9A60,
  special:  0xB8902C,
  hidden:   0x906858,
};
const LOCKED_FILL   = 0xB8A898;
const LOCKED_LINE   = 0x8A7868;
const WORLD_BG      = 0x3A2E1E;
const PATH_COLOR    = 0xC4B090;

// Layout constants
const ZONE_W   = 380;
const ZONE_H   = 200;
const ZONE_GAP = 20;
const MAP_PAD  = 52;

// Derived world size
const WORLD_W  = MAP_PAD * 2 + 3 * ZONE_W + 2 * ZONE_GAP;
const WORLD_H  = MAP_PAD * 2 + 6 * ZONE_H + 5 * ZONE_GAP;

// Zone pixel bounds: id → {x, y, w, h}
const ZONE_BOUNDS = {};

function _buildZoneBounds() {
  ZONES.forEach(z => {
    if (!z.mapGrid) return;
    const c = z.mapGrid.col - 1;
    const r = z.mapGrid.row - 1;
    ZONE_BOUNDS[z.id] = {
      x: MAP_PAD + c * (ZONE_W + ZONE_GAP),
      y: MAP_PAD + r * (ZONE_H + ZONE_GAP),
      w: ZONE_W,
      h: ZONE_H,
    };
  });
}

// NPC sprite color by group
function _npcColor(group) {
  if (group === 'mob')     return 0xFC7B54;
  if (group === 'balance') return 0xF7B731;
  if (group === 'grind')   return 0x6BCB77;
  return 0xB0A090;
}

// Player sprite color by friend group
function _playerColor(group) {
  if (group === 'mob')     return 0xFC7B54;
  if (group === 'balance') return 0xF7B731;
  if (group === 'grind')   return 0x6BCB77;
  return 0xEAD9C0;
}

let _phaserGame = null;

/* ── Entry point called from game.js ─────────────────── */
function initPhaserGame(playerData) {
  _buildZoneBounds();

  const container = document.getElementById('phaser-container');
  const W = container.clientWidth  || window.innerWidth;
  const H = container.clientHeight || (window.innerHeight - 52);

  if (_phaserGame) { _phaserGame.destroy(true); _phaserGame = null; }

  _phaserGame = new Phaser.Game({
    type:            Phaser.AUTO,
    parent:          'phaser-container',
    width:           W,
    height:          H,
    backgroundColor: '#3A2E1E',
    physics: {
      default: 'arcade',
      arcade:  { gravity: { y: 0 }, debug: false },
    },
    scale: {
      mode:       Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [buildGameScene(playerData)],
  });
}

/* ── Scene factory ────────────────────────────────────── */
function buildGameScene(playerData) {

  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' });
      this.px           = 0;    // player world-x
      this.py           = 0;    // player world-y
      this.currentZone  = 'front_entrance';
      this.nearbyNpc    = null;
      this.npcPositions = {};   // npcId → {x, y}
      this.playerGfx    = null;
      this.playerLabel  = null;
      this.hintText     = null;
    }

    create() {
      const state    = Engine.getState();
      const periodId = state.period?.id || 'before_school';

      /* ── 1. World background ──────────────────────── */
      this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, WORLD_BG);

      /* ── 2. Path / ground strips between zones ────── */
      const pathGfx = this.add.graphics();
      pathGfx.fillStyle(PATH_COLOR, 0.35);
      // Horizontal paths
      for (let r = 0; r < 5; r++) {
        const py = MAP_PAD + (r + 1) * ZONE_H + r * ZONE_GAP;
        pathGfx.fillRect(MAP_PAD, py, WORLD_W - MAP_PAD * 2, ZONE_GAP);
      }
      // Vertical paths
      for (let c = 0; c < 2; c++) {
        const px = MAP_PAD + (c + 1) * ZONE_W + c * ZONE_GAP;
        pathGfx.fillRect(px, MAP_PAD, ZONE_GAP, WORLD_H - MAP_PAD * 2);
      }

      /* ── 3. Zone tiles ────────────────────────────── */
      const zoneGfx = this.add.graphics();

      ZONES.forEach(zone => {
        if (!zone.mapGrid) return;
        const b      = ZONE_BOUNDS[zone.id];
        const locked = zone.unlocksAt > state.grade;
        const fill   = locked ? LOCKED_FILL : (ZONE_FILL_COLORS[zone.type]  || 0xE4D8C8);
        const line   = locked ? LOCKED_LINE : (ZONE_LINE_COLORS[zone.type]  || 0xB8A890);

        zoneGfx.fillStyle(fill, locked ? 0.55 : 1.0);
        zoneGfx.fillRect(b.x, b.y, b.w, b.h);
        zoneGfx.lineStyle(2, line, 1);
        zoneGfx.strokeRect(b.x, b.y, b.w, b.h);

        // Crosshatch overlay on locked zones
        if (locked) {
          zoneGfx.lineStyle(1, line, 0.22);
          for (let i = -b.h; i < b.w + b.h; i += 22) {
            const x1 = b.x + Math.max(0, i);
            const y1 = b.y + Math.max(0, -i);
            const x2 = b.x + Math.min(b.w, i + b.h);
            const y2 = b.y + Math.min(b.h, b.h - i);
            if (x1 < b.x + b.w && y2 > b.y)
              zoneGfx.lineBetween(x1, y1, x2, y2);
          }
        }

        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;

        // Zone name
        this.add.text(cx, cy - 12, (zone.shortName || zone.name).toUpperCase(), {
          fontSize:   locked ? '10px' : '12px',
          fontFamily: 'Space Mono, monospace',
          color:      locked ? '#8A7A6A' : '#2D1F12',
          fontStyle:  'bold',
          stroke:     locked ? 'transparent' : 'rgba(255,255,255,0.4)',
          strokeThickness: 2,
        }).setOrigin(0.5, 0.5).setAlpha(locked ? 0.65 : 1);

        // Icon or lock badge
        if (locked) {
          this.add.text(cx, cy + 14, `GR.${zone.unlocksAt}`, {
            fontSize:   '10px',
            fontFamily: 'Space Mono, monospace',
            color:      '#8A7A6A',
          }).setOrigin(0.5, 0.5).setAlpha(0.65);
        } else {
          this.add.text(cx, cy + 14, zone.icon || '', {
            fontSize: '18px',
          }).setOrigin(0.5, 0.5);
        }
      });

      /* ── 4. NPC sprites ───────────────────────────── */
      const npcGfx = this.add.graphics();

      // Group NPCs by zone for even spacing
      const byZone = {};
      NPCS.forEach(npc => {
        const loc    = npc.schedule[periodId] ?? npc.defaultZone;
        const b      = ZONE_BOUNDS[loc];
        if (!b) return;
        const zone   = ZONES.find(z => z.id === loc);
        if (zone && zone.unlocksAt > state.grade) return;
        const statOk = Object.entries(npc.statRequirements || {})
          .every(([k, v]) => (state.stats[k] || 0) >= v);
        if (!statOk) return;
        if (!byZone[loc]) byZone[loc] = [];
        byZone[loc].push(npc);
      });

      Object.entries(byZone).forEach(([zoneId, npcs]) => {
        const b = ZONE_BOUNDS[zoneId];
        npcs.forEach((npc, i) => {
          const total  = npcs.length;
          const margin = 55;
          const nx     = total > 1
            ? b.x + margin + (i / (total - 1)) * (b.w - margin * 2)
            : b.x + b.w / 2;
          const ny = b.y + b.h * 0.62;

          this.npcPositions[npc.id] = { x: nx, y: ny };

          const col = _npcColor(npc.group);
          // Shadow
          npcGfx.fillStyle(0x000000, 0.18);
          npcGfx.fillEllipse(nx, ny + 18, 18, 6);
          // Body
          npcGfx.fillStyle(col, 1);
          npcGfx.fillRect(nx - 7, ny - 2, 14, 16);
          // Head
          npcGfx.fillCircle(nx, ny - 10, 9);
          // Outline
          npcGfx.lineStyle(1.5, 0x2D1F12, 0.5);
          npcGfx.strokeCircle(nx, ny - 10, 9);

          // Name tag
          this.add.text(nx, ny - 24, npc.name, {
            fontSize:   '8px',
            fontFamily: 'Space Mono, monospace',
            color:      '#2D1F12',
            backgroundColor: 'rgba(234,217,192,0.82)',
            padding:    { x: 3, y: 1 },
          }).setOrigin(0.5, 1);
        });
      });

      /* ── 5. Player sprite ─────────────────────────── */
      const startB = ZONE_BOUNDS['front_entrance'];
      this.px = startB ? startB.x + startB.w / 2 : WORLD_W / 2;
      this.py = startB ? startB.y + startB.h * 0.55 : WORLD_H / 2;

      const pCol = _playerColor(playerData.friendGroup);

      this.playerGfx = this.add.graphics();
      this._renderPlayer(pCol);
      this.playerGfx.x = this.px;
      this.playerGfx.y = this.py;
      this.playerGfx.setDepth(10);

      // Player name label
      this.playerLabel = this.add.text(this.px, this.py - 30, (playerData.name || 'YOU').toUpperCase(), {
        fontSize:        '10px',
        fontFamily:      'Space Mono, monospace',
        color:           '#FFFFFF',
        backgroundColor: 'rgba(45,31,18,0.82)',
        padding:         { x: 4, y: 2 },
      }).setOrigin(0.5, 1).setDepth(11);

      /* ── 6. Interaction hint ──────────────────────── */
      this.hintText = this.add.text(this.px, this.py - 46, '', {
        fontSize:        '11px',
        fontFamily:      'Space Mono, monospace',
        color:           '#F7B731',
        backgroundColor: 'rgba(45,31,18,0.88)',
        padding:         { x: 5, y: 3 },
      }).setOrigin(0.5, 1).setDepth(12).setVisible(false);

      /* ── 7. Camera ────────────────────────────────── */
      this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.startFollow(this.playerGfx, true, 0.09, 0.09);
      this.cameras.main.setZoom(1);

      /* ── 8. Input ─────────────────────────────────── */
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd    = this.input.keyboard.addKeys({
        up:    Phaser.Input.Keyboard.KeyCodes.W,
        down:  Phaser.Input.Keyboard.KeyCodes.S,
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });
      this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.eKey.on('down', () => this._interact());

      /* ── 9. Minimap compass label ─────────────────── */
      const compassStyle = {
        fontSize: '8px', fontFamily: 'Space Mono, monospace',
        color: 'rgba(200,185,170,0.55)',
      };
      this.add.text(MAP_PAD - 4,           MAP_PAD - 24,          'WEST',   compassStyle).setOrigin(0, 0);
      this.add.text(MAP_PAD + 2 * (ZONE_W + ZONE_GAP) + ZONE_W / 2,
                    MAP_PAD - 24,          'EAST',   compassStyle).setOrigin(0.5, 0);
      this.add.text(MAP_PAD,               WORLD_H - MAP_PAD + 8, 'FIELDS', compassStyle).setOrigin(0, 0);

      /* Initial zone sync */
      this._detectZone(true);
    }

    /* ── Draw player into its Graphics object ───────── */
    _renderPlayer(color) {
      const g = this.playerGfx;
      g.clear();
      // Drop shadow
      g.fillStyle(0x000000, 0.22);
      g.fillEllipse(0, 22, 22, 8);
      // Body
      g.fillStyle(color, 1);
      g.fillRect(-10, 0, 20, 22);
      // Head
      g.fillCircle(0, -11, 11);
      // White rim
      g.lineStyle(2, 0xFFFFFF, 0.55);
      g.strokeCircle(0, -11, 11);
      g.strokeRect(-10, 0, 20, 22);
      // Direction dot (so it's not symmetric)
      g.fillStyle(0xFFFFFF, 0.7);
      g.fillCircle(0, -13, 3);
    }

    update(time, delta) {
      const SPEED = 240;
      const dt    = delta / 1000;

      let dx = 0, dy = 0;
      if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
      if (this.cursors.right.isDown || this.wasd.right.isDown) dx =  1;
      if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
      if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy =  1;

      // Normalize diagonal
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      this.px = Phaser.Math.Clamp(this.px + dx * SPEED * dt, 4, WORLD_W - 4);
      this.py = Phaser.Math.Clamp(this.py + dy * SPEED * dt, 4, WORLD_H - 4);

      this.playerGfx.x = this.px;
      this.playerGfx.y = this.py;

      this.playerLabel.x = this.px;
      this.playerLabel.y = this.py - 28;

      if ((dx !== 0 || dy !== 0)) this._detectZone(false);
      this._detectNPC();
    }

    /* ── Check which zone the player is in ──────────── */
    _detectZone(force) {
      for (const [id, b] of Object.entries(ZONE_BOUNDS)) {
        if (this.px >= b.x && this.px <= b.x + b.w &&
            this.py >= b.y && this.py <= b.y + b.h) {
          if (id !== this.currentZone || force) {
            if (Engine.canGoTo(id)) {
              this.currentZone = id;
              Engine.goTo(id);
              // Update HUD zone text
              const el = document.getElementById('hud-zone');
              if (el) {
                const z = ZONES.find(z => z.id === id);
                el.textContent = z ? z.name : id;
              }
            }
          }
          return;
        }
      }
    }

    /* ── Check NPC proximity ────────────────────────── */
    _detectNPC() {
      const DIST = 65;
      let   best = null, bestD = Infinity;

      for (const [id, pos] of Object.entries(this.npcPositions)) {
        const d = Math.hypot(pos.x - this.px, pos.y - this.py);
        if (d < DIST && d < bestD) { best = id; bestD = d; }
      }

      if (best) {
        const npc = NPCS.find(n => n.id === best);
        this.nearbyNpc = npc;
        this.hintText.setText(`[E] TALK TO ${npc.name.toUpperCase()}`);
        this.hintText.setVisible(true);
        this.hintText.x = this.px;
        this.hintText.y = this.py - 46;
      } else {
        this.nearbyNpc = null;
        this.hintText.setVisible(false);
      }
    }

    /* ── E key: talk to NPC or trigger zone object ──── */
    _interact() {
      if (this.nearbyNpc) {
        Engine.talkTo(this.nearbyNpc.id);
        return;
      }
      const objs = Engine.getObjectsInZone(this.currentZone);
      if (objs.length > 0) Engine.triggerInteraction(objs[0].id);
    }
  }

  return GameScene;
}

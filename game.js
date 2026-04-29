/* ═══════════════════════════════════════════════════════
   MYTH — game.js
   Scene sequencer + character creation logic
═══════════════════════════════════════════════════════ */

'use strict';

// ── GSAP shorthand ────────────────────────────────────
const G = gsap;

// ── State ─────────────────────────────────────────────
const player = {
  name: '',
  friendGroup: null,
  personality: null,
  height: null,
  rumor: null,
  background: null,
  secret: null,
  stats: {
    gpa:              2.00,   // 0.00 – 4.00
    friendships:      3.0,
    relationships:    2.0,
    sports:           2.0,
    intelligence:     5.0,
    extracurriculars: 2.0,
    happiness:        5.0,
  }
};

const STAT_LABELS = {
  gpa:              'GPA',
  friendships:      'FRIENDSHIPS',
  relationships:    'RELATIONSHIPS',
  sports:           'SPORTS',
  intelligence:     'INTELLIGENCE',
  extracurriculars: 'EXTRACURRICULARS',
  happiness:        'HAPPINESS',
};

// Stat bar colors — percentage-based so GPA (0–4) and others (0–10) use same thresholds
function statColor(key, val) {
  const pct = key === 'gpa' ? val / 4 : val / 10;
  if (pct >= 0.7) return '#F7B731';
  if (pct >= 0.4) return '#6BCB77';
  return '#FC7B54';
}

// Clamp helper that respects GPA's 0–4 scale
function clampStat(key, val) {
  return key === 'gpa' ? clamp(val, 0, 4) : clamp(val, 0, 10);
}

// ── Randomization pools ───────────────────────────────
const HEIGHTS = ["5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\"","6'5\""];

const RUMORS = [
  { text: 'Got expelled from their last school', tox: +2 },
  { text: "Rumor is they're loaded but hiding it", tox: +1 },
  { text: 'People say they were a prodigy at something', tox: 0 },
  { text: "Word is they've already hooked up with someone here", tox: +2 },
  { text: "Apparently their family is... controversial", tox: +1 },
  { text: "People say they're not actually from here", tox: 0 },
  { text: "They say this one's got a dark side", tox: +2 },
  { text: "Supposedly the child of someone important", tox: +1 },
  { text: "Overheard: 'Watch out for that one.'", tox: +1 },
  { text: "They say they turned down a scholarship somewhere else", tox: 0 },
  { text: "Someone said they used to be a completely different person", tox: 0 },
  { text: "Apparently there's a video of them doing something embarrassing", tox: +2 },
  { text: "Word is they've been to three different schools in two years", tox: +1 },
  { text: "Supposedly they ghosted their entire old friend group over the summer", tox: +1 },
  { text: "Heard they can actually fight — like, for real", tox: +1 },
  { text: "People say they went through something serious last year", tox: 0 },
  { text: "Word is they have a record", tox: +2 },
  { text: "Someone swears they've seen them cry in a bathroom stall", tox: 0 },
  { text: "They say this one's running from something", tox: +1 },
  { text: "Heard they used to be homeschooled — this is their first real school", tox: 0 },
  { text: "Supposedly dated someone twice their age over the summer", tox: +2 },
  { text: "Heard they only got in because of a deal their parents made", tox: +1 },
  { text: "Word is their parents are going through a really bad divorce", tox: 0 },
  { text: "People say they're already talking to someone's girlfriend", tox: +2 },
  { text: "Apparently they got caught cheating at their last school", tox: +2 },
  { text: "Someone said they're only here for a semester", tox: 0 },
  { text: "Overheard two teachers whispering about them on day one", tox: +1 },
  { text: "Word is they turned down an offer from a D1 program", tox: 0 },
  { text: "Supposedly they know something about someone powerful here", tox: +1 },
  { text: "People say they used to be best friends with someone who hates them now", tox: +1 },
];

const BACKGROUNDS = [
  {
    id: 'new_kid',
    label: 'NEW KID',
    desc: 'Nobody knows your story yet.',
    bonus: { intelligence: +1, friendships: -1 },
  },
  {
    id: 'legacy',
    label: 'LEGACY STUDENT',
    desc: "Your family's name opens doors here.",
    bonus: { friendships: +2, gpa: -0.2, happiness: +1 },
  },
  {
    id: 'scholarship',
    label: 'SCHOLARSHIP KID',
    desc: 'You earned your place. Everyone knows it.',
    bonus: { gpa: +0.5, intelligence: +1, extracurriculars: +1 },
  },
  {
    id: 'transfer',
    label: 'TRANSFER STUDENT',
    desc: 'You chose to leave somewhere else. That choice follows you.',
    bonus: { intelligence: +1, relationships: -1, happiness: -1 },
  },
  {
    id: 'local_legend',
    label: 'LOCAL KID',
    desc: "You've been in this neighborhood forever. Half these people knew you in 4th grade.",
    bonus: { friendships: +2, happiness: +2 },
  },
  {
    id: 'military',
    label: 'MILITARY KID',
    desc: "You've moved five times. This is just another school. You've gotten good at starting over.",
    bonus: { intelligence: +1, friendships: -1, happiness: -1 },
  },
  {
    id: 'online_famous',
    label: 'QUIETLY INTERNET FAMOUS',
    desc: "You have a following. Most people here don't know it yet.",
    bonus: { friendships: +1, extracurriculars: +2, happiness: +1 },
  },
  {
    id: 'returnee',
    label: 'RETURNEE',
    desc: 'You went to middle school here, left for two years, and came back. Nobody knows why.',
    bonus: { intelligence: +1, friendships: -1 },
  },
  {
    id: 'prodigy',
    label: 'SKIPPED A GRADE',
    desc: "You're younger than everyone. Some respect it. Others use it against you.",
    bonus: { gpa: +0.8, intelligence: +2, friendships: -2 },
  },
  {
    id: 'old_money',
    label: 'OLD MONEY',
    desc: "Your family has history at this school. Not all of it flattering.",
    bonus: { friendships: +1, happiness: +2, gpa: -0.2 },
  },
];

const SECRETS = [
  { id: 'anxiety',      label: 'You have anxiety',                  desc: 'You manage it. Mostly.',                                     icon: '🫀' },
  { id: 'learning',     label: 'Learning disability (hidden)',       desc: "You've been compensating for years.",                         icon: '🧠' },
  { id: 'wealthy',      label: 'Secretly very wealthy',             desc: "You don't look it. On purpose.",                             icon: '💰' },
  { id: 'talent',       label: 'Hidden artistic talent',            desc: "You haven't shown anyone yet.",                              icon: '🎨' },
  { id: 'family',       label: 'Difficult home life',               desc: "You leave it at the door. Every single day.",                icon: '🏠' },
  { id: 'ex_athlete',   label: 'Quit a sport you were elite at',    desc: 'The muscle memory stays.',                                   icon: '⚡' },
  { id: 'crush',        label: 'Already in love with someone here', desc: "First day. Already complicated.",                            icon: '💛' },
  { id: 'following',    label: 'Anonymous online following',        desc: "Thousands know your work. Not your face.",                   icon: '📱' },
  { id: 'chronic',      label: 'Chronic illness — managed, hidden', desc: "Invisible. Exhausting. Nobody knows.",                       icon: '💊' },
  { id: 'therapy',      label: "You've been in therapy for 2 years", desc: "Best decision you ever made. You'll never tell anyone.",   icon: '🛋' },
  { id: 'ghosted',      label: 'You ghosted your entire old friend group', desc: "They still don't know why. Neither do you, fully.",   icon: '👻' },
  { id: 'writer',       label: 'You write — real stuff, dark stuff', desc: "Not for class. It goes somewhere nobody will ever read.",   icon: '✍️' },
  { id: 'bad_breakup',  label: 'A relationship ended badly',        desc: "It shaped you more than you want to admit.",                 icon: '💔' },
  { id: 'secret_keep',  label: "You know someone's secret",         desc: "Something big. You haven't decided what to do with it.",    icon: '🔑' },
  { id: 'language',     label: 'Fluent in a language nobody here speaks', desc: "You use it to think. To stay private.",               icon: '🗣' },
  { id: 'dropout_risk', label: 'You almost didn\'t come back this year', desc: "Something almost changed everything. It still might.", icon: '🚪' },
];

// ── Utility ───────────────────────────────────────────
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function flash(cb) {
  const el = document.getElementById('flash-overlay');
  G.timeline()
    .to(el, { opacity: 1, duration: 0.08 })
    .to(el, { opacity: 0, duration: 0.25, onComplete: cb });
}

function showScene(id, onDone) {
  const el = document.getElementById(id);
  if (!el) { if (onDone) onDone(); return; }
  el.classList.add('active');
  el.style.opacity = '0';
  G.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out', onComplete: onDone });
}

function hideScene(id, onDone) {
  const el = document.getElementById(id);
  G.to(el, {
    opacity: 0, duration: 0.3, ease: 'power2.in',
    onComplete: () => {
      el.classList.remove('active');
      if (onDone) onDone();
    }
  });
}

// Noise canvas disabled — not used in warm parchment theme

// ════════════════════════════════════════════════════════
//  SCENE 0 — BOOT
// ════════════════════════════════════════════════════════
(function bootScene() {
  showScene('scene-boot');
  setTimeout(() => hideScene('scene-boot', startIntro), 1200);
})();

// ════════════════════════════════════════════════════════
//  SCENE 1 — INTRO
// ════════════════════════════════════════════════════════
function startIntro() {
  showScene('scene-intro', () => {
    // Make all intro text immediately visible
    ['intro-l1','intro-l2','intro-l3'].forEach(id => {
      const el = document.getElementById(id);
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
    });
    const continueEl = document.getElementById('intro-continue');
    continueEl.style.opacity = '1';

    function proceed() {
      window.removeEventListener('keydown', proceed);
      continueEl.removeEventListener('click', proceed);
      hideScene('scene-intro', startNameScene);
    }
    window.addEventListener('keydown', proceed);
    continueEl.addEventListener('click', proceed);
  });
}

// ════════════════════════════════════════════════════════
//  SCENE 2 — NAME
// ════════════════════════════════════════════════════════
function startNameScene() {
  showScene('scene-name', () => {
    const input = document.getElementById('name-input');
    const btn   = document.getElementById('name-confirm');
    const numEl = document.querySelector('.id-number');

    input.addEventListener('input', () => {
      const v = input.value.trim();
      btn.disabled = v.length < 2;
      numEl.textContent = v.length >= 2
        ? `WB–2026–${Math.abs(v.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % 9000 + 1000)}`
        : 'WB–2026–????';
    });

    btn.addEventListener('click', () => {
      player.name = input.value.trim();
      hideScene('scene-name', startGroupScene);
    });

    input.focus();
  });
}

// ════════════════════════════════════════════════════════
//  SCENE 3 — FRIEND GROUP
// ════════════════════════════════════════════════════════
function startGroupScene() {
  showScene('scene-group', () => {
    G.to('.group-card', { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
    document.querySelectorAll('.group-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.group-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        player.friendGroup = card.dataset.group;
        applyGroupStats(card.dataset.group);
        hideScene('scene-group', startPersonalityScene);
      });
    });
  });
}

function applyGroupStats(g) {
  const s = player.stats;
  if (g === 'mob') {
    s.friendships    = clamp(s.friendships    + 3,   0, 10);
    s.sports         = clamp(s.sports         + 1,   0, 10);
    s.gpa            = clamp(s.gpa            - 0.5, 0, 4);
    s.intelligence   = clamp(s.intelligence   - 2,   0, 10);
    s.happiness      = clamp(s.happiness      - 1,   0, 10);
  } else if (g === 'balance') {
    s.friendships      = clamp(s.friendships      + 2,   0, 10);
    s.happiness        = clamp(s.happiness        + 2,   0, 10);
    s.extracurriculars = clamp(s.extracurriculars + 1,   0, 10);
    s.gpa              = clamp(s.gpa              + 0.3, 0, 4);
  } else if (g === 'grind') {
    s.gpa            = clamp(s.gpa            + 0.8, 0, 4);
    s.intelligence   = clamp(s.intelligence   + 3,   0, 10);
    s.relationships  = clamp(s.relationships  - 2,   0, 10);
    s.happiness      = clamp(s.happiness      - 1,   0, 10);
  }
}

// ════════════════════════════════════════════════════════
//  SCENE 4 — PERSONALITY
// ════════════════════════════════════════════════════════
function startPersonalityScene() {
  showScene('scene-personality', () => {
    G.to('.pers-card', { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
    document.querySelectorAll('.pers-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.pers-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        player.personality = card.dataset.pers;
        applyPersonalityStats(player.personality);
        hideScene('scene-personality', startRandomizeScene);
      });
    });
  });
}

function applyPersonalityStats(p) {
  const s = player.stats;
  if (p === 'grinder') {
    s.gpa              = clampStat('gpa',          s.gpa          + 0.6);
    s.intelligence     = clampStat('intelligence',  s.intelligence  + 2);
    s.happiness        = clampStat('happiness',     s.happiness     - 1);
  } else if (p === 'social') {
    s.friendships      = clampStat('friendships',   s.friendships   + 3);
    s.relationships    = clampStat('relationships', s.relationships + 2);
    s.happiness        = clampStat('happiness',     s.happiness     + 1);
  } else if (p === 'athlete') {
    s.sports           = clampStat('sports',           s.sports           + 3);
    s.extracurriculars = clampStat('extracurriculars', s.extracurriculars + 1);
    s.intelligence     = clampStat('intelligence',     s.intelligence     - 1);
  } else if (p === 'charmer') {
    s.relationships    = clampStat('relationships',    s.relationships + 3);
    s.friendships      = clampStat('friendships',      s.friendships   + 1);
    s.happiness        = clampStat('happiness',        s.happiness     + 1);
  } else if (p === 'observer') {
    s.intelligence     = clampStat('intelligence',  s.intelligence  + 2);
    s.happiness        = clampStat('happiness',     s.happiness     - 1);
    s.friendships      = clampStat('friendships',   s.friendships   - 1);
  } else if (p === 'rebel') {
    s.happiness        = clampStat('happiness',        s.happiness        + 1);
    s.gpa              = clampStat('gpa',              s.gpa              - 0.3);
    s.extracurriculars = clampStat('extracurriculars', s.extracurriculars + 1);
  } else if (p === 'empath') {
    s.relationships    = clampStat('relationships', s.relationships + 2);
    s.happiness        = clampStat('happiness',     s.happiness     + 1);
    s.intelligence     = clampStat('intelligence',  s.intelligence  + 1);
  } else if (p === 'wildcard') {
    const keys = Object.keys(s);
    const picks = keys.sort(() => Math.random() - 0.5).slice(0, 3);
    s[picks[0]] = clampStat(picks[0], s[picks[0]] + 2);
    s[picks[1]] = clampStat(picks[1], s[picks[1]] + 2);
    s[picks[2]] = clampStat(picks[2], s[picks[2]] - 1);
  }
}

// ════════════════════════════════════════════════════════
//  SCENE 5 — RANDOMIZE
// ════════════════════════════════════════════════════════
const RANDOM_SEQUENCE = [
  { key: 'height',     label: 'HEIGHT',     pool: HEIGHTS,     icon: '📏', accent: '#F7B731', glow: 'rgba(247,183,49,0.18)' },
  { key: 'rumor',      label: 'RUMOR',      pool: RUMORS,      icon: '💬', accent: '#FC7B54', glow: 'rgba(252,123,84,0.2)',  special: true },
  { key: 'background', label: 'BACKGROUND', pool: BACKGROUNDS, icon: '📋', accent: '#6BCB77', glow: 'rgba(107,203,119,0.2)', special: true },
  { key: 'secret',     label: 'SECRET',     pool: SECRETS,     icon: '🔒', accent: '#E8849A', glow: 'rgba(232,132,154,0.2)', special: true, hidden: true },
];

function startRandomizeScene() {
  // Roll all values
  player.height = rand(HEIGHTS);

  const rumorData = rand(RUMORS);
  player.rumor = rumorData.text;
  // Heavier rumors quietly dent happiness
  if (rumorData.tox > 0) {
    player.stats.happiness = clamp(player.stats.happiness - rumorData.tox * 0.3, 0, 10);
  }

  const bgData = rand(BACKGROUNDS);
  player.background = bgData;
  Object.entries(bgData.bonus).forEach(([k, v]) => {
    if (player.stats[k] !== undefined)
      player.stats[k] = clampStat(k, player.stats[k] + v);
  });

  player.secret = rand(SECRETS);

  showScene('scene-randomize', () => {
    const stage = document.getElementById('random-stage');

    // Show all cards at once in a grid
    const items = [
      { label: 'HEIGHT',     value: player.height,            sub: null,                       accent: '#C9913A', secret: false },
      { label: 'RUMOR',      value: '"' + player.rumor + '"', sub: 'Affects early reputation', accent: '#C4613A', secret: false },
      { label: 'BACKGROUND', value: player.background.label,  sub: player.background.desc,     accent: '#6E9E60', secret: false },
      { label: 'SECRET',     value: player.secret.label,      sub: player.secret.desc,         accent: '#C47A82', secret: true  },
    ];

    const grid = document.createElement('div');
    grid.className = 'revealed-grid';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mini-reveal-card';
      card.style.borderColor = item.accent + '66';
      card.innerHTML = `
        <div class="mrc-type">${item.label}</div>
        <div class="mrc-value" style="color:${item.accent}">${item.secret ? '🔒 ' + item.value : item.value}</div>
        ${item.sub ? `<div class="mrc-sub">${item.sub}</div>` : ''}
        ${item.secret ? '<div class="mrc-secret-note">Only you can see this</div>' : ''}
      `;
      grid.appendChild(card);
    });

    stage.innerHTML = '';
    stage.appendChild(grid);

    G.to('.mini-reveal-card', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.2, // This creates the "one-by-one" reveal effect
      ease: 'power2.out'
    });

    // Mark all dots done
    document.querySelectorAll('.rp-dot').forEach(d => d.classList.add('done'));

    // Continue button
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn-primary';
    continueBtn.textContent = 'CONTINUE →';
    continueBtn.style.marginTop = '24px';
    continueBtn.addEventListener('click', () => hideScene('scene-randomize', startCharCardScene));
    stage.appendChild(continueBtn);
  });
}

// ════════════════════════════════════════════════════════
//  SCENE 6 — CHARACTER CARD
// ════════════════════════════════════════════════════════
function startCharCardScene() {
  const groupLabels = { mob: 'GAYGOS', balance: 'XBOX', grind: "LUCAS'S GANG" };
  const groupColors = { mob: '#FC7B54', balance: '#F7B731', grind: '#6BCB77' };
  const persLabels  = {
    grinder: 'THE GRINDER', social: 'SOCIAL BUTTERFLY',
    athlete: 'THE ATHLETE', charmer: 'THE CHARMER',
    observer: 'THE OBSERVER', rebel: 'THE REBEL',
    empath: 'THE EMPATH', wildcard: 'THE WILDCARD',
  };

  document.getElementById('cc-name-display').textContent = player.name.toUpperCase();

  const gBadge = document.getElementById('cc-group-display');
  gBadge.textContent = groupLabels[player.friendGroup] || '—';
  gBadge.style.borderColor = (groupColors[player.friendGroup] || '#F7B731') + '88';
  gBadge.style.color = groupColors[player.friendGroup] || '#F7B731';
  gBadge.style.background = (groupColors[player.friendGroup] || '#F7B731') + '18';

  document.getElementById('cc-pers-display').textContent = persLabels[player.personality] || '—';

  document.getElementById('cc-attributes').innerHTML = `
    <div class="cc-attr">
      <div class="cc-attr-label">HEIGHT</div>
      <div class="cc-attr-val">${player.height}</div>
    </div>
  `;

  document.getElementById('cc-cards-mini').innerHTML = [
    { label: 'RUMOR',      val: player.rumor,                                         color: '#FC7B54', hidden: false },
    { label: 'BACKGROUND', val: player.background.label + ' — ' + player.background.desc, color: '#6BCB77', hidden: false },
    { label: 'SECRET',     val: player.secret.label,                                  color: '#E8849A', hidden: true  },
  ].map(sp => `
    <div class="mini-special-card" style="--msc-color:${sp.color}">
      <div class="msc-type">${sp.label}</div>
      ${sp.hidden
        ? `<div class="msc-value msc-hidden">${sp.val}</div><div class="msc-hidden-label">🔒 ONLY YOU KNOW</div>`
        : `<div class="msc-value">${sp.val}</div>`}
    </div>
  `).join('');

  document.getElementById('cc-stats-bars').innerHTML = Object.entries(player.stats).map(([key, val]) => {
    const isGpa = key === 'gpa';
    const pct   = isGpa ? val / 4 * 100 : val / 10 * 100;
    const disp  = isGpa ? val.toFixed(2) : val.toFixed(1);
    return `
      <div class="stat-row">
        <div class="stat-row-top">
          <span class="stat-name">${STAT_LABELS[key]}</span>
          <span class="stat-val">${disp}</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="background:${statColor(key,val)};width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  showScene('scene-charcard', () => {
    G.to('#cc-wrap', { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.3)' });
    G.to('.stat-row', { opacity: 1, x: 0, stagger: 0.04, duration: 0.35, delay: 0.25, ease: 'power2.out' });
    document.getElementById('begin-btn').addEventListener('click', startTransition);
  });
}

// ════════════════════════════════════════════════════════
//  SCENE 7 — TRANSITION
// ════════════════════════════════════════════════════════
function startTransition() {
  hideScene('scene-charcard', () => {
    showScene('scene-transition', () => {
      const textEl = document.getElementById('trans-text');
      textEl.textContent = 'FRESHMAN YEAR BEGINS.';
      textEl.style.opacity = '1';
      setTimeout(launchGame, 1200);
    });
  });
}

// ════════════════════════════════════════════════════════
//  GAME WORLD — launch, render, UI
// ════════════════════════════════════════════════════════

function launchGame() {
  Engine.init(player);

  // Freshman restrictions — orientation handled by zone-entry in world3d.js
  window.MYTH_ORIENTATION_ACTIVE    = false;
  window.MYTH_FRESHMAN_RESTRICTION  = true;
  window.MYTH_CLUB_FAIR_TRIGGERED   = false;
  window.MYTH_CLUB_CHOICE           = null;
  window.MYTH_CLUB_MISS_DELTAS      = {};
  window.MYTH_BIO_TRIGGERED         = false;
  window.MYTH_BIO_DONE              = false;
  window.MYTH_PE_TRIGGERED          = false;
  window.MYTH_PE_DONE               = false;
  window.MYTH_POWER_OUTAGE          = false;
  window.MYTH_POWER_RESTORE         = false;
  window.MYTH_BOMB_THREAT_ACTIVE    = false;
  window.MYTH_BOMB_CLEAR            = false;

  // Snapshot starting stats for year-end recap
  window.MYTH_START_STATS = Object.assign({}, player.stats);
  // Amplify all stat changes 1.5× for more impactful choices
  window.MYTH_STAT_MULT = 1.5;

  const transEl = document.getElementById('scene-transition');
  transEl.classList.remove('active');
  transEl.style.opacity = '0';

  showScene('scene-game', () => {
    Engine.on('stat_change',    ({ key, delta }) => { refreshStatsSidebar(); _queueStatToast(key, delta); });
    Engine.on('period_change',  ()               => { updateHUD(); safeEventCheck(); });
    Engine.on('grade_up',       ({ to })         => showGradeUnlock(to));
    Engine.on('npc_talk',       ({ npc, node })  => openDialogue(npc, node));
    Engine.on('dialogue_close', ()               => closeDialogueBox());

    Engine.goTo('gym');
    updateHUD();
    wireGameButtons();

    // Show controls screen, then launch 3D world on dismiss
    const ctrlEl = document.getElementById('controls-overlay');
    ctrlEl.style.display = 'flex';
    function dismissControls() {
      ctrlEl.removeEventListener('click', dismissControls);
      document.removeEventListener('keydown', dismissControls);
      ctrlEl.style.opacity = '0';
      ctrlEl.style.transition = 'opacity 0.4s';
      setTimeout(() => {
        ctrlEl.style.display = 'none';
        ctrlEl.style.opacity = '';
        ctrlEl.style.transition = '';
        requestAnimationFrame(() => { initWorld3D(player); });
      }, 400);
    }
    ctrlEl.addEventListener('click', dismissControls);
    document.addEventListener('keydown', dismissControls);
  });
}

function safeEventCheck() {
  try { EventManager.checkTriggers(Engine.getState()); } catch (e) {}
}

// ════════════════════════════════════════════════════════
//  ORIENTATION OVERLAY
// ════════════════════════════════════════════════════════

const OR_SPEECH = [
  { speaker: 'COACH RIVERA',         text: 'Welcome to Westbrook. You\'re freshmen. That means something here.' },
  { speaker: 'COACH RIVERA',         text: 'This school has four hundred students. You\'ll see the same faces every single day for the next four years. What they think of you is entirely up to you.' },
  { speaker: 'COACH RIVERA',         text: 'A few rules. Stay out of the senior lot. Don\'t touch the trophies in the front case. And if you\'re going to make a name for yourself — earn it.' },
  { speaker: 'VICE PRINCIPAL HAYES', text: 'Your class schedules will be distributed at homeroom. Today is orientation. Look around. These are your people now.' },
  { speaker: 'COACH RIVERA',         text: 'Before we continue — find your seat. This isn\'t assigned. But remember: where you sit on day one tells people something.' },
];
let _orSpeechIdx = 0;

function showOrientationOverlay() {
  _orSpeechIdx = 0;
  const overlay = document.getElementById('orientation-overlay');
  overlay.classList.add('open');
  const inner = overlay.querySelector('.or-inner');
  G.from(inner, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
  _renderSpeechLine(inner);
}

function _renderSpeechLine(inner) {
  const line = OR_SPEECH[_orSpeechIdx];
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; FRESHMAN ORIENTATION</div>
    <div class="or-speech-speaker">${line.speaker}</div>
    <p class="or-speech-text">"${line.text}"</p>
    <div class="or-speech-nav">
      <span class="or-speech-progress">${_orSpeechIdx + 1} / ${OR_SPEECH.length}</span>
      <button class="btn-primary" id="or-next-btn">
        ${_orSpeechIdx < OR_SPEECH.length - 1 ? 'NEXT →' : 'FIND YOUR SEAT →'}
      </button>
    </div>
    <div class="or-key-hint" style="margin-top:6px;font-size:0.72rem;opacity:0.5">[ ENTER ] to continue</div>
  `;
  G.from(inner.querySelector('.or-speech-text'), { opacity: 0, y: 8, duration: 0.35, ease: 'power2.out' });

  let _fired = false;
  function _advance() {
    if (_fired) return; _fired = true;
    document.removeEventListener('keydown', _orEnterKH);
    _orSpeechIdx++;
    if (_orSpeechIdx >= OR_SPEECH.length) { _showSeatChoice(inner); }
    else { _renderSpeechLine(inner); }
  }
  function _orEnterKH(e) { if (e.key === 'Enter') _advance(); }
  document.addEventListener('keydown', _orEnterKH);
  document.getElementById('or-next-btn').addEventListener('click', _advance, { once: true });
}

function _showSeatChoice(inner) {
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; FRESHMAN ORIENTATION</div>
    <h1 class="or-title">WHERE DO YOU SIT?</h1>
    <div class="or-scene">
      <p>The gym smells like floor wax and new shoes. The bleachers are filling up fast. You've got maybe ninety seconds before Coach Rivera starts talking again.</p>
      <p class="or-prompt">Where do you go? <span class="or-key-hint">[ press 1 – 4 ]</span></p>
    </div>
    <div class="or-choices" id="or-choices-live">
      <button class="or-choice-btn" data-choice="alone_back">
        <span class="ocb-num">1</span>
        <span class="ocb-label">ALONE IN THE BACK</span>
        <span class="ocb-hint">Top row. Nobody bothers you. You can see everything from up here.</span>
      </button>
      <button class="or-choice-btn" data-choice="familiar_face">
        <span class="ocb-num">2</span>
        <span class="ocb-label">NEXT TO SOMEONE FAMILIAR</span>
        <span class="ocb-hint">You recognize them from middle school. Small relief. Just barely.</span>
      </button>
      <button class="or-choice-btn" data-choice="front_row">
        <span class="ocb-num">3</span>
        <span class="ocb-label">FRONT ROW</span>
        <span class="ocb-hint">Make an impression. Let Coach Rivera see your face first.</span>
      </button>
      <button class="or-choice-btn" data-choice="popular_kids">
        <span class="ocb-num">4</span>
        <span class="ocb-label">NEXT TO THE POPULAR KIDS</span>
        <span class="ocb-hint">You spot them immediately. Everyone does. A few glance over.</span>
      </button>
    </div>
  `;
  G.from('.or-choice-btn', { opacity: 0, y: 10, stagger: 0.07, duration: 0.35, ease: 'power2.out' });

  document.querySelectorAll('.or-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => resolveOrientationChoice(btn.dataset.choice), { once: true });
  });

  // Keyboard 1-4
  const keyHandler = (e) => {
    const map = { '1': 'alone_back', '2': 'familiar_face', '3': 'front_row', '4': 'popular_kids',
                  'Digit1': 'alone_back', 'Digit2': 'familiar_face', 'Digit3': 'front_row', 'Digit4': 'popular_kids',
                  'Numpad1': 'alone_back', 'Numpad2': 'familiar_face', 'Numpad3': 'front_row', 'Numpad4': 'popular_kids' };
    const choice = map[e.key] || map[e.code];
    if (choice) {
      document.removeEventListener('keydown', keyHandler);
      resolveOrientationChoice(choice);
    }
  };
  document.addEventListener('keydown', keyHandler);
}

function resolveOrientationChoice(choice) {
  const OUTCOMES = {
    alone_back: {
      deltas: { intelligence: +1, happiness: -1, friendships: -1 },
      text: 'Top row. You climb past empty seats until there\'s nobody on either side. The gym fills up below you.',
      sub:  'Devon Clark sits two rows down. He nods once. Neither of you say anything. It\'s fine.',
    },
    familiar_face: {
      deltas: { friendships: +2, relationships: +1, happiness: +1 },
      text: 'You recognize them from middle school — Jordan Park. Their face changes when they see you. Relief. Same as yours.',
      sub:  '"Thank god," Jordan says. "Sit down before someone worse does." You do.',
    },
    front_row: {
      deltas: { gpa: +0.3, extracurriculars: +1, happiness: -1, friendships: -1 },
      text: 'The front row is mostly empty. You take the center seat. Coach Rivera makes eye contact immediately.',
      sub:  '"Good. A student who pays attention." Someone behind you laughs quietly. You pretend not to hear it.',
    },
    popular_kids: {
      deltas: { friendships: +2, relationships: +1, happiness: +1, intelligence: -1 },
      text: 'Tyler Brooks is already holding court in the third row. You walk straight toward the group like you\'ve been there before.',
      sub:  'One of them — tall, red hoodie — slides over without being asked. Tyler watches you sit down. "You\'re new," he says. It\'s not a question.',
    },
  };

  const outcome = OUTCOMES[choice];
  if (!outcome) return;

  Object.entries(outcome.deltas).forEach(([stat, delta]) => {
    Engine.modifyStat(stat, delta);
  });

  // Swap inner content to result screen — no stat line shown
  const inner = document.querySelector('.or-inner');
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; FRESHMAN ORIENTATION</div>
    <p class="or-result-text">${outcome.text}</p>
    <p class="or-result-sub">${outcome.sub}</p>
    <button class="btn-primary" id="or-continue-btn" style="margin-top:28px;align-self:flex-start">BEGIN FRESHMAN YEAR →</button>
    <div class="or-key-hint" style="margin-top:6px;font-size:0.72rem;opacity:0.5">[ ENTER ] to continue</div>
  `;

  G.from(inner, { opacity: 0, duration: 0.35 });

  let _fired = false;
  function _doClose() {
    if (_fired) return; _fired = true;
    document.removeEventListener('keydown', _resultEnterKH);
    closeOrientationOverlay();
  }
  function _resultEnterKH(e) { if (e.key === 'Enter') _doClose(); }
  document.addEventListener('keydown', _resultEnterKH);
  document.getElementById('or-continue-btn').addEventListener('click', _doClose, { once: true });
}

function closeOrientationOverlay() {
  const overlay = document.getElementById('orientation-overlay');
  G.to(overlay, {
    opacity: 0, duration: 0.4, ease: 'power2.in',
    onComplete: () => {
      overlay.classList.remove('open');
      overlay.style.opacity = '';
      window.MYTH_ORIENTATION_ACTIVE = false;
      // Restriction stays on — only the immediate campus is accessible until after PE
      Engine.setFlag('orientation_complete');
      refreshStatsSidebar();
      if (window.MYTH_WORLD3D_CANVAS) window.MYTH_WORLD3D_CANVAS.requestPointerLock();
      setTimeout(safeEventCheck, 400);
      setTimeout(() => {
        if (window.MYTH_SHOW_NOTIF) window.MYTH_SHOW_NOTIF('Overheard: "There\'s a club fair somewhere near the gym..."');
      }, 3500);
    },
  });
}

// ── Campus map renderer (legacy — replaced by Phaser) ─
function renderMap() {
  const mapEl = document.getElementById('campus-map');
  if (!mapEl) return;
  const accessible = Engine.getAccessibleZones();
  const accessibleIds = new Set(accessible.map(z => z.id));
  const state = Engine.getState();

  // Title strip
  mapEl.innerHTML = `
    <div class="map-title-strip" style="grid-column:1/-1">
      WESTBROOK HIGH SCHOOL
      <span class="map-compass">CUPERTINO, CA ☀️</span>
    </div>
  `;

  // Render each zone with a grid position
  ZONES.filter(z => z.mapGrid).forEach(zone => {
    const isLocked  = !accessibleIds.has(zone.id);
    const isActive  = state.currentZone?.id === zone.id;
    const npcsHere  = Engine.getNPCsInZone(zone.id);

    const tile = document.createElement('div');
    tile.className = `zone-tile${isLocked ? ' locked' : ''}${isActive ? ' active' : ''}`;
    tile.dataset.zoneId = zone.id;
    tile.dataset.type   = zone.type;
    tile.style.gridColumn = zone.mapGrid.col;
    tile.style.gridRow    = zone.mapGrid.row;

    const npcDots = npcsHere.slice(0, 4).map(() =>
      `<div class="zt-npc-dot"></div>`).join('');

    tile.innerHTML = `
      <div class="zt-top">
        <span class="zt-icon">${isLocked ? '🔒' : zone.icon}</span>
        ${isLocked ? `<span class="zt-lock">GR.${zone.unlocksAt}</span>` : ''}
      </div>
      <div class="zt-name">${zone.shortName || zone.name}</div>
      ${!isLocked && npcsHere.length ? `<div class="zt-npc-dots">${npcDots}</div>` : ''}
    `;

    if (!isLocked) {
      tile.addEventListener('click', () => {
        Engine.goTo(zone.id);
        renderMap();  // re-render to update active tile
      });
    }

    mapEl.appendChild(tile);
  });
}

// ── Zone detail panel (legacy stub — Phaser handles zone display) ─
function updateZonePanel(zone) {
  if (!zone) return;
  const hudZone = document.getElementById('hud-zone');
  if (hudZone) hudZone.textContent = zone.name;
  if (!document.getElementById('zp-name')) return;

  // People
  const peopleList = document.getElementById('zp-people-list');
  const npcs = Engine.getNPCsInZone(zone.id);
  if (npcs.length) {
    peopleList.innerHTML = npcs.map(npc => `
      <div class="zp-npc-row" data-npc-id="${npc.id}">
        <div class="zp-npc-portrait">${npc.portrait}</div>
        <div class="zp-npc-info">
          <div class="zp-npc-name">${npc.name}</div>
          <div class="zp-npc-role">${npc.role.toUpperCase()}</div>
        </div>
      </div>
    `).join('');
    peopleList.querySelectorAll('.zp-npc-row').forEach(row => {
      row.addEventListener('click', () => Engine.talkTo(row.dataset.npcId));
    });
  } else {
    peopleList.innerHTML = '<div class="zp-empty">Nobody here right now.</div>';
  }

  // Objects / interactions
  const thingsList = document.getElementById('zp-things-list');
  const objects = Engine.getObjectsInZone(zone.id);
  if (objects.length) {
    thingsList.innerHTML = objects.map(obj => `
      <div class="zp-obj-row" data-obj-id="${obj.id}">
        <span class="zp-obj-icon">${obj.icon || '●'}</span>
        <span class="zp-obj-label">${obj.label}</span>
      </div>
    `).join('');
    thingsList.querySelectorAll('.zp-obj-row').forEach(row => {
      row.addEventListener('click', () => Engine.triggerInteraction(row.dataset.objId));
    });
  } else {
    thingsList.innerHTML = '<div class="zp-empty">Nothing to interact with yet.</div>';
  }

  // Animate panel update
  G.from(['.zp-npc-row', '.zp-obj-row'], {
    opacity: 0, x: 8, stagger: 0.05, duration: 0.3, ease: 'power2.out',
  });
}

// ── HUD update ────────────────────────────────────────
function updateHUD() {
  const s = Engine.getState();
  if (!s) return;
  document.getElementById('hud-grade').textContent  = `GRADE ${s.grade}`;
  document.getElementById('hud-period').textContent = s.period.label;
  document.getElementById('hud-day').textContent    = `· ${s.day} · Week ${s.week}`;
}

// ── Stats sidebar ─────────────────────────────────────
function refreshStatsSidebar() {
  const s = Engine.getState();
  if (!s) return;
  const list = document.getElementById('ss-stats-list');
  list.innerHTML = Object.entries(s.stats).map(([key, val]) => {
    const isGpa = key === 'gpa';
    const pct   = isGpa ? val / 4 * 100 : val / 10 * 100;
    const disp  = isGpa ? val.toFixed(2) : val.toFixed(1);
    return `
      <div class="ss-stat-row">
        <div class="ss-stat-top">
          <span class="ss-stat-name">${STAT_LABELS[key] || key.toUpperCase()}</span>
          <span class="ss-stat-val">${disp}</span>
        </div>
        <div class="ss-bar-track">
          <div class="ss-bar-fill" style="width:${pct}%;background:${statColor(key,val)}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Dialogue box ──────────────────────────────────────
function openDialogue(npc, node) {
  const box = document.getElementById('dialogue-box');
  document.getElementById('db-portrait').textContent     = npc.portrait;
  document.getElementById('db-speaker-name').textContent = npc.name;
  document.getElementById('db-speaker-role').textContent = npc.role.toUpperCase();

  if (node) {
    document.getElementById('db-text').textContent = node.line;
    const choicesEl = document.getElementById('db-choices');
    choicesEl.innerHTML = (node.choices || []).map((c, i) => `
      <button class="db-choice" data-idx="${i}">${c.label}</button>
    `).join('');
    choicesEl.querySelectorAll('.db-choice').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        Engine.resolveChoice(node.choices[i]);
        closeDialogueBox();
      });
    });
  } else {
    document.getElementById('db-text').textContent =
      `${npc.name} is here but doesn't have anything to say right now.`;
    document.getElementById('db-choices').innerHTML = '';
  }

  box.classList.add('open');
}

function closeDialogueBox() {
  document.getElementById('dialogue-box').classList.remove('open');
  Engine.closeDialogue();
}

// ── Grade unlock toast ────────────────────────────────
function showGradeUnlock(grade) {
  const toast = document.getElementById('grade-unlock-toast');
  document.getElementById('gut-title').textContent = `GRADE ${grade}`;
  G.timeline()
    .to(toast, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' })
    .to(toast, { opacity: 0, y: -10, duration: 0.4, delay: 2.5 });
}

// ── Button wiring ─────────────────────────────────────
function wireGameButtons() {
  document.getElementById('hud-stats-btn').addEventListener('click', () => {
    refreshStatsSidebar();
    document.getElementById('stats-sidebar').classList.toggle('open');
  });
  document.getElementById('stats-close').addEventListener('click', () => {
    document.getElementById('stats-sidebar').classList.remove('open');
  });
  document.getElementById('db-close').addEventListener('click', closeDialogueBox);
  document.getElementById('hud-next-period-btn').addEventListener('click', () => {
    Engine.advancePeriod();
    updateHUD();
    safeEventCheck();
  });
}

// ── Stat change notification toast ───────────────────
let _statToastTimer = null;
let _statToastPending = {};

function _flushStatToast() {
  if (!Object.keys(_statToastPending).length) return;
  const parts = Object.entries(_statToastPending).map(([key, delta]) => {
    const sign = delta > 0 ? '+' : '';
    const color = delta > 0 ? '#6bcb77' : '#fc7b54';
    return `<span style="color:${color}">${sign}${delta.toFixed(1)} ${STAT_LABELS[key] || key}</span>`;
  });
  const toast = document.getElementById('stat-toast');
  if (!toast) { _statToastPending = {}; return; }
  toast.innerHTML = parts.join('  ·  ');
  toast.classList.add('visible');
  clearTimeout(_statToastTimer);
  _statToastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    _statToastPending = {};
  }, 2800);
}

function _queueStatToast(key, delta) {
  if (!_statToastPending[key]) _statToastPending[key] = 0;
  _statToastPending[key] += delta;
}

// ════════════════════════════════════════════════════════
//  CLUB FAIR OVERLAY
// ════════════════════════════════════════════════════════

const CLUB_DATA = {
  robotics: {
    name:       'ROBOTICS CLUB',
    icon:       '🤖',
    desc:       'Build robots, write code that moves metal, compete nationally.',
    flavor:     'Meetings every Tuesday and Thursday in Room F3.',
    joinDeltas: { gpa: -0.2, friendships: 1.5, relationships: -1.3, extracurriculars: 2.0 },
    missDeltas: { gpa: -0.1, friendships: -0.5, extracurriculars: -0.5 },
  },
  football: {
    name:       'FOOTBALL TEAM',
    icon:       '🏈',
    desc:       'Practice every day after school. Friday night lights. The whole school watches.',
    flavor:     'Tryouts this week. Practice on the field.',
    joinDeltas: { gpa: -0.5, friendships: 1.8, sports: 2.0, intelligence: -1.6, extracurriculars: 1.2 },
    missDeltas: { sports: -0.8, friendships: -0.6, happiness: -0.4 },
  },
  none: {
    name:       'NO COMMITMENT',
    icon:       '📚',
    desc:       'Focus on your studies. Keep your schedule open. Your time is yours.',
    flavor:     'No meetings. No obligations.',
    joinDeltas: { gpa: 0.5, friendships: -1.0, intelligence: 1.4, extracurriculars: -0.8 },
    missDeltas: {},
  },
};

function showClubFairOverlay(boothType) {
  const data = CLUB_DATA[boothType];
  if (!data) return;
  const overlay = document.getElementById('club-fair-overlay');
  if (!overlay) return;
  const inner = overlay.querySelector('.cf-inner');
  const _rumorLine = player.rumor
    ? `<div class="cf-rumor-tag">💬 <em>"${player.rumor}"</em></div>`
    : '';
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; CLUB FAIR</div>
    ${_rumorLine}
    <div class="cf-icon">${data.icon}</div>
    <div class="cf-title">${data.name}</div>
    <p class="cf-desc">${data.desc}</p>
    <p class="cf-flavor">${data.flavor}</p>
    ${boothType !== 'none' ? '<p class="cf-warning">This is a commitment. Missing meetings has consequences.</p>' : ''}
    <div class="cf-buttons">
      <button class="btn-primary" id="cf-join-btn">JOIN →</button>
      <button class="cf-pass-btn" id="cf-pass-btn">PASS</button>
    </div>
    <div class="or-key-hint" style="margin-top:6px;font-size:0.72rem;opacity:0.5">[ ENTER ] to join</div>
  `;
  overlay.classList.add('open');
  G.from(inner, { opacity: 0, y: 20, duration: 0.45, ease: 'power2.out' });

  let _fired = false;
  function _doJoin() {
    if (_fired) return; _fired = true;
    document.removeEventListener('keydown', _cfEnterKH);
    resolveClubChoice(boothType, true);
  }
  function _doPass() {
    if (_fired) return; _fired = true;
    document.removeEventListener('keydown', _cfEnterKH);
    resolveClubChoice(boothType, false);
  }
  function _cfEnterKH(e) { if (e.key === 'Enter') _doJoin(); }
  document.addEventListener('keydown', _cfEnterKH);
  document.getElementById('cf-join-btn').addEventListener('click', _doJoin, { once: true });
  document.getElementById('cf-pass-btn').addEventListener('click', _doPass, { once: true });
}

function resolveClubChoice(boothType, joined) {
  const overlay = document.getElementById('club-fair-overlay');
  const data    = CLUB_DATA[boothType];
  if (!data || !overlay) return;

  if (joined) {
    window.MYTH_CLUB_CHOICE      = boothType;
    window.MYTH_CLUB_MISS_DELTAS = data.missDeltas;
    Object.entries(data.joinDeltas).forEach(([k, v]) => Engine.modifyStat(k, v));
  } else {
    // Reset trigger so the player can walk up to a different booth
    window.MYTH_CLUB_FAIR_TRIGGERED = false;
  }

  const inner = overlay.querySelector('.cf-inner');
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; CLUB FAIR</div>
    <div class="cf-icon">${joined ? '✓' : '—'}</div>
    <div class="cf-title">${joined ? 'COMMITTED.' : 'YOUR CALL.'}</div>
    <p class="cf-desc">${joined
      ? 'You\'re in. Show up when it counts.'
      : 'You walk past the booth. The recruiter doesn\'t say anything.'}</p>
    <button class="btn-primary" id="cf-done-btn" style="margin-top:28px">CONTINUE →</button>
    <div class="or-key-hint" style="margin-top:6px;font-size:0.72rem;opacity:0.5">[ ENTER ] to continue</div>
  `;

  let _fired = false;
  function _doDone() {
    if (_fired) return; _fired = true;
    document.removeEventListener('keydown', _cfDoneKH);
    G.to(overlay, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('open');
        overlay.style.opacity = '';
        window.MYTH_ORIENTATION_ACTIVE = false;
        refreshStatsSidebar();
        if (window.MYTH_WORLD3D_CANVAS) window.MYTH_WORLD3D_CANVAS.requestPointerLock();
        setTimeout(() => {
          if (window.MYTH_SHOW_NOTIF) window.MYTH_SHOW_NOTIF('Head to Biology Room 102 — next to the Club Fair.');
          if (joined && window.MYTH_CLUB_CHOICE && window.MYTH_CLUB_CHOICE !== 'none') {
            showECNavBanner(window.MYTH_CLUB_CHOICE);
          }
        }, 700);
      },
    });
  }
  function _cfDoneKH(e) { if (e.key === 'Enter') _doDone(); }
  document.addEventListener('keydown', _cfDoneKH);
  document.getElementById('cf-done-btn').addEventListener('click', _doDone, { once: true });
}

function showECNavBanner(ecChoice) {
  const existing = document.getElementById('ec-nav-banner');
  if (existing) existing.remove();

  const isRobotics = ecChoice === 'robotics';
  const name = isRobotics ? 'Robotics Club' : 'Football Team';
  const location = isRobotics ? 'the Gym (west side of campus)' : 'the Football Field (north of campus)';
  const icon = isRobotics ? '⚙' : '▶';

  const banner = document.createElement('div');
  banner.id = 'ec-nav-banner';
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:1.5rem;opacity:0.9">${icon}</span>
      <div>
        <div style="font-size:0.72rem;letter-spacing:0.1em;opacity:0.7;text-transform:uppercase">YOUR EC</div>
        <div style="font-size:0.92rem;font-weight:700;color:#f0dc88">${name}</div>
        <div style="font-size:0.75rem;opacity:0.75;margin-top:2px">Head to ${location}</div>
      </div>
    </div>
  `;
  banner.style.cssText = `
    position:fixed; bottom:80px; right:20px;
    background:rgba(8,15,40,0.93);
    border:1.5px solid rgba(232,208,112,0.5);
    border-radius:10px; padding:12px 16px;
    color:#e0d4b0; font-family:inherit; z-index:9000;
    box-shadow:0 4px 20px rgba(0,0,0,0.6);
    pointer-events:none;
    animation: ecBannerFadeIn 0.5s ease;
  `;
  document.body.appendChild(banner);
  window.MYTH_EC_NAV_BANNER = banner;
}

function showClubMissedOverlay() {
  const overlay   = document.getElementById('club-fair-overlay');
  if (!overlay) return;
  const clubName  = window.MYTH_CLUB_CHOICE === 'robotics' ? 'Robotics Club' : 'Football Practice';
  const missDeltas = window.MYTH_CLUB_MISS_DELTAS || {};
  // Apply penalties silently
  Object.entries(missDeltas).forEach(([k, v]) => Engine.modifyStat(k, v));

  const inner = overlay.querySelector('.cf-inner');
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; COMMITMENT</div>
    <div class="cf-title">YOU MISSED ${clubName.toUpperCase()}.</div>
    <p class="cf-desc">You didn't show up. People noticed.</p>
    <button class="btn-primary" id="cf-done-btn" style="margin-top:28px">OK</button>
    <div class="or-key-hint" style="margin-top:6px;font-size:0.72rem;opacity:0.5">[ ENTER ] to continue</div>
  `;
  overlay.classList.add('open');
  G.from(inner, { opacity: 0, duration: 0.35 });

  let _fired = false;
  function _doDone() {
    if (_fired) return; _fired = true;
    document.removeEventListener('keydown', _missKH);
    G.to(overlay, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('open');
        overlay.style.opacity = '';
        window.MYTH_ORIENTATION_ACTIVE = false;
        if (window.MYTH_WORLD3D_CANVAS) window.MYTH_WORLD3D_CANVAS.requestPointerLock();
      },
    });
  }
  function _missKH(e) { if (e.key === 'Enter') _doDone(); }
  document.addEventListener('keydown', _missKH);
  document.getElementById('cf-done-btn').addEventListener('click', _doDone, { once: true });
}

// ═══════════════════════════════════════════════════════
//  BIO CLASS + PE EVENTS
// ═══════════════════════════════════════════════════════

const PIG_STATIONS = [
  {
    id: 'A', system: 'Cardiovascular System',
    setup: 'The pig is pinned supine. The chest cavity is open, exposing a dark reddish-purple, fist-sized organ nestled between two deflated, pale lungs.',
    region: 'HEART', emoji: '❤',
    question: 'What is the primary function of the heart?',
    choices: ['Filter toxins from the bloodstream', 'Pump blood through the circulatory system', 'Regulate body temperature'],
    correct: 1,
    right: 'Correct. The heart is a muscular pump that drives blood through both the pulmonary and systemic circuits.',
    wrong: 'Not quite. Filtration is the kidney\'s job — the heart is purely a pump.',
  },
  {
    id: 'B', system: 'Digestive System',
    setup: 'The abdominal cavity is pinned open. A large, multi-lobed brownish-red organ dominates the upper right quadrant of the body cavity.',
    region: 'LIVER', emoji: '🟤',
    question: 'What are the two main functions of the liver?',
    choices: ['Pumping blood and filtering oxygen', 'Producing bile and detoxifying blood', 'Gas exchange and nutrient absorption'],
    correct: 1,
    right: 'Correct. The liver produces bile for fat digestion and acts as the body\'s primary blood filter.',
    wrong: 'That\'s not it. The large brownish organ is the liver — it produces bile and detoxifies blood.',
  },
  {
    id: 'C', system: 'Respiratory System',
    setup: 'The thoracic cavity is pinned wide. Two pale, spongy organs flank the heart. Below them, a dome-shaped sheet of muscle separates the chest from the abdomen.',
    region: 'DIAPHRAGM', emoji: '🫧',
    question: 'What does the diaphragm do when you inhale?',
    choices: ['It relaxes and rises, compressing the lungs', 'It contracts and flattens, expanding chest volume to draw air in', 'It filters incoming air for pathogens'],
    correct: 1,
    right: 'Correct. Diaphragm contraction pulls the muscle downward, increasing chest volume and creating negative pressure.',
    wrong: 'Close — it\'s a muscle, and muscles contract. The diaphragm flattens downward to pull air into the lungs.',
  },
  {
    id: 'D', system: 'Urinary System',
    setup: 'Pinned against the dorsal body wall are two bean-shaped organs. A whitish tube runs from each toward the midline, merging at a small balloon-like organ below.',
    region: 'KIDNEYS', emoji: '🫘',
    question: 'How do the kidneys maintain homeostasis?',
    choices: ['By secreting hormones that control heart rate', 'By filtering blood and regulating fluid/electrolyte balance', 'By absorbing nutrients from the digestive tract'],
    correct: 1,
    right: 'Correct. The kidneys filter roughly 180 L of blood daily, regulating water, electrolytes, and pH.',
    wrong: 'Not quite. Kidneys filter blood and regulate fluid balance — homeostasis through excretion, not hormones.',
  },
  {
    id: 'E', system: 'Nervous System',
    setup: 'The dorsal cranium is carefully opened. A small, wrinkled organ sits in the braincase. It connects via the spinal cord running down the dorsal side of the spine.',
    region: 'BRAINSTEM', emoji: '🧠',
    question: 'Which region controls involuntary functions like breathing and heart rate?',
    choices: ['The cerebrum — conscious thought and movement', 'The cerebellum — balance and coordination', 'The brainstem / medulla oblongata — autonomic functions'],
    correct: 2,
    right: 'Correct. The medulla oblongata automates breathing, heart rate, and blood pressure without conscious input.',
    wrong: 'Those handle voluntary actions. The brainstem / medulla oblongata controls the involuntary systems.',
  },
];

function _bioClose(gpaDelta, gradeLabel, colorHex) {
  const overlay = document.getElementById('bio-overlay');
  if (!overlay) return;
  const inner = overlay.querySelector('.bio-inner');
  inner.innerHTML = `
    <div class="bio-result-screen" style="--grade-col:${colorHex}">
      <div class="or-badge">PERIOD 1 · BIOLOGY — RESULT</div>
      <div class="bio-result-grade">${gradeLabel}</div>
      <div class="bio-result-sub">${gpaDelta > 0 ? 'GPA improving.' : gpaDelta < 0 ? 'GPA took a hit.' : 'GPA unchanged.'}</div>
      <button class="btn-primary" id="bio-done-btn" style="margin-top:32px">CONTINUE →</button>
      <div class="or-key-hint" style="margin-top:8px;font-size:.7rem;opacity:.45">[ ENTER ] to continue</div>
    </div>
  `;
  if (gpaDelta !== 0 && typeof Engine !== 'undefined') Engine.modifyStat('gpa', gpaDelta);
  G.from(inner.querySelector('.bio-result-screen'), { opacity: 0, y: 20, duration: 0.5 });

  let _f = false;
  function _done() {
    if (_f) return; _f = true;
    document.removeEventListener('keydown', _kh);
    window.MYTH_POWER_OUTAGE  = false;
    window.MYTH_POWER_RESTORE = true;
    G.to(overlay, {
      opacity: 0, duration: 0.5, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('open');
        overlay.style.opacity = '';
        window.MYTH_BIO_DONE           = true;
        window.MYTH_ORIENTATION_ACTIVE = false;
        refreshStatsSidebar();
        if (window.MYTH_SHOW_NOTIF) window.MYTH_SHOW_NOTIF('Head to the gym — PE starts now.');
        if (window.MYTH_WORLD3D_CANVAS) window.MYTH_WORLD3D_CANVAS.requestPointerLock();
      },
    });
  }
  function _kh(e) { if (e.key === 'Enter') _done(); }
  document.addEventListener('keydown', _kh);
  document.getElementById('bio-done-btn').addEventListener('click', _done, { once: true });
}

// ── Scenario A: Power Outage ──────────────────────────────────────────────
function showBioOutage() {
  window.MYTH_POWER_OUTAGE = true;
  const overlay = document.getElementById('bio-overlay');
  const inner   = overlay.querySelector('.bio-inner');

  const beats = [
    { delay: 0,    html: `<span class="outage-flash"></span><p>Mrs. Alvarez begins distributing the assessment rubrics. You pull back the paper towel on your tray. The smell hits harder now.</p>` },
    { delay: 2400, html: `<p>Then — the lights. Every overhead fluorescent dies at once. The projector goes black. The ventilation fans wind down with a groan.</p>` },
    { delay: 4600, html: `<span class="outage-emergency">⚠ EMERGENCY LIGHTING ACTIVATED</span><p>Red emergency strips flicker on along the baseboards. Outside the window, the sky has gone dark. Wind drives rain in sheets against the glass.</p>` },
    { delay: 7200, html: `<p><span class="speaker">MRS. ALVAREZ:</span> <em>"Stay in your seats. Don't touch the specimens. Maintenance is — "</em> Her radio crackles. She listens. Her expression changes.</p>` },
    { delay: 9800, html: `<p><span class="speaker">MRS. ALVAREZ:</span> <em>"All right. District policy. Weather-related power event. The practical is cancelled. Everyone receives credit for today."</em></p>` },
    { delay: 12000, html: `<p class="outage-kicker">Automatic A. You didn't have to know a single organ. The storm just handed it to you.</p>` },
  ];

  function renderBeat(idx) {
    const b = beats[idx];
    const row = document.createElement('div');
    row.className = 'outage-beat';
    row.innerHTML = b.html;
    inner.querySelector('.outage-story').appendChild(row);
    G.from(row, { opacity: 0, y: 12, duration: 0.6 });
    if (idx + 1 < beats.length) setTimeout(() => renderBeat(idx + 1), beats[idx + 1].delay - b.delay);
    else setTimeout(() => _bioClose(0.40, 'A', '#6BCB77'), 1800);
  }

  inner.innerHTML = `
    <div class="outage-scene">
      <div class="outage-sky">
        <div class="lightning l1"></div>
        <div class="lightning l2"></div>
        <div class="wind-particles">${Array.from({length:18},()=>'<span></span>').join('')}</div>
        <div class="rain-layer"></div>
      </div>
      <div class="outage-room-label">BIOLOGY · ROOM 102</div>
      <div class="outage-story"></div>
      <div class="outage-meter">
        <div class="outage-flicker"></div>
      </div>
    </div>
  `;
  G.from(inner, { opacity: 0, duration: 0.5 });
  setTimeout(() => renderBeat(0), 500);
}

// ── Scenario B: Pig Practical ─────────────────────────────────────────────
function showBioPractical() {
  const overlay = document.getElementById('bio-overlay');
  const inner   = overlay.querySelector('.bio-inner');
  let score = 0, stationIdx = 0, _answered = false;

  function renderStation() {
    const s = PIG_STATIONS[stationIdx];
    _answered = false;
    inner.innerHTML = `
      <div class="practical-scene">
        <div class="practical-header">
          <span class="practical-badge">PERIOD 1 · BIOLOGY — PIG PRACTICAL</span>
          <span class="practical-progress">Station ${stationIdx + 1} / ${PIG_STATIONS.length}</span>
        </div>
        <div class="practical-tray">
          <div class="tray-label">${s.emoji} STATION ${s.id} — ${s.system.toUpperCase()}</div>
          <div class="tray-description">${s.setup}</div>
          <div class="tray-highlight">▶ Focus region: <strong>${s.region}</strong></div>
        </div>
        <div class="practical-question">${s.question}</div>
        <div class="practical-choices">
          ${s.choices.map((c,i)=>`<button class="prac-btn" data-idx="${i}">${String.fromCharCode(65+i)}. ${c}</button>`).join('')}
        </div>
        <div class="practical-feedback" id="prac-fb"></div>
      </div>
    `;
    G.from(inner.querySelector('.practical-scene'), { opacity: 0, y: 16, duration: 0.4 });

    inner.querySelectorAll('.prac-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (_answered) return;
        _answered = true;
        const chosen = parseInt(this.dataset.idx);
        const correct = chosen === s.correct;
        if (correct) score++;
        inner.querySelectorAll('.prac-btn').forEach((b,i) => {
          b.disabled = true;
          if (i === s.correct) b.classList.add('prac-correct');
          else if (i === chosen && !correct) b.classList.add('prac-wrong');
        });
        const fb = document.getElementById('prac-fb');
        fb.textContent = correct ? `✓ ${s.right}` : `✗ ${s.wrong}`;
        fb.className = 'practical-feedback ' + (correct ? 'fb-right' : 'fb-wrong');
        G.from(fb, { opacity: 0, duration: 0.3 });
        setTimeout(() => {
          stationIdx++;
          if (stationIdx < PIG_STATIONS.length) renderStation();
          else showPracticalResult();
        }, 2200);
      });
    });
  }

  function showPracticalResult() {
    const pct = score / PIG_STATIONS.length;
    let grade, gpaDelta, col;
    if (pct >= 1.0)        { grade='A+'; gpaDelta= 0.50; col='#F7B731'; }
    else if (pct >= 0.8)   { grade='A';  gpaDelta= 0.35; col='#6BCB77'; }
    else if (pct >= 0.6)   { grade='B+'; gpaDelta= 0.15; col='#6BCB77'; }
    else if (pct >= 0.4)   { grade='B';  gpaDelta= 0;    col='#aaa';    }
    else if (pct >= 0.2)   { grade='C';  gpaDelta=-0.15; col='#FC7B54'; }
    else                   { grade='F';  gpaDelta=-0.40; col='#e05050'; }

    inner.innerHTML = `
      <div class="practical-results">
        <div class="or-badge">BIOLOGY · PIG PRACTICAL — SCORED</div>
        <div class="prac-score-line">
          <span class="prac-score-num" style="color:${col}">${score} / ${PIG_STATIONS.length}</span>
          <span class="prac-score-grade" style="color:${col}">${grade}</span>
        </div>
        <div class="prac-score-breakdown">
          ${PIG_STATIONS.map((s,i)=>`<div class="prac-station-row">Station ${s.id} — ${s.system}</div>`).join('')}
        </div>
        <button class="btn-primary" id="prac-done-btn" style="margin-top:28px">CONTINUE →</button>
        <div class="or-key-hint" style="margin-top:6px;font-size:.7rem;opacity:.45">[ ENTER ] to continue</div>
      </div>
    `;
    G.from(inner.querySelector('.practical-results'), { opacity: 0, y: 20, duration: 0.5 });
    let _f = false;
    function _done() {
      if (_f) return; _f = true;
      document.removeEventListener('keydown', _pkh);
      _bioClose(gpaDelta, grade, col);
    }
    function _pkh(e) { if (e.key === 'Enter') _done(); }
    document.addEventListener('keydown', _pkh);
    document.getElementById('prac-done-btn').addEventListener('click', _done, { once: true });
  }

  // Intro card before first station
  inner.innerHTML = `
    <div class="practical-intro">
      <div class="or-badge">PERIOD 1 · BIOLOGY</div>
      <div class="practical-intro-title">PIG PRACTICAL</div>
      <p class="practical-intro-desc">Five dissection trays. Five pigs. You have one question per station.<br>Walk up, assess what you see, and answer.</p>
      <div class="practical-intro-smell">The formaldehyde smell is sharp. Your eyes water slightly.</div>
      <button class="btn-primary" id="prac-start-btn" style="margin-top:28px">BEGIN →</button>
      <div class="or-key-hint" style="margin-top:6px;font-size:.7rem;opacity:.45">[ ENTER ] to begin</div>
    </div>
  `;
  G.from(inner, { opacity: 0, duration: 0.5 });
  let _startFired = false;
  function _startDone() {
    if (_startFired) return; _startFired = true;
    document.removeEventListener('keydown', _startKH);
    renderStation();
  }
  function _startKH(e) { if (e.key === 'Enter') _startDone(); }
  document.addEventListener('keydown', _startKH);
  document.getElementById('prac-start-btn').addEventListener('click', _startDone, { once: true });
}

// ── Scenario C: Chemical Incident ─────────────────────────────────────────
function showBioChemical() {
  const overlay = document.getElementById('bio-overlay');
  const inner   = overlay.querySelector('.bio-inner');

  const beats = [
    { delay: 0,    text: 'Lab Technician Torres wheels in a supply cart just as the practical begins. He sets two bottles on the counter without checking the labels.' },
    { delay: 2800, text: 'You see it before he does. The left bottle is pale yellow — the formaldehyde neutralizer. The right bottle is a concentrated bleach solution. He reaches for the right one.' },
    { delay: 5800, text: 'The moment bleach contacts the residual formaldehyde in the trays, a pale greenish vapor rises from the nearest tray. Then the next. It spreads fast.' },
    { delay: 8200, text: 'The smell is immediate and violent. Your eyes water. The front row staggers back.', special: 'smell' },
    { delay: 10200, text: 'Jaylen Rodriguez — front left, the guy who always answers first — stands up from his stool. Looks confused. Then his knees buckle. His stool skitters across the tile.', special: 'faint' },
    { delay: 13000, text: 'MRS. ALVAREZ: "OUT! EVERYONE OUT RIGHT NOW!" The fire alarm trips. Students flood into the hallway. You make it to the courtyard, eyes streaming.', special: 'alarm' },
    { delay: 15500, text: 'WVFD Engine 7 arrives in four minutes. Two paramedics evaluate Jaylen on a gurney in the parking lot. A hazmat unit follows six minutes behind.', special: 'ambulance' },
    { delay: 18500, text: 'Three students are treated for dizziness. Jaylen goes to the hospital for observation — he\'s fine, but the school is liable. Every student in Bio gets an automatic A, posted that night.' },
  ];

  inner.innerHTML = `
    <div class="chem-scene">
      <div class="chem-room">
        <div class="chem-desks">
          ${Array.from({length:6},(_,i)=>`<div class="chem-desk" style="--di:${i}"></div>`).join('')}
        </div>
        <div class="smoke-container">
          <div class="smoke-cloud s1"></div>
          <div class="smoke-cloud s2"></div>
          <div class="smoke-cloud s3"></div>
        </div>
        <div class="faint-figure" id="faint-figure"></div>
        <div class="ambulance-element" id="ambulance-el"></div>
      </div>
      <div class="chem-story" id="chem-story"></div>
    </div>
  `;
  G.from(inner, { opacity: 0, duration: 0.5 });

  let smokeActive = false, ambulanceActive = false;
  function renderBeat(idx) {
    const b = beats[idx];
    const div = document.createElement('div');
    div.className = 'chem-beat';
    div.textContent = b.text;
    document.getElementById('chem-story').appendChild(div);
    G.from(div, { opacity: 0, y: 8, duration: 0.5 });

    if (b.special === 'smell' && !smokeActive) {
      smokeActive = true;
      inner.querySelectorAll('.smoke-cloud').forEach(s => s.classList.add('active'));
    }
    if (b.special === 'faint') {
      const ff = document.getElementById('faint-figure');
      if (ff) { ff.classList.add('active'); setTimeout(() => ff.classList.add('fallen'), 1200); }
    }
    if (b.special === 'alarm') {
      inner.querySelector('.chem-room').classList.add('alarm-state');
    }
    if (b.special === 'ambulance') {
      const ae = document.getElementById('ambulance-el');
      if (ae) ae.classList.add('active');
    }

    if (idx + 1 < beats.length) setTimeout(() => renderBeat(idx + 1), beats[idx + 1].delay - b.delay);
    else setTimeout(() => _bioClose(0.30, 'A', '#6BCB77'), 2200);
  }
  setTimeout(() => renderBeat(0), 400);
}

// Show bio class intro then branch randomly
function showBioClassEvent() {
  window.MYTH_ORIENTATION_ACTIVE = true;
  const overlay = document.getElementById('bio-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  const inner = overlay.querySelector('.bio-inner');
  const _bgBioLines = {
    new_kid:       "You barely know the building layout. You follow the antiseptic smell.",
    legacy:        "The Westbrook crest above the door has been here longer than you have.",
    scholarship:   "You earned your place in this room. Now you have to keep earning it.",
    transfer:      "Different school, same frog smell. Some things don't change.",
    local_legend:  "You've heard about this class since sixth grade. Everyone says it's brutal.",
    military:      "You've started over enough times to know the first test sets the tone.",
    online_famous: "Nobody in here knows you from your posts. Good.",
    returnee:      "Room 102. You were in this hallway before. Feels different now.",
    prodigy:       "You're the youngest one in here. You're also the most prepared.",
    old_money:     "Your grandfather's name is on the science wing. No pressure.",
  };
  const _bgNote = (_bgBioLines[player.background && player.background.id] ||
    "You make your way to the biology building. The antiseptic smell hits before you even open the door.");
  inner.innerHTML = `
    <div class="bio-transition">
      <div class="or-badge">WESTBROOK HIGH SCHOOL</div>
      <div class="bio-trans-period">PERIOD 1</div>
      <div class="bio-trans-subject">BIOLOGY</div>
      <div class="bio-trans-room">South Wing · Room 102</div>
      <div class="bio-trans-line"></div>
      <p class="bio-trans-note">${_bgNote} Five dissection trays sit covered on the lab tables.</p>
    </div>
  `;
  G.from(inner, { opacity: 0, duration: 0.7 });

  const scenarios = ['outage', 'practical', 'chemical'];
  const chosen = scenarios[Math.floor(Math.random() * scenarios.length)];
  setTimeout(() => {
    if (chosen === 'outage')    showBioOutage();
    else if (chosen === 'practical') showBioPractical();
    else                        showBioChemical();
  }, 3000);
}

// ═══════════════════════════════════════════════════════
//  PE CLASS — BOMB THREAT
// ═══════════════════════════════════════════════════════

function showPEBombThreat() {
  window.MYTH_ORIENTATION_ACTIVE  = true;
  window.MYTH_BOMB_THREAT_ACTIVE  = true;
  const overlay = document.getElementById('pe-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  const inner = overlay.querySelector('.pe-inner');

  runBombThreat();

  function runBombThreat() {
    // Go full-screen for the bomb threat — maximum immersion
    overlay.classList.add('threat-fullscreen');

    inner.innerHTML = `
      <div class="threat-scene" id="threat-scene">
        <div class="threat-static" id="threat-static"></div>
        <div class="threat-alert-bar" id="threat-bar">
          <span class="threat-bar-text">🚨 EMERGENCY BROADCAST — WESTBROOK HIGH SCHOOL 🚨</span>
        </div>
        <div class="threat-broadcast-stamp" id="threat-stamp">LIVE</div>
        <div class="threat-pa" id="threat-pa"></div>
        <div class="threat-gym-dark">
          <div class="threat-corner-students" id="corner-students"></div>
          <div class="threat-player-you" id="player-you"></div>
          <div class="threat-lights" id="threat-lights"></div>
        </div>
        <div class="threat-story" id="threat-story"></div>
      </div>
    `;
    G.from(inner, { opacity: 0, duration: 0.3 });

    const pa    = document.getElementById('threat-pa');
    const story = document.getElementById('threat-story');

    const _secretThought = (function() {
      const _t = {
        anxiety:      "The silence is the worst part. Your brain won't stop running scenarios. You breathe through it, one count at a time. You've done this before.",
        learning:     "Your mind races in its own direction, like always. You catalog exits, patterns, details. A different kind of processing. It keeps you calm.",
        wealthy:      "You think about how none of this — the school, the floor, the bleachers — would feel real if you told anyone what your house looks like.",
        talent:       "For some reason, all you can think about is a sketch you never finished. You trace it mentally on the back of your hand.",
        family:       "You've sat in tense, silent rooms before. You know how to go somewhere else in your head. You go there now.",
        ex_athlete:   "You feel your weight distributed correctly — heels, knees, back flat. The training doesn't leave. It just becomes background noise.",
        crush:        "You scan the corner twice before you find them. They're okay. You look away before they notice you looking.",
        following:    "Nobody here knows you. Nobody here knows the other you either. Right now, that feels like the only good thing.",
        chronic:      "You check your body the way you always do, automatically — levels, breathing, tension. You're okay. You stay okay.",
        therapy:      "Your therapist would say: name five things you can see. Cold floor. Wrestling mat. Emergency sign. Dusty bleacher. Someone's untied shoe. You're okay.",
        ghosted:      "You think about the last group chat. They're probably not thinking about you right now. You're not sure if that's better or worse.",
        writer:       "Somewhere in the back of your head, you're already writing this. The cold floor. The held breath. The way time dilates when nothing moves.",
        bad_breakup:  "The thing about real fear is it makes everything else feel like noise. For a minute, the other stuff doesn't matter. You hate that it's almost a relief.",
        secret_keep:  "You think about what you know. About what it would mean if something actually happened here and certain people never got to answer for it.",
        language:     "You start counting in the other language. Quietly. In your head. It has always felt like a private room nobody else can enter.",
        dropout_risk: "You almost didn't come back this year. Sitting here now, you can't decide if that makes this feel more precious or more fragile.",
      };
      return _t[player.secret && player.secret.id] || "The seconds stretch. You stop counting and just breathe.";
    })();

    // Phase 1 sequence — plays up to the choice point
    const phase1 = [
      { delay: 0,    pa: '[— PA STATIC —]',   text: null, effect: 'crackle' },
      { delay: 900,  pa: '"ATTENTION ALL WESTBROOK HIGH STUDENTS AND STAFF."', text: null, effect: 'alarm' },
      { delay: 2800, pa: '"A CREDIBLE THREAT HAS BEEN RECEIVED AT THIS FACILITY."', text: null, effect: null },
      { delay: 4600, pa: '"THIS IS A LOCKDOWN. THIS IS NOT A DRILL."', text: null, effect: 'strobe' },
      { delay: 6200, pa: '"ALL STUDENTS AND STAFF REPORT TO SECURE LOCATIONS IMMEDIATELY. DO NOT LEAVE YOUR SECURE LOCATION UNTIL FURTHER NOTICE."', text: null, effect: null },
      { delay: 9000, pa: null, text: 'The gym lights cut. Emergency strips on the ceiling click to red.', effect: 'dim' },
      { delay: 11200, pa: null, text: '"CORNER — NORTHEAST — NOW! GO GO GO!" Coach Williams doesn\'t sound like a coach anymore.', effect: 'corner' },
      { delay: 13400, pa: null, text: 'You compress into the far corner under the emergency exit sign. Cold concrete wall. Thirty bodies. Everyone is breathing too fast.', effect: 'hide' },
      { delay: 15600, pa: null, text: 'Someone starts sobbing quietly behind you. A freshman you don\'t know. You don\'t turn around. Nobody does.', effect: null },
      { delay: 17200, pa: null, text: _secretThought, effect: null },
      { delay: 19000, pa: null, text: 'Coach Williams: "Nobody moves. I mean it. Nobody moves." His voice is completely flat. That\'s the scariest part.', effect: null },
    ];

    function addBeat(text, cls) {
      const d = document.createElement('div');
      d.className = cls || 'threat-beat';
      d.textContent = text;
      story.appendChild(d);
      story.scrollTop = story.scrollHeight;
      G.from(d, { opacity: 0, y: 10, duration: 0.5 });
    }

    function runPhase1(i) {
      const s = phase1[i];
      if (s.pa) {
        pa.textContent = s.pa;
        pa.className = 'threat-pa' + (s.effect === 'crackle' ? ' crackle' : ' lockdown-msg');
        G.from(pa, { opacity: 0, duration: 0.4 });
      }
      if (s.text) addBeat(s.text);
      const scene = document.getElementById('threat-scene');
      if (s.effect === 'alarm'  && scene) scene.classList.add('alarm-active');
      if (s.effect === 'dim'    && scene) scene.classList.add('lights-dimmed');
      if (s.effect === 'strobe' && scene) scene.classList.add('strobe-active');
      if (s.effect === 'corner') {
        const cs = document.getElementById('corner-students');
        if (cs) cs.classList.add('huddled');
        const py = document.getElementById('player-you');
        if (py) py.classList.add('hiding');
      }
      if (i + 1 < phase1.length) {
        setTimeout(() => runPhase1(i + 1), phase1[i + 1].delay - s.delay);
      } else {
        setTimeout(showChoice, 2000);
      }
    }

    function showChoice() {
      // Pause narrative — present the disobey choice
      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'threat-choice';
      choiceDiv.innerHTML = `
        <p class="threat-choice-prompt">The emergency exit is 15 feet away. You could be outside in three seconds. Coach has his back turned.</p>
        <div class="threat-choice-btns">
          <button class="threat-btn-stay" id="threat-stay">STAY PUT</button>
          <button class="threat-btn-run"  id="threat-run">MAKE A RUN FOR IT</button>
        </div>
      `;
      story.appendChild(choiceDiv);
      story.scrollTop = story.scrollHeight;
      G.from(choiceDiv, { opacity: 0, y: 14, duration: 0.6 });

      document.getElementById('threat-stay').addEventListener('click', () => {
        choiceDiv.remove();
        runPhase2_stay();
      }, { once: true });
      document.getElementById('threat-run').addEventListener('click', () => {
        choiceDiv.remove();
        runPhase2_run();
      }, { once: true });
    }

    // Branch A — obey
    function runPhase2_stay() {
      const beats = [
        { delay: 0,    pa: '[41 MINUTES LATER]', text: null, time: true },
        { delay: 1400, pa: null, text: 'All-clear. A handwritten note in locker 247 — almost certainly a prank. But SWAT swept every room anyway. Two dogs. The works.' },
        { delay: 4200, pa: null, text: 'You walk out into the afternoon. The grass looks too bright. Nobody talks on the way to the parking lot.' },
      ];
      function rb(i) {
        const s = beats[i];
        if (s.pa) { pa.textContent = s.pa; pa.className = 'threat-pa' + (s.time ? ' time-stamp' : ' lockdown-msg'); G.from(pa, { opacity: 0, duration: 0.4 }); }
        if (s.text) addBeat(s.text);
        const scene = document.getElementById('threat-scene');
        if (scene) { scene.classList.remove('alarm-active'); scene.classList.add('all-clear'); }
        if (i + 1 < beats.length) setTimeout(() => rb(i + 1), beats[i + 1].delay);
        else setTimeout(() => showPEResult(false), 2400);
      }
      rb(0);
    }

    // Branch B — disobey
    function runPhase2_run() {
      const scene = document.getElementById('threat-scene');
      if (scene) scene.classList.add('run-flash');
      const beats = [
        { delay: 0,    text: 'You move. Three seconds, door, outside. The air hits you like a wall. Sunlight.' },
        { delay: 2200, text: 'You\'re the only student in the courtyard. A security officer sees you immediately. He does not look relieved.' },
        { delay: 4200, text: 'Forty-five minutes later — after the all-clear — you\'re sitting in the main office. It was a prank. Everyone knows. The officer does not care.' },
        { delay: 6400, text: 'Principal Reyes: "We\'ll need your parents here Monday morning." He doesn\'t raise his voice. That\'s somehow worse.' },
      ];
      function rb(i) {
        const s = beats[i];
        if (s.text) addBeat(s.text, 'threat-beat threat-beat-run');
        if (i + 1 < beats.length) setTimeout(() => rb(i + 1), beats[i + 1].delay);
        else setTimeout(() => showPEResult(true), 2400);
      }
      rb(0);
    }

    runPhase1(0);
  }

  function showPEResult(disobeyed) {
    overlay.classList.remove('threat-fullscreen');
    const inner2 = overlay.querySelector('.pe-inner');
    if (disobeyed) {
      inner2.innerHTML = `
        <div class="pe-result-screen">
          <div class="or-badge">PERIOD 4 · PE — LOCKDOWN CONCLUDED</div>
          <div class="pe-result-icon">🚪</div>
          <div class="pe-result-title" style="color:#e05050">PRINCIPAL'S OFFICE.</div>
          <p class="pe-result-text">It was a false alarm. But you ran during a lockdown — against direct orders. Monday morning: a meeting with Principal Reyes and your parents. It goes on your record.</p>
          <button class="btn-primary" id="pe-done-btn" style="margin-top:28px">CONTINUE →</button>
          <div class="or-key-hint" style="margin-top:6px;font-size:.7rem;opacity:.45">[ ENTER ] to continue</div>
        </div>
      `;
    } else {
      inner2.innerHTML = `
        <div class="pe-result-screen">
          <div class="or-badge">PERIOD 4 · PE — LOCKDOWN CONCLUDED</div>
          <div class="pe-result-icon">🔓</div>
          <div class="pe-result-title">FALSE ALARM.</div>
          <p class="pe-result-text">A prank. Probably. But you were in that corner for forty-one minutes and your heart didn't slow down the whole time. Some things stay with you.</p>
          <button class="btn-primary" id="pe-done-btn" style="margin-top:28px">CONTINUE →</button>
          <div class="or-key-hint" style="margin-top:6px;font-size:.7rem;opacity:.45">[ ENTER ] to continue</div>
        </div>
      `;
    }
    G.from(inner2.querySelector('.pe-result-screen'), { opacity: 0, y: 20, duration: 0.5 });

    if (typeof Engine !== 'undefined') {
      if (disobeyed) {
        Engine.modifyStats({ happiness: -3.0, intelligence: -0.3, friendships: -0.5, gpa: -0.1 });
      } else {
        Engine.modifyStats({ happiness: -2.0, intelligence: 0.5, friendships: 0.3 });
      }
    }

    let _f = false;
    function _done() {
      if (_f) return; _f = true;
      document.removeEventListener('keydown', _pekh);
      window.MYTH_BOMB_THREAT_ACTIVE = false;
      window.MYTH_BOMB_CLEAR         = true;
      G.to(overlay, {
        opacity: 0, duration: 0.5, ease: 'power2.in',
        onComplete: () => {
          overlay.classList.remove('open');
          overlay.style.opacity = '';
          showFreshmanYearEnd();
        },
      });
    }
    function _pekh(e) { if (e.key === 'Enter') _done(); }
    document.addEventListener('keydown', _pekh);
    document.getElementById('pe-done-btn').addEventListener('click', _done, { once: true });
  }
}

// ═══════════════════════════════════════════════════════
//  FRESHMAN YEAR COMPLETION CUTSCENE
// ═══════════════════════════════════════════════════════
function showFreshmanYearEnd() {
  const start  = window.MYTH_START_STATS || {};
  const now    = (typeof Engine !== 'undefined' && Engine.getState) ? (Engine.getState()?.stats ?? player.stats) : player.stats;
  const ec     = window.MYTH_CLUB_CHOICE === 'robotics' ? 'Robotics Club' :
                 window.MYTH_CLUB_CHOICE === 'football'  ? 'Football'       : 'No EC joined';

  const statOrder = ['gpa','friendships','relationships','sports','intelligence','extracurriculars','happiness'];
  const MAX       = { gpa: 4, friendships: 10, relationships: 10, sports: 10, intelligence: 10, extracurriculars: 10, happiness: 10 };

  function statRow(key) {
    const s0  = start[key] ?? now[key];
    const s1  = now[key];
    const d   = +(s1 - s0).toFixed(2);
    const pct = key === 'gpa' ? (s1 / 4) * 100 : (s1 / 10) * 100;
    const col = pct >= 70 ? '#F7B731' : pct >= 40 ? '#6BCB77' : '#FC7B54';
    const arrow = d > 0 ? `<span style="color:#6BCB77">▲ +${d}</span>` :
                  d < 0 ? `<span style="color:#FC7B54">▼ ${d}</span>`  :
                          `<span style="color:#888">— 0</span>`;
    const label = STAT_LABELS[key] || key.toUpperCase();
    const barW  = Math.round(pct);
    return `
      <div class="yr-stat-row">
        <span class="yr-stat-label">${label}</span>
        <div class="yr-stat-bar-wrap">
          <div class="yr-stat-bar" style="width:${barW}%;background:${col}"></div>
        </div>
        <span class="yr-stat-val">${s1.toFixed(key==='gpa'?2:1)}</span>
        <span class="yr-stat-delta">${arrow}</span>
      </div>
    `;
  }

  const gpa     = now.gpa || 0;
  const overallLabel = gpa >= 3.8 ? 'HONORS FRESHMAN' : gpa >= 3.0 ? 'SOLID YEAR' : gpa >= 2.0 ? 'GETTING BY' : 'ROUGH START';
  const overallDesc  = gpa >= 3.8 ? "You finished your first year stronger than most upperclassmen. They noticed."
                     : gpa >= 3.0 ? "You held it together. First year of high school — that's harder than it sounds."
                     : gpa >= 2.0 ? "It wasn't your best work. You know that. So does everyone else. Sophomore year is a reset."
                     : "This year got away from you. But you're still here.";

  const overlay = document.getElementById('year-end-overlay');
  if (!overlay) {
    // Fallback: inject overlay if not in HTML
    const el = document.createElement('div');
    el.id = 'year-end-overlay';
    el.className = 'year-end-overlay';
    document.getElementById('scene-game').appendChild(el);
  }
  const el = document.getElementById('year-end-overlay');
  el.innerHTML = `
    <div class="yr-inner">
      <div class="yr-top-badge">WESTBROOK HIGH SCHOOL · CUPERTINO, CA</div>
      <div class="yr-year-label">FRESHMAN YEAR</div>
      <div class="yr-complete">COMPLETE</div>
      <div class="yr-divider"></div>
      <div class="yr-verdict-label">${overallLabel}</div>
      <p class="yr-verdict-desc">${overallDesc}</p>
      <div class="yr-ec-line">EC: <span class="yr-ec-val">${ec}</span></div>
      <div class="yr-stats">
        ${statOrder.map(statRow).join('')}
      </div>
      <div class="yr-divider" style="margin-top:28px"></div>
      <div class="yr-next-label">SOPHOMORE YEAR BEGINS</div>
      <p class="yr-next-desc">The campus is yours now. The restrictions are gone. Whatever reputation you built this year — you carry it into Year 2.</p>
      <button class="btn-primary yr-continue-btn" id="yr-continue-btn">CONTINUE TO SOPHOMORE YEAR →</button>
      <div class="or-key-hint" style="margin-top:8px;font-size:.7rem;opacity:.4">[ ENTER ] to continue</div>
    </div>
  `;
  el.style.display = 'flex';
  G.from(el, { opacity: 0, duration: 0.8 });
  G.from(el.querySelector('.yr-inner'), { y: 30, opacity: 0, duration: 1.0, ease: 'power2.out' });

  let _f2 = false;
  function _finish() {
    if (_f2) return; _f2 = true;
    document.removeEventListener('keydown', _yrKH);
    G.to(el, { opacity: 0, duration: 0.6, onComplete: () => {
      el.style.display = 'none';
      window.MYTH_PE_DONE              = true;
      window.MYTH_ORIENTATION_ACTIVE   = false;
      window.MYTH_FRESHMAN_RESTRICTION = false;
      refreshStatsSidebar();
      setTimeout(() => showSophomoreYear(), 400);
    }});
  }
  function _yrKH(e) { if (e.key === 'Enter') _finish(); }
  document.addEventListener('keydown', _yrKH);
  document.getElementById('yr-continue-btn').addEventListener('click', _finish, { once: true });
}

function groupLabels_g(g) {
  return { mob: 'GAYGOS', balance: 'XBOX', grind: "LUCAS'S GANG" }[g] || '—';
}
function persLabels_g(p) {
  return {
    grinder:  'THE GRINDER',
    social:   'SOCIAL BUTTERFLY',
    athlete:  'THE ATHLETE',
    charmer:  'THE CHARMER',
    observer: 'THE OBSERVER',
    rebel:    'THE REBEL',
    empath:   'THE EMPATH',
    wildcard: 'THE WILDCARD',
  }[p] || '—';
}

// ═══════════════════════════════════════════════════════
//  YEAR PROGRESSION — Sophomore · Junior · Senior
// ═══════════════════════════════════════════════════════

const STAT_SHORT = {
  gpa:'GPA', friendships:'FRND', relationships:'REL',
  sports:'SPT', intelligence:'INT', extracurriculars:'EC', happiness:'HAP'
};

function statChips(deltas) {
  return Object.entries(deltas).map(([k,v]) => {
    const cls = v > 0 ? 'chip-gain' : 'chip-lose';
    return `<span class="stat-chip ${cls}">${v>0?'+':''}${v} ${STAT_SHORT[k]||k}</span>`;
  }).join('');
}

function applyDeltas(deltas) {
  Object.entries(deltas).forEach(([k,v]) => {
    if (typeof Engine !== 'undefined' && Engine.modifyStat) Engine.modifyStat(k, v);
  });
}

function _getYrOverlay() {
  let el = document.getElementById('year-select-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'year-select-overlay';
    el.className = 'year-select-overlay';
    document.getElementById('scene-game').appendChild(el);
  }
  el.style.display = 'flex';
  el.style.opacity = '1';
  return el;
}

function _currentStats() {
  return (typeof Engine !== 'undefined' && Engine.getState)
    ? (Engine.getState()?.stats ?? player.stats) : player.stats;
}

function _statsGrid(now) {
  return Object.keys(STAT_LABELS).map(k => {
    const v = now[k] ?? 0;
    const pct = k==='gpa' ? (v/4)*100 : (v/10)*100;
    const col = pct>=70?'#F7B731':pct>=40?'#6BCB77':'#FC7B54';
    return `<div class="ys-stat-row">
      <span class="ys-stat-key">${STAT_LABELS[k]}</span>
      <div class="ys-bar-wrap"><div class="ys-bar-fill" style="width:${Math.min(pct,100)}%;background:${col}"></div></div>
      <span class="ys-stat-num">${v.toFixed(k==='gpa'?2:1)}</span>
    </div>`;
  }).join('');
}

// ── SOPHOMORE YEAR ──────────────────────────────────

const SOPH_PATHS = [
  { id:'ap_cs',   icon:'💻', title:'AP COMPUTER SCIENCE A',
    desc:'You grind code all semester. The final exam breaks you.',
    outcome:'You pass out during the final. Fracture your jaw on the floor.',
    deltas:{ intelligence:1.5, extracurriculars:2.0, happiness:-2.0, gpa:-1.0 } },
  { id:'studies', icon:'📖', title:'STUDIES CLASS',
    desc:'You prioritize balance. Someone catches your eye every day.',
    outcome:'You secure a significant other.',
    deltas:{ gpa:0.3, relationships:3.0, happiness:1.5, extracurriculars:-1.0 } },
  { id:'precalc', icon:'📐', title:'PRE-CALC HONORS',
    desc:'First test. You open the booklet and know nothing.',
    outcome:'You fail the exam. Tutoring follows.',
    deltas:{ intelligence:1.0, gpa:-0.5, happiness:-1.5, extracurriculars:0.5 } },
  { id:'physics', icon:'🥚', title:'PHYSICS — EGG DROP',
    desc:'Weeks of engineering. Culminates in a trip to Great America.',
    outcome:'Time-sink, but the field trip is a blast.',
    deltas:{ gpa:-0.2, friendships:2.0, happiness:2.0, intelligence:1.0 } }
];

const SOPH_EVENTS = [
  { icon:'🎮', title:'BRAWL STARS PHASE',
    desc:'You and the crew get hooked. Weekend sessions spiral.',
    deltas:{ friendships:1.0, gpa:-0.2, happiness:1.0 } },
  { icon:'📝', title:'THE PSAT',
    desc:"First standardized test. It's humbling.",
    deltas:{ intelligence:0.5, happiness:-1.0 } },
  { icon:'🏋', title:'FITNESS JOURNEY',
    desc:'You start hitting the gym. Something changes.',
    deltas:{ sports:1.5, happiness:1.0, extracurriculars:-0.5 } }
];

function showSophomoreYear() {
  const overlay = _getYrOverlay();
  const selected = new Set();

  function render() {
    overlay.innerHTML = `
      <div class="ys-inner">
        <div class="ys-badge">WESTBROOK HIGH · SOPHOMORE YEAR</div>
        <div class="ys-title">CHOOSE YOUR PATHS</div>
        <div class="ys-subtitle">Pick <strong>2</strong> — they define the year.</div>
        <div class="ys-grid">
          ${SOPH_PATHS.map(p=>`
            <div class="ys-card${selected.has(p.id)?' selected':''}" data-id="${p.id}">
              <div class="ys-card-icon">${p.icon}</div>
              <div class="ys-card-title">${p.title}</div>
              <div class="ys-card-desc">${p.desc}</div>
              <div class="ys-chips">${statChips(p.deltas)}</div>
            </div>`).join('')}
        </div>
        <button class="btn-primary ys-confirm" id="ys-confirm" ${selected.size<2?'disabled':''}>
          LOCK IN ${selected.size}/2 →
        </button>
      </div>`;
    overlay.querySelectorAll('.ys-card').forEach(card=>{
      card.addEventListener('click',()=>{
        const id=card.dataset.id;
        if(selected.has(id)) selected.delete(id);
        else if(selected.size<2) selected.add(id);
        render();
      });
    });
    const btn=document.getElementById('ys-confirm');
    if(btn && selected.size===2) btn.addEventListener('click',()=>{
      SOPH_PATHS.filter(p=>selected.has(p.id)).forEach(p=>applyDeltas(p.deltas));
      showPathOutcomes();
    },{once:true});
  }

  function showPathOutcomes() {
    const chosen=SOPH_PATHS.filter(p=>selected.has(p.id));
    overlay.innerHTML=`
      <div class="ys-inner">
        <div class="ys-badge">SOPHOMORE YEAR · YOUR PATHS</div>
        <div class="ys-title" style="font-size:2rem">THE YEAR UNFOLDS</div>
        <div style="display:flex;flex-direction:column;gap:14px;margin-top:24px;width:100%;max-width:580px">
          ${chosen.map(p=>`
            <div class="ys-outcome-card">
              <span class="ys-card-icon" style="font-size:2rem">${p.icon}</span>
              <div>
                <div class="ys-card-title" style="font-size:0.9rem">${p.title}</div>
                <div class="ys-card-desc" style="color:rgba(220,210,190,.85)">${p.outcome}</div>
              </div>
            </div>`).join('')}
        </div>
        <button class="btn-primary ys-confirm" id="ys-next" style="margin-top:32px">CONTINUE →</button>
      </div>`;
    document.getElementById('ys-next').addEventListener('click',()=>_sophEvent(0),{once:true});
  }

  render();
}

function _sophEvent(idx) {
  if(idx>=SOPH_EVENTS.length){ showSophomoreYearEnd(); return; }
  const ev=SOPH_EVENTS[idx], overlay=_getYrOverlay();
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">SOPHOMORE YEAR · SCHOOL EVENT</div>
      <div class="ys-event-icon">${ev.icon}</div>
      <div class="ys-title" style="font-size:2.2rem">${ev.title}</div>
      <p class="ys-card-desc" style="max-width:460px;font-size:1rem;line-height:1.7;margin-top:8px">${ev.desc}</p>
      <div class="ys-chips" style="margin-top:16px;justify-content:center">${statChips(ev.deltas)}</div>
      <button class="btn-primary ys-confirm" id="ys-ev-next" style="margin-top:28px">CONTINUE →</button>
    </div>`;
  applyDeltas(ev.deltas);
  document.getElementById('ys-ev-next').addEventListener('click',()=>_sophEvent(idx+1),{once:true});
}

function showSophomoreYearEnd() {
  const overlay=_getYrOverlay(), now=_currentStats();
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">WESTBROOK HIGH · CUPERTINO, CA</div>
      <div class="ys-year-label">SOPHOMORE YEAR</div>
      <div class="yr-complete">COMPLETE</div>
      <div class="yr-divider"></div>
      <div class="ys-stats-grid">${_statsGrid(now)}</div>
      <div class="yr-divider" style="margin-top:24px"></div>
      <div class="ys-next-label">JUNIOR YEAR BEGINS</div>
      <p class="ys-card-desc" style="margin-top:8px">Stakes are real now. This year follows you to college apps.</p>
      <button class="btn-primary ys-confirm" id="ys-jr-btn" style="margin-top:20px">CONTINUE TO JUNIOR YEAR →</button>
    </div>`;
  document.getElementById('ys-jr-btn').addEventListener('click',()=>{
    G.to(overlay,{opacity:0,duration:0.5,onComplete:()=>{
      overlay.style.display='none'; overlay.style.opacity='';
      if(typeof refreshStatsSidebar==='function') refreshStatsSidebar();
      showJuniorYear();
    }});
  },{once:true});
}

// ── JUNIOR YEAR ──────────────────────────────────────

const JR_PATHS = [
  { id:'calc_bc',     icon:'∫',  title:'CALC BC (THE CONLIN GRIND)',
    desc:'All-nighters. Caffeine. Derivatives. B in the class, 5 on the AP exam.',
    deltas:{ gpa:-0.3, intelligence:2.5, extracurriculars:2.0, happiness:-1.5 } },
  { id:'dual_enroll', icon:'🎓', title:'DUAL ENROLLMENT',
    desc:'College courses at the local CC. Manageable workload, weighted GPA boost.',
    deltas:{ gpa:0.4, intelligence:1.2, extracurriculars:1.0 } },
  { id:'apush',       icon:'🇺🇸',title:'APUSH',
    desc:'You ace it. But every free period goes to notes. No breathing room.',
    deltas:{ gpa:0.2, friendships:-1.5, intelligence:1.5, happiness:-1.0 } }
];

const JR_LIFE = [
  { id:'socialite', icon:'🚗', title:'THE SOCIALITE',
    desc:"Driver's license, parking lot hangs, Prom. Social peak.",
    deltas:{ gpa:-0.4, friendships:3.0, relationships:3.0, happiness:2.5 } },
  { id:'athlete',   icon:'🏈', title:'TRIPLE-THREAT ATHLETE',
    desc:'Football · Baseball · Golf. Campus icon. Zero study time.',
    deltas:{ gpa:-0.6, friendships:3.5, sports:4.0, intelligence:-1.0 } },
  { id:'body',      icon:'💪', title:'BODY TRANSFORMATION',
    desc:'You hit the gym religiously. You get shredded. Confidence skyrockets.',
    deltas:{ sports:3.0, happiness:2.5, relationships:1.0, extracurriculars:-1.0 } }
];

const JR_MILESTONES = [
  { icon:'📊', title:'THE SAT / ACT',
    desc:'Mandatory stress-test. Weeks of practice problems.',
    deltas:{ intelligence:1.0, happiness:-1.0 } },
  { icon:'🏫', title:'COLLEGE SEARCH',
    desc:'Browsing university brochures. The anxiety is creeping in.',
    deltas:{ extracurriculars:0.5, happiness:-0.2 } }
];

function showJuniorYear() {
  const overlay=_getYrOverlay();
  const selected=new Set();

  function render() {
    overlay.innerHTML=`
      <div class="ys-inner">
        <div class="ys-badge">WESTBROOK HIGH · JUNIOR YEAR</div>
        <div class="ys-title">ACADEMIC PATHS</div>
        <div class="ys-subtitle">Pick <strong>2 courses</strong> — these hit your transcript.</div>
        <div class="ys-grid">
          ${JR_PATHS.map(p=>`
            <div class="ys-card${selected.has(p.id)?' selected':''}" data-id="${p.id}">
              <div class="ys-card-icon">${p.icon}</div>
              <div class="ys-card-title">${p.title}</div>
              <div class="ys-card-desc">${p.desc}</div>
              <div class="ys-chips">${statChips(p.deltas)}</div>
            </div>`).join('')}
        </div>
        <button class="btn-primary ys-confirm" id="ys-confirm" ${selected.size<2?'disabled':''}>
          LOCK IN ${selected.size}/2 →
        </button>
      </div>`;
    overlay.querySelectorAll('.ys-card').forEach(card=>{
      card.addEventListener('click',()=>{
        const id=card.dataset.id;
        if(selected.has(id)) selected.delete(id);
        else if(selected.size<2) selected.add(id);
        render();
      });
    });
    const btn=document.getElementById('ys-confirm');
    if(btn && selected.size===2) btn.addEventListener('click',()=>{
      JR_PATHS.filter(p=>selected.has(p.id)).forEach(p=>applyDeltas(p.deltas));
      showJuniorLifeEvent();
    },{once:true});
  }
  render();
}

function showJuniorLifeEvent() {
  const overlay=_getYrOverlay();
  let chosen=null;

  function render() {
    overlay.innerHTML=`
      <div class="ys-inner">
        <div class="ys-badge">JUNIOR YEAR · MAJOR LIFE FOCUS</div>
        <div class="ys-title">YOUR DEFINING YEAR</div>
        <div class="ys-subtitle">Choose <strong>1</strong> — this is who you become.</div>
        <div class="ys-grid">
          ${JR_LIFE.map(p=>`
            <div class="ys-card${chosen===p.id?' selected':''}" data-id="${p.id}">
              <div class="ys-card-icon">${p.icon}</div>
              <div class="ys-card-title">${p.title}</div>
              <div class="ys-card-desc">${p.desc}</div>
              <div class="ys-chips">${statChips(p.deltas)}</div>
            </div>`).join('')}
        </div>
        <button class="btn-primary ys-confirm" id="ys-confirm" ${!chosen?'disabled':''}>THIS IS ME →</button>
      </div>`;
    overlay.querySelectorAll('.ys-card').forEach(card=>{
      card.addEventListener('click',()=>{ chosen=card.dataset.id; render(); });
    });
    const btn=document.getElementById('ys-confirm');
    if(btn && chosen) btn.addEventListener('click',()=>{
      applyDeltas(JR_LIFE.find(p=>p.id===chosen).deltas);
      _jrMilestone(0);
    },{once:true});
  }
  render();
}

function _jrMilestone(idx) {
  if(idx>=JR_MILESTONES.length){ showJuniorYearEnd(); return; }
  const m=JR_MILESTONES[idx], overlay=_getYrOverlay();
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">JUNIOR YEAR · MILESTONE</div>
      <div class="ys-event-icon">${m.icon}</div>
      <div class="ys-title" style="font-size:2.2rem">${m.title}</div>
      <p class="ys-card-desc" style="max-width:460px;font-size:1rem;line-height:1.7;margin-top:8px">${m.desc}</p>
      <div class="ys-chips" style="margin-top:16px;justify-content:center">${statChips(m.deltas)}</div>
      <button class="btn-primary ys-confirm" id="ys-ev-next" style="margin-top:28px">CONTINUE →</button>
    </div>`;
  applyDeltas(m.deltas);
  document.getElementById('ys-ev-next').addEventListener('click',()=>_jrMilestone(idx+1),{once:true});
}

function showJuniorYearEnd() {
  const overlay=_getYrOverlay(), now=_currentStats();
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">WESTBROOK HIGH · CUPERTINO, CA</div>
      <div class="ys-year-label">JUNIOR YEAR</div>
      <div class="yr-complete">COMPLETE</div>
      <div class="yr-divider"></div>
      <div class="ys-stats-grid">${_statsGrid(now)}</div>
      <div class="yr-divider" style="margin-top:24px"></div>
      <div class="ys-next-label">SENIOR YEAR BEGINS</div>
      <p class="ys-card-desc" style="margin-top:8px">The home stretch. Apps, chaos, and the end of an era.</p>
      <button class="btn-primary ys-confirm" id="ys-sr-btn" style="margin-top:20px">CONTINUE TO SENIOR YEAR →</button>
    </div>`;
  document.getElementById('ys-sr-btn').addEventListener('click',()=>{
    G.to(overlay,{opacity:0,duration:0.5,onComplete:()=>{
      overlay.style.display='none'; overlay.style.opacity='';
      if(typeof refreshStatsSidebar==='function') refreshStatsSidebar();
      showSeniorYear();
    }});
  },{once:true});
}

// ── SENIOR YEAR ──────────────────────────────────────

const SR_TIME_KILLERS = [
  { id:'kalshi',    icon:'📈', title:'MARKET GAMBLER',
    desc:'You spend free periods betting on event contracts. Addictive.',
    deltas:{ intelligence:1.0, gpa:-0.2, happiness:0.5 } },
  { id:'athlete_s', icon:'⛳', title:'DUAL ATHLETE',
    desc:'Golf & Football. Finish your high school career strong.',
    deltas:{ sports:2.5, friendships:1.5, gpa:-0.3 } },
  { id:'assassin',  icon:'💧', title:'SENIOR ASSASSIN',
    desc:"Water guns and paranoia. The most fun you've had all year.",
    deltas:{ friendships:2.0, happiness:2.5, intelligence:-0.5 } }
];

function showSeniorYear() {
  const overlay=_getYrOverlay();
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">WESTBROOK HIGH · SENIOR YEAR</div>
      <div class="ys-event-icon">📝</div>
      <div class="ys-title">COLLEGE APP SEASON</div>
      <p class="ys-card-desc" style="max-width:500px;font-size:1rem;line-height:1.7;margin-top:8px">
        First semester. A blur of essays, deadlines, and sleepless nights.
        The process sucks the life out of you — but you finish.
      </p>
      <div class="ys-chips" style="margin-top:16px;justify-content:center">
        ${statChips({ extracurriculars:2.0, intelligence:1.0, happiness:-3.0, gpa:-0.5 })}
      </div>
      <button class="btn-primary ys-confirm" id="ys-apps-done" style="margin-top:32px">SUBMIT APPS →</button>
    </div>`;
  applyDeltas({ extracurriculars:2.0, intelligence:1.0, happiness:-3.0, gpa:-0.5 });
  document.getElementById('ys-apps-done').addEventListener('click',()=>_srFlip(),{once:true});
}

function _srFlip() {
  const overlay=_getYrOverlay();
  const lockIn=Math.random()<0.5;
  const ev=lockIn
    ? { icon:'🔒', title:'THE LOCK-IN PHASE', desc:"You stay disciplined to protect your offers.", deltas:{gpa:0.5,intelligence:1.0,happiness:-1.0} }
    : { icon:'😴', title:'SEVERE SENIORITIS',  desc:"You ditch class. You don't care anymore.",   deltas:{gpa:-0.6,friendships:2.0,happiness:1.5,intelligence:-1.0} };
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">SENIOR YEAR · SECOND SEMESTER</div>
      <div class="ys-event-icon">${ev.icon}</div>
      <div class="ys-title" style="font-size:2.2rem">${ev.title}</div>
      <p class="ys-card-desc" style="max-width:460px;font-size:1rem;line-height:1.7;margin-top:8px">${ev.desc}</p>
      <div class="ys-chips" style="margin-top:16px;justify-content:center">${statChips(ev.deltas)}</div>
      <button class="btn-primary ys-confirm" id="ys-flip-done" style="margin-top:28px">CONTINUE →</button>
    </div>`;
  applyDeltas(ev.deltas);
  document.getElementById('ys-flip-done').addEventListener('click',()=>_srSunrise(),{once:true});
}

function _srSunrise() {
  const overlay=_getYrOverlay();
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">SENIOR YEAR · EVENT</div>
      <div class="ys-event-icon">🌅</div>
      <div class="ys-title" style="font-size:2.2rem">SENIOR SUNRISE</div>
      <p class="ys-card-desc" style="max-width:460px;font-size:1rem;line-height:1.7;margin-top:8px">
        5:00 AM. You drag yourself out of bed. Completely cloudy — can't see the sun.
        But you're there. That counts for something.
      </p>
      <div class="ys-chips" style="margin-top:16px;justify-content:center">
        ${statChips({ friendships:0.5, happiness:-0.5 })}
      </div>
      <button class="btn-primary ys-confirm" id="ys-sr-hc" style="margin-top:28px">CONTINUE →</button>
    </div>`;
  applyDeltas({ friendships:0.5, happiness:-0.5 });
  document.getElementById('ys-sr-hc').addEventListener('click',()=>_srHomecoming(),{once:true});
}

function _srHomecoming() {
  const overlay=_getYrOverlay();
  const now=_currentStats();
  const withPartner=(now.relationships??0)>5.0;
  const deltas=withPartner?{happiness:2.0,relationships:1.5}:{friendships:1.5,relationships:-0.5};
  const desc=withPartner
    ? "You go with your partner. The night is everything."
    : "No date. You roll with the squad. Still a memory.";
  overlay.innerHTML=`
    <div class="ys-inner">
      <div class="ys-badge">SENIOR YEAR · EVENT</div>
      <div class="ys-event-icon">🕺</div>
      <div class="ys-title" style="font-size:2.2rem">HOMECOMING DANCE</div>
      <div class="ys-card-desc" style="font-size:0.8rem;opacity:0.55;margin-top:4px">
        ${withPartner?'REL > 5.0 — You have a date.':'REL ≤ 5.0 — Going with friends.'}
      </div>
      <p class="ys-card-desc" style="max-width:460px;font-size:1rem;line-height:1.7;margin-top:10px">${desc}</p>
      <div class="ys-chips" style="margin-top:16px;justify-content:center">${statChips(deltas)}</div>
      <button class="btn-primary ys-confirm" id="ys-sr-tk" style="margin-top:28px">CONTINUE →</button>
    </div>`;
  applyDeltas(deltas);
  document.getElementById('ys-sr-tk').addEventListener('click',()=>_srTimeKiller(),{once:true});
}

function _srTimeKiller() {
  const overlay=_getYrOverlay();
  let chosen=null;

  function render() {
    overlay.innerHTML=`
      <div class="ys-inner">
        <div class="ys-badge">SENIOR YEAR · FINAL SEMESTER</div>
        <div class="ys-title">HOW DO YOU SPEND IT?</div>
        <div class="ys-subtitle">One last thing that defines your senior year.</div>
        <div class="ys-grid">
          ${SR_TIME_KILLERS.map(p=>`
            <div class="ys-card${chosen===p.id?' selected':''}" data-id="${p.id}">
              <div class="ys-card-icon">${p.icon}</div>
              <div class="ys-card-title">${p.title}</div>
              <div class="ys-card-desc">${p.desc}</div>
              <div class="ys-chips">${statChips(p.deltas)}</div>
            </div>`).join('')}
        </div>
        <button class="btn-primary ys-confirm" id="ys-confirm" ${!chosen?'disabled':''}>LOCK IN →</button>
      </div>`;
    overlay.querySelectorAll('.ys-card').forEach(card=>{
      card.addEventListener('click',()=>{ chosen=card.dataset.id; render(); });
    });
    const btn=document.getElementById('ys-confirm');
    if(btn && chosen) btn.addEventListener('click',()=>{
      applyDeltas(SR_TIME_KILLERS.find(p=>p.id===chosen).deltas);
      showGraduation();
    },{once:true});
  }
  render();
}

function showGraduation() {
  const overlay=_getYrOverlay(), now=_currentStats();
  const gpa=now.gpa??0;
  const label=gpa>=3.8?'VALEDICTORIAN CANDIDATE':gpa>=3.0?'HONOR ROLL':gpa>=2.0?'GRADUATED':'BARELY MADE IT';
  const desc=gpa>=3.8?"Four years of excellence. They'll remember your name."
           : gpa>=3.0?"Solid. You did what you came to do."
           : gpa>=2.0?"You got through it. That's something."
           : "It was hard. But you're here.";
  overlay.innerHTML=`
    <div class="ys-inner" style="text-align:center">
      <div class="ys-badge">WESTBROOK HIGH SCHOOL · CLASS OF 2030</div>
      <div class="ys-event-icon" style="font-size:4rem;margin:20px 0">🎓</div>
      <div class="ys-year-label" style="font-size:3rem;letter-spacing:.15em">GRADUATION</div>
      <div class="yr-complete" style="font-size:1.6rem;margin:6px 0">${label}</div>
      <p class="ys-card-desc" style="max-width:480px;font-size:1rem;line-height:1.7;margin:12px auto">${desc}</p>
      <div class="yr-divider" style="margin:20px auto;max-width:480px"></div>
      <div class="ys-stats-grid" style="max-width:520px;margin:0 auto">${_statsGrid(now)}</div>
      <div class="yr-divider" style="margin:20px auto;max-width:480px"></div>
      <p style="font-size:0.78rem;opacity:0.35;margin-top:6px;letter-spacing:.1em">MYTH · HIGH SCHOOL LIFE SIMULATOR</p>
    </div>`;
  if(typeof refreshStatsSidebar==='function') refreshStatsSidebar();
}

// ════════════════════════════════════════════════════════
//  SOPHOMORE YEAR SYSTEM
// ════════════════════════════════════════════════════════

function _sophShow(html) {
  const inner = document.getElementById('soph-inner');
  inner.innerHTML = html;
  const overlay = document.getElementById('soph-overlay');
  overlay.style.display = 'flex';
  G.from(inner, { opacity: 0, y: 22, duration: 0.45, ease: 'power2.out' });
}
function _sophHide(cb) {
  G.to('#soph-inner', { opacity: 0, y: -12, duration: 0.3, ease: 'power2.in', onComplete: () => {
    document.getElementById('soph-overlay').style.display = 'none';
    if (cb) cb();
  }});
}

// ── Freshman year end + class/EC selection ────────────
window.showFreshmanYearEnd = function() {
  window.MYTH_SOPH_CLASS = null;
  window.MYTH_SOPH_EC    = null;
  _sophShow(`
    <div class="soph-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; END OF FRESHMAN YEAR</div>
    <h1 class="soph-title">SOPHOMORE YEAR.</h1>
    <div class="soph-scene">
      <p>It went fast. One year down. The halls feel smaller somehow — or maybe you just got bigger. Summer passed. You're back. Time to pick your path.</p>
    </div>
    <div class="soph-prompt">SELECT YOUR SOPHOMORE CLASS:</div>
    <div class="soph-grade-choice-grid" id="soph-class-grid" style="grid-template-columns:1fr 1fr 1fr">
      <div class="soph-grade-card" data-pick="apcsa"><div class="sgc-label">AP COMPUTER SCIENCE A</div><div class="sgc-desc">Code, problem-solve, survive Mr. Chen's grading. High stress. High reward.</div></div>
      <div class="soph-grade-card" data-pick="physics"><div class="sgc-label">AP PHYSICS 1</div><div class="sgc-desc">Ms. Torres. Egg drops and a surprise field trip. Hands-on. Unpredictable.</div></div>
      <div class="soph-grade-card" data-pick="studies"><div class="sgc-label">STUDIES PERIOD</div><div class="sgc-desc">Structured free period. More people. More drama. Easier on the GPA.</div></div>
    </div>
    <div style="height:28px"></div>
    <div class="soph-prompt">SELECT YOUR EXTRACURRICULAR:</div>
    <div class="soph-grade-choice-grid" id="soph-ec-grid" style="grid-template-columns:1fr 1fr 1fr">
      <div class="soph-grade-card" data-pick="robotics"><div class="sgc-label">ROBOTICS TEAM</div><div class="sgc-desc">Build something real. Vasquez's room. Soldering irons and late nights.</div></div>
      <div class="soph-grade-card" data-pick="football"><div class="sgc-label">VARSITY FOOTBALL</div><div class="sgc-desc">Coach Rivera. Sprints, weights, film. You've got the build for it.</div></div>
      <div class="soph-grade-card" data-pick="brawlstars"><div class="sgc-label">ESPORTS CLUB</div><div class="sgc-desc">Brawl Stars competitive team. Tournaments, rankings, late-night scrims.</div></div>
    </div>
    <div class="soph-nav" style="margin-top:32px">
      <span class="soph-progress">Choose one class and one EC to continue.</span>
      <button class="btn-primary" id="soph-start-btn" disabled>START SOPHOMORE YEAR →</button>
    </div>
  `);
  let classChoice = null, ecChoice = null;
  function updateBtn() { const b = document.getElementById('soph-start-btn'); if (b) b.disabled = !(classChoice && ecChoice); }
  document.getElementById('soph-class-grid').querySelectorAll('.soph-grade-card').forEach(c => {
    c.addEventListener('click', () => { document.getElementById('soph-class-grid').querySelectorAll('.soph-grade-card').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); classChoice = c.dataset.pick; updateBtn(); });
  });
  document.getElementById('soph-ec-grid').querySelectorAll('.soph-grade-card').forEach(c => {
    c.addEventListener('click', () => { document.getElementById('soph-ec-grid').querySelectorAll('.soph-grade-card').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); ecChoice = c.dataset.pick; updateBtn(); });
  });
  document.getElementById('soph-start-btn').addEventListener('click', () => {
    if (!classChoice || !ecChoice) return;
    window.MYTH_SOPH_CLASS = classChoice; window.MYTH_SOPH_EC = ecChoice;
    Engine.setFlag('soph_class_' + classChoice);
    Engine.setFlag('soph_ec_' + ecChoice);
    Engine.setFlag('freshman_year_complete');
    Engine.forceGradeUp(); updateHUD();
    _sophHide(() => { Engine.advancePeriod(); safeEventCheck(); });
  });
};

// ════════════════════════════════════════════════════════
//  APCSA CLASS 1
// ════════════════════════════════════════════════════════
window.showAPCSA_Class1 = function() { Engine.setFlag('soph_apcsa1_started'); _apcsa1_beat1(); };

function _apcsa1_beat1() {
  _sophShow(`<div class="soph-badge">ROOM 214 · AP COMPUTER SCIENCE A</div><h1 class="soph-title">PERIOD 2.</h1>
    <div class="soph-scene"><p>Mr. Chen's room smells like dry-erase markers. Posters of Java syntax line the walls. He's already writing before anyone's seated.</p></div>
    <div class="soph-speaker">MR. CHEN</div><div class="soph-speech">"Find a seat. Doesn't matter which — for today."</div>
    <div class="soph-scene"><p>You sit. The kid next to you already has their laptop open.</p></div>
    <div class="soph-nav"><span class="soph-progress">1 / 5</span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = _apcsa1_beat2;
}
function _apcsa1_beat2() {
  _sophShow(`<div class="soph-badge">ROOM 214 · AP COMPUTER SCIENCE A</div>
    <div class="soph-speaker">MR. CHEN</div><div class="soph-speech">"This is AP CSA. We use Java. You write code, read code, debug code. The AP exam is in May. I do not curve."</div>
    <div class="soph-speech">"First task. What does this print?"</div>
    <div class="soph-code-block">System.out.println("Hello" + " " + "World");</div>
    <div class="soph-prompt">WHAT IS THE OUTPUT?</div>
    <div class="soph-choices" id="soph-choices">
      <button class="soph-choice" data-ans="correct"><span class="soph-choice-label">Hello World</span></button>
      <button class="soph-choice" data-ans="wrong"><span class="soph-choice-label">HelloWorld</span></button>
      <button class="soph-choice" data-ans="wrong"><span class="soph-choice-label">"Hello" + " " + "World"</span></button>
      <button class="soph-choice" data-ans="wrong"><span class="soph-choice-label">Error</span></button>
    </div>
    <div class="soph-nav"><span class="soph-progress">2 / 5</span></div>`);
  document.querySelectorAll('#soph-choices .soph-choice').forEach(b => { b.onclick = () => _apcsa1_q1result(b.dataset.ans === 'correct'); });
}
function _apcsa1_q1result(correct) {
  Engine.modifyStat('gpa', correct ? 1 : -0.5); _flushStatToast();
  _sophShow(`<div class="soph-badge">ROOM 214 · AP COMPUTER SCIENCE A</div>
    <div class="soph-speaker">MR. CHEN</div>
    <div class="soph-speech">${correct ? '"Correct. String concatenation." He marks his gradebook.' : '"No. Read the operators." He marks his gradebook.'}</div>
    <div class="soph-stat-delta ${correct ? '' : 'neg'}">GPA ${correct ? '+1.0' : '−0.5'}</div>
    <div class="soph-scene"><p>Class moves on. Three more exercises. Your hand hurts by the end.</p></div>
    <div class="soph-nav"><span class="soph-progress">3 / 5</span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = _apcsa1_beat4;
}
function _apcsa1_beat4() {
  _sophShow(`<div class="soph-badge">ROOM 214 · AP COMPUTER SCIENCE A</div>
    <div class="soph-scene"><p>End of class. The kid next to you — Marcus — leans over.</p></div>
    <div class="soph-speaker">MARCUS</div><div class="soph-speech">"You get that last one? I had no idea what a for-loop was before today."</div>
    <div class="soph-prompt">HOW DO YOU RESPOND?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="sc-a"><span class="soph-choice-label">HELP HIM OUT</span><span class="soph-choice-hint">Walk him through it before you leave.</span></button>
      <button class="soph-choice" id="sc-b"><span class="soph-choice-label">"YEAH, IT'S BASICALLY A LOOP"</span></button>
      <button class="soph-choice" id="sc-c"><span class="soph-choice-label">SHRUG AND PACK UP</span></button>
    </div>
    <div class="soph-nav"><span class="soph-progress">4 / 5</span></div>`);
  document.getElementById('sc-a').onclick = () => { Engine.modifyStats({ friendships:1, integrity:1 }); _flushStatToast(); _apcsa1_beat5('You spend five minutes at the board. He gets it.'); };
  document.getElementById('sc-b').onclick = () => { Engine.modifyStats({ friendships:1 }); _flushStatToast(); _apcsa1_beat5('Close enough. He nods and writes something down.'); };
  document.getElementById('sc-c').onclick = () => { _apcsa1_beat5('You leave. He figures it out on his own, probably.'); };
}
function _apcsa1_beat5(narr) {
  _sophShow(`<div class="soph-badge">ROOM 214 · AP COMPUTER SCIENCE A</div>
    <div class="soph-scene"><p>${narr}</p><p>Chen's problem set is already in your bag.</p></div>
    <div class="soph-nav"><span class="soph-progress">5 / 5</span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_apcsa1_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  APCSA FINAL EXAM
// ════════════════════════════════════════════════════════
window.showAPCSA_Final = function() { Engine.setFlag('soph_apcsa_final_started'); _apcsa_final_beat1(); };

function _apcsa_final_beat1() {
  _sophShow(`<div class="soph-badge">ROOM 214 · AP COMPUTER SCIENCE A — FINAL EXAM</div><h1 class="soph-title">FINALS WEEK.</h1>
    <div class="soph-scene"><p>Desks spread apart. No bags. Assigned seats printed in 8-point font. Two hours. Chen sets a timer on the projector and sits down without a word.</p></div>
    <div class="soph-nav"><span class="soph-progress">Exam begins.</span><button class="btn-primary" id="soph-next">BEGIN EXAM →</button></div>`);
  document.getElementById('soph-next').onclick = _apcsa_final_q1;
}
let _apcsa_correct = 0;
function _apcsa_final_q1() {
  _apcsa_correct = 0;
  _sophShow(`<div class="soph-badge">ROOM 214 — FINAL · Q1</div>
    <div class="soph-code-block">int[] nums = {3, 1, 4, 1, 5};\nSystem.out.println(nums[2]);</div>
    <div class="soph-prompt">WHAT IS PRINTED?</div>
    <div class="soph-choices">
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">1</span></button>
      <button class="soph-choice" data-a="c"><span class="soph-choice-label">4</span><span class="soph-choice-hint">Arrays are zero-indexed</span></button>
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">3</span></button>
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">5</span></button>
    </div><div class="soph-nav"><span class="soph-progress">Q 1 / 2</span></div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { if (b.dataset.a==='c') _apcsa_correct++; _apcsa_final_q2(); }; });
}
function _apcsa_final_q2() {
  _sophShow(`<div class="soph-badge">ROOM 214 — FINAL · Q2</div>
    <div class="soph-code-block">for (int i = 0; i < 3; i++) {\n    System.out.print(i + " ");\n}</div>
    <div class="soph-prompt">WHAT IS THE OUTPUT?</div>
    <div class="soph-choices">
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">1 2 3</span></button>
      <button class="soph-choice" data-a="c"><span class="soph-choice-label">0 1 2 </span><span class="soph-choice-hint">Starts at 0, condition is i &lt; 3</span></button>
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">0 1 2 3</span></button>
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">Error</span></button>
    </div><div class="soph-nav"><span class="soph-progress">Q 2 / 2</span></div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { if (b.dataset.a==='c') _apcsa_correct++; _apcsa_final_waterBreak(false); }; });
}
function _apcsa_final_waterBreak(second) {
  _sophShow(`<div class="soph-badge">ROOM 214 — FINAL · MID-EXAM</div>
    <div class="soph-speaker">MS. PARK</div>
    <div class="soph-speech">"Water's outside if you need it. Won't affect your score."</div>
    <div class="soph-scene"><p>The hallway is quiet. The fountain is twenty feet away. Your hand aches.</p></div>
    <div class="soph-prompt">DO YOU TAKE THE WATER BREAK?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="wb-yes"><span class="soph-choice-label">YES — STEP OUT</span></button>
      <button class="soph-choice" id="wb-no"><span class="soph-choice-label">NO — KEEP WORKING</span></button>
    </div>`);
  document.getElementById('wb-yes').onclick = _apcsa_final_faint;
  document.getElementById('wb-no').onclick   = () => second ? _apcsa_final_finish() : _apcsa_final_q3();
}
function _apcsa_final_q3() {
  _sophShow(`<div class="soph-badge">ROOM 214 — FINAL · CONTINUING</div>
    <div class="soph-code-block">String s = "Westbrook";\nSystem.out.println(s.length());</div>
    <div class="soph-prompt">WHAT IS PRINTED?</div>
    <div class="soph-choices">
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">8</span></button>
      <button class="soph-choice" data-a="c"><span class="soph-choice-label">9</span><span class="soph-choice-hint">length() counts all characters</span></button>
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">10</span></button>
    </div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { if (b.dataset.a==='c') _apcsa_correct++; _apcsa_final_q4(); }; });
}
function _apcsa_final_q4() {
  _sophShow(`<div class="soph-badge">ROOM 214 — FINAL · LAST QUESTION</div>
    <div class="soph-prompt">TRUE OR FALSE: Java is case-sensitive.</div>
    <div class="soph-choices">
      <button class="soph-choice" data-a="c"><span class="soph-choice-label">TRUE</span><span class="soph-choice-hint">int ≠ Int ≠ INT</span></button>
      <button class="soph-choice" data-a="w"><span class="soph-choice-label">FALSE</span></button>
    </div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { if (b.dataset.a==='c') _apcsa_correct++; _apcsa_final_waterBreak(true); }; });
}
function _apcsa_final_finish() {
  const gpaD = _apcsa_correct >= 3 ? 2 : _apcsa_correct === 2 ? 1 : 0;
  if (gpaD) Engine.modifyStat('gpa', gpaD); _flushStatToast();
  _sophShow(`<div class="soph-badge">ROOM 214 — FINAL · COMPLETE</div><h1 class="soph-title">PENCILS DOWN.</h1>
    <div class="soph-scene"><p>Chen collects the exams without a word. Marcus gives you a look on the way out: <em>how'd you do?</em> You shrug.</p></div>
    <div class="soph-stat-delta ${gpaD>0?'':'neg'}">GPA ${gpaD>0?'+':'±'}${gpaD} · ${_apcsa_correct} / 4 correct</div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_apcsa_final_done'); _sophHide(() => safeEventCheck()); };
}
function _apcsa_final_faint() {
  _sophShow(`<div class="soph-badge">ROOM 214 — HALLWAY</div>
    <div class="soph-scene"><p>You set your pencil down. The hallway is empty. Your shoes squeak on the linoleum. The fountain is right there. Cool water.</p><p>It feels good. For about two seconds.</p></div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = () => {
    G.to('#soph-inner', { opacity: 0, duration: 1.2, ease: 'power2.in', onComplete: () => {
      document.getElementById('soph-inner').innerHTML = `<div style="text-align:center;padding:80px 0;font-family:monospace;color:rgba(255,255,255,0.08);font-size:13px;letter-spacing:.18em">. . .</div>`;
      G.to('#soph-inner', { opacity: 1, duration: 0.6, delay: 0.8, onComplete: () => setTimeout(_apcsa_hospital, 1400) });
    }});
  };
}
function _apcsa_hospital() {
  Engine.modifyStats({ stress:3, sleep:-2, gpa:-1 }); _flushStatToast();
  _sophShow(`<div class="soph-badge">VALLEY MEDICAL CENTER · ROOM 7</div><h1 class="soph-title" style="color:#b8d0f0">YOU WAKE UP.</h1>
    <div class="soph-hospital"><div class="soph-hospital-title">VALLEY MEDICAL CENTER</div>
    <div class="soph-scene" style="color:#c0d0e8"><p>White ceiling. Beeping monitor. Your jaw feels like concrete. The doctor explains it plainly: you fainted at the fountain, hit the basin edge. Broken jaw. Four stitches. Wired for six weeks.</p><p>You didn't finish the exam. Chen gives you a make-up — district policy. But you're eating through a straw for a month and a half.</p></div></div>
    <div class="soph-stat-delta neg">GPA −1 · STRESS +3 · SLEEP −2</div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_apcsa_final_done'); Engine.setFlag('soph_fainted'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  ROBOTICS EC
// ════════════════════════════════════════════════════════
window.showRobotics_EC = function() { Engine.setFlag('soph_robotics_started'); _robotics_beat1(); };
function _robotics_beat1() {
  _sophShow(`<div class="soph-badge">ROOM 108 · ROBOTICS TEAM</div><h1 class="soph-title">AFTER SCHOOL.</h1>
    <div class="soph-scene"><p>Mr. Vasquez's room looks like a hardware store exploded in a computer lab. Bins of servos, wires, half-assembled arms.</p></div>
    <div class="soph-speaker">MR. VASQUEZ</div><div class="soph-speech">"You're the new one. We're building a line-following bot for regionals. Pick a task — everything needs doing."</div>
    <div class="soph-prompt">WHERE DO YOU START?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="rb-a"><span class="soph-choice-label">MOUNT THE SERVO MOTORS</span><span class="soph-choice-hint">Physical work. Screw motors to the chassis.</span></button>
      <button class="soph-choice" id="rb-b"><span class="soph-choice-label">WIRE THE SENSOR ARRAY</span><span class="soph-choice-hint">Careful soldering. IR sensors need precise placement.</span></button>
      <button class="soph-choice" id="rb-c"><span class="soph-choice-label">READ THE SCHEMATIC FIRST</span><span class="soph-choice-hint">Understand the whole system before touching anything.</span></button>
    </div><div class="soph-nav"><span class="soph-progress">1 / 4</span></div>`);
  document.getElementById('rb-a').onclick = () => { Engine.modifyStats({extracurriculars:1,physique:1}); _flushStatToast(); _robotics_beat2('You torque down the motors. Vasquez: "Even spacing. Good instinct."','+1 EXTRACURRICULARS · +1 PHYSIQUE'); };
  document.getElementById('rb-b').onclick = () => { Engine.modifyStats({extracurriculars:1,gpa:1}); _flushStatToast(); _robotics_beat2('You solder clean joints. The senior next to you stops to watch.','+1 EXTRACURRICULARS · +1 GPA'); };
  document.getElementById('rb-c').onclick = () => { Engine.modifyStats({extracurriculars:1,intelligence:1}); _flushStatToast(); _robotics_beat2('You catch a labeling error nobody else noticed. Vasquez marks it on the board.','+1 EXTRACURRICULARS · +1 INTELLIGENCE'); };
}
function _robotics_beat2(narr, delta) {
  _sophShow(`<div class="soph-badge">ROOM 108 · ROBOTICS TEAM</div>
    <div class="soph-scene"><p>${narr}</p></div><div class="soph-stat-delta">${delta}</div>
    <div class="soph-speaker">MR. VASQUEZ</div><div class="soph-speech">"Next — program the movement logic. Line-following bot. Who wants to take a pass at the code?"</div>
    <div class="soph-prompt">DO YOU VOLUNTEER?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="rb-vol"><span class="soph-choice-label">VOLUNTEER — "I'll try it"</span></button>
      <button class="soph-choice" id="rb-pass"><span class="soph-choice-label">LET SOMEONE ELSE GO FIRST</span></button>
    </div><div class="soph-nav"><span class="soph-progress">2 / 4</span></div>`);
  document.getElementById('rb-vol').onclick  = () => { Engine.modifyStats({extracurriculars:1,stress:1}); _flushStatToast(); _robotics_beat3(true); };
  document.getElementById('rb-pass').onclick = () => { Engine.modifyStats({selfAwareness:1}); _flushStatToast(); _robotics_beat3(false); };
}
function _robotics_beat3(vol) {
  const n = vol ? 'You write a PID loop. The bot oscillates but tracks the line. Vasquez tweaks two constants. "Solid foundation."' : 'You watch Priya write it. You catch a divide-by-zero bug before she runs it. "Nice catch," she says.';
  _sophShow(`<div class="soph-badge">ROOM 108 · ROBOTICS TEAM</div>
    <div class="soph-scene"><p>${n}</p></div>
    <div class="soph-scene"><p>The bot follows the line for a meter then drifts off. Everyone groans, then laughs.</p></div>
    <div class="soph-nav"><span class="soph-progress">3 / 4</span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = _robotics_beat4;
}
function _robotics_beat4() {
  _sophShow(`<div class="soph-badge">ROOM 108 · ROBOTICS TEAM</div>
    <div class="soph-speaker">MR. VASQUEZ</div><div class="soph-speech">"Tuesdays and Thursdays. Regionals is in February. Get comfortable."</div>
    <div class="soph-scene"><p>You stack the chassis parts. The room smells like solder. It's kind of a good smell.</p></div>
    <div class="soph-nav"><span class="soph-progress">4 / 4</span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_robotics_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  FOOTBALL EC
// ════════════════════════════════════════════════════════
window.showFootball_EC = function() { Engine.setFlag('soph_football_started'); _football_beat1(); };
function _football_beat1() {
  _sophShow(`<div class="soph-badge">ATHLETIC FIELD · VARSITY FOOTBALL</div><h1 class="soph-title">FIRST PRACTICE.</h1>
    <div class="soph-speaker">COACH RIVERA</div><div class="soph-speech">"Sprints. Forty yards. I time everyone on day one. Line up."</div>
    <div class="soph-prompt">HOW DO YOU RUN IT?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="fb-a"><span class="soph-choice-label">FULL SEND FROM THE START</span></button>
      <button class="soph-choice" id="fb-b"><span class="soph-choice-label">CONTROLLED BURST — BUILD TO TOP SPEED</span></button>
      <button class="soph-choice" id="fb-c"><span class="soph-choice-label">PACE YOURSELF</span></button>
    </div><div class="soph-nav"><span class="soph-progress">1 / 4</span></div>`);
  document.getElementById('fb-a').onclick = () => { Engine.modifyStats({athleticism:2,physique:1,stress:1}); _flushStatToast(); _football_weights('"5.4 seconds. Close to pulling something." You didn\'t.','+2 ATH · +1 PHY · +1 STRESS'); };
  document.getElementById('fb-b').onclick = () => { Engine.modifyStats({athleticism:1,physique:2}); _flushStatToast(); _football_weights('"5.6. Good form. Do it right every time."','+1 ATH · +2 PHY'); };
  document.getElementById('fb-c').onclick = () => { Engine.modifyStats({selfAwareness:1,athleticism:1}); _flushStatToast(); _football_weights('"6.1. You\'ve got more. We\'ll find it."','+1 SELF-AWR · +1 ATH'); };
}
function _football_weights(narr, delta) {
  _sophShow(`<div class="soph-badge">ATHLETIC FIELD · VARSITY FOOTBALL</div>
    <div class="soph-scene"><p>${narr}</p></div><div class="soph-stat-delta">${delta}</div>
    <div class="soph-speaker">COACH RIVERA</div><div class="soph-speech">"Weight room. Twenty minutes. Bench, squat, core. I want to see your baseline."</div>
    <div class="soph-prompt">HOW DO YOU APPROACH THE WEIGHTS?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="wt-a"><span class="soph-choice-label">PUSH FOR YOUR MAX</span></button>
      <button class="soph-choice" id="wt-b"><span class="soph-choice-label">STRONG BUT SUSTAINABLE</span></button>
    </div><div class="soph-nav"><span class="soph-progress">2 / 4</span></div>`);
  document.getElementById('wt-a').onclick = () => { Engine.modifyStats({physique:2,athleticism:1,sleep:-1}); _flushStatToast(); _football_practice('Numbers you haven\'t touched before. Rivera writes them down. Arms shake for an hour.','+2 PHY · +1 ATH · −1 SLEEP'); };
  document.getElementById('wt-b').onclick = () => { Engine.modifyStats({physique:1,athleticism:1}); _flushStatToast(); _football_practice('Clean reps. Rivera nods once. His version of approval.','+1 PHY · +1 ATH'); };
}
function _football_practice(narr, delta) {
  _sophShow(`<div class="soph-badge">ATHLETIC FIELD · VARSITY FOOTBALL</div>
    <div class="soph-scene"><p>${narr}</p></div><div class="soph-stat-delta">${delta}</div>
    <div class="soph-speaker">COACH RIVERA</div><div class="soph-speech">"Route running. 5-yard out, 10-yard curl, post. Corner is live. Run it clean."</div>
    <div class="soph-prompt">HOW DO YOU RUN THE ROUTE?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="rt-a"><span class="soph-choice-label">SELL THE FAKE — HEAD JUKE INTO THE BREAK</span></button>
      <button class="soph-choice" id="rt-b"><span class="soph-choice-label">RUN IT EXACTLY AS DRAWN</span></button>
    </div><div class="soph-nav"><span class="soph-progress">3 / 4</span></div>`);
  document.getElementById('rt-a').onclick = () => { Engine.modifyStats({athleticism:2,toxicity:1}); _flushStatToast(); _football_end('You sell the fake hard. Corner bites. Rivera whistles twice.','+2 ATH · +1 TOX'); };
  document.getElementById('rt-b').onclick = () => { Engine.modifyStats({athleticism:1,integrity:1}); _flushStatToast(); _football_end('Clean break. Rivera: "That\'s the standard."','+1 ATH · +1 INT'); };
}
function _football_end(narr, delta) {
  _sophShow(`<div class="soph-badge">ATHLETIC FIELD · VARSITY FOOTBALL</div>
    <div class="soph-scene"><p>${narr}</p></div><div class="soph-stat-delta">${delta}</div>
    <div class="soph-scene"><p>Practice ends with conditioning — ten 100-yard gassers. By the showers you can barely lift your arms. But something about it felt right.</p></div>
    <div class="soph-nav"><span class="soph-progress">4 / 4</span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_football_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  STUDIES CLASS 1
// ════════════════════════════════════════════════════════
window.showStudies_Class1 = function() { Engine.setFlag('soph_studies1_started'); _studies1_beat1(); };
function _studies1_beat1() {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div><h1 class="soph-title">FIRST DAY.</h1>
    <div class="soph-speaker">MR. NGUYEN</div><div class="soph-speech">"New seats today. Gets you out of your comfort zone."</div>
    <div class="soph-scene"><p>You find your name. Row three, second from the left. You sit. And then — <em>they</em> sit next to you.</p></div>
    <div class="soph-nav"><span class="soph-progress">1 / 5</span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = _studies1_beat2;
}
function _studies1_beat2() {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>You've seen them around. The kind of person you've looked at twice and then pretended you hadn't.</p></div>
    <div class="soph-speaker">MR. NGUYEN</div><div class="soph-speech">"Turn to the person next to you. Thirty seconds. Learn their name and one thing you have in common. Go."</div>
    <div class="soph-prompt">WHAT DO YOU SAY FIRST?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="st-a"><span class="soph-choice-label">"HEY — I'M ${player.name || 'ME'}."</span></button>
      <button class="soph-choice" id="st-b"><span class="soph-choice-label">"YOU HAVE THAT CLASS WITH MR. CHEN, RIGHT?"</span></button>
      <button class="soph-choice" id="st-c"><span class="soph-choice-label">WAIT FOR THEM TO GO FIRST</span></button>
    </div><div class="soph-nav"><span class="soph-progress">2 / 5</span></div>`);
  document.getElementById('st-a').onclick = () => { Engine.modifyStats({relationships:1,integrity:1}); _flushStatToast(); _studies1_beat3('"Oh — yeah. Hey." They smile once. Something shifted.'); };
  document.getElementById('st-b').onclick = () => { Engine.modifyStats({relationships:1,selfAwareness:1}); _flushStatToast(); _studies1_beat3('"Yeah, Chen is brutal." You both laugh. Nguyen says time.'); };
  document.getElementById('st-c').onclick = () => { Engine.modifyStats({selfAwareness:1}); _flushStatToast(); _studies1_beat3('"I\'m Jordan." You give your name back.'); };
}
function _studies1_beat3(narr) {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>${narr}</p></div>
    <div class="soph-speaker">MR. NGUYEN</div><div class="soph-speech">"Open to page 44. I want a thesis from every pair by the end of class."</div>
    <div class="soph-prompt">HOW DO YOU WORK WITH THEM?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="st2-a"><span class="soph-choice-label">TAKE THE LEAD</span></button>
      <button class="soph-choice" id="st2-b"><span class="soph-choice-label">ASK WHAT THEY THINK FIRST</span></button>
      <button class="soph-choice" id="st2-c"><span class="soph-choice-label">SPLIT THE WORK</span></button>
    </div><div class="soph-nav"><span class="soph-progress">3 / 5</span></div>`);
  document.getElementById('st2-a').onclick = () => { Engine.modifyStats({gpa:1,relationships:-1}); _flushStatToast(); _studies1_beat4('You drive. Strong thesis but they seem distant.','+1 GPA · −1 REL'); };
  document.getElementById('st2-b').onclick = () => { Engine.modifyStats({relationships:2,gpa:1}); _flushStatToast(); _studies1_beat4('Their angle is better than yours. The thesis is good. So is the conversation.','+2 REL · +1 GPA'); };
  document.getElementById('st2-c').onclick = () => { Engine.modifyStats({gpa:1}); _flushStatToast(); _studies1_beat4('Efficient. Professional. Transactional.','+1 GPA'); };
}
function _studies1_beat4(narr, delta) {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>${narr}</p></div><div class="soph-stat-delta">${delta||''}</div>
    <div class="soph-speaker">JORDAN</div><div class="soph-speech">"Same seats next class, right?"</div>
    <div class="soph-choices">
      <button class="soph-choice" id="st3-a"><span class="soph-choice-label">"YEAH. SEE YOU THEN."</span></button>
      <button class="soph-choice" id="st3-b"><span class="soph-choice-label">"THAT WASN'T AS BAD AS I THOUGHT."</span></button>
      <button class="soph-choice" id="st3-c"><span class="soph-choice-label">JUST SMILE AND NOD</span></button>
    </div><div class="soph-nav"><span class="soph-progress">4 / 5</span></div>`);
  document.getElementById('st3-a').onclick = () => { Engine.modifyStats({relationships:1}); _flushStatToast(); _studies1_beat5('They smile once before the door closes.'); };
  document.getElementById('st3-b').onclick = () => { Engine.modifyStats({relationships:2}); _flushStatToast(); _studies1_beat5('They actually laugh. "Same." Then they\'re gone. The day feels different.'); };
  document.getElementById('st3-c').onclick = () => { _studies1_beat5('They give you one look and leave.'); };
}
function _studies1_beat5(narr) {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>${narr}</p></div>
    <div class="soph-nav"><span class="soph-progress">5 / 5</span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_studies1_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  STUDIES CLASS 2 — Group project
// ════════════════════════════════════════════════════════
window.showStudies_Class2 = function() { Engine.setFlag('soph_studies2_started'); _studies2_beat1(); };
function _studies2_beat1() {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD — WEEK 3</div><h1 class="soph-title">GROUP DAY.</h1>
    <div class="soph-scene"><p>Different seats. Jordan is across the room. Your group: Tyler (hasn't opened his notebook), Camille (visibly on her phone), Devon (shrugged when groups were announced).</p></div>
    <div class="soph-speaker">MR. NGUYEN</div><div class="soph-speech">"Thirty minutes. Outline the project. I'm walking around."</div>
    <div class="soph-nav"><span class="soph-progress">1 / 4</span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = _studies2_beat2;
}
function _studies2_beat2() {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>Five minutes in. Tyler is talking about something unrelated. Camille contributed two words. Devon is staring at the wall. The outline is blank. 25 minutes left.</p></div>
    <div class="soph-prompt">WHAT DO YOU DO?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="gp-a"><span class="soph-choice-label">JUST DO IT YOURSELF</span><span class="soph-choice-hint">Write the whole outline. At least it gets done.</span></button>
      <button class="soph-choice" id="gp-b"><span class="soph-choice-label">TELL MR. NGUYEN YOUR GROUP ISN'T WORKING</span></button>
      <button class="soph-choice" id="gp-c"><span class="soph-choice-label">ASSIGN TASKS OUT LOUD</span><span class="soph-choice-hint">"Tyler, intro. Camille, section two." Make it direct.</span></button>
    </div><div class="soph-nav"><span class="soph-progress">2 / 4</span></div>`);
  document.getElementById('gp-a').onclick = () => { Engine.modifyStats({gpa:1,stress:2,integrity:-1}); _flushStatToast(); _studies2_beat3('You write everything. Nguyen glances at you. He knows. The outline is the best in the room. You\'re also furious.','+1 GPA · +2 STRESS · −1 INT'); };
  document.getElementById('gp-b').onclick = () => { Engine.modifyStats({integrity:2,stress:-1,toxicity:1}); _flushStatToast(); _studies2_beat3('Nguyen comes over. Doesn\'t say anything — just watches. Suddenly everyone has opinions.','+2 INT · −1 STRESS · +1 TOX'); };
  document.getElementById('gp-c').onclick = () => { Engine.modifyStats({friendships:1,extracurriculars:1,stress:1}); _flushStatToast(); _studies2_beat3('"Tyler — intro. Camille — sources. Devon — conclusion." It works. Barely.','+1 FRND · +1 EC · +1 STRESS'); };
}
function _studies2_beat3(narr, delta) {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>${narr}</p></div>
    <div class="soph-nav"><span class="soph-progress">3 / 4</span><button class="btn-primary" id="soph-next">NEXT →</button></div>`);
  document.getElementById('soph-next').onclick = _studies2_beat4;
}
function _studies2_beat4() {
  _sophShow(`<div class="soph-badge">ROOM 119 · STUDIES PERIOD</div>
    <div class="soph-scene"><p>Bell rings. Jordan catches your eye from across the room and mouths: <em>"how was your group?"</em></p><p>You make a face. They laugh.</p></div>
    <div class="soph-nav"><span class="soph-progress">4 / 4</span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_studies2_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  PHYSICS CLASS 1 — EGG DROP
// ════════════════════════════════════════════════════════
window.showPhysics_Class1 = function() { Engine.setFlag('soph_physics1_started'); _phys1_intro(); };
function _phys1_intro() {
  _sophShow(`<div class="soph-badge">ROOM 203 · AP PHYSICS 1</div><h1 class="soph-title">EGG DROP DAY.</h1>
    <div class="soph-scene"><p>Ms. Torres is standing on a desk holding a raw egg. She's smiling in a way that should concern you.</p></div>
    <div class="soph-speaker">MS. TORRES</div><div class="soph-speech">"You design a protective device. It drops from the second-floor balcony. Egg survives — full marks. Egg dies — partial. No device — zero."</div>
    <div class="soph-scene"><p>Materials table: bubble wrap, straws, rubber bands, cotton balls, a plastic bag, cardboard, tape, foam pieces.</p></div>
    <div class="soph-nav"><span class="soph-progress">Build Phase</span><button class="btn-primary" id="soph-next">START BUILDING →</button></div>`);
  document.getElementById('soph-next').onclick = _phys1_build;
}
let _eggScore = 0;
function _phys1_build() {
  _eggScore = 0;
  _sophShow(`<div class="soph-badge">ROOM 203 — EGG DROP · BUILD PHASE</div>
    <div class="soph-prompt">OUTER CASING:</div>
    <div class="soph-choices">
      <button class="soph-choice" data-pts="3"><span class="soph-choice-label">BUBBLE WRAP + TAPE (double layer)</span></button>
      <button class="soph-choice" data-pts="2"><span class="soph-choice-label">CARDBOARD BOX</span></button>
      <button class="soph-choice" data-pts="1"><span class="soph-choice-label">PLASTIC BAG</span></button>
    </div><div class="soph-nav"><span class="soph-progress">Step 1 / 3</span></div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { _eggScore += parseInt(b.dataset.pts); _phys1_build2(); }; });
}
function _phys1_build2() {
  _sophShow(`<div class="soph-badge">ROOM 203 — EGG DROP · BUILD PHASE</div>
    <div class="soph-prompt">CUSHIONING:</div>
    <div class="soph-choices">
      <button class="soph-choice" data-pts="3"><span class="soph-choice-label">COTTON BALLS (packed tight)</span></button>
      <button class="soph-choice" data-pts="2"><span class="soph-choice-label">FOAM PIECES</span></button>
      <button class="soph-choice" data-pts="1"><span class="soph-choice-label">STRAWS (crumple zone)</span></button>
    </div><div class="soph-nav"><span class="soph-progress">Step 2 / 3</span></div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { _eggScore += parseInt(b.dataset.pts); _phys1_build3(); }; });
}
function _phys1_build3() {
  _sophShow(`<div class="soph-badge">ROOM 203 — EGG DROP · BUILD PHASE</div>
    <div class="soph-prompt">LANDING SYSTEM:</div>
    <div class="soph-choices">
      <button class="soph-choice" data-pts="3"><span class="soph-choice-label">PARACHUTE (plastic bag + rubber bands)</span></button>
      <button class="soph-choice" data-pts="2"><span class="soph-choice-label">RUBBER BAND SHOCK ABSORBERS</span></button>
      <button class="soph-choice" data-pts="0"><span class="soph-choice-label">NOTHING — THE CUSHION IS ENOUGH</span></button>
    </div><div class="soph-nav"><span class="soph-progress">Step 3 / 3</span></div>`);
  document.querySelectorAll('#soph-inner .soph-choice').forEach(b => { b.onclick = () => { _eggScore += parseInt(b.dataset.pts); _phys1_drop(); }; });
}
function _phys1_drop() {
  const survived = _eggScore >= 6, partial = _eggScore >= 4;
  const gpaD = survived ? 2 : partial ? 1 : -1;
  Engine.modifyStats({ gpa: gpaD, stress: survived ? -1 : 1, extracurriculars: 1 }); _flushStatToast();
  _sophShow(`<div class="soph-badge">ROOM 203 — EGG DROP · THE DROP</div>
    <div class="soph-scene"><p>Torres lines everyone up at the balcony. Three seconds of freefall.</p></div>
    <div class="soph-scene" style="font-size:22px;text-align:center;padding:12px 0;color:${survived?'#6bcb77':partial?'#f7b731':'#fc7b54'}">
      ${survived ? '✓ EGG SURVIVED.' : partial ? '~ EGG CRACKED — PARTIAL CREDIT.' : '✗ EGG DESTROYED.'}
    </div>
    <div class="soph-scene"><p>${survived?'"Excellent engineering. Full marks."':partial?'"Close. Cracked but intact for half credit."':'"Spectacular. Wrong kind. But still." The class laughs.'}</p></div>
    <div class="soph-stat-delta ${gpaD>=0?'':'neg'}">GPA ${gpaD>=0?'+':''}${gpaD} · +1 EC</div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_physics1_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  PHYSICS CLASS 2 — GREAT AMERICA FIELD TRIP
// ════════════════════════════════════════════════════════
window.showPhysics_FieldTrip = function() { Engine.setFlag('soph_physics_trip_started'); _fieldtrip_intro(); };
function _fieldtrip_intro() {
  _sophShow(`<div class="soph-badge">WESTBROOK HIGH · AP PHYSICS 1</div><h1 class="soph-title">SURPRISE.</h1>
    <div class="soph-speaker">MS. TORRES</div><div class="soph-speech">"Field trip. Friday. Great America. Permission slips due tomorrow. This is a physics lab — but yes, you can ride the rides."</div>
    <div class="soph-nav"><span class="soph-progress">Friday morning.</span><button class="btn-primary" id="soph-next">ARRIVE AT GREAT AMERICA →</button></div>`);
  document.getElementById('soph-next').onclick = _fieldtrip_park;
}
function _fieldtrip_park() {
  _sophShow(`<div class="soph-badge">GREAT AMERICA — SANTA CLARA, CA</div><h1 class="soph-title" style="color:#f7b731">YOU'RE HERE.</h1>
    <div class="soph-scene"><p>Torres gives you a worksheet and says "meet at the front gate at 3:45, no exceptions." Then she basically lets you go.</p></div>
    <div style="margin:18px 0"><canvas id="ga-map" width="520" height="300" style="border:1px solid rgba(200,180,120,0.3);border-radius:6px;display:block;cursor:pointer;max-width:100%"></canvas></div>
    <div id="ga-ride-info" style="min-height:50px;font-size:13px;color:#c8bfa8;padding:6px 0"></div>
    <div class="soph-nav"><span class="soph-progress">Click a ride to visit it (visit at least 2).</span><button class="btn-primary" id="ga-done-btn" disabled>HEAD BACK →</button></div>`);
  _buildGAMap();
}
const GA_RIDES = [
  { id:'demon',     label:'The Demon',    x:50,  y:40,  w:100,h:55, color:'#8B2020', desc:'Classic steel coaster. Four inversions. 3.5g.',         stats:{athleticism:1,stress:1,happiness:2} },
  { id:'gold',      label:'Gold Striker', x:190, y:35,  w:110,h:60, color:'#8B6914', desc:'Tallest wooden coaster on the West Coast. 103 ft drop.', stats:{athleticism:2,stress:2,happiness:3} },
  { id:'flight',    label:'Flight Deck',  x:340, y:40,  w:110,h:55, color:'#1a4a7a', desc:'Inverted coaster. Feet dangle. 4g on the loop.',         stats:{athleticism:2,stress:3,happiness:2,sleep:-1} },
  { id:'log',       label:'Loggers Run',  x:50,  y:155, w:100,h:55, color:'#2a6e2a', desc:'Log flume. A 45-foot plunge. You will get soaked.',       stats:{happiness:2,stress:-1} },
  { id:'skytower',  label:'Sky Tower',    x:190, y:160, w:100,h:55, color:'#4a3a8a', desc:'Observation tower. 30 seconds up. View of the whole bay.',stats:{selfAwareness:2,stress:-2,happiness:1} },
  { id:'vortex',    label:'Vortex',       x:340, y:155, w:110,h:55, color:'#7a3a20', desc:'Stand-up coaster. Your quads will not thank you.',        stats:{athleticism:2,physique:1,stress:2} },
];
let _gaVisited = new Set();
function _buildGAMap() {
  const canvas = document.getElementById('ga-map');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function draw() {
    ctx.fillStyle = '#0d1520'; ctx.fillRect(0,0,520,300);
    ctx.strokeStyle = 'rgba(200,180,100,0.15)'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(260,0); ctx.lineTo(260,300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,135); ctx.lineTo(520,135); ctx.stroke();
    ctx.fillStyle='rgba(201,145,58,0.6)'; ctx.font='bold 10px monospace'; ctx.fillText('GREAT AMERICA — SANTA CLARA',10,268);
    GA_RIDES.forEach(r => {
      const vis = _gaVisited.has(r.id);
      ctx.fillStyle = vis ? r.color+'55' : r.color;
      ctx.strokeStyle = vis ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)';
      ctx.lineWidth = vis ? 1 : 2;
      _gaRRect(ctx,r.x,r.y,r.w,r.h,5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = vis ? 'rgba(255,255,255,0.35)' : '#fff';
      ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      const words = r.label.split(' ');
      words.forEach((w,i) => ctx.fillText(w, r.x+r.w/2, r.y+r.h/2-(words.length-1)*6+i*13));
      if (vis) { ctx.fillStyle='#6bcb77'; ctx.font='13px sans-serif'; ctx.fillText('✓',r.x+r.w-10,r.y+14); }
      ctx.textAlign='left';
    });
  }
  draw();
  canvas.onclick = e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX-rect.left)*(520/rect.width), my = (e.clientY-rect.top)*(300/rect.height);
    const hit = GA_RIDES.find(r => mx>=r.x&&mx<=r.x+r.w&&my>=r.y&&my<=r.y+r.h);
    if (!hit || _gaVisited.has(hit.id)) return;
    const info = document.getElementById('ga-ride-info');
    if (info) info.innerHTML = `<strong style="color:#f7b731">${hit.label}</strong> — ${hit.desc}<br><span style="color:#6bcb77;font-size:11px;font-family:monospace">${Object.entries(hit.stats).map(([k,v])=>`${v>0?'+':''}${v} ${STAT_LABELS[k]||k}`).join(' · ')}</span>`;
    Object.entries(hit.stats).forEach(([k,v]) => Engine.modifyStat(k,v)); _flushStatToast();
    _gaVisited.add(hit.id); draw();
    const btn = document.getElementById('ga-done-btn'); if (btn && _gaVisited.size >= 2) btn.disabled = false;
  };
  document.getElementById('ga-done-btn').onclick = () => {
    Engine.modifyStats({happiness:2,stress:-1}); _flushStatToast();
    Engine.setFlag('soph_physics_trip_done'); _sophHide(() => safeEventCheck());
  };
}
function _gaRRect(ctx,x,y,w,h,r) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// ════════════════════════════════════════════════════════
//  BRAWL STARS EC (ESPORTS)
// ════════════════════════════════════════════════════════
window.showBrawlStars_EC = function() { Engine.setFlag('soph_brawl_started'); _brawl_intro(); };
window._brawlTournamentOnly = function() {
  Engine.setFlag('brawl_tournament');
  _sophShow(`<div class="soph-badge">BRAWL STARS TOURNAMENT · BRACKET OPENS</div><h1 class="soph-title">LET'S GO.</h1>
    <div class="soph-scene"><p>32 players. Single elimination. Okafor pulls up the bracket on his phone. Your first-round opponent: ranked 14th in the region.</p></div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="brawl-go">START ROUND 1 →</button></div>`);
  document.getElementById('brawl-go').onclick = () => _brawl_tournament(1, 32);
};
const _RPS = ['ROCK','PAPER','SCISSORS'];
function _rpsWin(p,c) { if(p===c) return 'tie'; if((p==='ROCK'&&c==='SCISSORS')||(p==='PAPER'&&c==='ROCK')||(p==='SCISSORS'&&c==='PAPER')) return 'win'; return 'lose'; }
function _brawl_intro() {
  _sophShow(`<div class="soph-badge">ROOM 102 · ESPORTS CLUB</div><h1 class="soph-title">AFTER SCHOOL.</h1>
    <div class="soph-scene"><p>Mr. Okafor's room has six gaming stations. It smells like energy drinks. You join the Brawl Stars team.</p></div>
    <div class="soph-speaker">MR. OKAFOR</div><div class="soph-speech">"There's a 32-player single elimination tournament this Saturday. Online. You want in?"</div>
    <div class="soph-prompt">DO YOU ENTER?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="brawl-yes"><span class="soph-choice-label">YES — COMPETE</span><span class="soph-choice-hint">32-player bracket. Win rounds, earn more stats.</span></button>
      <button class="soph-choice" id="brawl-no"><span class="soph-choice-label">NO — JUST PRACTICE</span><span class="soph-choice-hint">Less pressure. Half the gains.</span></button>
    </div>`);
  document.getElementById('brawl-yes').onclick = () => { Engine.setFlag('brawl_tournament'); _brawl_tournament(1,32); };
  document.getElementById('brawl-no').onclick  = () => {
    Engine.modifyStats({extracurriculars:1,intelligence:1}); _flushStatToast();
    _sophShow(`<div class="soph-badge">ESPORTS CLUB — PRACTICE</div><div class="soph-scene"><p>Scrimmages for two hours. Solid practice.</p></div><div class="soph-stat-delta">+1 EC · +1 INT</div><div class="soph-nav"><span></span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
    document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_brawl_done'); _sophHide(() => safeEventCheck()); };
  };
}
function _brawl_tournament(round, remaining) {
  const names = {1:'ROUND OF 32',2:'ROUND OF 16',4:'QUARTERFINALS',8:'SEMIFINALS',16:'GRAND FINAL'};
  const cpu = _RPS[Math.floor(Math.random()*3)];
  _sophShow(`<div class="soph-badge">BRAWL STARS · ${names[round]||'ROUND '+round}</div>
    <div class="soph-scene"><p>${remaining} players remain. Your opponent loads in.</p></div>
    <div class="soph-prompt">YOUR MOVE:</div>
    <div class="soph-choices">${_RPS.map(o=>`<button class="soph-choice rps-btn" data-pick="${o}"><span class="soph-choice-label">${o}</span></button>`).join('')}</div>`);
  document.querySelectorAll('.rps-btn').forEach(b => {
    b.onclick = () => {
      const r = _rpsWin(b.dataset.pick, cpu);
      if (r==='win') _brawl_roundWin(round, remaining, b.dataset.pick, cpu);
      else if (r==='tie') _brawl_tournament(round, remaining);
      else _brawl_roundLose(round, b.dataset.pick, cpu);
    };
  });
}
function _brawl_roundWin(round, remaining, pick, cpu) {
  Engine.modifyStats({extracurriculars:1,intelligence:1,friendships:1}); _flushStatToast();
  const nextRound = round*2, nextRemaining = Math.floor(remaining/2), isFinal = nextRound > 16;
  _sophShow(`<div class="soph-badge">BRAWL STARS · WIN</div>
    <div class="soph-scene"><p><strong style="color:#f7b731">${pick}</strong> beats <strong style="color:#fc7b54">${cpu}</strong>. ${isFinal?'You win the tournament. The chat explodes. Okafor stands up from his desk.':`You advance. ${nextRemaining} players left.`}</p></div>
    <div class="soph-stat-delta">+1 EC · +1 INT · +1 FRIENDSHIPS</div>
    <div class="soph-nav"><span></span>${isFinal?`<button class="btn-primary" id="brawl-done">CLAIM VICTORY →</button>`:`<button class="btn-primary" id="brawl-next">NEXT ROUND →</button>`}</div>`);
  if (isFinal) {
    document.getElementById('brawl-done').onclick = () => { Engine.modifyStats({extracurriculars:2,friendships:2,intelligence:2}); _flushStatToast(); Engine.setFlag('brawl_champion'); Engine.setFlag('soph_brawl_done'); _sophHide(() => safeEventCheck()); };
  } else {
    document.getElementById('brawl-next').onclick = () => _brawl_tournament(nextRound, nextRemaining);
  }
}
function _brawl_roundLose(round, pick, cpu) {
  Engine.modifyStats({extracurriculars:1,intelligence:1}); _flushStatToast();
  _sophShow(`<div class="soph-badge">BRAWL STARS · ELIMINATED</div>
    <div class="soph-scene"><p><strong style="color:#f7b731">${pick}</strong> loses to <strong style="color:#6bcb77">${cpu}</strong>. ${Math.log2(round)===0?'First round exit.':'You made it ' + Math.log2(round+1) + ' rounds in. That\'s something.'}</p></div>
    <div class="soph-stat-delta">+1 EC · +1 INT</div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('soph_brawl_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  FITNESS JOURNEY
// ════════════════════════════════════════════════════════
window.showFitnessJourney = function() { Engine.setFlag('fitness_started'); _fitness_offer(); };
function _fitness_offer() {
  _sophShow(`<div class="soph-badge">WESTBROOK HIGH · GYM</div><h1 class="soph-title">THE GYM.</h1>
    <div class="soph-scene"><p>Coach Rivera stops you after PE. "You've got potential. The weight room's open after school Monday through Thursday. It's not required. But you can tell who uses it."</p></div>
    <div class="soph-prompt">DO YOU WANT TO START GOING TO THE GYM?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="fit-yes"><span class="soph-choice-label">YES — START A ROUTINE</span></button>
      <button class="soph-choice" id="fit-no"><span class="soph-choice-label">NOT RIGHT NOW</span></button>
    </div>`);
  document.getElementById('fit-yes').onclick = _fitness_commitment;
  document.getElementById('fit-no').onclick   = () => { _sophHide(() => safeEventCheck()); };
}
function _fitness_commitment() {
  _sophShow(`<div class="soph-badge">WESTBROOK HIGH · GYM</div>
    <div class="soph-prompt">HOW MUCH TIME CAN YOU COMMIT?</div>
    <div class="soph-choices">
      <button class="soph-choice" id="fit-low"><span class="soph-choice-label">LOW — 1 day/week</span><span class="soph-choice-hint">Easy to keep. Slow gains.</span></button>
      <button class="soph-choice" id="fit-med"><span class="soph-choice-label">MEDIUM — 3 days/week</span><span class="soph-choice-hint">Balanced. Visible results in a month.</span></button>
      <button class="soph-choice" id="fit-high"><span class="soph-choice-label">HIGH — 5 days/week</span><span class="soph-choice-hint">Serious. Costs time and energy.</span></button>
    </div>`);
  document.getElementById('fit-low').onclick  = () => _fitness_workout('low');
  document.getElementById('fit-med').onclick  = () => _fitness_workout('medium');
  document.getElementById('fit-high').onclick = () => _fitness_workout('high');
}
function _fitness_workout(level) {
  const o = { low:{stats:{physique:1,athleticism:1},narr:'One session a week. Your energy levels up slightly after a month.'}, medium:{stats:{physique:2,athleticism:2,sleep:1,stress:-1},narr:'Three days a week. You see actual change. Your sleep improves too.'}, high:{stats:{physique:3,athleticism:3,sleep:-1,stress:2},narr:'Five days a week. Best shape of your life. Also exhausted.'} }[level];
  Engine.modifyStats(o.stats); _flushStatToast();
  _sophShow(`<div class="soph-badge">WESTBROOK HIGH · GYM</div>
    <div class="soph-scene"><p>${o.narr}</p></div>
    <div class="soph-stat-delta">${Object.entries(o.stats).map(([k,v])=>`${v>0?'+':''}${v} ${STAT_LABELS[k]||k}`).join(' · ')}</div>
    <div class="soph-nav"><span></span><button class="btn-primary" id="soph-done">CONTINUE →</button></div>`);
  document.getElementById('soph-done').onclick = () => { Engine.setFlag('fitness_done'); _sophHide(() => safeEventCheck()); };
}

// ════════════════════════════════════════════════════════
//  SOPHOMORE YEAR END
// ════════════════════════════════════════════════════════
window.showSophYearEnd = function() {
  const start = window.MYTH_START_STATS || {}, cur = Engine.getState().stats;
  _sophShow(`<div class="soph-badge">WESTBROOK HIGH SCHOOL · END OF SOPHOMORE YEAR</div><h1 class="soph-title">SOPHOMORE YEAR DONE.</h1>
    <div class="soph-scene"><p>Two years in. You know the campus now — the rhythms, the people, the unspoken rules. Something changed this year.</p></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 28px;margin:18px 0">
      ${Object.entries(cur).map(([k,v]) => {
        const d = Math.round((v-(start[k]??v))*10)/10;
        const pct = v/10*100, bc = pct>=80?'#6bcb77':pct>=50?'#f7b731':'#fc7b54';
        return `<div><div style="display:flex;justify-content:space-between;font-family:monospace;font-size:10px;color:#a89878;margin-bottom:3px"><span>${STAT_LABELS[k]}</span><span style="color:${bc}">${v.toFixed(1)}${d!==0?` <span style="color:${d>0?'#6bcb77':'#fc7b54'}">(${d>0?'+':''}${d})</span>`:''}</span></div><div style="background:rgba(255,255,255,0.08);border-radius:2px;height:4px"><div style="width:${pct}%;height:100%;background:${bc};border-radius:2px"></div></div></div>`;
      }).join('')}
    </div>
    <div class="soph-nav" style="margin-top:24px"><span class="soph-progress">JUNIOR YEAR AWAITS.</span><button class="btn-primary" id="soph-yr-done">ENTER JUNIOR YEAR →</button></div>`);
  document.getElementById('soph-yr-done').onclick = () => {
    window.MYTH_START_STATS = Object.assign({}, Engine.getState().stats);
    Engine.setFlag('sophomore_year_complete'); Engine.forceGradeUp(); updateHUD();
    _sophHide(() => safeEventCheck());
  };
};

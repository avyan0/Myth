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

  const transEl = document.getElementById('scene-transition');
  transEl.classList.remove('active');
  transEl.style.opacity = '0';

  showScene('scene-game', () => {
    Engine.on('stat_change',    ()               => refreshStatsSidebar());
    Engine.on('period_change',  ()               => { updateHUD(); safeEventCheck(); });
    Engine.on('grade_up',       ({ to })         => showGradeUnlock(to));
    Engine.on('npc_talk',       ({ npc, node })  => openDialogue(npc, node));
    Engine.on('dialogue_close', ()               => closeDialogueBox());

    Engine.goTo('gym');
    updateHUD();
    wireGameButtons();

    // Launch Three.js 3D world (showOrientationOverlay called from inside world3d.js after load)
    requestAnimationFrame(() => {
      initWorld3D(player);
    });
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
      window.MYTH_ORIENTATION_ACTIVE   = false;
      window.MYTH_FRESHMAN_RESTRICTION = false;  // full campus unlocked after orientation
      Engine.setFlag('orientation_complete');
      refreshStatsSidebar();
      if (window.MYTH_WORLD3D_CANVAS) window.MYTH_WORLD3D_CANVAS.requestPointerLock();
      setTimeout(safeEventCheck, 400);
      // Staggered hints nudging player to find the club fair
      setTimeout(() => {
        if (window.MYTH_SHOW_NOTIF) window.MYTH_SHOW_NOTIF('Overheard: "There\'s a club fair somewhere on campus today..."');
      }, 3500);
      setTimeout(() => {
        if (window.MYTH_SHOW_NOTIF) window.MYTH_SHOW_NOTIF('Someone mentions seeing signs posted south of the gym.');
      }, 9000);
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
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; CLUB FAIR</div>
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
      },
    });
  }
  function _cfDoneKH(e) { if (e.key === 'Enter') _doDone(); }
  document.addEventListener('keydown', _cfDoneKH);
  document.getElementById('cf-done-btn').addEventListener('click', _doDone, { once: true });
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
  inner.innerHTML = `
    <div class="bio-transition">
      <div class="or-badge">WESTBROOK HIGH SCHOOL</div>
      <div class="bio-trans-period">PERIOD 1</div>
      <div class="bio-trans-subject">BIOLOGY</div>
      <div class="bio-trans-room">Building C · Room 102</div>
      <div class="bio-trans-line"></div>
      <p class="bio-trans-note">You make your way across campus to the biology building. The antiseptic smell hits before you even open the door. Five dissection trays sit covered on the lab tables.</p>
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

  // Phase 1: Volleyball intro
  inner.innerHTML = `
    <div class="pe-intro-scene">
      <div class="pe-gym-view">
        <div class="pe-net"></div>
        <div class="pe-court-lines"></div>
        <div class="pe-players">
          ${Array.from({length:6},(_,i)=>`<div class="pe-player" style="--pi:${i}"></div>`).join('')}
        </div>
        <div class="pe-ball" id="pe-ball"></div>
      </div>
      <div class="pe-intro-text">
        <div class="or-badge">PERIOD 4 · PE — GYMNASIUM</div>
        <p>Coach Williams has the volleyball nets up. The gym still smells faintly of Bio. Energy is loose — people are relieved after whatever happened in their morning classes.</p>
        <p>You're at the net for your team. The ball comes over. You set it perfectly. Someone spikes it. The other side scrambles.</p>
        <p class="pe-good-moment">For a moment, everything feels completely normal.</p>
      </div>
    </div>
  `;
  G.from(inner, { opacity: 0, duration: 0.7 });

  setTimeout(() => runBombThreat(), 4500);

  function runBombThreat() {
    // PA crackle effect
    inner.innerHTML = `
      <div class="threat-scene" id="threat-scene">
        <div class="threat-alert-bar" id="threat-bar">
          <span class="threat-bar-text">⚠ EMERGENCY BROADCAST ⚠</span>
        </div>
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

    const pa   = document.getElementById('threat-pa');
    const story = document.getElementById('threat-story');

    const sequence = [
      {
        delay: 0,
        pa: '[PA CRACKLE]',
        text: null,
        effect: 'crackle',
      },
      {
        delay: 1200,
        pa: '"ATTENTION ALL WESTBROOK HIGH STUDENTS AND STAFF — A CREDIBLE THREAT HAS BEEN RECEIVED AT THIS FACILITY. THIS IS A LOCKDOWN. THIS IS NOT A DRILL. ALL STUDENTS REPORT TO SECURE LOCATIONS IMMEDIATELY."',
        text: null,
        effect: 'alarm',
      },
      {
        delay: 4200,
        pa: null,
        text: 'The gym lights cut to half. Someone hits the main breaker. The air changes. Coach Williams is already moving — no hesitation.',
        effect: 'dim',
      },
      {
        delay: 6800,
        pa: null,
        text: '"CORNER — NORTHEAST — NOW!" Thirty students compress into the space under the emergency exit sign. Everyone moves fast. Nobody argues.',
        effect: 'corner',
      },
      {
        delay: 9200,
        pa: null,
        text: 'You find space behind the bleacher support, next to a rolled-up wrestling mat. The floor is cold through your shorts. You pull your knees in.',
        effect: 'hide',
      },
      {
        delay: 11500,
        pa: null,
        text: 'Nobody speaks above a whisper. One girl is crying quietly. Someone\'s hands are shaking — maybe yours.',
        effect: null,
      },
      {
        delay: 14000,
        pa: '[41 MINUTES LATER]',
        text: null,
        effect: 'time',
      },
      {
        delay: 15200,
        pa: null,
        text: 'The all-clear sounds. A handwritten note was found in a locker — a prank, almost certainly. But the SWAT team swept the building anyway. Two police dogs. The works.',
        effect: 'clear',
      },
      {
        delay: 17800,
        pa: null,
        text: 'You walk out into the afternoon. The grass looks too bright. Your legs feel like they belong to someone else. You don\'t talk to anyone on the way to the parking lot.',
        effect: null,
      },
    ];

    let seqIdx = 0;
    function runSeq(i) {
      const s = sequence[i];
      if (s.pa) {
        pa.textContent = s.pa;
        pa.className = 'threat-pa' + (s.effect === 'crackle' ? ' crackle' : s.effect === 'time' ? ' time-stamp' : ' lockdown-msg');
        G.from(pa, { opacity: 0, duration: 0.4 });
      }
      if (s.text) {
        const d = document.createElement('div');
        d.className = 'threat-beat';
        d.textContent = s.text;
        story.appendChild(d);
        G.from(d, { opacity: 0, y: 8, duration: 0.5 });
      }
      // Visual effects
      const scene = document.getElementById('threat-scene');
      if (s.effect === 'alarm' && scene) scene.classList.add('alarm-active');
      if (s.effect === 'dim'   && scene) scene.classList.add('lights-dimmed');
      if (s.effect === 'corner') {
        const cs = document.getElementById('corner-students');
        if (cs) cs.classList.add('huddled');
        const py = document.getElementById('player-you');
        if (py) py.classList.add('hiding');
      }
      if (s.effect === 'clear' && scene) {
        scene.classList.remove('alarm-active');
        scene.classList.add('all-clear');
      }

      if (i + 1 < sequence.length) {
        const nextDelay = sequence[i + 1].delay - s.delay;
        setTimeout(() => runSeq(i + 1), nextDelay);
      } else {
        setTimeout(showPEResult, 2400);
      }
    }
    runSeq(0);
  }

  function showPEResult() {
    const inner2 = overlay.querySelector('.pe-inner');
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
    G.from(inner2.querySelector('.pe-result-screen'), { opacity: 0, y: 20, duration: 0.5 });

    if (typeof Engine !== 'undefined') {
      Engine.modifyStats({ happiness: -2.0, intelligence: 0.5, friendships: 0.3 });
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
          window.MYTH_PE_DONE            = true;
          window.MYTH_ORIENTATION_ACTIVE = false;
          refreshStatsSidebar();
          if (window.MYTH_WORLD3D_CANVAS) window.MYTH_WORLD3D_CANVAS.requestPointerLock();
        },
      });
    }
    function _pekh(e) { if (e.key === 'Enter') _done(); }
    document.addEventListener('keydown', _pekh);
    document.getElementById('pe-done-btn').addEventListener('click', _done, { once: true });
  }
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

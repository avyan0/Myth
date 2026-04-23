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
    gpa:            5,
    friendships:    3,
    relationships:  2,
    toxicity:       1,
    looks:          5,
    physique:       5,
    athleticism:    4,
    extracurriculars: 2,
    culturality:    3,
    integrity:      7,
    stress:         3,
    wealth:         5,
    selfAwareness:  4,
    sleep:          6,
  }
};

const STAT_LABELS = {
  gpa:              'GPA',
  friendships:      'FRIENDSHIPS',
  relationships:    'RELATIONSHIPS',
  toxicity:         'TOXICITY',
  looks:            'LOOKS',
  physique:         'PHYSIQUE',
  athleticism:      'ATHLETICISM',
  extracurriculars: 'EXTRACURRICULARS',
  culturality:      'CULTURALITY',
  integrity:        'INTEGRITY',
  stress:           'STRESS',
  wealth:           'WEALTH',
  selfAwareness:    'SELF-AWARENESS',
  sleep:            'SLEEP',
};

// Stat bar colors: gold for high, white for mid, red for low / toxic
function statColor(key, val) {
  if (key === 'toxicity' || key === 'stress') {
    if (val >= 7) return '#FC7B54';
    if (val >= 4) return '#F7B731';
    return '#6BCB77';
  }
  if (val >= 7) return '#F7B731';
  if (val >= 4) return '#6BCB77';
  return '#FC7B54';
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
    bonus: { integrity: +1, selfAwareness: +1, friendships: -1 },
  },
  {
    id: 'legacy',
    label: 'LEGACY STUDENT',
    desc: "Your family's name opens doors here.",
    bonus: { wealth: +2, friendships: +1, integrity: -1 },
  },
  {
    id: 'scholarship',
    label: 'SCHOLARSHIP KID',
    desc: 'You earned your place. Everyone knows it.',
    bonus: { gpa: +1, athleticism: +1, stress: +1 },
  },
  {
    id: 'transfer',
    label: 'TRANSFER STUDENT',
    desc: 'You chose to leave somewhere else. That choice follows you.',
    bonus: { selfAwareness: +2, toxicity: +1, friendships: -1 },
  },
  {
    id: 'local_legend',
    label: 'LOCAL KID',
    desc: "You've been in this neighborhood forever. Half these people knew you in 4th grade.",
    bonus: { friendships: +2, culturality: +1, selfAwareness: -1 },
  },
  {
    id: 'military',
    label: 'MILITARY KID',
    desc: "You've moved five times. This is just another school. You've gotten good at starting over.",
    bonus: { selfAwareness: +2, stress: -1, relationships: -1 },
  },
  {
    id: 'online_famous',
    label: 'QUIETLY INTERNET FAMOUS',
    desc: "You have a following. Most people here don't know it yet.",
    bonus: { culturality: +2, wealth: +1, toxicity: +1 },
  },
  {
    id: 'returnee',
    label: 'RETURNEE',
    desc: 'You went to middle school here, left for two years, and came back. Nobody knows why.',
    bonus: { selfAwareness: +1, integrity: +1, friendships: -1, toxicity: +1 },
  },
  {
    id: 'prodigy',
    label: 'SKIPPED A GRADE',
    desc: "You're younger than everyone. Some respect it. Others use it against you.",
    bonus: { gpa: +2, selfAwareness: +1, stress: +1, looks: -1 },
  },
  {
    id: 'old_money',
    label: 'OLD MONEY',
    desc: "Your family has history at this school. Not all of it flattering.",
    bonus: { wealth: +3, integrity: -1, stress: +1 },
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
    s.friendships    = clamp(s.friendships    + 3, 0, 10);
    s.toxicity       = clamp(s.toxicity       + 3, 0, 10);
    s.gpa            = clamp(s.gpa            - 2, 0, 10);
    s.integrity      = clamp(s.integrity      - 2, 0, 10);
  } else if (g === 'balance') {
    s.looks          = clamp(s.looks          + 2, 0, 10);
    s.physique       = clamp(s.physique       + 2, 0, 10);
    s.gpa            = clamp(s.gpa            + 1, 0, 10);
    // −consistency is handled narratively, no direct stat
  } else if (g === 'grind') {
    s.gpa            = clamp(s.gpa            + 3, 0, 10);
    s.selfAwareness  = clamp(s.selfAwareness  + 2, 0, 10);
    s.relationships  = clamp(s.relationships  - 2, 0, 10);
    s.looks          = clamp(s.looks          - 1, 0, 10);
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
    s.gpa             = clamp(s.gpa             + 2, 0, 10);
    s.selfAwareness   = clamp(s.selfAwareness   + 2, 0, 10);
  } else if (p === 'social') {
    s.friendships     = clamp(s.friendships     + 2, 0, 10);
    s.relationships   = clamp(s.relationships   + 2, 0, 10);
  } else if (p === 'athlete') {
    s.athleticism     = clamp(s.athleticism     + 3, 0, 10);
    s.physique        = clamp(s.physique        + 2, 0, 10);
    s.extracurriculars= clamp(s.extracurriculars+ 1, 0, 10);
    s.sleep           = clamp(s.sleep           - 1, 0, 10);
  } else if (p === 'charmer') {
    s.relationships   = clamp(s.relationships   + 2, 0, 10);
    s.friendships     = clamp(s.friendships     + 1, 0, 10);
    s.looks           = clamp(s.looks           + 1, 0, 10);
    s.integrity       = clamp(s.integrity       - 1, 0, 10);
  } else if (p === 'observer') {
    s.selfAwareness   = clamp(s.selfAwareness   + 3, 0, 10);
    s.culturality     = clamp(s.culturality     + 1, 0, 10);
    s.friendships     = clamp(s.friendships     - 1, 0, 10);
  } else if (p === 'rebel') {
    s.toxicity        = clamp(s.toxicity        + 2, 0, 10);
    s.integrity       = clamp(s.integrity       - 1, 0, 10);
    s.stress          = clamp(s.stress          - 1, 0, 10);
    s.extracurriculars= clamp(s.extracurriculars+ 1, 0, 10);
  } else if (p === 'empath') {
    s.relationships   = clamp(s.relationships   + 2, 0, 10);
    s.selfAwareness   = clamp(s.selfAwareness   + 1, 0, 10);
    s.stress          = clamp(s.stress          + 2, 0, 10);
    s.sleep           = clamp(s.sleep           - 1, 0, 10);
  } else if (p === 'wildcard') {
    const keys = Object.keys(s);
    const picks = keys.sort(() => Math.random() - 0.5).slice(0, 3);
    s[picks[0]] = clamp(s[picks[0]] + 2, 0, 10);
    s[picks[1]] = clamp(s[picks[1]] + 2, 0, 10);
    s[picks[2]] = clamp(s[picks[2]] - 1, 0, 10);
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
  player.stats.toxicity = clamp(player.stats.toxicity + rumorData.tox, 0, 10);

  const bgData = rand(BACKGROUNDS);
  player.background = bgData;
  Object.entries(bgData.bonus).forEach(([k, v]) => {
    if (player.stats[k] !== undefined)
      player.stats[k] = clamp(player.stats[k] + v, 0, 10);
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

  document.getElementById('cc-stats-bars').innerHTML = Object.entries(player.stats).map(([key, val]) => `
    <div class="stat-row">
      <div class="stat-row-top">
        <span class="stat-name">${STAT_LABELS[key]}</span>
        <span class="stat-val">${val.toFixed(1)}</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill" style="background:${statColor(key,val)};width:${val/10*100}%"></div>
      </div>
    </div>
  `).join('');

  showScene('scene-charcard', () => {
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

  // Set freshman zone restriction before anything renders
  window.MYTH_ORIENTATION_ACTIVE  = true;
  window.MYTH_FRESHMAN_RESTRICTION = new Set(['gym', 'locker_rooms', 'basketball_courts']);

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

    // Launch Phaser, then show orientation overlay after a short delay
    requestAnimationFrame(() => {
      initPhaserGame(player);
      setTimeout(showOrientationOverlay, 600);
    });
  });
}

function safeEventCheck() {
  try { EventManager.checkTriggers(Engine.getState()); } catch (e) {}
}

// ════════════════════════════════════════════════════════
//  ORIENTATION OVERLAY
// ════════════════════════════════════════════════════════

function showOrientationOverlay() {
  const overlay = document.getElementById('orientation-overlay');
  overlay.classList.add('open');
  G.from(overlay.querySelector('.or-inner'), {
    opacity: 0, y: 20, duration: 0.5, ease: 'power2.out',
  });

  document.querySelectorAll('.or-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resolveOrientationChoice(btn.dataset.choice);
    }, { once: true });
  });
}

function resolveOrientationChoice(choice) {
  const OUTCOMES = {
    alone_back: {
      deltas: { selfAwareness: +1, stress: -1 },
      text: 'You find the top row. Nobody sits next to you. Exactly how you wanted it.',
      sub:  'You can see everyone from here. Good.',
    },
    familiar_face: {
      deltas: { friendships: +1, relationships: +1 },
      text: 'They look up — surprised, then relieved. You both are.',
      sub:  'A small anchor in a sea of strangers.',
    },
    front_row: {
      deltas: { extracurriculars: +1, stress: +1 },
      text: 'Front row. You can feel eyes on your back the whole time.',
      sub:  'Coach Rivera noticed. So did everyone else.',
    },
    popular_kids: {
      deltas: { friendships: +2, toxicity: +1, integrity: -1 },
      text: 'You sit down like you belong there. A few of them glance over. Not all of them look away.',
      sub:  'Something just started. You\'re not sure what.',
    },
  };

  const outcome = OUTCOMES[choice];
  if (!outcome) return;

  Object.entries(outcome.deltas).forEach(([stat, delta]) => {
    Engine.modifyStat(stat, delta);
  });

  // Swap inner content to result screen
  const inner = document.querySelector('.or-inner');
  inner.innerHTML = `
    <div class="or-badge">WESTBROOK HIGH SCHOOL &nbsp;·&nbsp; FRESHMAN ORIENTATION</div>
    <p class="or-result-text">"${outcome.text}"</p>
    <p class="or-result-sub">${outcome.sub}</p>
    <button class="btn-primary" id="or-continue-btn" style="margin-top:28px;align-self:flex-start">CONTINUE →</button>
  `;

  G.from(inner, { opacity: 0, duration: 0.35 });

  document.getElementById('or-continue-btn').addEventListener('click', closeOrientationOverlay);
}

function closeOrientationOverlay() {
  const overlay = document.getElementById('orientation-overlay');
  G.to(overlay, {
    opacity: 0, duration: 0.4, ease: 'power2.in',
    onComplete: () => {
      overlay.classList.remove('open');
      overlay.style.opacity = '';
      window.MYTH_ORIENTATION_ACTIVE   = false;
      window.MYTH_FRESHMAN_RESTRICTION = null; // lift zone restriction
      Engine.setFlag('orientation_complete');
      refreshStatsSidebar();
      setTimeout(safeEventCheck, 400);
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
  list.innerHTML = Object.entries(s.stats).map(([key, val]) => `
    <div class="ss-stat-row">
      <div class="ss-stat-top">
        <span class="ss-stat-name">${STAT_LABELS[key]}</span>
        <span class="ss-stat-val">${val.toFixed(1)}</span>
      </div>
      <div class="ss-bar-track">
        <div class="ss-bar-fill" style="width:${val/10*100}%;background:${statColor(key,val)}"></div>
      </div>
    </div>
  `).join('');
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

/* ═══════════════════════════════════════════════════════
   events.js — MYTH Event Framework
   Defines EventManager and active event registrations.
═══════════════════════════════════════════════════════ */

'use strict';

// ── Category definitions ──────────────────────────────
const EVENT_CATEGORIES = {
  academic:  { label: 'ACADEMIC',  color: '#3F5F8C' },
  social:    { label: 'SOCIAL',    color: '#C4613A' },
  athletic:  { label: 'ATHLETIC',  color: '#6E9E60' },
  personal:  { label: 'PERSONAL',  color: '#C47A82' },
  drama:     { label: 'DRAMA',     color: '#C9913A' },
  milestone: { label: 'MILESTONE', color: '#2D1F12' },
};

// ── EventManager ──────────────────────────────────────
const EventManager = (function () {

  const _registered = {};    // id → event
  const _fired      = new Set();
  const _queue      = [];
  let   _presenting = false;

  function register(event) {
    _registered[event.id] = event;
  }

  function registerMany(events) {
    events.forEach(register);
  }

  function checkTriggers(state) {
    if (!state) return;
    Object.values(_registered).forEach(event => {
      if (event.once && _fired.has(event.id)) return;
      if (_queue.find(e => e.id === event.id)) return;
      try {
        if (event.trigger(state)) _queue.push(event);
      } catch (e) { /* bad condition — skip */ }
    });
    _processQueue(state);
  }

  function _processQueue(state) {
    if (_presenting || _queue.length === 0) return;
    const event = _queue.shift();
    if (event.once) _fired.add(event.id);
    _present(event, state);
  }

  function _present(event, state) {
    _presenting = true;
    const cat   = EVENT_CATEGORIES[event.category] || { label: 'EVENT', color: '#A09080' };
    const scene = typeof event.scene === 'function' ? event.scene(state) : event.scene;

    const card  = document.getElementById('event-modal-card');
    card.style.setProperty('--em-color', cat.color);

    document.getElementById('em-category').textContent = cat.label;
    document.getElementById('em-category').style.color = cat.color;
    document.getElementById('em-location').textContent = scene.location || '';
    document.getElementById('em-title').textContent    = event.title;
    document.getElementById('em-setup').textContent    = scene.setup;

    const choicesEl = document.getElementById('em-choices');
    choicesEl.innerHTML = '';
    (scene.choices || []).forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'em-choice';
      btn.innerHTML = `<span class="em-choice-label">${choice.label}</span>
        ${choice.hint ? `<span class="em-choice-hint">${choice.hint}</span>` : ''}`;
      btn.addEventListener('click', () => _resolve(choice, scene, state));
      choicesEl.appendChild(btn);
    });

    const modal = document.getElementById('event-modal');
    modal.classList.add('open');
    gsap.fromTo('#event-modal-card',
      { opacity: 0, y: 36, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }
    );
  }

  function _resolve(choice, scene, state) {
    if (choice.outcome?.statDeltas)  Engine.modifyStats(choice.outcome.statDeltas);
    if (choice.outcome?.flagsToSet)  choice.outcome.flagsToSet.forEach(f => Engine.setFlag(f));
    if (choice.outcome?.onResolve)   choice.outcome.onResolve(Engine.getState());

    const narrative = choice.outcome?.narrative;
    if (narrative) {
      document.getElementById('em-setup').textContent = narrative;
      const choicesEl = document.getElementById('em-choices');
      choicesEl.innerHTML = '';
      const cont = document.createElement('button');
      cont.className = 'em-choice em-choice-continue';
      cont.textContent = 'Continue →';
      cont.addEventListener('click', _close);
      choicesEl.appendChild(cont);
    } else {
      _close();
    }
  }

  function _close() {
    gsap.to('#event-modal-card', {
      opacity: 0, y: 16, scale: 0.96, duration: 0.28, ease: 'power2.in',
      onComplete: () => {
        document.getElementById('event-modal').classList.remove('open');
        _presenting = false;
        if (_queue.length > 0) _processQueue(Engine.getState());
      }
    });
  }

  return { register, registerMany, checkTriggers };

})();


// ════════════════════════════════════════════════════════
//  ACTIVE EVENT REGISTRATIONS
//
//  The old MYTH_EVENTS array (15 events) was removed — every event in it
//  was dead code. Reasons:
//    • currentZone-gated events (first_lunch_seat, pickup_game,
//      quiet_moment, library_alone, pe_moment): Engine.goTo() is only
//      called once at launch (gym). Zone never updates as the player
//      moves in the 3D world.
//    • Time-gated events (end_of_first_week, party_invite,
//      homecoming_decision, first_big_assignment, sports_tryout_notice,
//      friend_group_tension): the engine clock only advances when the
//      player clicks "Next Period". Freshman year ends via direct PE
//      callback before week 2 is ever reached.
//    • first_morning: needs a period_change for before_school on day 0
//      week 1, but the game starts at that period — no change fires.
//    • study_group_invite: required gpa >= 5 on a 0–4 scale. Impossible.
//    • Remaining random events (teacher_calls_on_you, hallway_beef,
//      hard_morning, social_media_moment): could theoretically fire if
//      the player clicks Next Period, but no story content depends on
//      them and they modify stats (selfAwareness, toxicity, etc.) that
//      are not tracked anywhere in the game UI.
//
//  freshman_year_end is kept as a fallback only. showFreshmanYearEnd()
//  is also called directly from the PE completion handler in game.js,
//  so this event is redundant but harmless.
// ════════════════════════════════════════════════════════

EventManager.registerMany([

  {
    id:       'freshman_year_end',
    category: 'milestone',
    title:    'End of Freshman Year',
    once:     true,
    trigger:  s => s.grade === 9 && s.week >= 8 && s.dayIndex === 4 && s.period.id === 'after_school',
    scene: {
      location: 'END OF YEAR',
      setup: 'Freshman year is over. Summer is here.',
      choices: [{
        label: 'HEAD INTO SUMMER →',
        outcome: { onResolve: () => setTimeout(window.showFreshmanYearEnd, 400) },
      }],
    },
  },

]);

// Chess Openings App

// ===== State =====
let state = {
  screen: 'home',             // 'home' | 'opening'
  colorFilter: 'white',
  currentOpening: null,       // opening object
  currentLine: null,          // line object
  currentStates: [],          // array of game states for current line
  currentMoveIndex: 0,        // which move we're on (0 = start)
  panelTab: 'lines',          // 'lines' | 'practice'
  practice: {
    active: false,
    lineId: 'all',            // line id or 'all'
    activeLine: null,
    gamePractice: null,       // game state used in practice
    moveIndex: 0,             // next expected move index
    selectedSq: null,         // [r,c] or null
    score: { correct: 0, wrong: 0 },
    hintMode: false,
  },
  progress: loadProgress(),   // { openingId: { lineId: { learned: bool, attempts, correct } } }
  boardFlipped: false,
  lastMove: null,             // { from: [r,c], to: [r,c] }
};

// ===== Persistence =====
function loadProgress() {
  try { return JSON.parse(localStorage.getItem('chess_progress') || '{}'); } catch { return {}; }
}
function saveProgress() {
  localStorage.setItem('chess_progress', JSON.stringify(state.progress));
}
function markLearned(openingId, lineId) {
  if (!state.progress[openingId]) state.progress[openingId] = {};
  if (!state.progress[openingId][lineId]) state.progress[openingId][lineId] = { learned: false, attempts: 0, correct: 0 };
  state.progress[openingId][lineId].learned = true;
  saveProgress();
}
function getLineProgress(openingId, lineId) {
  return (state.progress[openingId] || {})[lineId] || { learned: false, attempts: 0, correct: 0 };
}

// ===== Board Rendering =====
function renderBoard(gameState, selectedSq, legalMoves, lastMove, flipped) {
  const board = document.getElementById('chess-board');
  if (!board) return;
  board.innerHTML = '';

  // Determine render order
  const rows = flipped ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]; // display rows
  const cols = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

  const highlightSet = new Set((legalMoves || []).map(([r,c]) => r+','+c));
  const lmFrom = lastMove ? lastMove.from[0]+','+lastMove.from[1] : null;
  const lmTo   = lastMove ? lastMove.to[0]+','+lastMove.to[1] : null;
  const selKey = selectedSq ? selectedSq[0]+','+selectedSq[1] : null;

  for (const r of rows) {
    for (const c of cols) {
      const sq = document.createElement('div');
      const key = r+','+c;
      const isLight = (r + c) % 2 === 0;
      sq.className = 'square ' + (isLight ? 'light' : 'dark');
      sq.dataset.r = r;
      sq.dataset.c = c;

      if (key === selKey) sq.classList.add('selected');
      if (key === lmFrom || key === lmTo) sq.classList.add(key === lmFrom ? 'last-move-from' : 'last-move-to');

      if (highlightSet.has(key)) {
        const targetPiece = gameState.board[r][c];
        sq.classList.add('hint-dot');
        if (targetPiece) sq.classList.add('capture-hint');
      }

      const piece = gameState.board[r][c];
      if (piece) {
        const el = document.createElement('span');
        el.className = 'piece ' + (piece === piece.toUpperCase() ? 'white-piece' : 'black-piece');
        el.textContent = PIECE_UNICODE[piece] || piece;
        sq.appendChild(el);
      }

      sq.addEventListener('click', () => handleSquareClick(r, c));
      board.appendChild(sq);
    }
  }

  // Update coord labels
  const files = flipped ? 'hgfedcba' : 'abcdefgh';
  const ranks = flipped ? '12345678' : '87654321';
  const fileEl = document.getElementById('coord-files');
  const rankEl = document.getElementById('coord-ranks');
  if (fileEl) fileEl.innerHTML = [...files].map(f => `<span>${f}</span>`).join('');
  if (rankEl) rankEl.innerHTML = [...ranks].map(r => `<span>${r}</span>`).join('');
}

// ===== Move List =====
function renderMoveList(moves, currentIndex) {
  const el = document.getElementById('move-list');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      const num = document.createElement('span');
      num.className = 'move-item';
      num.innerHTML = `<span class="move-num">${i/2+1}.</span>`;
      el.appendChild(num);
    }
    const btn = document.createElement('span');
    btn.className = 'move-item' + (i + 1 === currentIndex ? ' active' : '');
    btn.textContent = moves[i];
    btn.dataset.index = i + 1;
    btn.addEventListener('click', () => gotoMove(parseInt(btn.dataset.index)));
    el.appendChild(btn);
  }
  // Scroll active into view
  const active = el.querySelector('.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

// ===== Navigation =====
function gotoMove(index) {
  state.currentMoveIndex = Math.max(0, Math.min(index, state.currentStates.length - 1));
  const g = state.currentStates[state.currentMoveIndex];
  const lm = buildLastMove(state.currentLine.moves, state.currentMoveIndex);
  renderBoard(g, null, [], lm, state.boardFlipped);
  renderMoveList(state.currentLine.moves, state.currentMoveIndex);
  updateNavButtons();

  if (state.currentMoveIndex === state.currentLine.moves.length) {
    markLearned(state.currentOpening.id, state.currentLine.id);
    updateLinesPanel();
    updateHeaderStats();
    showToast('Line complete! Marked as learned.');
  }
}

function buildLastMove(moves, index) {
  if (index === 0) return null;
  const g0 = state.currentStates[index - 1];
  const g1 = state.currentStates[index];
  // Find what changed
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (g0.board[r][c] && !g1.board[r][c]) {
        // piece moved from here - find where it went
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (!g0.board[tr][tc] && g1.board[tr][tc] === g0.board[r][c]) {
              return { from: [r,c], to: [tr,tc] };
            }
          }
        }
      }
    }
  }
  return null;
}

function updateNavButtons() {
  const idx = state.currentMoveIndex;
  const max = state.currentStates.length - 1;
  document.getElementById('btn-prev')?.toggleAttribute('disabled', idx === 0);
  document.getElementById('btn-next')?.toggleAttribute('disabled', idx === max);
  document.getElementById('btn-first')?.toggleAttribute('disabled', idx === 0);
  document.getElementById('btn-last')?.toggleAttribute('disabled', idx === max);
  const el = document.getElementById('move-counter');
  if (el) el.textContent = `${idx} / ${max}`;
}

// ===== Square Click (Learn Mode) =====
function handleSquareClick(r, c) {
  if (state.practice.active) {
    handlePracticeClick(r, c);
    return;
  }
  // In learn mode, just go forward/back (clicking does nothing fancy)
}

// ===== Load Opening =====
function loadOpening(opening) {
  state.currentOpening = opening;
  state.currentLine = opening.lines[0];
  state.currentStates = buildStates(state.currentLine.moves);
  state.currentMoveIndex = 0;
  state.panelTab = 'lines';
  state.practice.active = false;
  state.boardFlipped = opening.color === 'black';
  state.lastMove = null;
  showOpeningScreen();
}

function loadLine(line) {
  state.currentLine = line;
  state.currentStates = buildStates(line.moves);
  state.currentMoveIndex = 0;
  state.practice.active = false;
  state.lastMove = null;
  renderBoard(state.currentStates[0], null, [], null, state.boardFlipped);
  renderMoveList(line.moves, 0);
  updateNavButtons();
  updateLinesPanel();
  updateKeyIdeas();
}

// ===== Screens =====
function showHomeScreen() {
  state.screen = 'home';
  document.getElementById('home-screen').style.display = 'block';
  document.getElementById('opening-screen').style.display = 'none';
  renderOpeningsGrid();
}

function showOpeningScreen() {
  state.screen = 'opening';
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('opening-screen').style.display = 'block';

  const o = state.currentOpening;
  document.getElementById('opening-title').textContent = o.name;
  const badge = document.getElementById('color-badge');
  badge.textContent = o.color;
  badge.className = 'color-badge ' + o.color;
  document.getElementById('eco-badge').textContent = o.eco;

  renderBoard(state.currentStates[0], null, [], null, state.boardFlipped);
  renderMoveList(state.currentLine.moves, 0);
  updateNavButtons();
  updateLinesPanel();
  updateKeyIdeas();
  switchPanelTab('lines');
  updatePracticePanel();
}

// ===== Lines Panel =====
function updateLinesPanel() {
  const el = document.getElementById('lines-list');
  if (!el) return;
  el.innerHTML = '';
  const o = state.currentOpening;
  for (const line of o.lines) {
    const prog = getLineProgress(o.id, line.id);
    const item = document.createElement('div');
    item.className = 'line-item' + (line.id === state.currentLine.id ? ' active' : '');
    const movesPreview = formatMovesPreview(line.moves, 6);
    item.innerHTML = `
      <div class="line-item-header">
        <span class="line-name">${line.name}</span>
        ${prog.learned ? '<span class="line-learned-badge">✓ Learned</span>' : ''}
      </div>
      <div class="line-moves-preview">${movesPreview}</div>
    `;
    item.addEventListener('click', () => loadLine(line));
    el.appendChild(item);
  }
}

function formatMovesPreview(moves, count) {
  const parts = [];
  for (let i = 0; i < Math.min(count, moves.length); i++) {
    if (i % 2 === 0) parts.push(`${i/2+1}.`);
    parts.push(moves[i]);
  }
  if (moves.length > count) parts.push('...');
  return parts.join(' ');
}

function updateKeyIdeas() {
  const el = document.getElementById('key-ideas-list');
  if (!el) return;
  const ideas = state.currentLine.keyIdeas || [];
  el.innerHTML = ideas.map(idea => `
    <div class="idea-item">
      <span class="idea-icon">▸</span>
      <span>${idea}</span>
    </div>
  `).join('');
  document.getElementById('line-description').textContent = state.currentLine.description || '';
}

// ===== Practice Panel =====
function updatePracticePanel() {
  const o = state.currentOpening;
  const sel = document.getElementById('practice-line-select');
  if (!sel) return;
  sel.innerHTML = '<option value="all">All learned lines</option>';
  for (const line of o.lines) {
    const prog = getLineProgress(o.id, line.id);
    if (prog.learned) {
      const opt = document.createElement('option');
      opt.value = line.id;
      opt.textContent = line.name;
      sel.appendChild(opt);
    }
  }
  updateScoreDisplay();
}

function updateScoreDisplay() {
  const { correct, wrong } = state.practice.score;
  const el = document.getElementById('score-correct');
  const el2 = document.getElementById('score-wrong');
  if (el) el.textContent = correct;
  if (el2) el2.textContent = wrong;
}

// ===== Start Practice =====
function startPractice() {
  const o = state.currentOpening;
  const lineId = document.getElementById('practice-line-select')?.value || 'all';

  let candidateLines = o.lines.filter(l => getLineProgress(o.id, l.id).learned);
  if (candidateLines.length === 0) {
    showToast('Learn at least one line first!');
    return;
  }

  if (lineId !== 'all') {
    candidateLines = candidateLines.filter(l => l.id === lineId);
  }

  const line = candidateLines[Math.floor(Math.random() * candidateLines.length)];
  const practiceGame = createGame();

  state.practice.active = true;
  state.practice.activeLine = line;
  state.practice.gamePractice = practiceGame;
  state.practice.moveIndex = 0;
  state.practice.selectedSq = null;
  state.practice.hintMode = false;

  state.currentLine = line;
  state.currentStates = buildStates(line.moves);

  renderBoard(practiceGame, null, [], null, state.boardFlipped);
  renderMoveList(line.moves, 0);
  updateNavButtons();

  updatePracticeStatus();
  updateProgressBar();
  document.getElementById('practice-result')?.classList.remove('show');

  // If Black opening, auto-play White's first move
  if (o.color === 'black') {
    setTimeout(() => practiceAutoPlay(), 400);
  }
}

function practiceAutoPlay() {
  const line = state.practice.activeLine;
  const idx = state.practice.moveIndex;
  if (idx >= line.moves.length) return;

  const g = state.practice.gamePractice;
  const san = line.moves[idx];
  const newG = makeMove(g, san);
  state.practice.gamePractice = newG;
  state.practice.moveIndex++;

  const lm = buildLastMoveFromGames(g, newG);
  renderBoard(newG, null, [], lm, state.boardFlipped);
  renderMoveList(line.moves, state.practice.moveIndex);
  updatePracticeStatus();
  updateProgressBar();

  if (state.practice.moveIndex >= line.moves.length) {
    finishPractice(true);
  }
}

function buildLastMoveFromGames(g0, g1) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (g0.board[r][c] && !g1.board[r][c]) {
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (!g0.board[tr][tc] && g1.board[tr][tc] === g0.board[r][c]) {
              return { from: [r,c], to: [tr,tc] };
            }
          }
        }
      }
    }
  }
  return null;
}

function handlePracticeClick(r, c) {
  if (!state.practice.active) return;

  const line = state.practice.activeLine;
  const idx = state.practice.moveIndex;
  if (idx >= line.moves.length) return;

  const g = state.practice.gamePractice;
  const o = state.currentOpening;

  // Check if it's user's turn
  const isUserTurn = (o.color === 'white') === (g.turn === 'white');
  if (!isUserTurn) return;

  const piece = g.board[r][c];
  const isMyPiece = piece && ((piece === piece.toUpperCase()) === (g.turn === 'white'));

  if (!state.practice.selectedSq) {
    if (!isMyPiece) return;
    state.practice.selectedSq = [r, c];
    const legalMoves = getLegalMoves(g, r, c);
    const lm = buildLastMoveFromGames(state.currentStates[idx > 0 ? idx : 0], g);
    renderBoard(g, [r,c], legalMoves, lm, state.boardFlipped);
    return;
  }

  // Second click — try to make move
  const [fr, fc] = state.practice.selectedSq;

  if (fr === r && fc === c) {
    // Deselect
    state.practice.selectedSq = null;
    const lm = buildLastMoveFromGames(createGame(), g);
    renderBoard(g, null, [], null, state.boardFlipped);
    return;
  }

  if (isMyPiece) {
    // Clicked another own piece — select that instead
    state.practice.selectedSq = [r, c];
    const legalMoves = getLegalMoves(g, r, c);
    renderBoard(g, [r,c], legalMoves, null, state.boardFlipped);
    return;
  }

  // Attempt move
  state.practice.selectedSq = null;
  const san = moveToSAN(g, fr, fc, r, c);
  const expectedSAN = line.moves[idx];

  // Normalize SANs for comparison (strip +/#)
  const normSAN = (s) => s.replace(/[+#]/g, '');

  if (normSAN(san) === normSAN(expectedSAN) || san === expectedSAN) {
    // Correct!
    const newG = makeMove(g, expectedSAN);
    state.practice.gamePractice = newG;
    state.practice.moveIndex++;
    state.practice.score.correct++;

    const lm = { from: [fr, fc], to: [r, c] };
    renderBoard(newG, null, [], lm, state.boardFlipped);
    renderMoveList(line.moves, state.practice.moveIndex);
    updateScoreDisplay();
    showPracticeResult(true, expectedSAN);
    updateProgressBar();

    if (!state.progress[o.id]) state.progress[o.id] = {};
    if (!state.progress[o.id][line.id]) state.progress[o.id][line.id] = { learned: true, attempts: 0, correct: 0 };
    state.progress[o.id][line.id].attempts++;
    state.progress[o.id][line.id].correct++;
    saveProgress();

    if (state.practice.moveIndex >= line.moves.length) {
      setTimeout(() => finishPractice(true), 600);
      return;
    }

    // Auto-play opponent's move
    const newIdx = state.practice.moveIndex;
    const isNowUserTurn2 = (o.color === 'white') === (newG.turn === 'white');
    if (!isNowUserTurn2 && newIdx < line.moves.length) {
      setTimeout(() => practiceAutoPlay(), 600);
    } else {
      updatePracticeStatus();
    }
  } else {
    // Wrong move
    state.practice.score.wrong++;
    updateScoreDisplay();
    showPracticeResult(false, expectedSAN);

    if (!state.progress[o.id]) state.progress[o.id] = {};
    if (!state.progress[o.id][line.id]) state.progress[o.id][line.id] = { learned: true, attempts: 0, correct: 0 };
    state.progress[o.id][line.id].attempts++;
    saveProgress();

    // Flash wrong
    const sq = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (sq) {
      sq.classList.add('wrong-flash');
      setTimeout(() => sq.classList.remove('wrong-flash'), 400);
    }
    renderBoard(g, null, [], null, state.boardFlipped);
  }
}

function showPracticeResult(correct, san) {
  const el = document.getElementById('practice-result');
  if (!el) return;
  el.className = 'practice-result show ' + (correct ? 'correct' : 'wrong');
  el.textContent = correct ? `✓ Correct! ${san}` : `✗ Wrong. Expected: ${san}`;
  setTimeout(() => el.classList.remove('show'), 1800);
}

function finishPractice(success) {
  showToast(success ? '🎉 Line complete! Great job!' : 'Practice complete!');
  state.practice.active = false;
  updatePracticeStatus();
  document.getElementById('btn-start-practice').textContent = 'Practice Again';
}

function updatePracticeStatus() {
  const statusEl = document.getElementById('practice-status-turn');
  const hintEl = document.getElementById('practice-status-hint');
  if (!statusEl) return;

  if (!state.practice.active) {
    statusEl.textContent = 'Not practicing';
    if (hintEl) hintEl.textContent = 'Select a line and press Start Practice';
    return;
  }

  const g = state.practice.gamePractice;
  const line = state.practice.activeLine;
  const idx = state.practice.moveIndex;
  const o = state.currentOpening;

  if (idx >= line.moves.length) {
    statusEl.textContent = 'Line complete!';
    if (hintEl) hintEl.textContent = '';
    return;
  }

  const isUserTurn = (o.color === 'white') === (g.turn === 'white');
  statusEl.textContent = isUserTurn ? 'Your move' : "Opponent's move...";
  if (hintEl) {
    hintEl.textContent = isUserTurn
      ? `Move ${Math.floor(idx/2)+1}: play the ${o.color} side`
      : '';
  }
}

function updateProgressBar() {
  const el = document.getElementById('progress-bar-fill');
  const labelLeft = document.getElementById('progress-label-left');
  const labelRight = document.getElementById('progress-label-right');
  if (!el || !state.practice.active) return;

  const line = state.practice.activeLine;
  const idx = state.practice.moveIndex;
  const total = line.moves.length;
  const pct = total > 0 ? (idx / total) * 100 : 0;

  el.style.width = pct + '%';
  if (labelLeft) labelLeft.textContent = `Move ${idx} of ${total}`;
  if (labelRight) labelRight.textContent = Math.round(pct) + '%';
}

function showHint() {
  if (!state.practice.active) return;
  const line = state.practice.activeLine;
  const idx = state.practice.moveIndex;
  if (idx >= line.moves.length) return;

  const g = state.practice.gamePractice;
  const o = state.currentOpening;
  const isUserTurn = (o.color === 'white') === (g.turn === 'white');
  if (!isUserTurn) return;

  // Parse expected move and highlight source square
  const parsed = parseSAN(line.moves[idx]);
  if (parsed.type === 'move') {
    const src = findSource(g, parsed.pieceType, parsed.targetRow, parsed.targetCol, parsed.disambigFile, parsed.disambigRank);
    if (src) {
      const [r, c] = src;
      const legalMoves = getLegalMoves(g, r, c);
      renderBoard(g, [r, c], legalMoves, null, state.boardFlipped);
      showToast(`Hint: move from ${String.fromCharCode(97+c)}${8-r}`);
    }
  }
}

// ===== Panel Tabs =====
function switchPanelTab(tab) {
  state.panelTab = tab;
  document.querySelectorAll('.panel-tab').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  document.getElementById('tab-lines').style.display = tab === 'lines' ? 'block' : 'none';
  document.getElementById('tab-practice').style.display = tab === 'practice' ? 'block' : 'none';
  if (tab === 'practice') updatePracticePanel();
}

// ===== Home Grid =====
function renderOpeningsGrid() {
  const grid = document.getElementById('openings-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const filtered = OPENINGS.filter(o => o.color === state.colorFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">♟</div><p>No openings found</p></div>';
    return;
  }

  for (const o of filtered) {
    const learnedCount = o.lines.filter(l => getLineProgress(o.id, l.id).learned).length;
    const dots = o.lines.map(l => {
      const prog = getLineProgress(o.id, l.id);
      return `<span class="progress-dot ${prog.learned ? 'done' : ''}"></span>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'opening-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-name">${o.name}</span>
        <span class="card-eco">${o.eco}</span>
      </div>
      <div class="card-desc">${o.description.slice(0, 120)}...</div>
      <div class="card-footer">
        <div class="card-progress">
          <div class="progress-dots">${dots}</div>
          <span>${learnedCount}/${o.lines.length} lines</span>
        </div>
        <button class="learn-btn">Learn</button>
      </div>
    `;
    card.querySelector('.learn-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      loadOpening(o);
    });
    card.addEventListener('click', () => loadOpening(o));
    grid.appendChild(card);
  }
}

// ===== Stats =====
function updateHeaderStats() {
  let totalLearned = 0;
  for (const o of OPENINGS) {
    for (const l of o.lines) {
      if (getLineProgress(o.id, l.id).learned) totalLearned++;
    }
  }
  const el = document.getElementById('stat-learned');
  if (el) el.textContent = totalLearned;
}

// ===== Toast =====
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ===== Init =====
function init() {
  // Header stats
  updateHeaderStats();

  // Color filter tabs
  document.querySelectorAll('.color-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.colorFilter = tab.dataset.color;
      renderOpeningsGrid();
    });
  });

  // Panel tabs
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => switchPanelTab(tab.dataset.tab));
  });

  // Navigation buttons
  document.getElementById('btn-first')?.addEventListener('click', () => gotoMove(0));
  document.getElementById('btn-prev')?.addEventListener('click', () => gotoMove(state.currentMoveIndex - 1));
  document.getElementById('btn-next')?.addEventListener('click', () => gotoMove(state.currentMoveIndex + 1));
  document.getElementById('btn-last')?.addEventListener('click', () => gotoMove(state.currentStates.length - 1));
  document.getElementById('btn-flip')?.addEventListener('click', () => {
    state.boardFlipped = !state.boardFlipped;
    const g = state.practice.active ? state.practice.gamePractice : state.currentStates[state.currentMoveIndex];
    const lm = buildLastMove(state.currentLine?.moves || [], state.currentMoveIndex);
    renderBoard(g, null, [], lm, state.boardFlipped);
  });

  // Back button
  document.getElementById('btn-back')?.addEventListener('click', () => {
    state.practice.active = false;
    showHomeScreen();
    updateHeaderStats();
  });

  // Practice buttons
  document.getElementById('btn-start-practice')?.addEventListener('click', startPractice);
  document.getElementById('btn-hint')?.addEventListener('click', showHint);
  document.getElementById('btn-stop-practice')?.addEventListener('click', () => {
    state.practice.active = false;
    updatePracticeStatus();
    loadLine(state.currentLine);
    document.getElementById('btn-start-practice').textContent = 'Start Practice';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (state.screen !== 'opening' || state.practice.active) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') gotoMove(state.currentMoveIndex + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') gotoMove(state.currentMoveIndex - 1);
    if (e.key === 'Home') gotoMove(0);
    if (e.key === 'End') gotoMove(state.currentStates.length - 1);
  });

  showHomeScreen();
}

document.addEventListener('DOMContentLoaded', init);

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
    startingLines: [],        // lines filtered at practice start
    movesPlayed: [],          // full move history this session
    gamePractice: null,       // live game state
    selectedSq: null,         // [r,c] or null
    score: { correct: 0, wrong: 0 },
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

  const rows = flipped ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
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

// ===== Move List (Learn Mode) =====
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
  const active = el.querySelector('.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

// ===== Move List (Practice Mode) =====
function renderPracticeMoveList() {
  const el = document.getElementById('move-list');
  if (!el) return;
  el.innerHTML = '';
  const moves = state.practice.movesPlayed;
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      const num = document.createElement('span');
      num.className = 'move-item';
      num.innerHTML = `<span class="move-num">${i/2+1}.</span>`;
      el.appendChild(num);
    }
    const btn = document.createElement('span');
    btn.className = 'move-item' + (i === moves.length - 1 ? ' active' : '');
    btn.textContent = moves[i];
    el.appendChild(btn);
  }

  // Show "?" placeholder for the player's expected next move
  const nextState = getPracticeNextState();
  if (nextState && nextState.type === 'player') {
    const idx = moves.length;
    if (idx % 2 === 0) {
      const num = document.createElement('span');
      num.className = 'move-item';
      num.innerHTML = `<span class="move-num">${idx/2+1}.</span>`;
      el.appendChild(num);
    }
    const placeholder = document.createElement('span');
    placeholder.className = 'move-item pending';
    placeholder.textContent = '?';
    el.appendChild(placeholder);
  }

  const active = el.querySelector('.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

// ===== Navigation =====
function gotoMove(index) {
  if (state.practice.active) return; // disabled during practice
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

// ===== Square Click =====
function handleSquareClick(r, c) {
  if (state.practice.active) {
    handlePracticeClick(r, c);
    return;
  }
  // Learn mode: clicks do nothing (navigation via buttons/keys)
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

// ===== Compatible-Lines Engine =====
// Returns { type: 'player'|'opponent', moves: string[], compatibleCount: number }
// or null if no compatible lines remain
function getPracticeNextState() {
  const opening = state.currentOpening;
  const movesPlayed = state.practice.movesPlayed;
  const nextIdx = movesPlayed.length;
  const norm = s => s.replace(/[+#!?]/g, '');

  const compatible = state.practice.startingLines.filter(line => {
    if (nextIdx >= line.moves.length) return false;
    for (let i = 0; i < nextIdx; i++) {
      if (norm(line.moves[i]) !== norm(movesPlayed[i])) return false;
    }
    return true;
  });

  if (compatible.length === 0) return null;

  // White opening: player is White (even indices 0, 2, 4…)
  // Black opening: player is Black (odd indices 1, 3, 5…)
  const isPlayerTurn = opening.color === 'white'
    ? (nextIdx % 2 === 0)
    : (nextIdx % 2 === 1);

  const uniqueMoves = [...new Set(compatible.map(l => norm(l.moves[nextIdx])))];

  return {
    type: isPlayerTurn ? 'player' : 'opponent',
    moves: uniqueMoves,
    compatibleCount: compatible.length,
  };
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

  const practiceGame = createGame();

  state.practice.active = true;
  state.practice.startingLines = candidateLines;
  state.practice.movesPlayed = [];
  state.practice.gamePractice = practiceGame;
  state.practice.selectedSq = null;

  renderBoard(practiceGame, null, [], null, state.boardFlipped);
  renderPracticeMoveList();
  updateNavButtons();

  updatePracticeStatus();
  updateProgressBar();
  document.getElementById('practice-result')?.classList.remove('show');

  // If Black opening, auto-play White's first move
  if (o.color === 'black') {
    setTimeout(() => practiceAutoPlay(), 400);
  }
}

// Auto-play opponent's move (random from all compatible lines)
function practiceAutoPlay() {
  const next = getPracticeNextState();
  if (!next || next.type !== 'opponent') return;

  const san = next.moves[Math.floor(Math.random() * next.moves.length)];

  const g = state.practice.gamePractice;
  const newG = makeMove(g, san);
  state.practice.gamePractice = newG;
  state.practice.movesPlayed.push(san);

  const lm = buildLastMoveFromGames(g, newG);
  renderBoard(newG, null, [], lm, state.boardFlipped);
  renderPracticeMoveList();
  updatePracticeStatus();
  updateProgressBar();

  // Check if the book is exhausted after this move
  const after = getPracticeNextState();
  if (!after) {
    setTimeout(() => finishPractice(true), 600);
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

// ===== Practice Click Handler =====
function handlePracticeClick(r, c) {
  if (!state.practice.active) return;

  const next = getPracticeNextState();
  if (!next || next.type !== 'player') return; // not player's turn

  const g = state.practice.gamePractice;
  const o = state.currentOpening;

  const piece = g.board[r][c];
  const isMyPiece = piece && ((piece === piece.toUpperCase()) === (g.turn === 'white'));

  // First click: select piece
  if (!state.practice.selectedSq) {
    if (!isMyPiece) return;
    state.practice.selectedSq = [r, c];
    const legalMoves = getLegalMoves(g, r, c);
    renderBoard(g, [r,c], legalMoves, null, state.boardFlipped);
    return;
  }

  const [fr, fc] = state.practice.selectedSq;

  // Clicked same square: deselect
  if (fr === r && fc === c) {
    state.practice.selectedSq = null;
    renderBoard(g, null, [], null, state.boardFlipped);
    return;
  }

  // Clicked another own piece: re-select
  if (isMyPiece) {
    state.practice.selectedSq = [r, c];
    const legalMoves = getLegalMoves(g, r, c);
    renderBoard(g, [r,c], legalMoves, null, state.boardFlipped);
    return;
  }

  // Attempt move
  state.practice.selectedSq = null;
  const norm = s => s.replace(/[+#!?]/g, '');
  const san = moveToSAN(g, fr, fc, r, c);
  const normSan = norm(san);

  // Check if this move exists in any compatible line
  const matched = next.moves.find(e => norm(e) === normSan);

  if (matched) {
    // ✓ Correct move
    const newG = makeMove(g, matched);
    state.practice.gamePractice = newG;
    state.practice.movesPlayed.push(matched);
    state.practice.score.correct++;

    const lm = { from: [fr, fc], to: [r, c] };
    renderBoard(newG, null, [], lm, state.boardFlipped);
    renderPracticeMoveList();
    updateScoreDisplay();
    showPracticeResult(true, matched);
    updateProgressBar();

    // Record progress for all lines still compatible
    const norm2 = s => s.replace(/[+#!?]/g, '');
    for (const line of state.practice.startingLines) {
      const played = state.practice.movesPlayed.map(norm2);
      const lineMoves = line.moves.map(norm2);
      if (played.length <= lineMoves.length &&
          played.every((m, i) => m === lineMoves[i])) {
        if (!state.progress[o.id]) state.progress[o.id] = {};
        if (!state.progress[o.id][line.id])
          state.progress[o.id][line.id] = { learned: true, attempts: 0, correct: 0 };
        state.progress[o.id][line.id].attempts++;
        state.progress[o.id][line.id].correct++;
      }
    }
    saveProgress();

    // Check if book is exhausted
    const after = getPracticeNextState();
    if (!after) {
      setTimeout(() => finishPractice(true), 600);
      return;
    }

    // Auto-play opponent if it's their turn next
    if (after.type === 'opponent') {
      setTimeout(() => practiceAutoPlay(), 600);
    } else {
      updatePracticeStatus();
    }

  } else {
    // ✗ Wrong move
    state.practice.score.wrong++;
    updateScoreDisplay();

    const hasMultiple = next.moves.length > 1;
    showPracticeResult(false, next.moves[0], hasMultiple);

    // Record failed attempt for compatible lines
    const norm2 = s => s.replace(/[+#!?]/g, '');
    for (const line of state.practice.startingLines) {
      const played = state.practice.movesPlayed.map(norm2);
      const lineMoves = line.moves.map(norm2);
      if (played.length < lineMoves.length &&
          played.every((m, i) => m === lineMoves[i])) {
        if (!state.progress[o.id]) state.progress[o.id] = {};
        if (!state.progress[o.id][line.id])
          state.progress[o.id][line.id] = { learned: true, attempts: 0, correct: 0 };
        state.progress[o.id][line.id].attempts++;
      }
    }
    saveProgress();

    // Flash wrong target square
    const sq = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (sq) {
      sq.classList.add('wrong-flash');
      setTimeout(() => sq.classList.remove('wrong-flash'), 400);
    }
    renderBoard(g, null, [], null, state.boardFlipped);
  }
}

function showPracticeResult(correct, san, hasMultiple = false) {
  const el = document.getElementById('practice-result');
  if (!el) return;
  el.className = 'practice-result show ' + (correct ? 'correct' : 'wrong');
  if (correct) {
    el.textContent = `✓ Correct! ${san}`;
  } else {
    el.textContent = hasMultiple
      ? `✗ Wrong. Try: ${san} (or similar)`
      : `✗ Wrong. Expected: ${san}`;
  }
  setTimeout(() => el.classList.remove('show'), 1800);
}

function finishPractice(success) {
  showToast(success ? '🎉 All variations complete! Great job!' : 'Practice stopped.');
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

  const next = getPracticeNextState();

  if (!next) {
    statusEl.textContent = 'All variations complete!';
    if (hintEl) hintEl.textContent = '';
    return;
  }

  if (next.type === 'player') {
    const moveNum = Math.floor(state.practice.movesPlayed.length / 2) + 1;
    statusEl.textContent = 'Your move';
    if (hintEl) {
      const v = next.compatibleCount;
      hintEl.textContent = `Move ${moveNum} — ${v} variation${v !== 1 ? 's' : ''} in play`;
    }
  } else {
    statusEl.textContent = "Opponent's move…";
    if (hintEl) hintEl.textContent = '';
  }
}

function updateProgressBar() {
  const el = document.getElementById('progress-bar-fill');
  const labelLeft = document.getElementById('progress-label-left');
  const labelRight = document.getElementById('progress-label-right');
  if (!el) return;

  if (!state.practice.active || state.practice.startingLines.length === 0) {
    el.style.width = '0%';
    if (labelLeft) labelLeft.textContent = 'Move 0';
    if (labelRight) labelRight.textContent = '0%';
    return;
  }

  const played = state.practice.movesPlayed.length;
  const maxLen = Math.max(...state.practice.startingLines.map(l => l.moves.length));
  const pct = maxLen > 0 ? Math.min((played / maxLen) * 100, 100) : 0;

  el.style.width = pct + '%';
  if (labelLeft) labelLeft.textContent = `Move ${played} of ${maxLen}`;
  if (labelRight) labelRight.textContent = Math.round(pct) + '%';
}

// ===== Hint =====
function showHint() {
  if (!state.practice.active) return;
  const next = getPracticeNextState();
  if (!next || next.type !== 'player') return;

  const g = state.practice.gamePractice;
  const san = next.moves[0]; // hint on first expected move
  const parsed = parseSAN(san);

  if (parsed.type === 'castle') {
    showToast(`Hint: Castle ${parsed.side === 'king' ? 'kingside (O-O)' : 'queenside (O-O-O)'}`);
    return;
  }

  if (parsed.type === 'move') {
    const src = findSource(g, parsed.pieceType, parsed.targetRow, parsed.targetCol,
                           parsed.disambigFile, parsed.disambigRank);
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
  updateHeaderStats();

  document.querySelectorAll('.color-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.colorFilter = tab.dataset.color;
      renderOpeningsGrid();
    });
  });

  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => switchPanelTab(tab.dataset.tab));
  });

  document.getElementById('btn-first')?.addEventListener('click', () => gotoMove(0));
  document.getElementById('btn-prev')?.addEventListener('click', () => gotoMove(state.currentMoveIndex - 1));
  document.getElementById('btn-next')?.addEventListener('click', () => gotoMove(state.currentMoveIndex + 1));
  document.getElementById('btn-last')?.addEventListener('click', () => gotoMove(state.currentStates.length - 1));
  document.getElementById('btn-flip')?.addEventListener('click', () => {
    state.boardFlipped = !state.boardFlipped;
    const g = state.practice.active
      ? state.practice.gamePractice
      : state.currentStates[state.currentMoveIndex];
    const lm = state.practice.active
      ? null
      : buildLastMove(state.currentLine?.moves || [], state.currentMoveIndex);
    renderBoard(g, null, [], lm, state.boardFlipped);
  });

  document.getElementById('btn-back')?.addEventListener('click', () => {
    state.practice.active = false;
    showHomeScreen();
    updateHeaderStats();
  });

  document.getElementById('btn-start-practice')?.addEventListener('click', startPractice);
  document.getElementById('btn-hint')?.addEventListener('click', showHint);
  document.getElementById('btn-stop-practice')?.addEventListener('click', () => {
    state.practice.active = false;
    updatePracticeStatus();
    loadLine(state.currentLine);
    document.getElementById('btn-start-practice').textContent = 'Start Practice';
  });

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

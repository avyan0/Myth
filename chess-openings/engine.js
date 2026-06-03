// Chess Engine - handles board state and SAN move parsing

const INITIAL_BOARD = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const PIECE_UNICODE = {
  'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙',
  'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟'
};

function createGame() {
  return {
    board: INITIAL_BOARD.map(r => [...r]),
    turn: 'white',
    enPassant: null,
    castling: { wK: true, wQ: true, bK: true, bQ: true }
  };
}

function cloneGame(g) {
  return {
    board: g.board.map(r => [...r]),
    turn: g.turn,
    enPassant: g.enPassant ? [...g.enPassant] : null,
    castling: { ...g.castling }
  };
}

function isPathClear(board, r1, c1, r2, c2) {
  const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
  let r = r1 + dr, c = c1 + dc;
  while (r !== r2 || c !== c2) {
    if (board[r][c]) return false;
    r += dr; c += dc;
  }
  return true;
}

function canMove(g, r1, c1, r2, c2) {
  const p = g.board[r1][c1];
  if (!p) return false;
  const isWhite = p === p.toUpperCase();
  if ((g.turn === 'white') !== isWhite) return false;

  const target = g.board[r2][c2];
  if (target) {
    if ((target === target.toUpperCase()) === isWhite) return false;
  }

  const dr = r2 - r1, dc = c2 - c1;
  const adr = Math.abs(dr), adc = Math.abs(dc);
  const pt = p.toUpperCase();

  if (pt === 'N') return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);

  if (pt === 'B') return adr === adc && adr > 0 && isPathClear(g.board, r1, c1, r2, c2);

  if (pt === 'R') return (dr === 0 || dc === 0) && (adr + adc > 0) && isPathClear(g.board, r1, c1, r2, c2);

  if (pt === 'Q') {
    const diag = adr === adc && adr > 0;
    const straight = (dr === 0 || dc === 0) && (adr + adc > 0);
    return (diag || straight) && isPathClear(g.board, r1, c1, r2, c2);
  }

  if (pt === 'K') return adr <= 1 && adc <= 1 && (adr + adc > 0);

  if (pt === 'P') {
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    if (dc === 0) {
      if (dr === dir && !g.board[r2][c2]) return true;
      if (r1 === startRow && dr === 2 * dir && !g.board[r1 + dir][c1] && !g.board[r2][c2]) return true;
    } else if (adc === 1 && dr === dir) {
      if (g.board[r2][c2]) return true;
      if (g.enPassant && g.enPassant[0] === r2 && g.enPassant[1] === c2) return true;
    }
    return false;
  }
  return false;
}

function parseSAN(san) {
  let s = san.replace(/[+#!?]/g, '').trim();

  if (s === 'O-O-O' || s === '0-0-0') return { type: 'castle', side: 'queen' };
  if (s === 'O-O' || s === '0-0') return { type: 'castle', side: 'king' };

  let promotion = null;
  const pm = s.match(/=([QRBN])$/);
  if (pm) { promotion = pm[1]; s = s.slice(0, s.lastIndexOf('=')); }

  s = s.replace('x', '');

  let pieceType = 'P';
  if (/^[NBRQK]/.test(s)) { pieceType = s[0]; s = s.slice(1); }

  const tFile = s[s.length - 2].charCodeAt(0) - 97;
  const tRank = parseInt(s[s.length - 1]);
  const targetRow = 8 - tRank;
  const targetCol = tFile;

  const disambig = s.slice(0, -2);
  let disambigFile = null, disambigRank = null;
  for (const ch of disambig) {
    if (ch >= 'a' && ch <= 'h') disambigFile = ch.charCodeAt(0) - 97;
    if (ch >= '1' && ch <= '8') disambigRank = 8 - parseInt(ch);
  }

  return { type: 'move', pieceType, targetRow, targetCol, disambigFile, disambigRank, promotion };
}

function findSource(g, pieceType, targetRow, targetCol, disambigFile, disambigRank) {
  const candidates = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = g.board[r][c];
      if (!p) continue;
      if (p.toUpperCase() !== pieceType) continue;
      const isWhite = p === p.toUpperCase();
      if ((g.turn === 'white') !== isWhite) continue;
      if (disambigFile !== null && c !== disambigFile) continue;
      if (disambigRank !== null && r !== disambigRank) continue;
      if (canMove(g, r, c, targetRow, targetCol)) candidates.push([r, c]);
    }
  }
  if (candidates.length === 0) { console.error('No source for', pieceType, targetRow, targetCol); return null; }
  return candidates[0];
}

function makeMove(g, san) {
  const parsed = parseSAN(san);
  const ng = cloneGame(g);

  if (parsed.type === 'castle') {
    const row = ng.turn === 'white' ? 7 : 0;
    const K = ng.turn === 'white' ? 'K' : 'k';
    const R = ng.turn === 'white' ? 'R' : 'r';
    ng.board[row][4] = null;
    if (parsed.side === 'king') {
      ng.board[row][6] = K; ng.board[row][5] = R; ng.board[row][7] = null;
    } else {
      ng.board[row][2] = K; ng.board[row][3] = R; ng.board[row][0] = null;
    }
    if (ng.turn === 'white') { ng.castling.wK = false; ng.castling.wQ = false; }
    else { ng.castling.bK = false; ng.castling.bQ = false; }
    ng.turn = ng.turn === 'white' ? 'black' : 'white';
    ng.enPassant = null;
    return ng;
  }

  const { pieceType, targetRow, targetCol, disambigFile, disambigRank, promotion } = parsed;
  const src = findSource(ng, pieceType, targetRow, targetCol, disambigFile, disambigRank);
  if (!src) return ng;

  const [fromRow, fromCol] = src;
  const piece = ng.board[fromRow][fromCol];

  // En passant capture
  if (pieceType === 'P' && fromCol !== targetCol && !ng.board[targetRow][targetCol]) {
    const capturedRow = ng.turn === 'white' ? targetRow + 1 : targetRow - 1;
    ng.board[capturedRow][targetCol] = null;
  }

  // New en passant square
  ng.enPassant = null;
  if (pieceType === 'P' && Math.abs(targetRow - fromRow) === 2) {
    ng.enPassant = [(fromRow + targetRow) / 2, fromCol];
  }

  // Move piece
  ng.board[fromRow][fromCol] = null;
  if (promotion) {
    ng.board[targetRow][targetCol] = ng.turn === 'white' ? promotion : promotion.toLowerCase();
  } else {
    ng.board[targetRow][targetCol] = piece;
  }

  // Update castling rights
  if (pieceType === 'K') {
    if (ng.turn === 'white') { ng.castling.wK = false; ng.castling.wQ = false; }
    else { ng.castling.bK = false; ng.castling.bQ = false; }
  }
  if (pieceType === 'R') {
    if (fromRow === 7 && fromCol === 0) ng.castling.wQ = false;
    if (fromRow === 7 && fromCol === 7) ng.castling.wK = false;
    if (fromRow === 0 && fromCol === 0) ng.castling.bQ = false;
    if (fromRow === 0 && fromCol === 7) ng.castling.bK = false;
  }

  ng.turn = ng.turn === 'white' ? 'black' : 'white';
  return ng;
}

// Build array of game states for a move sequence
function buildStates(moves) {
  const states = [createGame()];
  for (const san of moves) {
    const prev = states[states.length - 1];
    states.push(makeMove(prev, san));
  }
  return states;
}

// Get legal destinations for a piece at (r,c) given game state
function getLegalMoves(g, r, c) {
  const moves = [];
  for (let tr = 0; tr < 8; tr++) {
    for (let tc = 0; tc < 8; tc++) {
      if (canMove(g, r, c, tr, tc)) moves.push([tr, tc]);
    }
  }
  return moves;
}

// Find SAN for a from->to move (used in practice mode)
function moveToSAN(g, fromRow, fromCol, toRow, toCol) {
  const piece = g.board[fromRow][fromCol];
  if (!piece) return null;
  const pt = piece.toUpperCase();
  const files = 'abcdefgh';
  const toSq = files[toCol] + (8 - toRow);

  if (pt === 'K') {
    // Check castling
    if (fromRow === (g.turn === 'white' ? 7 : 0) && fromCol === 4) {
      if (toCol === 6) return 'O-O';
      if (toCol === 2) return 'O-O-O';
    }
    return 'K' + toSq;
  }

  const isCapture = g.board[toRow][toCol] !== null ||
    (pt === 'P' && fromCol !== toCol && g.enPassant && g.enPassant[0] === toRow && g.enPassant[1] === toCol);

  if (pt === 'P') {
    if (fromCol !== toCol) return files[fromCol] + 'x' + toSq;
    return toSq;
  }

  // Check disambiguation
  let needFile = false, needRank = false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r === fromRow && c === fromCol) continue;
      const p2 = g.board[r][c];
      if (!p2 || p2.toUpperCase() !== pt) continue;
      if ((p2 === p2.toUpperCase()) !== (piece === piece.toUpperCase())) continue;
      if (canMove(g, r, c, toRow, toCol)) {
        if (c !== fromCol) needFile = true;
        else needRank = true;
      }
    }
  }

  let disambig = '';
  if (needFile) disambig += files[fromCol];
  if (needRank) disambig += (8 - fromRow);

  return pt + disambig + (isCapture ? 'x' : '') + toSq;
}

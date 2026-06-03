// Chess Openings Data — Comprehensive Edition
// 20 openings × 4-9 lines each ≈ 95 total lines

const OPENINGS = [

  // =====================================================================
  // WHITE OPENINGS
  // =====================================================================

  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    color: 'white',
    eco: 'C60-C99',
    description: 'One of the oldest and most classical openings. White attacks the Nc6 that defends e5, aiming for long-term pressure.',
    lines: [
      {
        id: 'morphy-main',
        name: 'Morphy Defense — Main',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','O-O','c3','d6','h3','Nb8','d4','Nbd7'],
        description: 'The most popular line. Black supports e5 and completes development before counterattacking with Nb8-d7.',
        keyIdeas: ['Ba4 retreats after a6','Re1 defends e4','c3 prepares d4','h3 prevents Bg4','d4 central break']
      },
      {
        id: 'exchange-variation',
        name: 'Exchange Variation',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Bxc6','dxc6','O-O','f6','d4','exd4','Nxd4','c5','Ne2','Qxd1'],
        description: 'White trades bishop for knight, giving Black doubled c-pawns but the bishop pair. Simplifying endgame strategy.',
        keyIdeas: ['Bxc6 gives Black doubled pawns','Bishop pair compensation for Black','Endgame edge for White','Attack c5–c6 weakness']
      },
      {
        id: 'berlin-defense',
        name: 'Berlin Defense',
        moves: ['e4','e5','Nf3','Nc6','Bb5','Nf6','O-O','Nxe4','d4','Nd6','Bxc6','dxc6','dxe5','Nf5','Qxd8+','Kxd8','Nc3','Ke8','h3'],
        description: 'The "Berlin Wall." Black enters a queenless endgame. Extremely solid and hard to crack.',
        keyIdeas: ['Nxe4 sacrifices knight','Queenless endgame after Qxd8+','King on d8 surprisingly safe','Bishop pair is Black\'s asset']
      },
      {
        id: 'classical-bc5',
        name: 'Classical Defense (Bc5)',
        moves: ['e4','e5','Nf3','Nc6','Bb5','Bc5','c3','Nf6','O-O','O-O','d4','Bb6','dxe5','Nxe5','Nxe5','d5'],
        description: 'Black mirrors White and fights for the center with Bc5. The "Classical" defense — solid and ambitious.',
        keyIdeas: ['Bc5 mirrors White strategy','c3+d4 central break','Bb6 retreats safely','d5 counterattack after exd5']
      },
      {
        id: 'schliemann',
        name: 'Schliemann-Jaenisch Gambit',
        moves: ['e4','e5','Nf3','Nc6','Bb5','f5','Nc3','fxe4','Nxe4','d5','Nxe5','dxe4','Nxc6','Qg5','Qe2','Nf6'],
        description: 'Black strikes immediately with f5, offering a gambit for dynamic counterplay. Very sharp and provocative.',
        keyIdeas: ['f5 fights back immediately','Accept or decline: both critical','Tactical complications ensue','King safety issues for both sides']
      },
      {
        id: 'open-variation',
        name: 'Open Variation',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Nxe4','d4','b5','Bb3','d5','dxe5','Be6','Nbd2','Nc5','c3','d4'],
        description: 'Black opens the position with Nxe4 and d5, creating dynamic imbalances. Highly theoretical.',
        keyIdeas: ['Nxe4 opens the position','d5 creates counterplay','Be6 develops with tempo','Tactical middlegame']
      },
      {
        id: 'marshall-attack',
        name: 'Marshall Attack',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','O-O','c3','d5','exd5','Nxd5','Nxe5','Nxe5','Rxe5','c6','d4','Bd6','Re1','Qh4'],
        description: 'Black sacrifices a pawn for a ferocious attack. One of the most feared gambits in chess.',
        keyIdeas: ['d5 pawn sacrifice','Nxd5 Nxe5 attack launch','Bd6 battery with Qh4','Attack against White king']
      },
      {
        id: 'breyer-variation',
        name: 'Breyer Variation',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','O-O','c3','d6','h3','Nb8','d4','Nbd7','Nbd2','Bb7','Bc2','Re8'],
        description: 'Nb8 repositions to d7 for a more harmonious setup. One of the deepest Ruy Lopez systems.',
        keyIdeas: ['Nb8 to d7 repositioning','Bb7 prepares c5','Re8 defends e5','Long maneuvering game']
      },
      {
        id: 'chigorin-defense',
        name: 'Chigorin Defense',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','O-O','c3','d6','h3','Na5','Bc2','c5','d4','Qc7'],
        description: 'Na5 chases the bishop and prepares c5. Active queen helps counterplay on the c-file.',
        keyIdeas: ['Na5 chases Bb3','c5 attacks White center','Qc7 supports c-file play','Unbalanced middlegame']
      }
    ]
  },

  {
    id: 'italian-game',
    name: 'Italian Game',
    color: 'white',
    eco: 'C50-C59',
    description: 'White targets f7 and the center with Bc4. A classic opening with many tactical and positional paths.',
    lines: [
      {
        id: 'giuoco-piano',
        name: 'Giuoco Piano',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','c3','Nf6','d4','exd4','cxd4','Bb4+','Bd2','Bxd2+','Nbxd2','d5'],
        description: 'The "Quiet Game." White builds a center with c3+d4. Black must react actively or be squeezed.',
        keyIdeas: ['c3 prepares d4','Bb4+ disrupts White rhythm','d5 counterattack is key','Open center with piece play']
      },
      {
        id: 'two-knights',
        name: 'Two Knights Defense',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Nf6','Ng5','d5','exd5','Na5','Bb5+','c6','dxc6','bxc6','Be2','h6','Nf3','e4','Ne5','Qd4'],
        description: 'Black attacks with Nf6 and d5. White\'s Ng5 attacks f7. Wild and tactical complications follow.',
        keyIdeas: ['Ng5 threatens f7','Na5 chases Bc4','h6 kicks Ng5 back','Wild tactical positions']
      },
      {
        id: 'evans-gambit',
        name: 'Evans Gambit',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','b4','Bxb4','c3','Ba5','d4','exd4','O-O','dxc3','Qb3','Qf6','e5','Qg6','Nxc3'],
        description: 'A romantic gambit — White sacrifices a pawn for rapid development and a fierce attack.',
        keyIdeas: ['b4 gambit pawn','Rapid development after cxd4','O-O first then Qb3','Initiative is the compensation']
      },
      {
        id: 'fried-liver',
        name: 'Fried Liver Attack',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Nf6','Ng5','d5','exd5','Nxd5','Nxf7','Kxf7','Qf3+','Ke6','Nc3','Nce7','d4','c6'],
        description: 'White sacrifices a knight on f7 for a ferocious king hunt. One of the most aggressive openings.',
        keyIdeas: ['Nxf7 king sacrifice','King is hunted across the board','Qf3+ with immediate pressure','Piece coordination attacks']
      },
      {
        id: 'hungarian-defense',
        name: 'Hungarian Defense',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Be7','d4','d6','O-O','Nf6','Re1','exd4','Nxd4','O-O','Nc3'],
        description: 'Black plays Be7 instead of Bc5, opting for a solid, passive setup. White keeps pressure.',
        keyIdeas: ['Be7 solid but passive','d6 solid center','White gets space advantage','Piece activity vs solid structure']
      },
      {
        id: 'italian-modern',
        name: 'Italian Modern (Slow)',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','O-O','Nf6','d3','O-O','c3','d5','exd5','Nxd5','Re1','Bg4'],
        description: 'The modern approach: slow development before d4. White maintains long-term pressure without committing.',
        keyIdeas: ['d3 before d4 — flexible','Re1 eyes e5','c3 supports later d4','Positional squeeze']
      }
    ]
  },

  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    color: 'white',
    eco: 'D06-D69',
    description: 'White offers a wing pawn to seize the center. The most classical and respected Queen Pawn opening.',
    lines: [
      {
        id: 'qgd-classical',
        name: 'QGD Classical',
        moves: ['d4','d5','c4','e6','Nc3','Nf6','Bg5','Be7','e3','O-O','Nf3','h6','Bh4','b6','cxd5','Nxd5','Bxe7','Qxe7'],
        description: 'The classical QGD. Black builds a solid fortress and maintains the center.',
        keyIdeas: ['Bg5 pins Nf6','e3 supports center','Bh4 retreats but keeps pin','Solid structure for Black']
      },
      {
        id: 'qga',
        name: "Queen's Gambit Accepted",
        moves: ['d4','d5','c4','dxc4','Nf3','Nf6','e3','e6','Bxc4','c5','O-O','a6','Qe2','b5','Bb3','Bb7'],
        description: 'Black accepts the gambit and fights for equality. White recovers the pawn with lasting pressure.',
        keyIdeas: ['Accept gambit and hold pawn','White recaptures on c4','Fight for d5 square','Active piece play for Black']
      },
      {
        id: 'slav-defense',
        name: 'Slav Defense',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','dxc4','a4','Bf5','e3','e6','Bxc4','Bb4','O-O','O-O'],
        description: 'c6 supports d5 while keeping the c8 bishop free. One of the soundest defenses.',
        keyIdeas: ['c6 defends d5','Bf5 free development','a4 prevents b5','Solid but active setup']
      },
      {
        id: 'semi-slav',
        name: 'Semi-Slav / Meran',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','e6','e3','Nbd7','Bd3','dxc4','Bxc4','b5','Bd3','a6','e4'],
        description: 'Black adds e6 to the Slav — gives flexibility. The Meran leads to rich tactical middlegames.',
        keyIdeas: ['e6 adds flexibility','b5 counterplay after dxc4','Meran: richest theoretical lines','Fight for center with b5-b4']
      },
      {
        id: 'tarrasch-defense',
        name: 'Tarrasch Defense',
        moves: ['d4','d5','c4','e6','Nc3','c5','cxd5','exd5','Nf3','Nc6','g3','Nf6','Bg2','Be7','O-O','O-O','dxc5','Bxc5'],
        description: 'Black accepts an isolated d-pawn in exchange for active pieces and open lines.',
        keyIdeas: ['IQP (isolated queen pawn)','Active pieces compensate','Fight for d4 square','Dynamic piece play']
      },
      {
        id: 'orthodox-defense',
        name: 'Orthodox Defense',
        moves: ['d4','d5','c4','e6','Nc3','Nf6','Bg5','Be7','e3','O-O','Nf3','Nbd7','Rc1','c6','Bd3','dxc4','Bxc4','Nd5'],
        description: 'Black develops harmoniously without taking risks. The most classical QGD setup.',
        keyIdeas: ['Nbd7 develops naturally','c6 supports d5','Nd5 central knight','Solid queenside pawn structure']
      },
      {
        id: 'cambridge-springs',
        name: 'Cambridge Springs Defense',
        moves: ['d4','d5','c4','e6','Nc3','Nf6','Bg5','Nbd7','e3','c6','Nf3','Qa5','Nd2','Bb4','Qc2','O-O'],
        description: 'Qa5 pins Nc3 and attacks the bishop. Forces White to be careful — trappy and active.',
        keyIdeas: ['Qa5 pin and pressure','Bb4 adds to pressure on Nc3','Active queen early','Tactical complications']
      }
    ]
  },

  {
    id: 'kings-gambit',
    name: "King's Gambit",
    color: 'white',
    eco: 'C30-C39',
    description: 'White sacrifices the f-pawn for rapid development and a king-side attack. The most romantic gambit in chess.',
    lines: [
      {
        id: 'kga-kieseritzky',
        name: 'KGA — Kieseritzky Gambit',
        moves: ['e4','e5','f4','exf4','Nf3','g5','h4','g4','Ne5','Nf6','Bc4','d5','exd5','Bd6','d4','Nh5'],
        description: 'Black defends the f4 pawn with g5, White attacks with h4. Extremely sharp and tactically rich.',
        keyIdeas: ['h4 attacks g5 pawn','Ne5 central knight sacrifice','Tactical fire on both sides','Attack and counter-attack']
      },
      {
        id: 'kga-muzio',
        name: 'KGA — Muzio Gambit',
        moves: ['e4','e5','f4','exf4','Nf3','g5','Bc4','g4','O-O','gxf3','Qxf3','Nc6','d3','Qf6','Nc3','Bc5+','Kh1','d6'],
        description: 'White sacrifices the knight for devastating piece activity. The most aggressive gambit in chess.',
        keyIdeas: ['O-O piece sacrifice','Qxf3 with massive development','Two pawns and attack for knight','Rapid attacking development']
      },
      {
        id: 'kga-cunningham',
        name: 'KGA — Cunningham Gambit',
        moves: ['e4','e5','f4','exf4','Nf3','Be7','Bc4','Bh4+','Kf1','d5','Bxd5','Nf6','Nc3','c6','Bb3','O-O'],
        description: 'Be7-h4+ forces the king to f1 early. Black gets practical compensation and initiative.',
        keyIdeas: ['Be7-h4+ disrupts castling','Kf1 is awkward','d5 immediate counterattack','Black gets activity']
      },
      {
        id: 'kgd-falkbeer',
        name: 'KGD — Falkbeer Countergambit',
        moves: ['e4','e5','f4','d5','exd5','e4','d3','Nf6','dxe4','Nxe4','Nf3','Bc5','Qe2','Bf5','Nc3','Qe7'],
        description: 'Black counters with d5 instead of accepting. White must accept or face a worse position.',
        keyIdeas: ['d5 counter-gambit','Black gets initiative','Nf6 develops with tempo','Active piece play']
      },
      {
        id: 'kgd-classical',
        name: 'KGD — Classical (Bc5)',
        moves: ['e4','e5','f4','Bc5','Nf3','d6','Nc3','Nf6','Bc4','Nc6','d3','Bg4','h3','Bxf3','Qxf3','Nd4'],
        description: 'Black declines with Bc5 and keeps a solid position. White plays for central control.',
        keyIdeas: ['Bc5 solid decline','Bg4 pin on Nf3','Nd4 fork threat','Piece activity vs structure']
      }
    ]
  },

  {
    id: 'london-system',
    name: 'London System',
    color: 'white',
    eco: 'D02',
    description: 'A reliable, solid system. White builds d4-Nf3-Bf4 regardless of Black\'s setup. Very flexible.',
    lines: [
      {
        id: 'london-main',
        name: 'London vs d5',
        moves: ['d4','d5','Nf3','Nf6','Bf4','e6','e3','Bd6','Bg3','O-O','Bd3','c5','c3','Nc6','Nbd2','Re8'],
        description: 'The classic London. White trades off the Bd6 and prepares a kingside attack via Ne5 or h4.',
        keyIdeas: ['Bf4 before e3','Bg3 exchange idea','Bd3 strong bishop','Ne5 ideal knight square']
      },
      {
        id: 'london-vs-kid',
        name: 'London vs King\'s Indian',
        moves: ['d4','Nf6','Nf3','g6','Bf4','Bg7','e3','O-O','Be2','d6','O-O','c5','c3','Nc6','h3','Qb6'],
        description: 'White uses the London against the fianchetto setup. h3 prevents Ng4 and keeps the structure.',
        keyIdeas: ['London works vs KID too','h3 prevents Ng4','c3 stabilizes center','Flexible piece positions']
      },
      {
        id: 'london-vs-dutch',
        name: 'London vs Dutch',
        moves: ['d4','f5','Nf3','Nf6','Bf4','e6','e3','d5','Bd3','Bd6','Bg3','O-O','c3','c6','Nbd2','Qe7'],
        description: 'White uses London against the Dutch. The bishop trade on Bd6 is an important theme.',
        keyIdeas: ['Bf4 before e3','Bxd6 trade is good','Nbd2 solid development','Queenside play later']
      },
      {
        id: 'jobava-london',
        name: 'Jobava London',
        moves: ['d4','Nf6','Nc3','d5','Bf4','e6','e3','Bd6','Nb5','Bxf4','exf4','Be7','Nf3','O-O','g3','c5'],
        description: 'Nc3 on move 2 — the Jobava London. More aggressive, aiming for Nb5 tricks and quick development.',
        keyIdeas: ['Nc3 before Nf3','Nb5 attacks Bd6','More aggressive than normal London','Quick development and pressure']
      }
    ]
  },

  {
    id: 'english-opening',
    name: 'English Opening',
    color: 'white',
    eco: 'A10-A39',
    description: 'White controls d5 indirectly with c4. Hypermodern and flexible — often transposes to other openings.',
    lines: [
      {
        id: 'symmetrical',
        name: 'Symmetrical Variation',
        moves: ['c4','c5','Nc3','Nf6','g3','g6','Bg2','Bg7','Nf3','O-O','O-O','Nc6','d3','d6','Rb1','a5','a3'],
        description: 'Black mirrors White perfectly. White must break symmetry. Rich positional battle.',
        keyIdeas: ['Control d5 from c4','Fianchetto bishop on g2','b4 breaks symmetry','Long-term positional squeeze']
      },
      {
        id: 'reversed-sicilian',
        name: 'Reversed Sicilian',
        moves: ['c4','e5','Nc3','Nf6','g3','d5','cxd5','Nxd5','Bg2','Nb6','Nf3','Nc6','O-O','Be7','d3','O-O'],
        description: 'White plays a Sicilian structure with an extra tempo. Rich strategic middlegame with many plans.',
        keyIdeas: ['Extra tempo vs Sicilian','Control d4 square','Flexible pawn structure','Positional pressure']
      },
      {
        id: 'anglo-indian',
        name: 'Anglo-Indian',
        moves: ['c4','Nf6','Nc3','e6','e4','d5','e5','d4','exf6','dxc3','bxc3','Qxf6','d4','e5'],
        description: 'e4 aims for a King\'s Pawn style game. Sharp and tactical with piece activity.',
        keyIdeas: ['e4 stakes central claim','exf6 gives piece','Central tension','Active piece play']
      },
      {
        id: 'four-knights-english',
        name: 'Four Knights English',
        moves: ['c4','Nf6','Nc3','Nc6','Nf3','e5','g3','Bb4','Bg2','O-O','O-O','e4','Ng5','Bxc3','bxc3','Re8'],
        description: 'All four knights come out immediately. Symmetrical development with dynamic play.',
        keyIdeas: ['All knights developed first','Bb4 pin on Nc3','Bxc3 gets bishop pair','Doubled pawns vs bishop pair']
      }
    ]
  },

  {
    id: 'vienna-game',
    name: 'Vienna Game',
    color: 'white',
    eco: 'C25-C29',
    description: 'Nc3 before Nf3 — flexible and often leads to sharp play. Can transpose to King\'s Gambit-like positions.',
    lines: [
      {
        id: 'vienna-gambit',
        name: 'Vienna Gambit',
        moves: ['e4','e5','Nc3','Nc6','f4','exf4','Nf3','g5','d4','g4','Bc4','gxf3','Qxf3','Ne5','Qh5'],
        description: 'f4 offers a King\'s Gambit-style pawn sacrifice. White gets huge development advantage.',
        keyIdeas: ['f4 gambit for open f-file','Attack before Black develops','Piece activity over material','Sacrificial play']
      },
      {
        id: 'frankenstein-dracula',
        name: 'Frankenstein-Dracula',
        moves: ['e4','e5','Nc3','Nf6','Bc4','Nxe4','Qh5','Nd6','Bb3','Nc6','Nb5','g6','Qf3','f5','Qd5','Qe7'],
        description: 'One of the most wildly tactical openings. Both sides have extreme attacking chances.',
        keyIdeas: ['Nxe4 accepted','Qh5 threatens Qxf7','Nb5 attacks Nd6','Wild chaos on both sides']
      },
      {
        id: 'three-knights',
        name: 'Three Knights Variation',
        moves: ['e4','e5','Nc3','Nc6','Nf3','Nf6','d4','exd4','Nxd4','Bb4','Nxc6','bxc6','Bd3','d5','exd5','cxd5'],
        description: 'Nf3 transposes to a Three Knights game. Open and active play for both sides.',
        keyIdeas: ['Three knights vs three','Open center after d4','Bishop pair for Black','Active piece game']
      },
      {
        id: 'vienna-bishop',
        name: 'Vienna with f4 Counter',
        moves: ['e4','e5','Nc3','Nf6','f4','d5','fxe5','Nxe4','Nf3','Bg4','Qe2','Nxc3','dxc3','Bxf3','gxf3','d4'],
        description: 'Black meets f4 with d5, sacrificing a pawn for active piece play.',
        keyIdeas: ['d5 meets f4 aggressively','Piece activity over pawn','f3 weakens White king','Dynamic compensation']
      }
    ]
  },

  {
    id: 'scotch-game',
    name: 'Scotch Game',
    color: 'white',
    eco: 'C44-C45',
    description: 'White opens the center immediately with d4 on move 3. Open, direct chess that challenges Black early.',
    lines: [
      {
        id: 'scotch-main',
        name: 'Scotch Game Main Line',
        moves: ['e4','e5','Nf3','Nc6','d4','exd4','Nxd4','Nf6','Nxc6','bxc6','e5','Qe7','Qe2','Nd5','c4','Ba6','b3'],
        description: 'Nxc6 gives Black doubled pawns but the bishop pair. White plays e5 and fights for the center.',
        keyIdeas: ['Open center immediately','Nxc6 doubled pawn theme','Bishop pair vs doubled pawns','e5 restricts Black']
      },
      {
        id: 'scotch-gambit',
        name: 'Scotch Gambit',
        moves: ['e4','e5','Nf3','Nc6','d4','exd4','Bc4','Bc5','Ng5','Nh6','Nxf7','Nxf7','Bxf7+','Kxf7','Qh5+','g6','Qxc5'],
        description: 'Bc4 instead of Nxd4 — sacrificing a knight on f7 for a savage attack.',
        keyIdeas: ['Bc4 avoids recapture','Ng5 threatens f7','Nxf7 sacrifice','Attack exposed king']
      },
      {
        id: 'mieses-variation',
        name: 'Mieses Variation',
        moves: ['e4','e5','Nf3','Nc6','d4','exd4','Nxd4','Nf6','Nxc6','bxc6','Nd2','Bc5','Bd3','d5','exd5','cxd5','O-O','O-O'],
        description: 'Nd2 supports e4 and prepares for development. More positional than the main line.',
        keyIdeas: ['Nd2 flexible development','Bd3 solid bishop','Fight for e4 and d5','Positional middlegame']
      },
      {
        id: 'scotch-four-knights',
        name: 'Scotch Four Knights',
        moves: ['e4','e5','Nf3','Nc6','d4','exd4','Nxd4','Nf6','Nc3','Bb4','Nxc6','bxc6','Bd3','d5','exd5','cxd5','O-O','O-O'],
        description: 'Nc3 allows Black to pin it with Bb4. Sharp and well-analyzed.',
        keyIdeas: ['Bb4 pin on Nc3','Nxc6 forced','d5 counterattack','Bishop pair dynamic play']
      }
    ]
  },

  {
    id: 'catalan-opening',
    name: 'Catalan Opening',
    color: 'white',
    eco: 'E00-E09',
    description: 'White combines QGD structure with a kingside fianchetto. Lasting positional pressure down the long diagonal.',
    lines: [
      {
        id: 'open-catalan',
        name: 'Open Catalan',
        moves: ['d4','Nf6','c4','e6','g3','d5','Bg2','dxc4','Nf3','Be7','O-O','O-O','Qc2','a6','Qxc4','b5','Qc2','Bb7'],
        description: 'Black captures dxc4 and White regains with Qc2. Long-term diagonal pressure from g2.',
        keyIdeas: ['Long diagonal Bg2','Qc2 regains c4 pawn','Lasting positional pressure','Space advantage queenside']
      },
      {
        id: 'closed-catalan',
        name: 'Closed Catalan',
        moves: ['d4','Nf6','c4','e6','g3','d5','Bg2','Be7','Nf3','O-O','O-O','dxc4','Qc2','a6','Rd1','b5','Qxc4','Bb7'],
        description: 'Black maintains d5 tension then releases it. White keeps long-term pressure.',
        keyIdeas: ['Hold d5 tension','Rd1 pressures d-file','Patient positional grind','Prove bishop\'s worth']
      },
      {
        id: 'catalan-qid',
        name: 'Catalan vs QID Setup',
        moves: ['d4','Nf6','c4','e6','Nf3','b6','g3','Bb7','Bg2','Be7','O-O','O-O','Nc3','Ne4','Qc2','Nxc3','Qxc3','f5'],
        description: 'Black fianchettoes on b7 instead of taking c4. Active bishop controls long diagonal.',
        keyIdeas: ['Bb7 fights g2 bishop','Ne4 aggressive knight','f5 kingside counterplay','Diagonal battle on a8-h1']
      }
    ]
  },

  {
    id: 'kings-indian-attack',
    name: "King's Indian Attack",
    color: 'white',
    eco: 'A07-A08',
    description: 'White builds a KID-like setup as White regardless of Black\'s choices. Flexible and dangerous.',
    lines: [
      {
        id: 'kia-vs-french',
        name: 'KIA vs French Setup',
        moves: ['e4','e6','d3','d5','Nd2','Nf6','Ngf3','c5','g3','Nc6','Bg2','Be7','O-O','O-O','Re1','b5','e5','Nd7'],
        description: 'White builds the KID as White against the French setup. Aims for the e5 advance.',
        keyIdeas: ['e5 advance is key plan','Re1 supports e4-e5','Kingside attack after castling','Nd7 blocks e5 advance']
      },
      {
        id: 'kia-vs-sicilian',
        name: 'KIA vs Sicilian',
        moves: ['e4','c5','Nf3','e6','d3','Nc6','g3','g6','Bg2','Bg7','O-O','Nge7','Re1','d6','c3','O-O','d4'],
        description: 'KIA against Sicilian players. Avoids theory and builds a kingside attack.',
        keyIdeas: ['Avoid Sicilian theory','Flexible setup','e5 break after preparation','Kingside pawn storm']
      },
      {
        id: 'kia-vs-caro',
        name: 'KIA vs Caro-Kann',
        moves: ['e4','c6','d3','d5','Nd2','Nf6','Ngf3','e5','g3','Bd6','Bg2','O-O','O-O','Re8','Re1','Nbd7'],
        description: 'KIA against Caro-Kann setup. Black mirrors positional play.',
        keyIdeas: ['Solid KIA setup','e5 response from Black','Flexible plans for both','Re1 supports e4']
      }
    ]
  },

  // =====================================================================
  // BLACK OPENINGS
  // =====================================================================

  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    color: 'black',
    eco: 'B20-B99',
    description: 'The most popular response to 1.e4. Black fights asymmetrically, leading to rich, unbalanced positions.',
    lines: [
      {
        id: 'najdorf',
        name: 'Najdorf — English Attack',
        moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6','Be3','e5','Nb3','Be6','f3','h5'],
        description: 'a6 stops Nb5. The English Attack (Be3/f3/g4) is White\'s most popular weapon. Black fights back with h5.',
        keyIdeas: ['a6 prevents Nb5','Be6 fights for d5 square','h5 stops g4 advance','Counter-attack on queenside']
      },
      {
        id: 'najdorf-6bg5',
        name: 'Najdorf — 6.Bg5',
        moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6','Bg5','e6','f4','Qb6','Qd2','Qxb2'],
        description: '6.Bg5 is Tal\'s line — highly tactical. Black goes Qb6-Qxb2 if daring.',
        keyIdeas: ['Bg5 pins Nf6','Qb6 counter-pressure','Qxb2 grab b2 if brave','Wild tactical fight']
      },
      {
        id: 'dragon',
        name: 'Dragon — Yugoslav Attack',
        moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','g6','Be3','Bg7','f3','O-O','Qd2','Nc6','Bc4','Bd7','O-O-O'],
        description: 'g6+Bg7 creates the fearsome dragon bishop. White attacks kingside, Black counters queenside.',
        keyIdeas: ['Dragon bishop on g7 dominates','Castle opposite sides','h5-h4 queenside storm','Race between attacks']
      },
      {
        id: 'scheveningen',
        name: 'Scheveningen Variation',
        moves: ['e4','c5','Nf3','e6','d4','cxd4','Nxd4','Nf6','Nc3','d6','Be2','Be7','O-O','O-O','f4','a6','Kh1','Qc7'],
        description: 'e6+d6 small center. Flexible and solid — can transpose to Najdorf or Keres Attack lines.',
        keyIdeas: ['e6+d6 small center','Flexible structure','Counter with b5 or Nc6-d4','Positional but fighting chess']
      },
      {
        id: 'classical-sicilian',
        name: 'Classical Variation',
        moves: ['e4','c5','Nf3','Nc6','d4','cxd4','Nxd4','Nf6','Nc3','d6','Bg5','e6','Qd2','Be7','O-O-O','O-O','f4','a6'],
        description: 'Nc6 develops naturally and fights for d4. Classical and solid with active counterplay.',
        keyIdeas: ['Nc6 fights for d4','Bg5 pin on Nf6','Opposite side castling','Race of attacks']
      },
      {
        id: 'kan-taimanov',
        name: 'Kan / Taimanov',
        moves: ['e4','c5','Nf3','e6','d4','cxd4','Nxd4','a6','Nc3','Qc7','Bd3','Nf6','O-O','Nc6','Nxc6','bxc6'],
        description: 'a6 + Qc7: flexible and avoids being pinned. Can transpose to Scheveningen or Najdorf.',
        keyIdeas: ['a6 prevents Nb5','Qc7 flexible queen','Transpose to Scheveningen or Najdorf','Avoid early theory']
      },
      {
        id: 'accelerated-dragon',
        name: 'Accelerated Dragon',
        moves: ['e4','c5','Nf3','Nc6','d4','cxd4','Nxd4','g6','c4','Bg7','Be3','Nf6','Nc3','d6','Be2','O-O','O-O'],
        description: 'g6+Bg7 without d6 first — skips the Yugoslav Attack. The Maroczy Bind is White\'s best try.',
        keyIdeas: ['g6 without d6','Avoid Yugoslav Attack','Maroczy Bind c4 pawn','Fight for d5 square']
      },
      {
        id: 'grand-prix',
        name: 'Grand Prix Attack (defense)',
        moves: ['e4','c5','Nc3','Nc6','f4','g6','Nf3','Bg7','Bc4','e6','f5','Nge7','fxe6','dxe6','Bb3','Na5'],
        description: 'White plays Nc3+f4 without d4. Black must counter actively or get crushed.',
        keyIdeas: ['Na5 chases Bc4','e6 limits f5 attack','Bg7 dragon bishop defends','Active counterplay needed']
      }
    ]
  },

  {
    id: 'french-defense',
    name: 'French Defense',
    color: 'black',
    eco: 'C00-C19',
    description: 'Solid and combative. Black accepts a cramped position and fights back with c5 and f6.',
    lines: [
      {
        id: 'winawer',
        name: 'Winawer Variation',
        moves: ['e4','e6','d4','d5','Nc3','Bb4','e5','c5','a3','Bxc3+','bxc3','Ne7','Qg4','Qc7','Qxg7','Rg8','Qxh7','cxd4'],
        description: 'Bb4 pins Nc3 and doubles White\'s pawns. Wild and tactical — both kings are often in danger.',
        keyIdeas: ['Bb4 pins Nc3','Bxc3+ doubles pawns','Ne7 avoids f4 pin','c5 attacks d4']
      },
      {
        id: 'classical-french',
        name: 'Classical Variation',
        moves: ['e4','e6','d4','d5','Nc3','Nf6','Bg5','Be7','e5','Nfd7','Bxe7','Qxe7','f4','O-O','Nf3','c5'],
        description: 'Black develops normally with Nf6/Be7. After e5, Black fights with c5.',
        keyIdeas: ['Nf6 challenges e4','c5 attacks d4','f6 pawn break later','Fight for e5 square']
      },
      {
        id: 'advance-french',
        name: 'Advance Variation',
        moves: ['e4','e6','d4','d5','e5','c5','c3','Nc6','Nf3','Qb6','Be2','cxd4','cxd4','Nh6','Nc3','Nf5'],
        description: 'White advances e5 early. Black attacks d4 with Qb6 and c5.',
        keyIdeas: ['c5 attacks d4 immediately','Qb6 targets b2 and d4','Nf5 after h3 kicks','Fight for c4 and d4']
      },
      {
        id: 'tarrasch-french',
        name: 'Tarrasch Variation (3.Nd2)',
        moves: ['e4','e6','d4','d5','Nd2','Nf6','e5','Nfd7','Bd3','c5','c3','Nc6','Ngf3','cxd4','cxd4','f6'],
        description: 'Nd2 avoids pin but is less aggressive. Black can fight with c5 and later f6.',
        keyIdeas: ['Nd2 avoids Bb4 pin','c5 attacks d4 again','f6 challenges e5','Flexible Black structure']
      },
      {
        id: 'exchange-french',
        name: 'Exchange Variation',
        moves: ['e4','e6','d4','d5','exd5','exd5','Bd3','Nf6','Nf3','Bd6','O-O','O-O','Bg5','c6','Nbd2','Bg4'],
        description: 'Symmetrical pawn structure. White tries to prove equality is not enough. Very solid for Black.',
        keyIdeas: ['Symmetrical structure','Fight for active pieces','Bg4 pin on Nf3','Minority attack queenside']
      },
      {
        id: 'mccutcheon',
        name: 'McCutcheon Variation',
        moves: ['e4','e6','d4','d5','Nc3','Nf6','Bg5','Bb4','e5','h6','Bd2','Bxc3','bxc3','Ne4','Qg4','Kf8'],
        description: 'Bb4 pins Nc3 with Bg5 on the board. Double pin! Active and ambitious play by Black.',
        keyIdeas: ['Bb4 pins Nc3','Ne4 strong central knight','Kf8 avoids check','Active piece counterplay']
      }
    ]
  },

  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    color: 'black',
    eco: 'B10-B19',
    description: 'Solid and reliable. c6 supports d5 and keeps the c8 bishop outside the pawn chain.',
    lines: [
      {
        id: 'classical-ck',
        name: 'Classical Variation',
        moves: ['e4','c6','d4','d5','Nc3','dxe4','Nxe4','Bf5','Ng3','Bg6','h4','h6','Nf3','Nd7','h5','Bh7','Bd3','Bxd3','Qxd3','Ngf6'],
        description: 'Black exchanges on e4 then develops the bishop to f5. The most classical response.',
        keyIdeas: ['Exchange on e4','Active Bf5 development','h4-h5 threatens bishop','Solid structure']
      },
      {
        id: 'advance-ck',
        name: 'Advance Variation',
        moves: ['e4','c6','d4','d5','e5','Bf5','Nf3','e6','Be2','c5','Be3','cxd4','Nxd4','Bg6','O-O','Nc6','Nxc6','bxc6'],
        description: 'Better than French: bishop is OUTSIDE the pawn chain. c5 counterplay comes quickly.',
        keyIdeas: ['Bf5 before e6 key move','c5 attacks d4','Better than French: active bishop','Counterplay with Nc6-Nge7']
      },
      {
        id: 'exchange-ck',
        name: 'Exchange Variation',
        moves: ['e4','c6','d4','d5','exd5','cxd5','Bd3','Nc6','c3','Nf6','Bf4','Bg4','Qb3','Qd7','Nd2','e6'],
        description: 'Symmetrical pawns. Black fights for e4 and tries to activate the pieces.',
        keyIdeas: ['Symmetrical structure','Fight for e4-e5 squares','Bg4 pin on Nf3','Active piece play needed']
      },
      {
        id: 'panov-botvinnik',
        name: 'Panov-Botvinnik Attack',
        moves: ['e4','c6','d4','d5','exd5','cxd5','c4','Nf6','Nc3','e6','Nf3','Be7','cxd5','Nxd5','Bc4','O-O','O-O','Nc6'],
        description: 'White creates an isolated d-pawn. Dynamic and active play favored by attacking players.',
        keyIdeas: ['c4 creates IQP for White','Active piece compensation','Fight for d5 and d4','Dynamic positions']
      },
      {
        id: 'fantasy-ck',
        name: 'Fantasy Variation (3.f3)',
        moves: ['e4','c6','d4','d5','f3','e6','Nc3','dxe4','fxe4','e5','Nf3','Bb4','Bc4','Bxc3+','bxc3','exd4'],
        description: 'f3 is aggressive — keeps the center. Black can respond with e6 then e5.',
        keyIdeas: ['f3 keeps center solid','e5 counterattack with tempo','Bxc3+ gives bishop pair','exd4 opens position']
      }
    ]
  },

  {
    id: 'kings-indian-defense',
    name: "King's Indian Defense",
    color: 'black',
    eco: 'E60-E99',
    description: 'Black fianchettoes and lets White build a center, then strikes with e5 or c5. Dynamic and combative.',
    lines: [
      {
        id: 'kid-classical',
        name: 'Classical Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','Nf3','O-O','Be2','e5','O-O','Nc6','d5','Ne7','Ne1','Nd7','Nd3','f5'],
        description: 'The definitive KID. White takes queenside space, Black attacks kingside. Classic chess battle.',
        keyIdeas: ['Fianchetto Bg7','e5 stakes kingside','f5-f4 kingside storm','Ne7-g6-f4 maneuver']
      },
      {
        id: 'kid-samisch',
        name: 'Sämisch Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','f3','O-O','Be3','c5','d5','e6','Nge2','exd5','cxd5','a6'],
        description: 'f3 fortifies the center for a kingside pawn storm. Black must react immediately with c5.',
        keyIdeas: ['f3 prepares g4-h4-h5','c5 counter before locked','Explosive kingside attack coming','Black must react quickly']
      },
      {
        id: 'kid-four-pawns',
        name: 'Four Pawns Attack',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','f4','O-O','Nf3','c5','d5','e6','Be2','exd5','cxd5','Re8'],
        description: 'White builds a massive center with four pawns. Black must undermine it immediately.',
        keyIdeas: ['Four pawn center is powerful','c5 undermines d4','Re8 pressures e-file','Dynamic counter-attack']
      },
      {
        id: 'kid-averbakh',
        name: 'Averbakh Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','Be2','O-O','Bg5','h6','Be3','c5','d5','e6','dxe6','fxe6'],
        description: 'Be2+Bg5 avoids immediate complications. Black can still fight with c5 and e6.',
        keyIdeas: ['Bg5 pins Nf6','c5 counter-attack','e6 challenges d5','fxe6 recapture opens f-file']
      },
      {
        id: 'kid-petrosian',
        name: 'Petrosian System',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','Nf3','O-O','d5','a5','Be2','Nbd7','Bg5','h6','Bh4','Nh5'],
        description: 'd5 closes the center early. Black uses knight maneuvers to fight for activity.',
        keyIdeas: ['d5 closes center early','Nh5-f4 maneuver','a5 stops queenside expansion','Knight vs bishop fight']
      }
    ]
  },

  {
    id: 'nimzo-indian',
    name: 'Nimzo-Indian Defense',
    color: 'black',
    eco: 'E20-E59',
    description: 'Bb4 pins the c3 knight and pressures the center. Hypermodern, rich in strategy and tactics.',
    lines: [
      {
        id: 'rubinstein',
        name: 'Rubinstein Variation (4.e3)',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','e3','O-O','Bd3','d5','Nf3','c5','O-O','dxc4','Bxc4','cxd4','exd4','Nc6'],
        description: 'e3 is the classical main line. Black castles and later fights for equality with c5.',
        keyIdeas: ['Bb4 pins Nc3','Castle early','c5 attacks d4','IQP after cxd4']
      },
      {
        id: 'classical-nimzo',
        name: 'Classical (4.Qc2)',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','Qc2','d5','a3','Bxc3+','Qxc3','Ne4','Qc2','c5','dxc5','Nc6','Nf3','Qa5+'],
        description: 'Qc2 prevents doubled pawns. Black forces the exchange anyway or plays for piece activity.',
        keyIdeas: ['Qc2 prevents Bxc3 doubling','Bxc3 happens anyway','Ne4 strong central knight','Qa5+ regains material']
      },
      {
        id: 'hubner',
        name: 'Hübner Variation',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','e3','c5','Bd3','Nc6','Nf3','Bxc3+','bxc3','d6','e4','e5','d5','Ne7'],
        description: 'Bxc3+ gives Black the bishop pair. Black then builds a solid pawn structure.',
        keyIdeas: ['Bxc3+ gives bishop pair early','d6 solid center','e5 stakes space','Knights vs bishops battle']
      },
      {
        id: 'leningrad-nimzo',
        name: 'Leningrad Variation (4.Bg5)',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','Bg5','h6','Bh4','c5','d5','Bxc3+','bxc3','d6','e3','e5'],
        description: 'Bg5 pins Nf6. Black responds with h6-c5 and then trades the bishop anyway.',
        keyIdeas: ['Bg5 creates tension','h6 forces Bh4 retreat','c5 counterplay','Bxc3 exchange despite Bg5']
      },
      {
        id: 'spassky-nimzo',
        name: 'Spassky / 4.e3 Nge2',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','e3','O-O','Nge2','d5','a3','Bd6','c5','Be7','b4','b6','Nf4','a5'],
        description: 'Nge2 avoids blocking the f-pawn. White prepares a queenside expansion with b4.',
        keyIdeas: ['Nge2 unblocks f-pawn','b4 queenside expansion','c5 space grab','a5 Black counterplay']
      }
    ]
  },

  {
    id: 'grunfeld-defense',
    name: 'Grünfeld Defense',
    color: 'black',
    eco: 'D70-D99',
    description: 'Black allows White a huge center then attacks it with the Bg7. The ultimate hypermodern defense.',
    lines: [
      {
        id: 'exchange-grunfeld',
        name: 'Exchange Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','d5','cxd5','Nxd5','e4','Nxc3','bxc3','Bg7','Bc4','c5','Ne2','O-O','O-O','Nc6'],
        description: 'White builds a massive center. Black\'s Bg7 attacks it forever. The ultimate Grünfeld test.',
        keyIdeas: ['Bg7 attacks d4 constantly','c5 undermines White center','Trade center for piece activity','Dynamic equality or advantage']
      },
      {
        id: 'russian-grunfeld',
        name: 'Russian System (5.Qb3)',
        moves: ['d4','Nf6','c4','g6','Nc3','d5','Nf3','Bg7','Qb3','dxc4','Qxc4','O-O','e4','Bg4','Be3','Nfd7','Be2','Nb6'],
        description: 'Qb3 pressures d5 and b7. Black must find precise play to equalize.',
        keyIdeas: ['Qb3 attacks b7 and d5','Bg4 pin on Nf3','Nb6 repositioning','Tension on b7 pawn']
      },
      {
        id: 'brinckmann-grunfeld',
        name: 'Brinckmann Attack (4.Bf4)',
        moves: ['d4','Nf6','c4','g6','Nc3','d5','Bf4','Bg7','e3','O-O','Rc1','dxc4','Bxc4','c5','d5','b5','Bb3','a6'],
        description: 'Bf4 keeps the c4 pawn and prepares for d5. Black counterattacks with c5 and b5.',
        keyIdeas: ['Bf4 keeps c4 pawn','d5 space advantage','b5 counterplay','Active Bg7 needed']
      },
      {
        id: 'hungarian-grunfeld',
        name: 'Anti-Grünfeld (4.Bg5)',
        moves: ['d4','Nf6','c4','g6','Nc3','d5','Bg5','Ne4','Bh4','Nxc3','bxc3','dxc4','e3','Be6','Nf3','Bg7'],
        description: 'Bg5 avoids the main Grünfeld. Black fights with Ne4 and bishop activity.',
        keyIdeas: ['Ne4 attacks Bg5','Nxc3 bxc3 structural','dxc4 takes the pawn','Be6 develops with tempo']
      }
    ]
  },

  {
    id: 'dutch-defense',
    name: 'Dutch Defense',
    color: 'black',
    eco: 'A80-A99',
    description: 'f5 controls e4 from move one. Combative and unbalanced — Black aims for a kingside attack.',
    lines: [
      {
        id: 'stonewall-dutch',
        name: 'Stonewall Variation',
        moves: ['d4','e6','c4','f5','g3','Nf6','Bg2','d5','Nf3','c6','O-O','Bd6','b3','Qe7','Ne5','O-O','Nd2'],
        description: 'd5+e6+f5+c6 Stonewall formation. Solid and compact with a kingside attack via Bd6-h2.',
        keyIdeas: ['Stonewall: d5+e6+f5+c6','Bd6 aims at h2','Ne4 ideal knight square','Kingside attack with pieces']
      },
      {
        id: 'classical-dutch',
        name: 'Classical Dutch',
        moves: ['d4','f5','Nf3','Nf6','g3','e6','Bg2','Be7','O-O','O-O','c4','d6','Nc3','Qe8','Re1','Qh5'],
        description: 'Qe8-h5 is the classical attacking plan. Black storms the kingside while White expands.',
        keyIdeas: ['Qe8-h5 attack plan','Ng4 attacking ideas','f-file as attack route','Ne4 central knight']
      },
      {
        id: 'leningrad-dutch',
        name: 'Leningrad Dutch',
        moves: ['d4','f5','g3','Nf6','Bg2','g6','Nf3','Bg7','O-O','O-O','c4','d6','Nc3','c6','d5','e5'],
        description: 'g6+Bg7 adds a dragon-bishop to the Dutch. e5 counterplay is Black\'s main plan.',
        keyIdeas: ['Bg7 dragon bishop','e5 central counterplay','cxd5 opens c-file','Active piece play']
      }
    ]
  },

  {
    id: 'pirc-defense',
    name: 'Pirc Defense',
    color: 'black',
    eco: 'B07-B09',
    description: 'Black lets White build a big center then attacks it with the g7 bishop. Hypermodern and flexible.',
    lines: [
      {
        id: 'austrian-attack',
        name: 'Austrian Attack',
        moves: ['e4','d6','d4','Nf6','Nc3','g6','f4','Bg7','Nf3','O-O','Bd3','Na6','O-O','c5','d5','Nc7'],
        description: 'f4 gives White a huge center. Black must counterattack immediately or be overrun.',
        keyIdeas: ['Bg7 attacks the center','c5 undermines d4','Na6-c7 maneuver','Black must be active']
      },
      {
        id: 'classical-pirc',
        name: 'Classical Variation',
        moves: ['e4','d6','d4','Nf6','Nc3','g6','Nf3','Bg7','Be2','O-O','O-O','c6','a4','Nbd7','h3','e5'],
        description: 'Solid development for both sides. Black waits and then plays e5 for counterplay.',
        keyIdeas: ['Bg7 solid development','c6 solid structure','e5 central counterplay','Wait for right moment']
      },
      {
        id: 'pirc-150',
        name: '150 Attack (Be3/Qd2)',
        moves: ['e4','d6','d4','Nf6','Nc3','g6','Be3','Bg7','Qd2','c6','f3','b5','g4','b4','Nce2','Nbd7'],
        description: 'White plays Be3+Qd2+f3+g4 — a brutal kingside attack. Black fights with b5-b4.',
        keyIdeas: ['g4-g5 pawn storm coming','b5-b4 queenside counter','f3 prepares g4','Race of pawn storms']
      }
    ]
  },

  {
    id: 'slav-defense',
    name: 'Slav Defense',
    color: 'black',
    eco: 'D10-D19',
    description: 'c6 defends d5 while keeping the c8 bishop free. One of the most solid defenses to the QGD.',
    lines: [
      {
        id: 'slav-main',
        name: 'Main Line (dxc4)',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','dxc4','a4','Bf5','e3','e6','Bxc4','Bb4','O-O','O-O','Qe2'],
        description: 'Black accepts the gambit with dxc4 and develops Bf5 before e6.',
        keyIdeas: ['dxc4 accepts gambit','Bf5 before e6 is key','a4 stops b5','Solid Nbd7 development']
      },
      {
        id: 'semi-slav-meran',
        name: 'Semi-Slav / Meran',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','e6','e3','Nbd7','Bd3','dxc4','Bxc4','b5','Bd3','a6','e4','c5'],
        description: 'e6 before dxc4 — the Meran. Black gets the most active counterplay with b5 and c5.',
        keyIdeas: ['e6 then dxc4 Meran','b5 powerful counterplay','c5 attacks d4','Rich theoretical battle']
      },
      {
        id: 'czech-slav',
        name: 'Czech Variation (Bf5)',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','dxc4','a4','Bf5','Ne5','Nbd7','Nxc4','Qc7','g3','e5'],
        description: 'Bf5 instead of Bf5 after a4 — Black fights for the c4 pawn differently.',
        keyIdeas: ['Ne5 fights for c4','Qc7 keeps c4 pawn','e5 central break','Active Bf5']
      },
      {
        id: 'chameleon-slav',
        name: 'Chameleon Variation',
        moves: ['d4','d5','c4','c6','Nc3','Nf6','Nf3','dxc4','a4','Na6','e3','Bg4','Bxc4','e6','O-O','Nb4'],
        description: 'Na6 is unusual but playable. Black gets active piece play with Nb4.',
        keyIdeas: ['Na6 unusual but active','Nb4 strong square','Bg4 pin on Nf3','Active piece compensation']
      }
    ]
  },

  {
    id: 'queens-indian',
    name: "Queen's Indian Defense",
    color: 'black',
    eco: 'E12-E19',
    description: 'b6+Bb7 prevents e4 and fights the center with pieces, not pawns. Classic hypermodern play.',
    lines: [
      {
        id: 'qid-main',
        name: 'Main Line (4.g3)',
        moves: ['d4','Nf6','c4','e6','Nf3','b6','g3','Bb7','Bg2','Be7','O-O','O-O','Nc3','Ne4','Qc2','Nxc3','Qxc3','d5'],
        description: 'Bb7 fianchetto controls the a8-h1 diagonal and fights e4. Very harmonious setup.',
        keyIdeas: ['Bb7 controls e4+d5','Ne4 centralizes','d5 fights for center','Bishop battle on long diagonal']
      },
      {
        id: 'petrosian-qid',
        name: 'Petrosian System (4.a3)',
        moves: ['d4','Nf6','c4','e6','Nf3','b6','a3','Bb7','Nc3','d5','cxd5','Nxd5','Qc2','Nxc3','Qxc3','c5','e3','Nc6'],
        description: 'a3 prevents Bb4+ and prepares e4. White plays for space, Black fights with c5.',
        keyIdeas: ['a3 prevents Bb4+','Prepare b4 or e4','c5 Black counterplay','Nc6 fights for d4']
      },
      {
        id: 'kasparov-qid',
        name: 'Kasparov / Anti-QID (4.g3 Ba6)',
        moves: ['d4','Nf6','c4','e6','Nf3','b6','g3','Ba6','b3','Bb4+','Bd2','Be7','Bg2','c6','Bc3','d5','Ne5','Nfd7'],
        description: 'Ba6 fights c4 directly. Black challenges the Catalan-style setup immediately.',
        keyIdeas: ['Ba6 attacks c4','b3 defends c4','c6+d5 solid center','Ne5 White central knight']
      }
    ]
  }

];

// Build a lookup by id
const OPENING_MAP = {};
OPENINGS.forEach(o => { OPENING_MAP[o.id] = o; });

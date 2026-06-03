// Chess Openings Data

const OPENINGS = [
  // ==================== WHITE OPENINGS ====================
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    color: 'white',
    eco: 'C60-C99',
    description: 'One of the oldest and most classical openings, attacking the knight that defends e5 to pressure Black\'s center.',
    lines: [
      {
        id: 'morphy-defense',
        name: 'Morphy Defense',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','O-O'],
        description: 'The most popular response. Black kicks the bishop with a6, then develops naturally. White builds lasting pressure.',
        keyIdeas: ['Control center with e4','Pin Nc6 with Bb5','Retreat to Ba4 after a6','Castle quickly','Rook to e1 supports e4']
      },
      {
        id: 'exchange-variation',
        name: 'Exchange Variation',
        moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Bxc6','dxc6','Nxe5','Qd4','Nf3','Qxe4+','Qe2','Qxe2+','Kxe2'],
        description: 'White trades the bishop for the knight, giving Black doubled pawns but the bishop pair.',
        keyIdeas: ['Trade bishop for knight','Give Black doubled pawns','Exploit pawn structure','Endgame advantage']
      },
      {
        id: 'berlin-defense',
        name: 'Berlin Defense',
        moves: ['e4','e5','Nf3','Nc6','Bb5','Nf6','O-O','Nxe4','d4','Nd6','Bxc6','dxc6','dxe5','Nf5','Qxd8+','Kxd8'],
        description: 'The Berlin Wall — Black enters a queenless middlegame with solid pawn structure. Extremely tough to crack.',
        keyIdeas: ['Enter Berlin endgame','King on d8 is surprisingly safe','Bishop pair advantage','Solid pawn structure']
      }
    ]
  },
  {
    id: 'italian-game',
    name: 'Italian Game',
    color: 'white',
    eco: 'C50-C59',
    description: 'One of the oldest openings, placing the bishop on the strong c4 square, targeting f7 and the center.',
    lines: [
      {
        id: 'giuoco-piano',
        name: 'Giuoco Piano',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','c3','Nf6','d4','exd4','cxd4','Bb4+','Bd2','Bxd2+','Nbxd2'],
        description: 'The "Quiet Game." White builds a strong center with c3 and d4 after developing the bishop to c4.',
        keyIdeas: ['c3 prepares d4','Central pawn duo','Open center favors development','Active bishop on c4']
      },
      {
        id: 'two-knights',
        name: 'Two Knights Defense',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Nf6','Ng5','d5','exd5','Na5','Bb5+','c6','dxc6','bxc6','Be2'],
        description: 'Black fights back aggressively with Nf6. White attacks f7 with Ng5, leading to sharp tactical play.',
        keyIdeas: ['Attack f7 with Ng5','Sharp tactical complications','Open lines after d5','Piece activity over material']
      },
      {
        id: 'evans-gambit',
        name: 'Evans Gambit',
        moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','b4','Bxb4','c3','Ba5','d4','exd4','O-O'],
        description: 'A romantic gambit! White sacrifices a pawn for rapid development and a fierce attack.',
        keyIdeas: ['b4 gambit for rapid development','Open center quickly','Piece activity over material','Attack before Black consolidates']
      }
    ]
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    color: 'white',
    eco: 'D06-D69',
    description: 'White offers a pawn to control the center. One of the most respected and classical openings in chess.',
    lines: [
      {
        id: 'qgd-classical',
        name: 'QGD Classical',
        moves: ['d4','d5','c4','e6','Nc3','Nf6','Bg5','Be7','e3','O-O','Nf3','h6','Bh4','b6'],
        description: 'Black declines the gambit and builds a solid structure. White maintains central tension.',
        keyIdeas: ['Bg5 pin on Nf6','Central tension with c4/d4','e3 supports center','Pressure on d5']
      },
      {
        id: 'qga',
        name: "Queen's Gambit Accepted",
        moves: ['d4','d5','c4','dxc4','Nf3','Nf6','e3','e6','Bxc4','c5','O-O','a6','Qe2','b5','Bb3'],
        description: 'Black accepts the gambit and fights for equality. White regains the pawn with positional pressure.',
        keyIdeas: ['Regain pawn with e3/Bxc4','Central control','Active bishop on c4','Fight for c5 square']
      },
      {
        id: 'slav-defense',
        name: 'Slav Defense',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','dxc4','a4','Bf5','e3','e6','Bxc4','Bb4'],
        description: 'Black defends d5 with c6, keeping the c8 bishop active. A solid and popular choice.',
        keyIdeas: ['c6 defends d5 without blocking bishop','Keep light-square bishop active','Fight for c4 pawn','Solid structure']
      }
    ]
  },
  {
    id: 'kings-gambit',
    name: "King's Gambit",
    color: 'white',
    eco: 'C30-C39',
    description: 'A swashbuckling romantic gambit. White sacrifices f-pawn to open the f-file and seize the center.',
    lines: [
      {
        id: 'kga-classical',
        name: "King's Gambit Accepted",
        moves: ['e4','e5','f4','exf4','Nf3','g5','Bc4','g4','Ne5','Qh4+','Kf1','d6','Nxf7'],
        description: 'Black accepts the pawn and tries to hold it with g5. Wild and tactical complications ensue.',
        keyIdeas: ['Open f-file after fxe5','Attack with Bc4 targeting f7','Sacrifice for initiative','King safety matters less than attack']
      },
      {
        id: 'kgd-falkbeer',
        name: 'Falkbeer Countergambit',
        moves: ['e4','e5','f4','d5','exd5','e4','d3','Nf6','dxe4','Nxe4','Nf3','Bc5','Qe2','Bf5'],
        description: 'Black strikes back in the center with d5! A sharp countergambit that fights for initiative.',
        keyIdeas: ['Counter with d5 instead of accepting','Fight for central control','Active piece play','Dynamic equality']
      }
    ]
  },
  {
    id: 'london-system',
    name: 'London System',
    color: 'white',
    eco: 'D02',
    description: 'A solid, reliable system. White builds a lasting structure with d4, Nf3, and Bf4, usable against almost anything.',
    lines: [
      {
        id: 'london-main',
        name: 'London Main Line',
        moves: ['d4','d5','Nf3','Nf6','Bf4','e6','e3','Bd6','Bg3','O-O','Bd3','c5','c3','Nc6','Nbd2'],
        description: 'The classic London setup. White builds a pyramid structure and prepares a kingside attack.',
        keyIdeas: ['Bf4 before e3','Solid pawn triangle','Bg3 exchange trap on Bd6','Nbd2 flexible development']
      },
      {
        id: 'london-vs-kid',
        name: 'London vs King\'s Indian',
        moves: ['d4','Nf6','Nf3','g6','Bf4','Bg7','e3','O-O','Be2','d6','O-O','Nbd7','h3','c5','c3'],
        description: 'White uses the London setup against a King\'s Indian fianchetto setup from Black.',
        keyIdeas: ['Solid setup vs fianchetto','h3 prevents Ng4','c3 prepares d5 push','Kingside space advantage']
      }
    ]
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    color: 'white',
    eco: 'A10-A39',
    description: 'A hypermodern opening. White controls the center indirectly with c4, often transposing to other systems.',
    lines: [
      {
        id: 'symmetrical',
        name: 'Symmetrical Variation',
        moves: ['c4','c5','Nc3','Nf6','g3','g6','Bg2','Bg7','Nf3','O-O','O-O','Nc6','d3','d6','Rb1'],
        description: 'Both sides mirror each other in a symmetrical setup. White aims to break symmetry advantageously.',
        keyIdeas: ['Control d5 from c4','Fianchetto bishop on g2','Break symmetry with b4','Long-term positional pressure']
      },
      {
        id: 'reversed-sicilian',
        name: 'Reversed Sicilian',
        moves: ['c4','e5','Nc3','Nf6','g3','d5','cxd5','Nxd5','Bg2','Nb6','Nf3','Nc6','O-O','Be7','d3'],
        description: 'White plays a Sicilian as White with an extra tempo. Rich strategic middlegame.',
        keyIdeas: ['Extra tempo compared to Sicilian','Control d4 square','Flexible pawn structure','Long-term positional squeeze']
      }
    ]
  },
  {
    id: 'vienna-game',
    name: 'Vienna Game',
    color: 'white',
    eco: 'C25-C29',
    description: 'White plays Nc3 before Nf3, keeping options open for f4 or Bc4. Can lead to sharp or positional play.',
    lines: [
      {
        id: 'vienna-gambit',
        name: 'Vienna Gambit',
        moves: ['e4','e5','Nc3','Nc6','f4','exf4','Nf3','g5','d4','g4','Bc4','gxf3','Qxf3'],
        description: 'White plays f4 — a gambit that opens the f-file for a fierce kingside attack.',
        keyIdeas: ['f4 gambit for open f-file','Attack before Black develops','Piece coordination','Sacrificial attack']
      },
      {
        id: 'vienna-bishop',
        name: 'Vienna with Bc4',
        moves: ['e4','e5','Nc3','Nf6','Bc4','Nxe4','Qh5','Nd6','Bb3','Nc6','Nb5','g6','Qf3','f5'],
        description: 'The Frankenstein-Dracula Variation! Highly tactical and fun attacking chess.',
        keyIdeas: ['Qh5 threatens mate on f7','Wild complications','Sacrifice for attack','Active piece play essential']
      }
    ]
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    color: 'white',
    eco: 'C44-C45',
    description: 'White immediately challenges the center with d4 on move 3. Open, direct, and concrete chess.',
    lines: [
      {
        id: 'scotch-main',
        name: 'Scotch Game Main',
        moves: ['e4','e5','Nf3','Nc6','d4','exd4','Nxd4','Nf6','Nxc6','bxc6','e5','Qe7','Qe2','Nd5','c4','Ba6'],
        description: 'After capturing on d4, White retreats Nxc6 giving Black doubled pawns but the bishop pair.',
        keyIdeas: ['Open center immediately','Fight for e5 square','Bishop pair vs doubled pawns','Active piece play']
      },
      {
        id: 'scotch-gambit',
        name: 'Scotch Gambit',
        moves: ['e4','e5','Nf3','Nc6','d4','exd4','Bc4','Bc5','Ng5','Nh6','Nxf7','Nxf7','Bxf7+','Kxf7','Qh5+'],
        description: 'White sacrifices the knight on f7 for a ferocious attack. Not for the faint-hearted!',
        keyIdeas: ['Bc4 instead of Nxd4','Attack f7 immediately','Sacrifice for king exposure','Initiative over material']
      }
    ]
  },
  {
    id: 'catalan-opening',
    name: 'Catalan Opening',
    color: 'white',
    eco: 'E00-E09',
    description: 'White combines a Queen\'s Gambit structure with a fianchetto. Long-term positional pressure.',
    lines: [
      {
        id: 'open-catalan',
        name: 'Open Catalan',
        moves: ['d4','Nf6','c4','e6','g3','d5','Bg2','dxc4','Nf3','Be7','O-O','O-O','Qc2','a6','Qxc4','b5'],
        description: 'Black accepts the pawn. White gets long-term pressure with the g2 bishop down the long diagonal.',
        keyIdeas: ['Long diagonal bishop on g2','Pressure on c4 pawn','Queen recaptures pawn','Lasting positional pressure']
      },
      {
        id: 'closed-catalan',
        name: 'Closed Catalan',
        moves: ['d4','Nf6','c4','e6','g3','d5','Bg2','Be7','Nf3','O-O','O-O','dxc4','Qc2','a6','Rd1','b5'],
        description: 'Black holds d5 and accepts a cramped position. White must work to prove the bishop\'s worth.',
        keyIdeas: ['Maintain d5 pawn','Prove Catalan bishop value','Rd1 pressures d-file','Patient positional grind']
      }
    ]
  },
  {
    id: 'kings-indian-attack',
    name: "King's Indian Attack",
    color: 'white',
    eco: 'A07-A08',
    description: 'White sets up a solid KID structure regardless of Black\'s setup. Flexible and dangerous attacking system.',
    lines: [
      {
        id: 'kia-vs-french',
        name: 'KIA vs French Setup',
        moves: ['e4','e6','d3','d5','Nd2','Nf6','Ngf3','c5','g3','Nc6','Bg2','Be7','O-O','O-O','Re1','b5'],
        description: 'White uses the KIA against the French-style setup with e6/d5. Aims for e5 advance.',
        keyIdeas: ['Build KID structure as White','e5 advance is key plan','Kingside attack after castling','Re1 supports e4-e5']
      },
      {
        id: 'kia-vs-sicilian',
        name: 'KIA vs Sicilian',
        moves: ['e4','c5','Nf3','e6','d3','Nc6','g3','g6','Bg2','Bg7','O-O','Nge7','Re1','d6','c3'],
        description: 'The KIA against Sicilian players. White avoids theory and builds a kingside attack.',
        keyIdeas: ['Avoid Sicilian theory','Flexible piece setup','e5 break after preparation','Kingside pawn storm']
      }
    ]
  },

  // ==================== BLACK OPENINGS ====================
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    color: 'black',
    eco: 'B20-B99',
    description: 'The most popular and combative response to 1.e4. Black fights for the center asymmetrically, leading to rich middlegames.',
    lines: [
      {
        id: 'najdorf',
        name: 'Najdorf Variation',
        moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6','Bg5','e6','f4','Qb6'],
        description: 'a6 prevents Nb5 and prepares b5. The most popular Sicilian — used by Fischer, Kasparov, and Anand.',
        keyIdeas: ['a6 stops Nb5','Prepare b5-b4 queenside expansion','Fight for d5 square','Counter-attack in center']
      },
      {
        id: 'dragon',
        name: 'Dragon Variation',
        moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','g6','Be3','Bg7','f3','O-O','Qd2','Nc6'],
        description: 'g6 and Bg7 create a fearsome dragon bishop. Black castles and launches a queenside attack.',
        keyIdeas: ['Dragon bishop on g7 dominates','Castle kingside and attack queenside','h5-h4 queenside storm','Opposite-side castling tactics']
      },
      {
        id: 'scheveningen',
        name: 'Scheveningen Variation',
        moves: ['e4','c5','Nf3','e6','d4','cxd4','Nxd4','Nf6','Nc3','d6','Be2','Be7','O-O','O-O','f4','a6'],
        description: 'Black forms the "small center" with e6/d6. Flexible and solid, with many transpositional possibilities.',
        keyIdeas: ['e6+d6 small center','Flexible pawn structure','Keres Attack if f4','Counterplay with b5/a5']
      },
      {
        id: 'classical-sicilian',
        name: 'Classical Variation',
        moves: ['e4','c5','Nf3','Nc6','d4','cxd4','Nxd4','Nf6','Nc3','d6','Bg5','e6','Qd2','a6','O-O-O','h6'],
        description: 'Nc6 develops naturally and fights for d4. Classical and solid, with rich positional play.',
        keyIdeas: ['Nc6 pressures d4','Solid development','Meet Bg5 pin with e6','Queenside counterplay with a5']
      }
    ]
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    color: 'black',
    eco: 'C00-C19',
    description: 'Solid and combative. Black builds a pawn chain and counterattacks White\'s center. Slightly cramped but very solid.',
    lines: [
      {
        id: 'winawer',
        name: 'Winawer Variation',
        moves: ['e4','e6','d4','d5','Nc3','Bb4','e5','c5','a3','Bxc3+','bxc3','Ne7','Qg4','Qc7','Qxg7','Rg8'],
        description: 'Black pins the knight and doubles White\'s pawns. Sharp and uncompromising chess.',
        keyIdeas: ['Bb4 pins Nc3','Double White\'s pawns with Bxc3+','c5 attacks d4','Counterplay with Qc7 and Ng6']
      },
      {
        id: 'classical-french',
        name: 'Classical Variation',
        moves: ['e4','e6','d4','d5','Nc3','Nf6','Bg5','Be7','e5','Nfd7','Bxe7','Qxe7','f4','O-O','Nf3','c5'],
        description: 'Black develops naturally with Nf6 and Be7. White advances e5 and Black counterattacks with c5.',
        keyIdeas: ['Nf6 challenges e4','After e5, Nfd7 attacks g5','c5 counterattack on White\'s center','f6 break to undermine e5']
      },
      {
        id: 'advance-french',
        name: 'Advance Variation',
        moves: ['e4','e6','d4','d5','e5','c5','c3','Nc6','Nf3','Qb6','Be2','Nge7','Na3','cxd4','cxd4','Nf5'],
        description: 'White advances e5 early. Black attacks d4 and the b2 pawn. Dynamic counterplay.',
        keyIdeas: ['c5 attacks d4 immediately','Qb6 targets b2 and d4','Nge7 avoids f4 pin','Break with f6 when ready']
      }
    ]
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    color: 'black',
    eco: 'B10-B19',
    description: 'A solid and reliable defense. Black supports d5 with c6, keeping the c8 bishop outside the pawn chain.',
    lines: [
      {
        id: 'classical-ck',
        name: 'Classical Variation',
        moves: ['e4','c6','d4','d5','Nc3','dxe4','Nxe4','Bf5','Ng3','Bg6','h4','h6','Nf3','Nd7','h5','Bh7'],
        description: 'Black exchanges on e4 then develops the bishop to f5. Solid and classical.',
        keyIdeas: ['Exchange on e4 to open d-file','Active bishop on f5','Solid pawn structure','Fight for d5 later']
      },
      {
        id: 'advance-ck',
        name: 'Advance Variation',
        moves: ['e4','c6','d4','d5','e5','Bf5','Nf3','e6','Be2','c5','Be3','Nc6','O-O','cxd4','Nxd4'],
        description: 'White advances e5 and Black gets a French-like position but with the bishop outside.',
        keyIdeas: ['Bf5 before e6','c5 counterattack on d4','Nc6 pressures d4','Better than French: active bishop']
      },
      {
        id: 'exchange-ck',
        name: 'Exchange Variation',
        moves: ['e4','c6','d4','d5','exd5','cxd5','Bd3','Nc6','c3','Nf6','Bf4','Bg4','Qb3','Qd7','Nd2'],
        description: 'Symmetrical pawn structure. White tries for a small but lasting advantage.',
        keyIdeas: ['Equal pawn structure','Fight for e5 or e4 square','Active piece play','Minority attack on queenside']
      }
    ]
  },
  {
    id: 'kings-indian-defense',
    name: "King's Indian Defense",
    color: 'black',
    eco: 'E60-E99',
    description: 'Black fianchettoes the king\'s bishop and lets White build a center, then strikes back with e5 or c5.',
    lines: [
      {
        id: 'kid-classical',
        name: 'Classical Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','Nf3','O-O','Be2','e5','O-O','Nc6','d5','Ne7'],
        description: 'The classic KID. After d5, Black plays on the kingside, White on the queenside. Rich, strategic battle.',
        keyIdeas: ['Fianchetto Bg7 controls center','e5 stakes kingside claim','After d5, attack with f5-f4','Ne7-g6-f4 is key maneuver']
      },
      {
        id: 'kid-samisch',
        name: 'Sämisch Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','f3','O-O','Be3','c5','d5','e6','Nge2','exd5'],
        description: 'White plays f3 to support e4 and prepares g4. Black must react dynamically.',
        keyIdeas: ['f3 fortifies center','Prepare g4 kingside attack','Black\'s c5 counterattack is key','Counterplay before White attacks']
      }
    ]
  },
  {
    id: 'nimzo-indian',
    name: 'Nimzo-Indian Defense',
    color: 'black',
    eco: 'E20-E59',
    description: 'Black pins the c3 knight with Bb4, ready to double White\'s pawns. Hypermodern and strategically rich.',
    lines: [
      {
        id: 'rubinstein',
        name: 'Rubinstein Variation',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','e3','O-O','Bd3','d5','Nf3','c5','O-O','dxc4','Bxc4'],
        description: 'Black pins Nc3 and castles quickly. White builds a solid center with e3 and d3.',
        keyIdeas: ['Bb4 pins Nc3','Castle early for king safety','c5 attacks d4','Bishop pair after Bxc3 or exchange']
      },
      {
        id: 'classical-nimzo',
        name: 'Classical Variation',
        moves: ['d4','Nf6','c4','e6','Nc3','Bb4','Qc2','d5','a3','Bxc3+','Qxc3','Ne4','Qc2','Nc6','e3'],
        description: 'Qc2 avoids doubled pawns. Black offers to exchange on c3 to damage White\'s structure anyway.',
        keyIdeas: ['Qc2 prevents doubled pawns','Ne4 centralization','Bxc3+ gives bishop pair to Black','Piece activity as compensation']
      }
    ]
  },
  {
    id: 'grunfeld-defense',
    name: 'Grünfeld Defense',
    color: 'black',
    eco: 'D70-D99',
    description: 'Black allows White a big center then attacks it with pieces. The ultimate hypermodern defense.',
    lines: [
      {
        id: 'exchange-grunfeld',
        name: 'Exchange Variation',
        moves: ['d4','Nf6','c4','g6','Nc3','d5','cxd5','Nxd5','e4','Nxc3','bxc3','Bg7','Bc4','c5','Ne2','Nc6'],
        description: 'White builds a massive center. Black\'s Bg7 attacks it. The ultimate test of the Grünfeld.',
        keyIdeas: ['Bg7 attacks d4','c5 undermines White center','Dynamic piece activity','Trade center for piece activity']
      },
      {
        id: 'russian-grunfeld',
        name: 'Russian System',
        moves: ['d4','Nf6','c4','g6','Nc3','d5','Nf3','Bg7','Qb3','dxc4','Qxc4','O-O','e4','Bg4','Be3','Nfd7'],
        description: 'Qb3 pressures d5 and b7. Black must be precise in this theoretical battleground.',
        keyIdeas: ['Qb3 attacks b7 and d5','Bg4 pins Nf3','Counterplay with Nd7-b6','Fight for e5 square']
      }
    ]
  },
  {
    id: 'dutch-defense',
    name: 'Dutch Defense',
    color: 'black',
    eco: 'A80-A99',
    description: 'f5 stakes a claim on e4 and gives Black a kingside attack. Combative and unbalanced from move one.',
    lines: [
      {
        id: 'stonewall-dutch',
        name: 'Stonewall Variation',
        moves: ['d4','e6','c4','f5','g3','Nf6','Bg2','d5','Nf3','c6','O-O','Bd6','b3','Qe7','Ne5','O-O'],
        description: 'Black builds the Stonewall (d5,e6,f5,c6). Solid and compact with a kingside attack.',
        keyIdeas: ['Stonewall: d5+e6+f5+c6','Bd6 aims at h2','Knight often goes Ne4','Minority attack with e5 break']
      },
      {
        id: 'classical-dutch',
        name: 'Classical Dutch',
        moves: ['d4','f5','Nf3','Nf6','g3','e6','Bg2','Be7','O-O','O-O','c4','d6','Nc3','Qe8','b3'],
        description: 'Black develops classically and prepares Qh5 or Ng4 attacking ideas on the kingside.',
        keyIdeas: ['Quick development','Qe8-h5 attacking plan','Ng4 attacking ideas','File f as attack route']
      }
    ]
  },
  {
    id: 'pirc-defense',
    name: 'Pirc Defense',
    color: 'black',
    eco: 'B07-B09',
    description: 'Black lets White build a strong center then attacks it with pieces and the g7 bishop. Hypermodern and flexible.',
    lines: [
      {
        id: 'austrian-attack',
        name: 'Austrian Attack',
        moves: ['e4','d6','d4','Nf6','Nc3','g6','f4','Bg7','Nf3','O-O','Bd3','Na6','O-O','c5','d5'],
        description: 'f4 gives White a huge center but Black\'s Bg7 and counterplay with c5 creates imbalance.',
        keyIdeas: ['Bg7 attacks the center','c5 undermines d4','Na6-c7-e6 maneuver','Black must counterattack immediately']
      },
      {
        id: 'classical-pirc',
        name: 'Classical Variation',
        moves: ['e4','d6','d4','Nf6','Nc3','g6','Nf3','Bg7','Be2','O-O','O-O','c6','a4','Nbd7','h3'],
        description: 'Solid development for both sides. White builds pressure, Black waits for the right moment.',
        keyIdeas: ['Bg7 dragon bishop','Solid c6 structure','Nbd7 flexible development','Wait for White overextension']
      }
    ]
  },
  {
    id: 'slav-defense',
    name: 'Slav Defense',
    color: 'black',
    eco: 'D10-D19',
    description: 'Black supports d5 with c6 keeping the light-square bishop free. One of the most solid defenses against the Queen\'s Gambit.',
    lines: [
      {
        id: 'slav-main',
        name: 'Main Line Slav',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','dxc4','a4','Bf5','e3','e6','Bxc4','Bb4','O-O','Nbd7'],
        description: 'Black accepts the gambit pawn with dxc4. Active Bf5 development before e6 locks it in.',
        keyIdeas: ['dxc4 accepts gambit','Bf5 must be played before e6','a4 stops b5','Solid Nbd7 development']
      },
      {
        id: 'semi-slav',
        name: 'Semi-Slav Defense',
        moves: ['d4','d5','c4','c6','Nf3','Nf6','Nc3','e6','e3','Nbd7','Bd3','dxc4','Bxc4','b5','Bd3','Bd6'],
        description: 'Black plays e6 before taking on c4. Meran and Anti-Meran are key battlegrounds.',
        keyIdeas: ['e6+c6 = semi-slav structure','b5 counterplay after taking c4','Bd6 challenges d3 bishop','Rich theoretical middlegame']
      }
    ]
  },
  {
    id: 'queens-indian',
    name: "Queen's Indian Defense",
    color: 'black',
    eco: 'E12-E19',
    description: 'Black prevents e4 with Bb7 or b6. A hypermodern defense with rich positional play.',
    lines: [
      {
        id: 'qid-main',
        name: 'Main Line',
        moves: ['d4','Nf6','c4','e6','Nf3','b6','g3','Bb7','Bg2','Be7','O-O','O-O','Nc3','Ne4','Qc2','Nxc3'],
        description: 'Bb7 fianchetto controls e4 and fights the Catalan-style bishop. Classical setup.',
        keyIdeas: ['Bb7 controls e4 and d5','Be7 solid development','Ne4 centralizes with tempo','Fight for d5 square']
      },
      {
        id: 'petrosian-qid',
        name: 'Petrosian System',
        moves: ['d4','Nf6','c4','e6','Nf3','b6','a3','Bb7','Nc3','d5','cxd5','Nxd5','e3','Nxc3','bxc3','Be7'],
        description: 'a3 prevents Bb4 and prepares e4. White plays a solid positional game.',
        keyIdeas: ['a3 prevents Bb4 pins','Prepare e4 space advantage','c3 recaptures avoid bishop pair for Black','Solid positional squeeze']
      }
    ]
  }
];

// Build a lookup by id
const OPENING_MAP = {};
OPENINGS.forEach(o => { OPENING_MAP[o.id] = o; });

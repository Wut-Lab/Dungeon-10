// Dungeon 10 game data. Tweak numbers here; game.js reads them.
const PLAYER = {
  name: 'Hero',
  hp: 20,            // max HP
  attack: 1,         // added to the d10 in opposed rolls
  damage: [2, 4],    // damage range rolled on a hit
  armorBreak: 0,     // armor slots this attack breaks after a hit
  armor: 3,          // max armor slots (each negates 1 damage, min 1 damage)
  repairRate: 0.33,  // Repair restores this share of BROKEN slots, rounded up, min 1
};

// The test map: two tiles. Enemy comes next.
const TILES = [
  { name: 'Entrance', kind: 'start' },
  { name: 'Dark Hall', kind: 'empty' },
];

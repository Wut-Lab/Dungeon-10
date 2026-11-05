// Dungeon 10 game data. Tweak numbers here; game.js reads them.
const PLAYER = {
  name: 'Hero',
  hp: 20,            // max HP
  attack: 1,         // added to the d10 in opposed rolls
  damage: [2, 4],    // damage range rolled on a hit
  armorBreak: 1,     // armor slots this attack breaks after a hit
  armor: 3,          // max armor slots (each negates 1 damage, min 1 damage)
  repairRate: 0.33,  // Repair restores this share of BROKEN slots, rounded up, min 1
};

// Enemies. abilities: 'hasty' = Hasty Attack (wins a tie where both drop to 0).
const ENEMIES = {
  goblinWarrior: { name: 'Goblin Warrior', icon: '👺', art: 'goblinWarrior', hp: 7, attack: 1, damage: [1, 5], armorBreak: 1, armor: 1, abilities: [] },
};

// The test map: two tiles.
const TILES = [
  { name: 'Entrance', kind: 'start' },
  { name: 'Dark Hall', kind: 'fight', enemy: 'goblinWarrior' },
];

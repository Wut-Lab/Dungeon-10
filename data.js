// Dungeon 10 game data. Tweak numbers here; game.js reads them.
const DUNGEON_NAME = 'The Hollow Crypt';   // placeholder name shown at the top of the play screen

const PLAYER = {
  name: 'Hero',
  hp: 20,            // max HP
  attack: 1,         // added to the d10 in opposed rolls
  damage: [1, 2],    // unarmed damage range; an equipped weapon replaces it
  armorBreak: 1,     // armor slots this attack breaks after a hit
  armor: 2,          // base armor slots (each negates 1 damage, min 1 damage); gear can add more
  repairRate: 0.33,  // Repair restores this share of BROKEN slots, rounded up, min 1
};

// Enemies. abilities: 'hasty' = Hasty Attack (wins a tie where both drop to 0).
const ENEMIES = {
  goblinWarrior: { name: 'Goblin Warrior', icon: '👺', art: 'goblinWarrior', hp: 7, attack: 1, damage: [1, 5], armorBreak: 1, armor: 1, abilities: [],
    gold: 10,                                        // gold for defeating it
    drops: [{ id: 'dirtyShoes', chance: 0.10 }] },   // possible loot, each rolled separately
};

// Random map settings (mapgen.js builds a new map every run). Map cells:
//   S start room   E exit room   R room (doors on every wall)
//   V room with doors top and bottom   H room with doors left and right
//   | vertical hallway   - horizontal hallway   . solid rock
const MAP_SETTINGS = {
  rows: 4, cols: 5,      // room slots (the map is rows*2-1 by cols*2-1 cells)
  loopChance: 0.15,      // chance of an extra hallway between neighbouring rooms (makes loops)
  trim: 3,               // dead-end rooms removed for an irregular shape
  passRoomChance: 0.5,   // chance a straight-through room becomes a V/H room
};

const ROOM_ENEMY_CHANCE = 0.25;           // chance a room (R, V or H) holds an enemy, rolled when you first enter it
const ROOM_ENEMIES = ['goblinWarrior'];   // which enemies can appear in rooms

// ---- Items and equipment ----
// Consumables are used from Inventory > Items, or with "Use item" in a fight (that is your action for the round).
const CONSUMABLES = {
  healingPotion: { name: 'Healing Potion', healPct: 0.25, desc: 'Restores 25% of max HP.' },
};
// Equipment slots: hand (either hand), helmet, breastplate, greaves.
// type sorts the Equipment list: weapon, shield, helmet, armor, greaves.
const EQUIPMENT = {
  shortSword: { name: 'Short Sword', slot: 'hand', type: 'weapon', damage: [2, 4], desc: 'Damage 2–4.' },
  dirtyShoes: { name: 'Dirty Shoes', slot: 'greaves', type: 'greaves', foeDamageMod: -1, desc: 'Enemies get −1 to damage rolls.' },
  simpleShield: { name: 'Simple Shield', slot: 'hand', type: 'shield', armor: 1, desc: '+1 armor slot.' },
};
// What the hero starts each run with.
const START_KIT = {
  items: { healingPotion: 1 },
  equipped: { rightHand: 'shortSword', leftHand: 'simpleShield', helmet: null, breastplate: null, greaves: null },
  pack: [],          // unequipped equipment
};

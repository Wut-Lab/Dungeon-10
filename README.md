# Dungeon 10
A simple dice-rolling dungeon crawler built around the ten-sided die (d10).

## Play it
**Download and play offline. No install needed.**
1. Download the game: [Dungeon-10 ZIP](https://github.com/Wut-Lab/Dungeon-10/archive/refs/heads/main.zip). You can also click the green **Code** button above, then **Download ZIP**.
2. Unzip it.
3. Open `index.html` in any web browser (double-click it).

The title screen has the same download link.

## Controls
- **Roll to move** (button, Space or Enter): you move 1 + d10 spaces.
- Hallways carry you straight on. In a room with more than one way on, tap a glowing doorway or use the **arrow keys**.
- Every run has a new random map. Some rooms only have doors on two opposite walls, so you pass straight through them.
- Rooms have a 25% chance of holding an enemy. Meeting one stops your move and starts a fight.
- The map reveals as you explore: you see every room and hallway you have visited, plus one space ahead through each opening. The exit is always visible so you know where to head.
- Reach the **exit stairs** to win.
- In a fight, tap an action or press **1** Attack, **2** Defend, **3** Repair, **4** Use item (drinks a potion), **5** Flee.
- **Inventory**, **Log** and **Options** sit at the top of the play screen. The Log records every enemy you have met as a list; tap one to open its full card (stats, times met and defeated). It is kept between runs in your browser. Esc closes a menu.
- **Inventory** has two tabs. **Items** lists consumables (you start with 1 Healing Potion, which restores 25% of max HP). **Equipment** shows the hero with a box by each hand and a Helmet / Breastplate / Greaves stack; your gear is listed under Weapons, Shields, Helmet, Armor and Greaves; tap a piece to equip or unequip it. Your weapon sets your damage (Short Sword 2–4, bare fists 1–2). The hero has 2 base armor slots; the starting Simple Shield adds a third.
- Defeating a Goblin Warrior earns **10 gold** (shown on your hero card) and has a 10% chance to drop **Dirty Shoes** (greaves: enemies get −1 to damage rolls). New loot makes the Inventory button bounce and shows a gold dot and a **New** tag until you look at it.

## Files
| File | What's in it |
|---|---|
| `index.html` | The page |
| `data.js` | Game numbers: player stats, enemies, map settings and encounter chance (edit these to tune the game) |
| `mapgen.js` | Builds a random dungeon map each run |
| `game.js` | Game logic |
| `art.js` | Paper-cutout art (SVG): characters and map tiles |
| `bg.svg` | The rock background behind the map |
| `style.css` | Look and feel, combat screen |

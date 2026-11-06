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
- The map reveals as you explore: you see every room and hallway you have visited, plus one space ahead through each opening.
- Reach the **exit stairs** to win.
- In a fight, tap an action or press **1** Attack, **2** Defend, **3** Repair, **4** Use item (coming soon), **5** Flee.

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

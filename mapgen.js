// Random dungeon maps. Every run builds a new one.
// Rooms sit on a grid of slots joined by one-cell hallways. A random maze links every slot,
// a few extra hallways add loops, some dead-end rooms are trimmed for an irregular shape,
// then the Entrance and Exit go on rooms far apart.
function generateMap(cfg = MAP_SETTINGS) {
  const { rows, cols } = cfg;
  const rnd = n => Math.floor(Math.random() * n);
  const id = (r, c) => r * cols + c;
  const links = new Set(), lk = (a, b) => (a < b ? a + ':' + b : b + ':' + a);
  const nbrs = (r, c) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && y < rows && x >= 0 && x < cols);

  // 1. Maze over all slots (randomized depth-first search).
  const seen = new Set([id(0, 0)]), stack = [[0, 0]];
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const open = nbrs(r, c).filter(([y, x]) => !seen.has(id(y, x)));
    if (!open.length) { stack.pop(); continue; }
    const [y, x] = open[rnd(open.length)];
    links.add(lk(id(r, c), id(y, x))); seen.add(id(y, x)); stack.push([y, x]);
  }
  // 2. Extra hallways for loops.
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    for (const [y, x] of nbrs(r, c)) if (Math.random() < cfg.loopChance / 2) links.add(lk(id(r, c), id(y, x)));

  const rooms = new Set(Array.from({ length: rows * cols }, (_, i) => i));
  const degree = i => [...links].filter(l => l.split(':').map(Number).includes(i)).length;
  const linked = i => [...links].map(l => l.split(':').map(Number)).filter(p => p.includes(i)).map(p => p[0] === i ? p[1] : p[0]);
  // 3. Trim some dead-end rooms.
  for (let k = 0; k < cfg.trim; k++) {
    const leaves = [...rooms].filter(i => degree(i) === 1);
    if (leaves.length < 3) break;
    const i = leaves[rnd(leaves.length)];
    rooms.delete(i);
    for (const l of [...links]) if (l.split(':').map(Number).includes(i)) links.delete(l);
  }
  // 4. Entrance and Exit: the two rooms farthest apart (search from a random room, then from the farthest).
  const far = from => {
    const dist = new Map([[from, 0]]), q = [from];
    while (q.length) { const i = q.shift(); for (const j of linked(i)) if (!dist.has(j)) { dist.set(j, dist.get(i) + 1); q.push(j); } }
    return [...dist].sort((a, b) => b[1] - a[1])[0][0];
  };
  const pool = [...rooms], start = far(far(pool[rnd(pool.length)])), exit = far(start);

  // 5. Draw it as text: rooms at even cells, hallways between linked rooms.
  const grid = Array.from({ length: rows * 2 - 1 }, () => Array(cols * 2 - 1).fill('.'));
  for (const l of links) {
    const [a, b] = l.split(':').map(Number), [ra, ca] = [Math.floor(a / cols), a % cols], [rb, cb] = [Math.floor(b / cols), b % cols];
    grid[ra + rb][ca + cb] = ra === rb ? '-' : '|';
  }
  for (const i of rooms) {
    const r = Math.floor(i / cols), c = i % cols, ns = linked(i).map(j => [Math.floor(j / cols) - r, j % cols - c]);
    let ch = 'R';
    const vert = ns.length === 2 && ns.every(([dr]) => dr !== 0), horiz = ns.length === 2 && ns.every(([, dc]) => dc !== 0);
    if ((vert || horiz) && Math.random() < cfg.passRoomChance) ch = vert ? 'V' : 'H';
    if (i === start) ch = 'S';
    if (i === exit) ch = 'E';
    grid[r * 2][c * 2] = ch;
  }
  return grid.map(row => row.join(''));
}

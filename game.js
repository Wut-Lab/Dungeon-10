// Dungeon 10 core. Plain JS, no build step: open index.html to play.
const $ = s => document.querySelector(s);
const d10 = () => 1 + Math.floor(Math.random() * 10);
const rollRange = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));

let state;

const makeUnit = base => ({ ...base, hpNow: base.hp, broken: 0 });
const intact = u => u.armor - u.broken;

// ---- Map ----
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const BACK = { up: 'down', down: 'up', left: 'right', right: 'left' };
const at = (r, c) => state.map[r]?.[c] ?? '.';
const key = (r, c) => r + ',' + c;
const isRoom = ch => 'RSEVH'.includes(ch);
// V rooms and | hallways only open up/down; H rooms and - hallways only left/right.
const opens = (ch, d) => ch === '|' || ch === 'V' ? d === 'up' || d === 'down' : ch === '-' || ch === 'H' ? d === 'left' || d === 'right' : ch !== '.';

// Ways out of a cell: rooms open into any hallway that runs toward them; hallways only run straight.
function exits(r, c) {
  const here = at(r, c), out = [];
  for (const [d, [dr, dc]] of Object.entries(DIRS)) {
    const there = at(r + dr, c + dc);
    // Both cells must open toward each other, and rooms only join through hallways.
    if (opens(here, d) && opens(there, BACK[d]) && !(isRoom(here) && isRoom(there))) out.push(d);
  }
  return out;
}

function findStart() { for (let r = 0; r < state.map.length; r++) { const c = state.map[r].indexOf('S'); if (c >= 0) return { r, c }; } }

function newRun() {
  state = { map: generateMap() };
  Object.assign(state, {
    cell: findStart(), prev: null, dir: null, steps: 0, moveRoll: null, choosing: null, moving: false,
    visited: new Set(), foes: {}, hero: makeUnit(PLAYER), foe: null, over: false,
    log: ['You enter the dungeon. Roll to move.'],
  });
  state.visited.add(key(state.cell.r, state.cell.c));
  show('play');
  render();
}

function show(id) { for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; }

// ---- Movement ----
// Roll 1 + d10 steps. Hallways carry you straight on; in a room with more than one way on, you choose.
const wait = ms => new Promise(res => setTimeout(res, calm.matches ? 0 : ms));

async function rollMove() {
  if (state.foe || state.over || state.moving || state.steps) return;
  const die = d10();
  state.moveRoll = die;
  state.steps = 1 + die;
  state.log = [`You roll ${die} + 1: move ${state.steps} spaces.`];
  render();
  await keepMoving();
}

async function keepMoving() {
  state.moving = true;
  while (state.steps > 0 && !state.foe && !state.over) {
    const { r, c } = state.cell;
    let options = exits(r, c);
    if (isRoom(at(r, c))) {
      const onward = options.filter(d => d !== BACK[state.dir]);
      if (onward.length) options = onward;          // only turn back from a dead end
      if (options.length > 1) { state.choosing = options; state.moving = false; render(); return; }
    } else {
      options = [state.dir];                         // hallways run straight
    }
    await moveTo(options[0]);
  }
  state.moving = false;
  state.choosing = null;
  if (!state.foe && !state.over) state.log.push('Roll again to keep exploring.');
  render();
}

async function choose(d) {
  if (!state.choosing?.includes(d)) return;
  state.choosing = null;
  state.moving = true;
  await moveTo(d);
  await keepMoving();
}

async function moveTo(d) {
  const [dr, dc] = DIRS[d];
  state.prev = { ...state.cell };
  state.cell = { r: state.cell.r + dr, c: state.cell.c + dc };
  state.dir = d;
  state.steps--;
  enterCell();
  render();
  await wait(220);
}

function enterCell() {
  const { r, c } = state.cell, k = key(r, c), ch = at(r, c);
  const first = !state.visited.has(k);
  state.visited.add(k);
  if (ch === 'E') { state.steps = 0; state.log.push('You find the stairs out of the dungeon!'); return end(true); }
  if ('RVH'.includes(ch) && first && Math.random() < ROOM_ENEMY_CHANCE) {
    const id = ROOM_ENEMIES[Math.floor(Math.random() * ROOM_ENEMIES.length)];
    state.foes[k] = makeUnit(ENEMIES[id]);
  }
  if (state.foes[k]) {
    state.steps = 0;                                  // an enemy stops you mid-move
    state.foe = state.foes[k];
    state.lastRoll = null; state.fx = []; state.armorFx = null;
    state.log = [`A ${state.foe.name} blocks the way!`];
  }
}

// ---- Combat ----
// Damage: roll in range, each intact armor slot negates 1 (min 1). Then Armor Break cracks slots.
function hit(att, def, breakMult = 1) {
  const raw = rollRange(att.damage);
  const dmg = Math.max(1, raw - intact(def));
  def.hpNow -= dmg;
  const brk = Math.min(intact(def), Math.floor(att.armorBreak * breakMult));
  def.broken += brk;
  if (brk) (def === state.hero ? state.armorFx.hero : state.armorFx.foe).lost += brk;
  state.fx.push({ att: att === state.hero ? 'hero' : 'foe', def: def === state.hero ? 'hero' : 'foe' });
  return `${att.name} hits for ${dmg} (rolled ${raw}, ${Math.max(0, raw - dmg)} blocked by armor)` + (brk ? `, breaking ${brk} armor` : '');
}

function act(action) {
  const h = state.hero, f = state.foe;
  if (!f || state.over) return;
  const log = [];
  state.fx = [];
  state.armorFx = { hero: { lost: 0, gained: 0 }, foe: { lost: 0, gained: 0 } };
  const startIntact = intact(h);
  state.armorStart = { hero: startIntact, foe: intact(f) };
  const hd = d10(), fd = d10();
  // Attacking uses the attack bonus; other actions roll a plain d10.
  const hTotal = hd + (action === 'attack' || action === 'flee' ? h.attack : 0);
  const fTotal = fd + f.attack;
  state.lastRoll = { hd, ht: hTotal, fd, ft: fTotal };
  log.push(`You roll ${hd}${hTotal !== hd ? ` +${hTotal - hd} = ${hTotal}` : ''} vs ${f.name} ${fd} +${f.attack} = ${fTotal}`);

  if (action === 'flee') {
    if (hTotal > fTotal) {
      log.push('You escape back the way you came!');
      state.foe = null; state.cell = state.prev; state.dir = BACK[state.dir];
      state.log = log; return render();
    }
    log.push('You fail to escape!');
    log.push(hit(f, h));
  } else if (action === 'attack') {
    if (hTotal > fTotal) log.push(hit(h, f));
    else if (fTotal > hTotal) log.push(hit(f, h));
    else {
      log.push('Tie! Both strike.');
      log.push(hit(h, f));
      log.push(hit(f, h));
      if (h.hpNow <= 0 && f.hpNow <= 0) {
        if (f.abilities.includes('hasty')) log.push(`${f.name}'s Hasty Attack lands first!`);
        else { h.hpNow = 1; log.push('You strike first and cling on with 1 HP!'); }
      }
    }
  } else {
    // defend / repair / item: hero doesn't strike. Enemy hits if it wins or ties.
    if (fTotal >= hTotal) log.push(hit(f, h, action === 'defend' ? 0.5 : 1));
    else log.push(action === 'defend' ? 'You hold your guard; the blow glances off.' : `${f.name} misses.`);
  }

  // Repair resolves at the end of the round, after the enemy's hit, so it always restores at least 1 slot.
  if (action === 'repair' && h.hpNow > 0) {
    const n = h.broken ? Math.max(1, Math.ceil(h.broken * h.repairRate)) : 0;
    h.broken -= n;
    log.push(n ? `You repair ${n} armor slot${n > 1 ? 's' : ''}.` : 'Your armor is already whole.');
    if (n) { state.fx.push({ repair: true }); state.armorFx.hero.gained += n; }
  }

  const af = state.armorFx.hero;
  if (af.lost || af.gained) log.push(`Your armor: ${startIntact}/${h.armor}` + (af.lost ? ` → ${af.lost} broken` : '') + (af.gained ? ` → ${af.gained} repaired` : '') + ` → ${intact(h)}/${h.armor}`);
  state.log = log;
  if (h.hpNow <= 0) return end(false);
  if (f.hpNow <= 0) {
    log.push(`The ${f.name} is defeated! Roll to move on.`);
    delete state.foes[key(state.cell.r, state.cell.c)];
    state.foe = null;
  }
  render();
}

function end(won) {
  state.over = true;
  render();
  $('#end-title').textContent = won ? 'Victory!' : 'You have fallen…';
  $('#end-text').textContent = won
    ? `You escaped the dungeon with ${state.hero.hpNow} HP and ${intact(state.hero)}/${state.hero.armor} armor left.`
    : 'The dungeon claims another adventurer.';
  $('#end-log').textContent = state.log.join('\n');
  show('end');
  $('#again').focus();
}

// ---- Drawing ----
function unitHud(u, el) {
  el.querySelector('.who').textContent = u.name + (u.abilities?.includes('hasty') ? ' · Hasty Attack' : '');
  el.querySelector('.fill').style.width = Math.max(0, u.hpNow / u.hp * 100) + '%';
  el.querySelector('.hpt').textContent = `HP ${Math.max(0, u.hpNow)} / ${u.hp}`;
  el.querySelector('.slots').innerHTML = Array.from({ length: u.armor }, (_, i) =>
    `<span class="slot ${i < intact(u) ? 'ok' : 'broken'}"></span>`).join('') || '<span class="none">No armor</span>';
  const af = state.armorFx?.[u === state.hero ? 'hero' : 'foe'];
  if (af && state.foe) el.querySelector('.slots').insertAdjacentHTML('beforeend',
    (af.lost ? `<span class="chg lost">−${af.lost}</span>` : '') + (af.gained ? `<span class="chg gained">+${af.gained}</span>` : ''));
  el.querySelector('.stats').textContent = `Atk +${u.attack} · Dmg ${u.damage[0]}–${u.damage[1]} · Break ${u.armorBreak}`;
}

// Round animations (Web Animations API). Skipped when the player prefers reduced motion.
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const ATTACK = {
  // Knight: step forward and thrust the sword (arm pivots at the shoulder).
  hero: { body: [{ transform: 'none' }, { transform: 'translateX(-4px)', offset: .3 }, { transform: 'translateX(26px)', offset: .6 }, { transform: 'none' }],
          wpn: [{ transform: 'none' }, { transform: 'rotate(-15deg)', offset: .3 }, { transform: 'rotate(68deg) translateX(6px)', offset: .6 }, { transform: 'none' }] },
  // Goblin: step forward, raise the axe back, then chop down (axe pivots at the hand).
  foe:  { body: [{ transform: 'none' }, { transform: 'translateX(4px)', offset: .3 }, { transform: 'translateX(-26px)', offset: .6 }, { transform: 'none' }],
          wpn: [{ transform: 'none' }, { transform: 'rotate(30deg)', offset: .3 }, { transform: 'rotate(-80deg)', offset: .6 }, { transform: 'none' }] },
};
const HURT = [{ transform: 'none' }, { transform: 'translateX(-6px)', filter: 'sepia(1) saturate(4) hue-rotate(-30deg)', offset: .2 },
  { transform: 'translateX(6px)', offset: .4 }, { transform: 'translateX(-4px)', offset: .6 }, { transform: 'none', filter: 'none' }];
const BREAK = [{ transform: 'none', background: 'var(--accent2)', opacity: 1 },
  { transform: 'scale(1.5) rotate(-12deg)', background: 'var(--accent)', opacity: 1, offset: .35 },
  { transform: 'translateY(5px) rotate(18deg) scale(.7)', background: 'var(--accent)', opacity: .2, offset: .7 },
  { transform: 'none', background: 'var(--line)', opacity: .6 }];
const REPAIR = [{ transform: 'scale(.6)', background: 'var(--line)', opacity: .6, filter: 'none' },
  { transform: 'scale(1.6)', background: '#f2d14a', opacity: 1, filter: 'drop-shadow(0 0 6px #f2d14a)', offset: .45 },
  { transform: 'none', background: 'var(--accent2)', opacity: 1, filter: 'none' }];
const SPEED = 650; // ms for one attack

function playFx() {
  const figs = { hero: $('#fig-hero'), foe: $('#fig-foe') };
  for (const d of ['#hd', '#fd']) { const el = $(d).parentElement; el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll'); }
  if (calm.matches) return;
  // Attacks play one after another (a tie shows both); each defender flinches as the blow lands.
  let t = 0;
  for (const fx of (state.fx || []).filter(x => !x.repair)) {
    const fig = figs[fx.att], a = ATTACK[fx.att];
    fig.animate(a.body, { duration: SPEED, delay: t, easing: 'ease-in-out' });
    fig.querySelector('.wpn')?.animate(a.wpn, { duration: SPEED, delay: t, easing: 'ease-in-out' });
    figs[fx.def].animate(HURT, { duration: 400, delay: t + SPEED * .55 });
    t += SPEED;
  }
  // Shield symbols: slots that broke crack and fall; slots that came back glow and pop in.
  for (const side of ['hero', 'foe']) {
    const af = state.armorFx?.[side]; if (!af) continue;
    const slots = document.querySelectorAll(`#${side} .slot`);
    const start = state.armorStart[side], afterHit = start - af.lost;
    const breakAt = t ? t - SPEED * .45 : 0;
    for (let i = afterHit; i < start; i++) slots[i]?.animate(BREAK, { duration: 850, delay: breakAt, fill: 'both' });
    for (let i = afterHit; i < afterHit + af.gained; i++) slots[i]?.animate(REPAIR, { duration: 850, delay: breakAt + (af.lost ? 950 : 0), fill: af.lost ? 'forwards' : 'both' });
    if (af.gained) figs.hero.animate([{ filter: 'none' }, { filter: 'drop-shadow(0 0 8px #f2d14a)' }, { filter: 'none' }], { duration: 850, delay: breakAt + (af.lost ? 950 : 0) });
  }
}

function render() {
  unitHud(state.hero, $('#hero'));
  const f = state.foe;
  $('#arena').hidden = !f;
  $('#board').hidden = !!f;
  // In a fight the hero's panel sits beside the enemy's; otherwise above the board.
  if (f) $('.plates').prepend($('#hero')); else $('#board').before($('#hero'));
  if (f) {
    unitHud(f, $('#foe'));
    $('#fig-hero').innerHTML = ART.hero;
    $('#fig-foe').innerHTML = ART[f.art] || '';
    playFx();
  }
  const r = state.lastRoll;
  $('#hd').textContent = r ? r.ht : '–';
  $('#fd').textContent = r ? r.ft : '–';
  $('#hd-sub').textContent = r ? `rolled ${r.hd}` : 'You';
  $('#fd-sub').textContent = r ? `rolled ${r.fd}` : 'Enemy';
  $('#actions').hidden = !f;
  $('#log').textContent = state.log.join('\n');

  drawMap();
  const moving = !f && !state.over;
  $('#move').hidden = !moving;
  $('#roll-move').disabled = !!(state.steps || state.moving);
  $('#move-die').textContent = state.moveRoll ?? '–';
  $('#steps').textContent = state.choosing ? `${state.steps} left · choose a way` : state.steps ? `${state.steps} left` : 'Ready';
}

function drawMap() {
  const b = $('#board');
  b.style.setProperty('--cols', state.map[0].length);
  b.innerHTML = '';
  const choiceAt = {};
  for (const d of state.choosing || []) choiceAt[key(state.cell.r + DIRS[d][0], state.cell.c + DIRS[d][1])] = d;
  // Fog of war: you see every cell you've visited, plus one cell ahead through each of their exits.
  const seen = new Set(state.visited);
  for (const k of state.visited) {
    const [r, c] = k.split(',').map(Number);
    for (const d of exits(r, c)) seen.add(key(r + DIRS[d][0], c + DIRS[d][1]));
  }
  state.map.forEach((row, r) => [...row].forEach((ch, c) => {
    const k = key(r, c), cell = document.createElement(choiceAt[k] ? 'button' : 'div');
    const shown = ch !== '.' && seen.has(k);
    cell.className = 'cell' + (ch === '.' ? ' rock' : shown ? '' : ' hidden') + (shown && !state.visited.has(k) ? ' fog' : '') + (choiceAt[k] ? ' pick' : '');
    if (shown) cell.innerHTML = TILE_ART[ch];
    if (state.foes[k]) cell.insertAdjacentHTML('beforeend', `<div class="mini foe-mini">${ART[state.foes[k].art]}</div>`);
    if (state.cell.r === r && state.cell.c === c) cell.insertAdjacentHTML('beforeend', `<div class="mini hero-mini">${ART.hero}</div>`);
    if (choiceAt[k]) {
      const d = choiceAt[k];
      cell.insertAdjacentHTML('beforeend', `<span class="arrow">${{ up: '▲', down: '▼', left: '◀', right: '▶' }[d]}</span>`);
      cell.setAttribute('aria-label', 'Go ' + d);
      cell.onclick = () => choose(d);
    }
    b.append(cell);
  }));
}

// ---- Input ----
$('#start').onclick = newRun;
$('#again').onclick = newRun;
$('#roll-move').onclick = rollMove;
document.querySelectorAll('#actions button').forEach(btn => btn.onclick = () => act(btn.dataset.act));
addEventListener('keydown', e => {
  if (!$('#title').hidden && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return newRun(); }
  if ($('#play').hidden) return;
  const arrow = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
  if (arrow && state.choosing) { e.preventDefault(); return choose(arrow); }
  if ((e.key === ' ' || e.key === 'Enter') && !state.foe && !$('#move').hidden && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); return rollMove(); }
  const btn = document.querySelector(`#actions button[data-key="${e.key}"]`);
  if (btn && !btn.disabled && state.foe) act(btn.dataset.act);
});

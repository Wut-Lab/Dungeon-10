// Dungeon 10 core. Plain JS, no build step: open index.html to play.
const $ = s => document.querySelector(s);
const d10 = () => 1 + Math.floor(Math.random() * 10);
const rollRange = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));

let state;

const makeUnit = (base, id) => ({ ...base, id, hpNow: base.hp, broken: 0 });

// ---- Bestiary (the Log menu): enemies you've met, kept between runs on this device ----
let bestiary = {};
try { bestiary = JSON.parse(localStorage.getItem('d10-bestiary')) || {}; } catch {}
function noteFoe(id, field) {
  const b = bestiary[id] ||= { met: 0, defeated: 0, felledYou: 0 };
  b[field]++;
  try { localStorage.setItem('d10-bestiary', JSON.stringify(bestiary)); } catch {}
}
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
    inv: { items: { ...START_KIT.items }, equipped: { ...START_KIT.equipped }, pack: [...START_KIT.pack] },
    log: ['You enter the dungeon. Roll to move.'],
  });
  state.visited.add(key(state.cell.r, state.cell.c));
  applyGear();
  state.map.forEach((row, r) => { const c = row.indexOf('E'); if (c >= 0) state.exitKey = key(r, c); });
  $('#dungeon-name').textContent = DUNGEON_NAME;
  closeMenu();
  show('play');
  render();
}

function show(id) { for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; }

// ---- Movement ----
// Roll 1 + d10 steps. Hallways carry you straight on; in a room with more than one way on, you choose.
const wait = ms => new Promise(res => setTimeout(res, calm.matches ? 0 : ms));

// A real-looking d10 (pentagonal trapezohedron, seen face-on). Colour comes from CSS vars on .die.
const D10_SVG = `<svg class="d10" viewBox="0 0 100 100" aria-hidden="true">
  <polygon class="f-side" points="50,4 4,46 6,64 50,96 94,64 96,46"/>
  <polygon class="f-low" points="14,52 6,64 50,96 50,78"/><polygon class="f-low" points="86,52 94,64 50,96 50,78"/>
  <polygon class="f-top" points="50,4 14,52 50,78 86,52"/>
  <polyline class="edge" points="50,4 4,46 6,64 50,96 94,64 96,46 50,4"/>
  <path class="edge" d="M50,4 L14,52 L50,78 L86,52 Z M4,46 L14,52 L6,64 M96,46 L86,52 L94,64 M50,78 L50,96"/></svg>`;
document.querySelectorAll('.die').forEach(d => d.prepend(document.createRange().createContextualFragment(D10_SVG)));
const DIE_SPIN = [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-260deg) scale(.7) translateY(-6px)', offset: .5 },
  { transform: 'rotate(-340deg) scale(1.08)', offset: .85 }, { transform: 'rotate(-360deg) scale(1)' }];
function spinDie(el) { if (!calm.matches) el.querySelector('.d10')?.animate(DIE_SPIN, { duration: 550, easing: 'cubic-bezier(.2,.7,.3,1)' }); }

async function rollMove() {
  if (state.foe || state.over || state.moving || state.steps) return;
  const die = d10();
  state.moveRoll = die;
  state.steps = 1 + die;
  state.log = [`You roll ${die} + 1: move ${state.steps} spaces.`];
  render();
  spinDie($('#move-die').parentElement);
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
    state.foes[k] = makeUnit(ENEMIES[id], id);
  }
  if (state.foes[k]) {
    state.steps = 0;                                  // an enemy stops you mid-move
    state.foe = state.foes[k];
    noteFoe(state.foe.id, 'met');
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

  if (action === 'item') {
    const id = firstItem();
    if (!id) return;
    log.push(useItem(id));       // drinking happens before the enemy's blow lands
  }

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
  if (h.hpNow <= 0) { noteFoe(f.id, 'felledYou'); return end(false); }
  if (f.hpNow <= 0) {
    log.push(`The ${f.name} is defeated! Roll to move on.`);
    noteFoe(f.id, 'defeated');
    delete state.foes[key(state.cell.r, state.cell.c)];
    state.foe = null;
  }
  render();
}

function end(won) {
  state.over = true;
  closeMenu();
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
  for (const d of ['#hd', '#fd']) spinDie($(d).parentElement);
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
  const itemBtn = $('[data-act=item]'), it = firstItem();
  itemBtn.disabled = !it;
  itemBtn.title = it ? `Use ${CONSUMABLES[it].name} (${state.inv.items[it]} left)` : 'No items';
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
  seen.add(state.exitKey);   // the exit is always shown, so you know where you're headed
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

// ---- Inventory ----
const SLOT_NAMES = { rightHand: 'Right hand', leftHand: 'Left hand', helmet: 'Helmet', breastplate: 'Breastplate', greaves: 'Greaves' };
// The hero's damage comes from the best equipped weapon, or bare fists.
function applyGear() {
  const weapons = ['rightHand', 'leftHand'].map(s => EQUIPMENT[state.inv.equipped[s]]).filter(w => w?.damage);
  state.hero.damage = weapons.length ? weapons.reduce((a, b) => (b.damage[1] > a.damage[1] ? b : a)).damage : PLAYER.damage;
}
function useItem(id) {
  const it = CONSUMABLES[id], h = state.hero;
  if (!it || !state.inv.items[id]) return null;
  state.inv.items[id]--;
  const healed = Math.min(it.heal || 0, h.hp - h.hpNow);
  h.hpNow += healed;
  return `You drink a ${it.name} and recover ${healed} HP.`;
}
const firstItem = () => Object.keys(state.inv.items).find(id => state.inv.items[id] > 0);
function equipBox(slot) {
  const id = state.inv.equipped[slot];
  return `<button class="gear-box ${slot}${id ? ' full' : ''}" data-slot="${slot}" title="${SLOT_NAMES[slot]}${id ? ': ' + EQUIPMENT[id].name : ' (empty)'}">
    ${id ? ICONS[id] || '' : ''}<small>${SLOT_NAMES[slot]}</small></button>`;
}
function inventoryMenu() {
  const tab = $('#menu').dataset.tab || 'items';
  const tabs = `<div class="tabs">${['items', 'equipment'].map(t => `<button data-tab="${t}" aria-pressed="${t === tab}">${t === 'items' ? 'Items' : 'Equipment'}</button>`).join('')}</div>`;
  if (tab === 'items') {
    const ids = Object.keys(state.inv.items).filter(id => state.inv.items[id] > 0);
    return `<h3>Inventory</h3>${tabs}<p class="sub">Consumables</p>` + (ids.length ? ids.map(id => `<div class="foe-row item-row">
      <span class="row-art">${ICONS[id] || ''}</span><span class="grow">${CONSUMABLES[id].name} <b>×${state.inv.items[id]}</b><small>${CONSUMABLES[id].desc}</small></span>
      <button class="use" data-use="${id}" ${state.foe ? 'disabled title="In a fight, use 4 · Use item"' : ''}>Use</button></div>`).join('')
      : '<p class="none">No consumables.</p>');
  }
  const e = state.inv.equipped;
  const pack = state.inv.pack.map((id, i) => `<button class="foe-row" data-pack="${i}"><span class="row-art">${ICONS[id] || ''}</span><span class="grow">${EQUIPMENT[id].name}<small>${EQUIPMENT[id].desc} Tap to equip.</small></span></button>`).join('');
  const wpn = ['rightHand', 'leftHand'].map(s => e[s] && EQUIPMENT[e[s]]).filter(Boolean);
  return `<h3>Inventory</h3>${tabs}
    <div class="equip">
      <div class="portrait">${equipBox('leftHand')}<div class="portrait-art">${ART.hero}</div>${equipBox('rightHand')}</div>
      <div class="armor-stack">${equipBox('helmet')}${equipBox('breastplate')}${equipBox('greaves')}</div>
    </div>
    <p class="sub">Damage ${state.hero.damage[0]}–${state.hero.damage[1]} ${wpn.length ? '' : '(bare fists)'} · Tap a filled box to unequip.</p>
    <p class="sub">Pack</p>${pack || '<p class="none">Nothing unequipped.</p>'}`;
}

// ---- Menus: Inventory, Log, Options ----
const MENUS = {
  inventory: inventoryMenu,
  log: () => {
    const ids = Object.keys(ENEMIES).filter(id => bestiary[id]);
    if (!ids.length) return `<h3>Log</h3><p class="none">No enemies encountered yet. Creatures you meet are recorded here.</p>`;
    const open = $('#menu').dataset.foe;
    if (open && ENEMIES[open]) {
      const id = open, e = ENEMIES[id], b = bestiary[id];
      return `<article class="entry card"><button class="card-close" aria-label="Close card">✕</button><div class="entry-art">${ART[e.art] || ''}</div><div>
        <h4>${e.name}</h4>
        <dl><dt>HP</dt><dd>${e.hp}</dd><dt>Attack</dt><dd>+${e.attack}</dd><dt>Damage</dt><dd>${e.damage[0]}–${e.damage[1]}</dd>
        <dt>Armor</dt><dd>${e.armor}</dd><dt>Break</dt><dd>${e.armorBreak}</dd></dl>
        ${e.abilities.length ? `<p class="abil">${e.abilities.map(a => a === 'hasty' ? 'Hasty Attack: wins a double knockout' : a).join(' · ')}</p>` : ''}
        <p class="tally">Met ${b.met} · Defeated ${b.defeated}${b.felledYou ? ` · Felled you ${b.felledYou}` : ''}</p>
      </div></article>`;
    }
    return `<h3>Log</h3><p class="sub">Enemies encountered · ${ids.length} of ${Object.keys(ENEMIES).length}</p>` +
      ids.map(id => `<button class="foe-row" data-foe="${id}"><span class="row-art">${ART[ENEMIES[id].art] || ''}</span>${ENEMIES[id].name}</button>`).join('');
  },
  options: () => `<h3>Options</h3><div class="opt-list">
    <button data-opt="restart">Restart run</button>
    <button data-opt="title">Return to title</button>
    <button data-opt="settings">Settings</button></div>`,
  settings: () => `<h3>Settings</h3><p class="none">Nothing here yet. Settings are coming soon.</p>`,
};
function openMenu(name) {
  if ($('#menu').dataset.open === name) return closeMenu();
  $('#menu').dataset.open = name;
  delete $('#menu').dataset.foe;
  $('#menu-body').innerHTML = MENUS[name]();
  $('#menu').hidden = false;
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-pressed', b.dataset.menu === name));
}
function closeMenu() {
  $('#menu').hidden = true; delete $('#menu').dataset.open;
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-pressed', 'false'));
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => openMenu(b.dataset.menu));
$('#menu-close').onclick = closeMenu;
$('#menu-body').onclick = e => {
  const t = e.target.closest('[data-tab],[data-use],[data-slot],[data-pack]');
  if (t && $('#menu').dataset.open === 'inventory') {
    const inv = state.inv;
    if (t.dataset.tab) $('#menu').dataset.tab = t.dataset.tab;
    if (t.dataset.use) { state.log = [useItem(t.dataset.use)]; }
    if (t.dataset.slot && inv.equipped[t.dataset.slot]) { inv.pack.push(inv.equipped[t.dataset.slot]); inv.equipped[t.dataset.slot] = null; }
    if (t.dataset.pack) {
      const i = +t.dataset.pack, id = inv.pack[i], slot = EQUIPMENT[id].slot;
      const to = slot === 'hand' ? (inv.equipped.rightHand ? (inv.equipped.leftHand ? 'rightHand' : 'leftHand') : 'rightHand') : slot;
      inv.pack.splice(i, 1);
      if (inv.equipped[to]) inv.pack.push(inv.equipped[to]);   // swap out whatever was there
      inv.equipped[to] = id;
    }
    applyGear(); render();
    $('#menu-body').innerHTML = inventoryMenu();
    return;
  }
  const opt = e.target.closest('[data-opt]')?.dataset.opt;
  if (opt === 'restart') newRun();
  if (opt === 'title') { closeMenu(); show('title'); }
  if (opt === 'settings') openMenu('settings');
  const foeId = e.target.closest('[data-foe]')?.dataset.foe;
  if (foeId) { $('#menu').dataset.foe = foeId; $('#menu-body').innerHTML = MENUS.log(); }
  if (e.target.closest('.card-close')) { delete $('#menu').dataset.foe; $('#menu-body').innerHTML = MENUS.log(); }
};

// ---- Input ----
$('#start').onclick = newRun;
$('#again').onclick = newRun;
$('#roll-move').onclick = rollMove;
document.querySelectorAll('#actions button').forEach(btn => btn.onclick = () => act(btn.dataset.act));
addEventListener('keydown', e => {
  if (!$('#title').hidden && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return newRun(); }
  if ($('#play').hidden) return;
  if (e.key === 'Escape' && !$('#menu').hidden) return closeMenu();
  if (!$('#menu').hidden) return;
  const arrow = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
  if (arrow && state.choosing) { e.preventDefault(); return choose(arrow); }
  if ((e.key === ' ' || e.key === 'Enter') && !state.foe && !$('#move').hidden && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); return rollMove(); }
  const btn = document.querySelector(`#actions button[data-key="${e.key}"]`);
  if (btn && !btn.disabled && state.foe) act(btn.dataset.act);
});

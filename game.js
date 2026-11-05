// Dungeon 10 core. Plain JS, no build step: open index.html to play.
const $ = s => document.querySelector(s);
const d10 = () => 1 + Math.floor(Math.random() * 10);
const rollRange = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));

let state;

const makeUnit = base => ({ ...base, hpNow: base.hp, broken: 0 });
const intact = u => u.armor - u.broken;

function newRun() {
  state = { pos: 0, hero: makeUnit(PLAYER), foe: null, cleared: new Set(), over: false, log: [] };
  show('play');
  render();
}

function show(id) { for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; }

// ---- Movement ----
function step() {
  if (state.foe || state.over || state.pos >= TILES.length - 1) return;
  state.pos++;
  const t = TILES[state.pos];
  if (t.kind === 'fight' && !state.cleared.has(state.pos)) {
    state.foe = makeUnit(ENEMIES[t.enemy]);
    state.log = [`A ${state.foe.name} blocks the way!`];
  }
  render();
}

// ---- Combat ----
// Damage: roll in range, each intact armor slot negates 1 (min 1). Then Armor Break cracks slots.
function hit(att, def, breakMult = 1) {
  const raw = rollRange(att.damage);
  const dmg = Math.max(1, raw - intact(def));
  def.hpNow -= dmg;
  const brk = Math.min(intact(def), Math.floor(att.armorBreak * breakMult));
  def.broken += brk;
  return `${att.name} hits for ${dmg} (rolled ${raw}, ${Math.max(0, raw - dmg)} blocked by armor)` + (brk ? `, breaking ${brk} armor` : '');
}

function act(action) {
  const h = state.hero, f = state.foe;
  if (!f || state.over) return;
  const log = [];
  const hd = d10(), fd = d10();
  // Attacking uses the attack bonus; other actions roll a plain d10.
  const hTotal = hd + (action === 'attack' || action === 'flee' ? h.attack : 0);
  const fTotal = fd + f.attack;
  state.lastRoll = { hd, ht: hTotal, fd, ft: fTotal };
  log.push(`You roll ${hd}${hTotal !== hd ? ` +${hTotal - hd} = ${hTotal}` : ''} vs ${f.name} ${fd} +${f.attack} = ${fTotal}`);

  if (action === 'repair') {
    const n = h.broken ? Math.max(1, Math.ceil(h.broken * h.repairRate)) : 0;
    h.broken -= n;
    log.push(n ? `You repair ${n} armor slot${n > 1 ? 's' : ''}.` : 'Your armor is already whole.');
  }

  if (action === 'flee') {
    if (hTotal > fTotal) { log.push('You escape back the way you came!'); state.foe = null; state.pos--; state.log = log; return render(); }
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

  state.log = log;
  if (h.hpNow <= 0) return end(false);
  if (f.hpNow <= 0) {
    log.push(`The ${f.name} is defeated!`);
    state.cleared.add(state.pos);
    state.foe = null;
    if (state.pos === TILES.length - 1) return end(true);
  }
  render();
}

function end(won) {
  state.over = true;
  render();
  $('#end-title').textContent = won ? 'Victory!' : 'You have fallen…';
  $('#end-text').textContent = won
    ? `You cleared the dungeon with ${state.hero.hpNow} HP and ${intact(state.hero)}/${state.hero.armor} armor left.`
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
  el.querySelector('.stats').textContent = `Atk +${u.attack} · Dmg ${u.damage[0]}–${u.damage[1]} · Break ${u.armorBreak}`;
}

function render() {
  unitHud(state.hero, $('#hero'));
  const f = state.foe;
  $('#foe').hidden = !f;
  if (f) unitHud(f, $('#foe'));
  const r = state.lastRoll;
  $('#dice').hidden = !f && !r;
  if (r) { $('#hd').textContent = r.hd; $('#fd').textContent = r.fd; }
  $('#actions').hidden = !f;
  $('#log').textContent = state.log.join('\n');
  $('.hint').hidden = !!f;

  const b = $('#board');
  b.innerHTML = '';
  TILES.forEach((t, i) => {
    const el = document.createElement('button');
    const next = i === state.pos + 1 && !f;
    el.className = 'tile' + (i === state.pos ? ' here' : '') + (next ? ' next' : '');
    const foeHere = t.kind === 'fight' && !state.cleared.has(i);
    el.innerHTML = `<span class="tname">${t.name}</span>` +
      (i === state.pos ? '<span class="token">🛡️</span>' : '') +
      (foeHere ? `<span class="token">${ENEMIES[t.enemy].icon}</span>` : '');
    el.setAttribute('aria-label', t.name + (i === state.pos ? ', you are here' : '') + (foeHere ? ', enemy' : ''));
    el.onclick = () => { if (next) step(); };
    b.append(el);
  });
}

// ---- Input ----
$('#start').onclick = newRun;
$('#again').onclick = newRun;
document.querySelectorAll('#actions button').forEach(btn => btn.onclick = () => act(btn.dataset.act));
addEventListener('keydown', e => {
  if (!$('#title').hidden && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return newRun(); }
  if ($('#play').hidden) return;
  if (e.key === 'ArrowRight') step();
  const btn = document.querySelector(`#actions button[data-key="${e.key}"]`);
  if (btn && !btn.disabled && state.foe) act(btn.dataset.act);
});

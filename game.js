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
    state.lastRoll = null; state.fx = []; state.armorFx = null;
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

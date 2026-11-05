// Dungeon 10 core. Plain JS, no build step: open index.html to play.
const $ = s => document.querySelector(s);
const d10 = () => 1 + Math.floor(Math.random() * 10);
const range = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));

let state;

function newRun() {
  state = {
    pos: 0,
    hero: { ...PLAYER, hpNow: PLAYER.hp, broken: 0, lastRoll: null },
  };
  drawBoard();
  drawHud();
}

function drawBoard() {
  const b = $('#board');
  b.innerHTML = '';
  TILES.forEach((t, i) => {
    const el = document.createElement('button');
    el.className = 'tile' + (i === state.pos ? ' here' : '') + (i === state.pos + 1 ? ' next' : '');
    el.innerHTML = `<span class="tname">${t.name}</span>` + (i === state.pos ? '<span class="token" aria-label="Hero">🛡️</span>' : '');
    el.onclick = () => { if (i === state.pos + 1) step(); };
    b.append(el);
  });
}

function drawHud() {
  const h = state.hero;
  $('#hp-fill').style.width = (h.hpNow / h.hp * 100) + '%';
  $('#hp-text').textContent = `HP ${h.hpNow} / ${h.hp}`;
  const intact = h.armor - h.broken;
  $('#armor').innerHTML = Array.from({ length: h.armor }, (_, i) =>
    `<span class="slot ${i < intact ? 'ok' : 'broken'}"></span>`).join('');
  $('#armor').title = `Armor ${intact} / ${h.armor}`;
  $('#roll').textContent = 'Last roll: ' + (h.lastRoll ?? '–');
}

function step() {
  if (state.pos >= TILES.length - 1) return;
  state.pos++;
  drawBoard();
}

$('#start').onclick = () => { $('#title').hidden = true; $('#play').hidden = false; newRun(); };
addEventListener('keydown', e => {
  if (!$('#play').hidden && e.key === 'ArrowRight') step();
  if (!$('#title').hidden && (e.key === 'Enter' || e.key === ' ')) $('#start').click();
});

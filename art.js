// Paper-cutout character art. Each piece is a flat shape; CSS adds the paper shadow.
// viewBox 0 0 120 160, standing on y=156. Hero faces right, enemies face left.
const ART = {
  hero: `<svg viewBox="0 0 120 160" class="paper" role="img" aria-label="The hero">
  <path d="M38 62 L30 140 L74 136 L66 60 Z" fill="#7a2418"/>
  <path d="M46 118 L44 152 L54 152 L56 118 Z" fill="#4a3424"/>
  <path d="M62 118 L66 152 L76 152 L70 118 Z" fill="#4a3424"/>
  <path d="M40 150 h16 v6 h-18 Z M64 150 h16 l2 6 h-18 Z" fill="#2b1d0e"/>
  <path d="M40 66 Q58 56 76 66 L80 122 L36 122 Z" fill="#2f5d50"/>
  <path d="M44 74 Q58 68 72 74 L74 98 L42 98 Z" fill="#9aa5a8"/>
  <path d="M38 104 h44 v7 h-44 Z" fill="#5a3b1e"/><rect x="56" y="104" width="8" height="7" fill="#d9b44a"/>
  <path d="M74 72 L92 88 L88 94 L72 82 Z" fill="#2f5d50"/>
  <path d="M86 92 L104 30 L110 32 L94 96 Z" fill="#cfd6d8"/>
  <path d="M80 92 L100 98 L98 103 L78 97 Z" fill="#8a5a2b"/>
  <circle cx="86" cy="95" r="5" fill="#e8c9a0"/>
  <circle cx="58" cy="46" r="15" fill="#e8c9a0"/>
  <path d="M42 46 Q42 26 58 26 Q74 26 74 46 L70 50 L70 42 L46 42 L46 50 Z" fill="#8f9ba0"/>
  <path d="M56 22 L60 12 L64 22 Z" fill="#8b2e16"/>
  <path d="M62 44 h12 v3 h-12 Z" fill="#2b1d0e"/>
  <circle cx="40" cy="96" r="21" fill="#8a5a2b"/>
  <circle cx="40" cy="96" r="21" fill="none" stroke="#9aa5a8" stroke-width="4"/>
  <path d="M40 78 L40 114 M24 96 L56 96" stroke="#d9b44a" stroke-width="4"/>
  </svg>`,

  goblinWarrior: `<svg viewBox="0 0 120 160" class="paper" role="img" aria-label="Goblin Warrior">
  <path d="M50 120 L46 152 L56 152 L58 120 Z" fill="#4f6b2a"/>
  <path d="M66 120 L70 152 L80 152 L74 120 Z" fill="#4f6b2a"/>
  <path d="M42 150 h16 v6 h-18 Z M68 150 h14 l2 6 h-16 Z" fill="#3a2a18"/>
  <path d="M44 74 Q62 64 80 74 L84 124 L40 124 Z" fill="#6b4a2a"/>
  <path d="M48 82 L78 82 L80 92 L46 92 Z M47 100 L79 100 L81 110 L45 110 Z" fill="#8a6a3a"/>
  <path d="M44 116 h40 v6 h-40 Z" fill="#3a2a18"/>
  <path d="M46 78 L28 96 L32 102 L50 88 Z" fill="#6f8f3a"/>
  <path d="M14 34 L24 30 L40 132 L34 134 Z" fill="#6b4a2a"/>
  <path d="M8 30 Q2 46 14 56 L26 50 L20 28 Z" fill="#9aa5a8"/>
  <path d="M8 30 Q2 46 14 56" fill="none" stroke="#cfd6d8" stroke-width="3"/>
  <circle cx="30" cy="99" r="6" fill="#6f8f3a"/>
  <path d="M80 80 L92 104 L86 108 L76 88 Z" fill="#6f8f3a"/>
  <path d="M46 56 L14 40 L40 66 Z" fill="#6f8f3a"/>
  <path d="M78 56 L108 36 L84 66 Z" fill="#6f8f3a"/>
  <ellipse cx="62" cy="56" rx="20" ry="18" fill="#7fa043"/>
  <path d="M42 50 Q62 30 82 50 L80 42 Q62 28 44 42 Z" fill="#5a3b1e"/>
  <path d="M48 52 l10 4 -10 3 Z" fill="#f2d14a"/><circle cx="52" cy="55" r="2" fill="#8b1a10"/>
  <path d="M70 56 l10 -4 -1 7 Z" fill="#f2d14a"/><circle cx="75" cy="56" r="2" fill="#8b1a10"/>
  <path d="M50 66 Q62 74 74 66 L72 68 Q62 72 52 68 Z" fill="#2b1d0e"/>
  <path d="M54 66 l2 5 2 -5 Z M66 66 l2 5 2 -5 Z" fill="#f3e9d2"/>
  <path d="M60 58 l-4 6 h6 Z" fill="#5f7f2f"/>
  </svg>`,
};

// Paper-cutout character art. Each piece is a flat shape; CSS adds the paper shadow.
// viewBox 0 0 120 160, feet on y=156. Hero faces right, enemies face left.
// Pieces are listed back to front.
const ART = {
  hero: `<svg viewBox="0 0 120 160" class="paper" role="img" aria-label="The hero">
  <path d="M42 64 L32 142 L72 138 L72 64 Z" fill="#7a2418"/>
  <rect x="47" y="116" width="9" height="34" fill="#4a3424"/>
  <rect x="62" y="116" width="9" height="34" fill="#4a3424"/>
  <path d="M44 148 h14 v8 h-17 Z M60 148 h14 l4 8 h-18 Z" fill="#2b1d0e"/>
  <path d="M42 64 Q58 58 74 64 L77 122 L39 122 Z" fill="#2f5d50"/>
  <path d="M45 69 Q58 64 71 69 L72 96 L44 96 Z" fill="#9aa5a8"/>
  <rect x="40" y="103" width="36" height="7" fill="#5a3b1e"/>
  <rect x="54" y="102" width="8" height="9" fill="#d9b44a"/>
  <path d="M70 64 L91 89 L85 95 L66 72 Z" fill="#2f5d50"/>
  <rect x="85" y="89" width="6" height="15" fill="#5a3b1e"/>
  <circle cx="88" cy="106" r="3.5" fill="#d9b44a"/>
  <path d="M85 89 L92 89 L99 30 L95 23 L91 30 Z" fill="#cfd6d8"/>
  <path d="M78 87 L99 85 L99 91 L78 93 Z" fill="#d9b44a"/>
  <circle cx="88" cy="96" r="5.5" fill="#7a868b"/>
  <path d="M46 66 L36 88 L43 91 L52 72 Z" fill="#2f5d50"/>
  <path d="M53 66 Q46 58 36 64 Q33 72 39 77 Q46 72 53 72 Z" fill="#9aa5a8"/>
  <path d="M51 73 Q44 70 37 75 L39 80 Q45 77 51 78 Z" fill="#8f9ba0"/>
  <path d="M63 66 Q70 58 80 64 Q83 72 77 77 Q70 72 63 72 Z" fill="#9aa5a8"/>
  <path d="M65 73 Q72 70 79 75 L77 80 Q71 77 65 78 Z" fill="#8f9ba0"/>
  <path class="m" d="M62 25 Q64 8 54 3.5 Q45 0 36 7 Q42 5.5 46 9 Q38 11 35 19 Q43 12 49 14 Q54 17 55 25 Z" fill="#7a2418"/>
  <path class="m" d="M60.5 25 Q61 12 54 8 Q47 5 41.5 9.5 Q47.5 8.5 50.5 11.5 Q45.5 13.5 44 18.5 Q49.5 14.5 53.5 16.5 Q57 19.5 57 25 Z" fill="#b5432a"/>
  <path class="d" d="M56 26 L62 26 L61 21 L57 21 Z" fill="#7a868b"/>
  <path d="M44 27 Q58 22 72 27 V62 H44 Z" fill="#8f9ba0"/>
  <path d="M63.5 23.6 Q68.5 24.6 72 27 V62 H63.5 Z" fill="#a3adb0"/>
  <path class="m" d="M44 27 Q58 22 72 27 Q58 31 44 27 Z" fill="#7a868b"/>
  <rect class="d" x="60" y="29" width="3.5" height="32" fill="#7a868b"/>
  <rect class="d" x="44" y="40" width="28" height="3.5" fill="#7a868b"/>
  <rect class="d" x="47.5" y="35.5" width="11" height="2.8" rx="1.2" fill="#2b1d0e"/>
  <rect class="d" x="65.5" y="35.5" width="5" height="2.8" rx="1.2" fill="#2b1d0e"/>
  <circle class="d" cx="49" cy="41.75" r=".8" fill="#cfd6d8"/><circle class="d" cx="56" cy="41.75" r=".8" fill="#cfd6d8"/><circle class="d" cx="68" cy="41.75" r=".8" fill="#cfd6d8"/>
  <circle class="d" cx="66.5" cy="48" r="1" fill="#2b1d0e"/><circle class="d" cx="69.5" cy="48" r="1" fill="#2b1d0e"/>
  <circle class="d" cx="66.5" cy="52" r="1" fill="#2b1d0e"/><circle class="d" cx="69.5" cy="52" r="1" fill="#2b1d0e"/>
  <circle class="d" cx="66.5" cy="56" r="1" fill="#2b1d0e"/><circle class="d" cx="69.5" cy="56" r="1" fill="#2b1d0e"/>
  <rect class="m" x="43" y="61" width="30" height="3.5" rx="1" fill="#7a868b"/>
  <circle cx="40" cy="98" r="20" fill="#8a5a2b"/>
  <circle cx="40" cy="98" r="18" fill="none" stroke="#9aa5a8" stroke-width="4"/>
  <path d="M40 82 V114 M24 98 H56" stroke="#d9b44a" stroke-width="4"/>
  <circle cx="40" cy="98" r="4" fill="#9aa5a8"/>
  </svg>`,

  goblinWarrior: `<svg viewBox="0 0 120 160" class="paper" role="img" aria-label="Goblin Warrior">
  <rect x="49" y="118" width="9" height="32" fill="#4f6b2a"/>
  <rect x="66" y="118" width="9" height="32" fill="#4f6b2a"/>
  <path d="M42 148 h16 v8 h-19 Z M66 148 h14 l3 8 h-17 Z" fill="#3a2a18"/>
  <path d="M76 74 L92 103 L86 107 L70 82 Z" fill="#6f8f3a"/>
  <path d="M50 74 L26 94 L31 103 L54 84 Z" fill="#6f8f3a"/>
  <path d="M47 74 Q62 67 77 74 L80 124 L44 124 Z" fill="#6b4a2a"/>
  <path d="M50 82 H74 L75 92 H49 Z M49 100 H75 L77 110 H47 Z" fill="#8a6a3a"/>
  <rect x="45" y="115" width="35" height="7" fill="#3a2a18"/>
  <circle cx="89" cy="106" r="5" fill="#7fa043"/>
  <path d="M18 34 L23 33 L39 132 L34 133 Z" fill="#6b4a2a"/>
  <path d="M21 38 L8 33 Q1 48 9 63 L24 56 Z" fill="#9aa5a8"/>
  <path d="M8 33 Q1 48 9 63" fill="none" stroke="#cfd6d8" stroke-width="3" stroke-linecap="round"/>
  <circle cx="31" cy="99" r="6" fill="#7fa043"/>
  <path d="M36 78 Q44 67 55 73 L53 83 Q45 79 39 85 Z" fill="#5a3b1e"/>
  <circle cx="46" cy="76" r="1.6" fill="#9aa5a8"/><circle cx="41" cy="80" r="1.6" fill="#9aa5a8"/>
  <path d="M44 51 L12 40 L44 63 Z" fill="#6f8f3a"/>
  <path d="M80 51 L112 40 L80 63 Z" fill="#6f8f3a"/>
  <ellipse cx="62" cy="57" rx="20" ry="17" fill="#7fa043"/>
  <path class="m" d="M43 51 Q44 37 62 37 Q80 37 81 51 Q62 44 43 51 Z" fill="#5a3b1e"/>
  <path class="d" d="M62 37.5 V45 M52 39.5 Q54 44 53 47 M72 39.5 Q70 44 71 47" fill="none" stroke="#3a2a18" stroke-width="1.2"/>
  <ellipse class="d" cx="54" cy="56" rx="5" ry="3.5" fill="#f2d14a"/>
  <ellipse class="d" cx="70" cy="56" rx="5" ry="3.5" fill="#f2d14a"/>
  <circle class="d" cx="53" cy="56" r="2" fill="#8b1a10"/>
  <circle class="d" cx="69" cy="56" r="2" fill="#8b1a10"/>
  <path class="d" d="M48 49 L59 52 L59 54.5 L48 51.5 Z" fill="#4f6b2a"/>
  <path class="d" d="M76 49 L65 52 L65 54.5 L76 51.5 Z" fill="#4f6b2a"/>
  <path class="d" d="M62 57 L58 64 L65 64 Z" fill="#5f7f2f"/>
  <path class="d" d="M52 67 Q62 76 72 67 Q62 71 52 67 Z" fill="#2b1d0e"/>
  <path class="d" d="M56 68.2 l2 4 l2 -3.4 Z M64 68.8 l2 3.4 l2 -4 Z" fill="#f3e9d2"/>
  </svg>`,
};

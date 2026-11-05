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
  <circle cx="88" cy="96" r="5.5" fill="#e8c9a0"/>
  <path d="M46 66 L36 88 L43 91 L52 72 Z" fill="#2f5d50"/>
  <circle cx="58" cy="47" r="14" fill="#e8c9a0"/>
  <path d="M43 46 Q43 30 58 30 Q73 30 73 46 Z" fill="#8f9ba0"/>
  <rect x="41" y="43" width="34" height="5" rx="1" fill="#7a868b"/>
  <path d="M55 31 Q58 16 69 20 Q64 25 63 31 Z" fill="#8b2e16"/>
  <circle cx="56" cy="53" r="1.8" fill="#2b1d0e"/>
  <circle cx="65" cy="53" r="1.8" fill="#2b1d0e"/>
  <path d="M68 53 L71 58 L67 58 Z" fill="#d4ae86"/>
  <path d="M58 60 Q62 62 66 60" fill="none" stroke="#7a4a2a" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="40" cy="98" r="20" fill="#8a5a2b"/>
  <circle cx="40" cy="98" r="18" fill="none" stroke="#9aa5a8" stroke-width="4"/>
  <path d="M40 82 V114 M24 98 H56" stroke="#d9b44a" stroke-width="4"/>
  <circle cx="40" cy="98" r="4" fill="#9aa5a8"/>
  </svg>`,

  goblinWarrior: `<svg viewBox="0 0 120 160" class="paper" role="img" aria-label="Goblin Warrior">
  <rect x="49" y="118" width="9" height="32" fill="#4f6b2a"/>
  <rect x="66" y="118" width="9" height="32" fill="#4f6b2a"/>
  <path d="M42 148 h16 v8 h-19 Z M66 148 h14 l3 8 h-17 Z" fill="#3a2a18"/>
  <path d="M44 74 Q62 66 80 74 L84 124 L40 124 Z" fill="#6b4a2a"/>
  <path d="M47 82 H77 L79 92 H45 Z M46 100 H78 L80 110 H44 Z" fill="#8a6a3a"/>
  <rect x="42" y="115" width="40" height="7" fill="#3a2a18"/>
  <path d="M78 78 L92 103 L86 107 L74 86 Z" fill="#6f8f3a"/>
  <circle cx="89" cy="106" r="5" fill="#7fa043"/>
  <path d="M18 34 L23 33 L39 132 L34 133 Z" fill="#6b4a2a"/>
  <path d="M21 38 L8 33 Q1 48 9 63 L24 56 Z" fill="#9aa5a8"/>
  <path d="M8 33 Q1 48 9 63" fill="none" stroke="#cfd6d8" stroke-width="3" stroke-linecap="round"/>
  <path d="M48 76 L26 94 L31 103 L52 86 Z" fill="#6f8f3a"/>
  <circle cx="29" cy="99" r="6" fill="#7fa043"/>
  <path d="M44 51 L12 40 L44 63 Z" fill="#6f8f3a"/>
  <path d="M80 51 L112 40 L80 63 Z" fill="#6f8f3a"/>
  <ellipse cx="62" cy="57" rx="20" ry="17" fill="#7fa043"/>
  <path d="M42 53 Q62 30 82 53 Q72 44 62 44 Q52 44 42 53 Z" fill="#5a3b1e"/>
  <ellipse cx="54" cy="56" rx="5" ry="3.5" fill="#f2d14a"/>
  <ellipse cx="70" cy="56" rx="5" ry="3.5" fill="#f2d14a"/>
  <circle cx="53" cy="56" r="2" fill="#8b1a10"/>
  <circle cx="69" cy="56" r="2" fill="#8b1a10"/>
  <path d="M48 49 L59 52 L59 54.5 L48 51.5 Z" fill="#4f6b2a"/>
  <path d="M76 49 L65 52 L65 54.5 L76 51.5 Z" fill="#4f6b2a"/>
  <path d="M62 57 L58 64 L65 64 Z" fill="#5f7f2f"/>
  <path d="M52 67 Q62 76 72 67 Q62 71 52 67 Z" fill="#2b1d0e"/>
  <path d="M56 68.2 l2 4 l2 -3.4 Z M64 68.8 l2 3.4 l2 -4 Z" fill="#f3e9d2"/>
  </svg>`,
};

/**
 * Aesthetic Preset Covers for Playlists
 */

export interface PlaylistCoverPreset {
  id: string;
  name: string;
  dataUrl: string;
}

export const SNEAKERS_PRESET_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#a8a29e" />
  <circle cx="20" cy="20" r="12" fill="#78716c" opacity="0.6" />
  <circle cx="65" cy="18" r="10" fill="#57534e" opacity="0.5" />
  <circle cx="45" cy="35" r="8" fill="#44403c" opacity="0.4" />
  <circle cx="85" cy="30" r="14" fill="#78716c" opacity="0.5" />
  <circle cx="15" cy="70" r="10" fill="#57534e" opacity="0.5" />
  <path d="M-5,105 L30,45 L50,55 L25,105 Z" fill="#2d4263" />
  <rect x="26" y="47" width="22" height="6" transform="rotate(-30 26 47)" fill="#cbd5e1" rx="2" />
  <path d="M55,105 L80,48 L100,56 L85,105 Z" fill="#2d4263" />
  <rect x="76" y="50" width="22" height="6" transform="rotate(-25 76 50)" fill="#cbd5e1" rx="2" />
  <ellipse cx="44" cy="50" rx="14" ry="10" transform="rotate(-35 44 50)" fill="#1c1917" />
  <ellipse cx="49" cy="46" rx="6" ry="6" fill="#f8fafc" />
  <line x1="38" y1="52" x2="48" y2="48" stroke="#ffffff" stroke-width="2" />
  <ellipse cx="78" cy="58" rx="15" ry="10" transform="rotate(-15 78 58)" fill="#1c1917" />
  <ellipse cx="85" cy="56" rx="6" ry="6" fill="#f8fafc" />
  <line x1="72" y1="59" x2="82" y2="57" stroke="#ffffff" stroke-width="2" />
</svg>
`)}`;

export const SUNSET_PRESET_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bgSun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bgSun)"/>
  <circle cx="50" cy="55" r="22" fill="#fef08a" opacity="0.9"/>
  <!-- Palm tree silhouettes -->
  <path d="M50,90 Q48,65 52,48" stroke="#18181b" stroke-width="3" fill="none"/>
  <path d="M52,48 Q40,40 32,48" stroke="#18181b" stroke-width="2.5" fill="none"/>
  <path d="M52,48 Q64,40 72,48" stroke="#18181b" stroke-width="2.5" fill="none"/>
  <path d="M52,48 Q50,34 52,28" stroke="#18181b" stroke-width="2.5" fill="none"/>
  <rect x="0" y="85" width="100" height="15" fill="#18181b"/>
</svg>
`)}`;

export const VINYL_PRESET_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#18181b"/>
  <!-- Vinyl disc -->
  <circle cx="50" cy="50" r="42" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="#27272a" stroke-width="0.8"/>
  <circle cx="50" cy="50" r="28" fill="none" stroke="#27272a" stroke-width="0.8"/>
  <circle cx="50" cy="50" r="21" fill="none" stroke="#27272a" stroke-width="0.8"/>
  <!-- Center label -->
  <circle cx="50" cy="50" r="16" fill="#ec4899"/>
  <circle cx="50" cy="50" r="4" fill="#ffffff"/>
  <circle cx="50" cy="50" r="2" fill="#000000"/>
</svg>
`)}`;

export const CYBER_PRESET_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cyber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="60%" stop-color="#3b0764"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#cyber)"/>
  <!-- Neon Sun -->
  <circle cx="50" cy="48" r="24" fill="#ec4899"/>
  <line x1="26" y1="42" x2="74" y2="42" stroke="#09090b" stroke-width="2"/>
  <line x1="28" y1="48" x2="72" y2="48" stroke="#09090b" stroke-width="2.5"/>
  <line x1="32" y1="54" x2="68" y2="54" stroke="#09090b" stroke-width="3"/>
  <line x1="38" y1="60" x2="62" y2="60" stroke="#09090b" stroke-width="3.5"/>
  <!-- Grid -->
  <line x1="0" y1="75" x2="100" y2="75" stroke="#06b6d4" stroke-width="1"/>
  <line x1="0" y1="85" x2="100" y2="85" stroke="#06b6d4" stroke-width="1.2"/>
  <line x1="0" y1="95" x2="100" y2="95" stroke="#06b6d4" stroke-width="1.5"/>
</svg>
`)}`;

export const CASSETTE_PRESET_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#f43f5e"/>
  <!-- Cassette body -->
  <rect x="12" y="24" width="76" height="52" rx="6" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
  <!-- Label sticker -->
  <rect x="20" y="32" width="60" height="36" rx="3" fill="#fef08a"/>
  <!-- Reels window -->
  <rect x="28" y="42" width="44" height="16" rx="4" fill="#ffffff" stroke="#18181b" stroke-width="1.5"/>
  <circle cx="38" cy="50" r="5" fill="#18181b"/>
  <circle cx="62" cy="50" r="5" fill="#18181b"/>
  <text x="50" y="39" font-family="monospace" font-size="5" fill="#18181b" font-weight="bold" text-anchor="middle">MIXTAPE 90S</text>
</svg>
`)}`;

export const PLAYLIST_PRESET_COVERS: PlaylistCoverPreset[] = [
  {
    id: 'preset-sneakers',
    name: 'Retro Sneakers (Original)',
    dataUrl: SNEAKERS_PRESET_COVER,
  },
  {
    id: 'preset-sunset',
    name: 'Sunset Golden Hour',
    dataUrl: SUNSET_PRESET_COVER,
  },
  {
    id: 'preset-vinyl',
    name: 'Vinyl Disc Groove',
    dataUrl: VINYL_PRESET_COVER,
  },
  {
    id: 'preset-cyber',
    name: 'Cyberpunk Neon',
    dataUrl: CYBER_PRESET_COVER,
  },
  {
    id: 'preset-cassette',
    name: '90s Cassette Tape',
    dataUrl: CASSETTE_PRESET_COVER,
  },
];

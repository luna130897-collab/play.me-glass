/**
 * Generates aesthetic vector cover artworks matching the user reference
 */

// 1. soft spot - Piri, Tommy Villiers (soft pastel pink illustration)
export const SOFT_SPOT_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#fbcfe8" />
  <path d="M15,90 Q30,40 50,45 Q70,50 85,90 Z" fill="#f472b6" opacity="0.6" />
  <circle cx="50" cy="35" r="16" fill="#fbcfe8" stroke="#f43f5e" stroke-width="2" />
  <path d="M35,65 Q50,55 65,65 Q80,85 50,95 Q20,85 35,65 Z" fill="#fb7185" opacity="0.7" />
  <circle cx="25" cy="25" r="4" fill="#fda4af" />
  <circle cx="75" cy="20" r="3" fill="#fda4af" />
</svg>
`)}`;

// 2. The Devil in I - Slipknot (.5 The Gray Chapter - dark mask artwork)
export const SLIPKNOT_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#09090b" />
  <rect x="25" y="20" width="50" height="60" fill="#27272a" rx="10" />
  <ellipse cx="40" cy="45" rx="6" ry="8" fill="#71717a" />
  <ellipse cx="60" cy="45" rx="6" ry="8" fill="#71717a" />
  <circle cx="40" cy="46" r="3" fill="#000000" />
  <circle cx="60" cy="46" r="3" fill="#000000" />
  <path d="M35,65 Q50,75 65,65" stroke="#991b1b" stroke-width="3" fill="none" />
  <line x1="38" y1="62" x2="38" y2="70" stroke="#71717a" stroke-width="1.5" />
  <line x1="46" y1="63" x2="46" y2="71" stroke="#71717a" stroke-width="1.5" />
  <line x1="54" y1="63" x2="54" y2="71" stroke="#71717a" stroke-width="1.5" />
  <line x1="62" y1="62" x2="62" y2="70" stroke="#71717a" stroke-width="1.5" />
  <text x="50" y="15" font-family="sans-serif" font-size="7" fill="#dc2626" font-weight="bold" text-anchor="middle">SLIPKNOT</text>
</svg>
`)}`;

// 3. Wolfcat - Still Woozy (funky multi-eyed cat face on warm orange/pink)
export const WOLFCAT_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#fb923c" />
  <path d="M20,70 Q15,35 45,25 Q75,15 80,60 Q85,85 50,85 Q25,85 20,70 Z" fill="#fda4af" stroke="#be185d" stroke-width="2" />
  <!-- Eyes -->
  <ellipse cx="38" cy="40" rx="5" ry="3" fill="#fff" stroke="#000" />
  <circle cx="38" cy="40" r="1.5" fill="#000" />
  <ellipse cx="55" cy="38" rx="5" ry="3" fill="#fff" stroke="#000" />
  <circle cx="55" cy="38" r="1.5" fill="#000" />
  <ellipse cx="46" cy="50" rx="5" ry="3" fill="#fff" stroke="#000" />
  <circle cx="46" cy="50" r="1.5" fill="#000" />
  <ellipse cx="62" cy="52" rx="4" ry="2.5" fill="#fff" stroke="#000" />
  <circle cx="62" cy="52" r="1" fill="#000" />
  <ellipse cx="36" cy="58" rx="4" ry="2.5" fill="#fff" stroke="#000" />
  <circle cx="36" cy="58" r="1" fill="#000" />
  <!-- Smile -->
  <path d="M42,68 Q50,73 58,67" stroke="#000" stroke-width="1.5" fill="none" />
</svg>
`)}`;

// 4. golden hour - JVKE (warm golden sunset aesthetic)
export const GOLDEN_HOUR_COVER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="goldenSky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#goldenSky)" />
  <!-- Radiant glowing sun -->
  <circle cx="50" cy="45" r="22" fill="#fef08a" opacity="0.85" />
  <circle cx="50" cy="45" r="30" fill="#fde047" opacity="0.35" />
  <circle cx="50" cy="45" r="38" fill="#facc15" opacity="0.15" />
  <!-- Sunbeams -->
  <line x1="50" y1="12" x2="50" y2="20" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
  <line x1="50" y1="70" x2="50" y2="78" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
  <line x1="17" y1="45" x2="25" y2="45" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
  <line x1="75" y1="45" x2="83" y2="45" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
  <!-- Typography badge -->
  <rect x="20" y="76" width="60" height="15" rx="5" fill="#18181b" opacity="0.8" />
  <text x="50" y="86.5" font-family="'Plus Jakarta Sans', sans-serif" font-size="6.5" fill="#fef08a" font-weight="900" text-anchor="middle" letter-spacing="1">GOLDEN HOUR</text>
</svg>
`)}`;

// Backwards compatibility alias
export const FRIENDLY_SEX_COVER = GOLDEN_HOUR_COVER;

import { ThemePresetId } from '../types';

export interface ThemeColorPalette {
  accent: string;
  accentText: string;
  accentBtnText: string;
  hover: string;
  dark: string;
  light: string;
  subtle: string;
  border: string;
  gradient: string;
  isDark: boolean;
}

export const THEME_COLOR_MAP: Record<ThemePresetId, ThemeColorPalette> = {
  // Aesthetic Full Glass Theme: Monochromatic Pure White & Frosted Smoked Glass
  'dark-glass': {
    accent: '#ffffff',
    accentText: '#ffffff',
    accentBtnText: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.85)',
    dark: '#e2e8f0',
    light: 'rgba(255, 255, 255, 0.15)',
    subtle: 'rgba(255, 255, 255, 0.22)',
    border: 'rgba(255, 255, 255, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.10) 100%)',
    isDark: true,
  },
};

/**
 * Applies CSS custom variables to the document element for Aesthetic Dark Glass
 */
export function applyThemeColors(
  _preset?: ThemePresetId,
  _customAccent?: string,
  glassOpacity?: number,
  glassBlur?: number
) {
  const palette = THEME_COLOR_MAP['dark-glass'];
  const accent = palette.accent;
  const hover = palette.hover;
  const dark = palette.dark;
  const light = palette.light;
  const subtle = palette.subtle;
  const border = palette.border;
  const gradient = palette.gradient;

  const root = document.documentElement;
  root.classList.add('dark-theme-mode');
  root.classList.remove('light-theme-mode');

  const opacityVal = glassOpacity !== undefined ? glassOpacity : 0.20;
  const blurVal = glassBlur !== undefined ? glassBlur : 4;
  const borderOpacity = Math.min(0.85, Math.max(0.14, opacityVal * 0.65 + 0.14));

  root.style.setProperty('--glass-opacity', opacityVal.toString());
  root.style.setProperty('--glass-blur', `${blurVal}px`);
  root.style.setProperty('--glass-border-opacity', borderOpacity.toString());

  // Elegant dark obsidian smoked glass
  root.style.setProperty('--glass-bg', `rgba(13, 17, 28, ${opacityVal})`);
  root.style.setProperty('--glass-border', `rgba(255, 255, 255, ${borderOpacity})`);

  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-accent-text', palette.accentText);
  root.style.setProperty('--theme-accent-btn-text', palette.accentBtnText);
  root.style.setProperty('--theme-accent-hover', hover);
  root.style.setProperty('--theme-accent-dark', dark);
  root.style.setProperty('--theme-accent-light', light);
  root.style.setProperty('--theme-accent-subtle', subtle);
  root.style.setProperty('--theme-accent-border', border);
  root.style.setProperty('--theme-gradient', gradient);
}

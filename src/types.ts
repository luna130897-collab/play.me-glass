export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  dateAdded: string;
  duration: number; // in seconds
  url: string;
  coverArt: string;
  isLiked?: boolean;
  isLocal?: boolean;
  explicit?: boolean;
  lyrics?: string[];
  plainLyrics?: string;
  syncedLyrics?: SyncedLyricLine[];
  fileSize?: string;
  bitrate?: string;
  format?: string;
}

export interface Playlist {
  id: string;
  name: string;
  creator: string;
  description?: string;
  coverArt?: string;
  coverEmoji?: string;
  trackIds: string[];
  createdAt: string;
}

export interface PlaybackSource {
  type: 'playlist' | 'library';
  id: string;
  name: string;
}

export type GifPresetId = 'gif-1' | 'gif-2' | 'gif-3' | 'custom';

export type MainNavTab = 'playlist' | 'library' | 'lyrics' | 'equalizer';

export type RepeatMode = 'off' | 'all' | 'one';

export interface AudioFXSettings {
  bassBoost: number; // 0 to 15 dB
  treble: number; // -6 to 12 dB
  playbackRate: number; // 0.5x to 1.5x
  virtualizer: boolean;
}

export type ThemePresetId = 'dark-glass';

export interface ThemeConfig {
  preset: ThemePresetId;
  customBgUrl: string | null;
  bgBlur: number; // in px
  bgDim: number; // 0 to 0.7
  glassOpacity?: number; // 0.04 (ultra transparent) to 0.85
  glassBlur?: number; // in px
}

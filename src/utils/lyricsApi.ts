export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsResult {
  plainLyrics?: string;
  syncedLyrics?: SyncedLyricLine[];
  source: string;
  trackName?: string;
  artistName?: string;
}

/**
 * Parses LRC timestamp string format: [mm:ss.xx] or [mm:ss] into seconds
 */
export function parseLrc(lrcText: string): SyncedLyricLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const result: SyncedLyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match;
    const timestamps: number[] = [];
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3]
        ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10)
        : 0;
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      timestamps.push(totalSeconds);
    }

    // Strip timestamp tags to extract the plain lyric text
    const text = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

    if (timestamps.length > 0 && text) {
      for (const time of timestamps) {
        result.push({ time, text });
      }
    }
  }

  // Sort chronologically
  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * Clean track title by removing extra tags like (Official Video), [Remastered], etc.
 */
function cleanSongTitle(title: string): string {
  return title
    .replace(/\s*[\(\[](official\s*video|music\s*video|audio|lyrics?|remastered|feat\.?.*|ft\.?.*)[\)\]]/gi, '')
    .trim();
}

/**
 * Fetch online lyrics by track metadata from LRCLIB
 */
export async function fetchLyricsOnline(
  trackName: string,
  artistName?: string,
  albumName?: string,
  duration?: number
): Promise<LyricsResult | null> {
  const cleanTitle = cleanSongTitle(trackName);
  const cleanArtist = artistName?.trim() || '';

  // 1. Try exact match on LRCLIB
  try {
    const params = new URLSearchParams();
    params.set('track_name', cleanTitle);
    if (cleanArtist) params.set('artist_name', cleanArtist);
    if (albumName) params.set('album_name', albumName);
    if (duration && duration > 0) params.set('duration', Math.round(duration).toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PlayMe-Music-App/2.0 (contact@voidcat101.dev)',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics || data.plainLyrics) {
        return {
          plainLyrics: data.plainLyrics || undefined,
          syncedLyrics: data.syncedLyrics ? parseLrc(data.syncedLyrics) : undefined,
          source: 'LRCLIB (Tersinkronisasi)',
          trackName: data.trackName,
          artistName: data.artistName,
        };
      }
    }
  } catch (err) {
    console.warn('LRCLIB exact get error:', err);
  }

  // 2. Try search query on LRCLIB
  try {
    const q = `${cleanArtist} ${cleanTitle}`.trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PlayMe-Music-App/2.0 (contact@voidcat101.dev)',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        // Pick first result that has synced or plain lyrics
        const best = results.find((r) => r.syncedLyrics || r.plainLyrics) || results[0];
        if (best.syncedLyrics || best.plainLyrics) {
          return {
            plainLyrics: best.plainLyrics || undefined,
            syncedLyrics: best.syncedLyrics ? parseLrc(best.syncedLyrics) : undefined,
            source: 'LRCLIB (Pencarian)',
            trackName: best.trackName,
            artistName: best.artistName,
          };
        }
      }
    }
  } catch (err) {
    console.warn('LRCLIB search error:', err);
  }

  // 3. Fallback to Lyrics.ovh (Plain text lyrics)
  if (cleanArtist && cleanTitle) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.lyrics) {
          return {
            plainLyrics: data.lyrics,
            source: 'Lyrics.ovh',
            trackName: cleanTitle,
            artistName: cleanArtist,
          };
        }
      }
    } catch (err) {
      console.warn('Lyrics.ovh error:', err);
    }
  }

  return null;
}

/**
 * Search lyrics by free text query
 */
export async function searchLyricsByQuery(query: string): Promise<
  {
    id: number | string;
    trackName: string;
    artistName: string;
    albumName?: string;
    plainLyrics?: string;
    syncedLyrics?: SyncedLyricLine[];
    duration?: number;
  }[]
> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query.trim())}`, {
      headers: {
        'User-Agent': 'PlayMe-Music-App/2.0 (contact@voidcat101.dev)',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item) => ({
          id: item.id,
          trackName: item.trackName,
          artistName: item.artistName,
          albumName: item.albumName,
          duration: item.duration,
          plainLyrics: item.plainLyrics,
          syncedLyrics: item.syncedLyrics ? parseLrc(item.syncedLyrics) : undefined,
        }));
      }
    }
  } catch (err) {
    console.warn('searchLyricsByQuery error:', err);
  }

  return [];
}

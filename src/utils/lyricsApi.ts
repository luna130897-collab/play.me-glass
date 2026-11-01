export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsSearchResult {
  id: string | number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  plainLyrics?: string;
  syncedLyrics?: SyncedLyricLine[];
  rawLrc?: string;
  source: string;
  isSynced: boolean;
}

export interface LyricsResult {
  plainLyrics?: string;
  syncedLyrics?: SyncedLyricLine[];
  rawLrc?: string;
  source: string;
  trackName?: string;
  artistName?: string;
}

/**
 * Parses LRC timestamp string format: [mm:ss.xx] or [mm:ss] or [hh:mm:ss.xx] into seconds
 */
export function parseLrc(lrcText: string): SyncedLyricLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const result: SyncedLyricLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

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
    const text = trimmed.replace(/\[\d{1,2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

    // Skip metadata tags like [ar:Artist], [ti:Title], [al:Album]
    if (text.startsWith('[') && text.endsWith(']')) continue;

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
 * Clean track title by removing track numbers, extensions, and dirty video/audio tags
 */
export function cleanSongTitle(title: string): string {
  if (!title) return '';
  return title
    // Remove file extensions
    .replace(/\.(mp3|flac|wav|m4a|aac|ogg|opus|wma)$/i, '')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Remove leading track numbers like "01. ", "01 - ", "1 "
    .replace(/^\d+[\s\.\-_]+/, '')
    // Remove video and audio tags like (Official Video), [Audio], [Lyrics], etc.
    .replace(/\s*[\(\[](official\s*video|music\s*video|official\s*audio|audio|lyrics?|lyric\s*video|visualizer|remastered|remaster|live|karaoke|1080p|720p|4k|hq|hd|explicit|clean|radio\s*edit|extended\s*mix)[\)\]]/gi, '')
    // Remove feat/ft tags from title
    .replace(/\s*[\(\[]?(feat\.?|ft\.?)\s+[^()\[\]]+[\)\]]?/gi, '')
    .trim();
}

/**
 * Clean artist name by removing generic placeholder names
 */
export function cleanArtistName(artist?: string): string {
  if (!artist) return '';
  const trimmed = artist.trim();
  const lower = trimmed.toLowerCase();

  // If generic local placeholder, return empty to prevent polluting search
  if (
    lower === 'artis lokal' ||
    lower === 'local artist' ||
    lower === 'unknown artist' ||
    lower === 'unknown' ||
    lower === 'various artists' ||
    lower === 'audio' ||
    lower === 'memori perangkat'
  ) {
    return '';
  }

  return trimmed
    .replace(/_/g, ' ')
    .replace(/\s*[\(\[]?(feat\.?|ft\.?)\s+[^()\[\]]+[\)\]]?/gi, '')
    .trim();
}

/**
 * Split "Artist - Song Title" strings if present in the title
 */
export function splitTitleArtist(rawTitle: string, rawArtist?: string): { title: string; artist: string } {
  let title = cleanSongTitle(rawTitle);
  let artist = cleanArtistName(rawArtist);

  if ((!artist || artist === '') && (title.includes(' - ') || title.includes(' – ') || title.includes(' — '))) {
    const parts = title.split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }
  }

  return { title, artist };
}

// Custom timeout fetch helper with user-agent
async function safeFetchJson<T>(url: string, timeoutMs: number = 6500): Promise<{ data: T | null; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return { data, status: res.status };
    }
    return { data: null, status: res.status };
  } catch (err: unknown) {
    clearTimeout(timer);
    return { data: null, status: 0 };
  }
}

/**
 * High-reliability multi-source lyrics search engine.
 * Combines LRCLIB exact get, LRCLIB full-text search, and Lyrics.ovh with automatic query sanitization.
 */
export async function searchLyricsComprehensive(
  rawTitle: string,
  rawArtist?: string,
  albumName?: string,
  duration?: number
): Promise<LyricsSearchResult[]> {
  const { title: cleanTitle, artist: cleanArtist } = splitTitleArtist(rawTitle, rawArtist);
  if (!cleanTitle) return [];

  const results: LyricsSearchResult[] = [];
  const seenIds = new Set<string>();

  const addResult = (
    id: string | number,
    trackName: string,
    artistName: string,
    album?: string,
    dur?: number,
    plainLyrics?: string,
    syncedLrcString?: string,
    source: string = 'LRCLIB'
  ) => {
    const key = `${trackName.toLowerCase()}__${artistName.toLowerCase()}`;
    if (seenIds.has(key)) return;
    seenIds.add(key);

    const parsedSynced = syncedLrcString ? parseLrc(syncedLrcString) : undefined;
    const isSynced = Boolean(parsedSynced && parsedSynced.length > 0);

    results.push({
      id,
      trackName,
      artistName,
      albumName: album,
      duration: dur,
      plainLyrics: plainLyrics || (isSynced ? parsedSynced?.map((l) => l.text).join('\n') : undefined),
      syncedLyrics: parsedSynced,
      rawLrc: syncedLrcString,
      source: isSynced ? `${source} (⚡ Sinkron)` : `${source} (Teks)`,
      isSynced,
    });
  };

  // 1. STRATEGY A: Exact match on LRCLIB (/api/get)
  if (cleanTitle) {
    const params = new URLSearchParams();
    params.set('track_name', cleanTitle);
    if (cleanArtist) params.set('artist_name', cleanArtist);
    if (albumName && albumName !== 'Memori Perangkat') params.set('album_name', albumName);
    if (duration && duration > 0) params.set('duration', Math.round(duration).toString());

    const { data } = await safeFetchJson<{
      id: number;
      trackName: string;
      artistName: string;
      albumName: string;
      duration: number;
      plainLyrics?: string;
      syncedLyrics?: string;
    }>(`https://lrclib.net/api/get?${params.toString()}`);

    if (data && (data.syncedLyrics || data.plainLyrics)) {
      addResult(
        data.id,
        data.trackName || cleanTitle,
        data.artistName || cleanArtist,
        data.albumName,
        data.duration,
        data.plainLyrics,
        data.syncedLyrics,
        'LRCLIB Resmi'
      );
    }
  }

  // 2. STRATEGY B: Full-Text Search on LRCLIB (/api/search?q=...)
  // Notice we use ?q= which uses full-text index and avoids 503 ServerOverloaded!
  const queryStr = cleanArtist ? `${cleanArtist} ${cleanTitle}` : cleanTitle;
  const { data: searchData } = await safeFetchJson<
    Array<{
      id: number;
      trackName: string;
      artistName: string;
      albumName: string;
      duration: number;
      plainLyrics?: string;
      syncedLyrics?: string;
    }>
  >(`https://lrclib.net/api/search?q=${encodeURIComponent(queryStr)}`);

  if (Array.isArray(searchData) && searchData.length > 0) {
    for (const item of searchData) {
      if (item.syncedLyrics || item.plainLyrics) {
        addResult(
          item.id,
          item.trackName,
          item.artistName,
          item.albumName,
          item.duration,
          item.plainLyrics,
          item.syncedLyrics,
          'LRCLIB'
        );
      }
    }
  }

  // 3. STRATEGY C: If no artist was specified or if 0 results, search title only on LRCLIB
  if (results.length === 0 && cleanArtist && cleanTitle) {
    const { data: titleOnlyData } = await safeFetchJson<
      Array<{
        id: number;
        trackName: string;
        artistName: string;
        albumName: string;
        duration: number;
        plainLyrics?: string;
        syncedLyrics?: string;
      }>
    >(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`);

    if (Array.isArray(titleOnlyData) && titleOnlyData.length > 0) {
      for (const item of titleOnlyData.slice(0, 5)) {
        if (item.syncedLyrics || item.plainLyrics) {
          addResult(
            item.id,
            item.trackName,
            item.artistName,
            item.albumName,
            item.duration,
            item.plainLyrics,
            item.syncedLyrics,
            'LRCLIB'
          );
        }
      }
    }
  }

  // 4. STRATEGY D: Fallback to Lyrics.ovh (Plain text lyrics for massive global catalog)
  if (cleanArtist && cleanTitle) {
    const { data: ovhData } = await safeFetchJson<{ lyrics?: string }>(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`
    );

    if (ovhData && ovhData.lyrics && ovhData.lyrics.trim().length > 20) {
      addResult(
        `ovh-${cleanArtist}-${cleanTitle}`,
        cleanTitle,
        cleanArtist,
        albumName,
        duration,
        ovhData.lyrics.trim(),
        undefined,
        'Lyrics.ovh'
      );
    }
  }

  // Sort results: prioritize synchronized LRC lyrics first, then by match closeness
  results.sort((a, b) => {
    if (a.isSynced && !b.isSynced) return -1;
    if (!a.isSynced && b.isSynced) return 1;
    return 0;
  });

  return results;
}

/**
 * Fetch top best matching lyrics directly (for auto-fetch)
 */
export async function fetchLyricsOnline(
  trackName: string,
  artistName?: string,
  albumName?: string,
  duration?: number
): Promise<LyricsResult | null> {
  const results = await searchLyricsComprehensive(trackName, artistName, albumName, duration);
  if (results.length > 0) {
    const best = results[0];
    return {
      plainLyrics: best.plainLyrics,
      syncedLyrics: best.syncedLyrics,
      rawLrc: best.rawLrc,
      source: best.source,
      trackName: best.trackName,
      artistName: best.artistName,
    };
  }
  return null;
}

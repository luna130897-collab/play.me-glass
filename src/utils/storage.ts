import { Track, Playlist, ThemeConfig, AudioFXSettings, RepeatMode } from '../types';

const DB_NAME = 'PlayMe_Music_DB';
const DB_VERSION = 3;

export const STORES = {
  SETTINGS: 'settings',
  TRACKS: 'tracks',
  AUDIO_BLOBS: 'audioBlobs',
  COVER_ARTS: 'coverArts',
  PLAYLISTS: 'playlists',
  LYRICS: 'lyricsCache',
};

// Open or initialize IndexedDB with robust error handling and upgrade migration
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.TRACKS)) {
        db.createObjectStore(STORES.TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.AUDIO_BLOBS)) {
        db.createObjectStore(STORES.AUDIO_BLOBS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.COVER_ARTS)) {
        db.createObjectStore(STORES.COVER_ARTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
        db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.LYRICS)) {
        db.createObjectStore(STORES.LYRICS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      console.warn('IndexedDB upgrade blocked, please close other tabs.');
    };
  });
}

/**
 * Save settings key-value (stores in both IndexedDB and localStorage for maximum resilience)
 */
export async function saveSetting<T>(key: string, value: T): Promise<void> {
  try {
    localStorage.setItem(`playme_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`localStorage save error for ${key}:`, e);
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    store.put({ key, value });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`IndexedDB save error for ${key}:`, err);
  }
}

/**
 * Load setting key-value with fallback default
 */
export async function loadSetting<T>(key: string, defaultValue: T): Promise<T> {
  // Try IndexedDB first
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    const req = store.get(key);
    const result = await new Promise<{ key: string; value: T } | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (result && result.value !== undefined) {
      return result.value;
    }
  } catch (e) {
    // Fall back to localStorage
  }

  try {
    const local = localStorage.getItem(`playme_${key}`);
    if (local !== null) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.warn(`localStorage load error for ${key}:`, e);
  }

  return defaultValue;
}

/**
 * Permanently save album cover art in IndexedDB
 */
export async function saveCoverArt(id: string, dataUrl: string): Promise<void> {
  if (!id || !dataUrl) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.COVER_ARTS, 'readwrite');
    const store = tx.objectStore(STORES.COVER_ARTS);
    store.put({ id, dataUrl, updatedAt: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`Failed to save cover art for ${id}:`, err);
  }
}

/**
 * Retrieve permanently stored album cover art from IndexedDB
 */
export async function getCoverArt(id: string): Promise<string | null> {
  if (!id) return null;
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.COVER_ARTS, 'readonly');
    const store = tx.objectStore(STORES.COVER_ARTS);
    const req = store.get(id);
    const record = await new Promise<{ id: string; dataUrl: string } | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return record?.dataUrl || null;
  } catch (err) {
    console.warn(`Failed to get cover art for ${id}:`, err);
    return null;
  }
}

/**
 * Delete cover art from IndexedDB
 */
export async function deleteCoverArt(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.COVER_ARTS, 'readwrite');
    const store = tx.objectStore(STORES.COVER_ARTS);
    store.delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`Failed to delete cover art for ${id}:`, err);
  }
}

/**
 * Store a local audio binary Blob (MP3/WAV/FLAC/AAC) permanently in IndexedDB.
 * Converts to clean pure Blob to avoid detached File handles across sessions.
 */
export async function saveAudioBlob(id: string, fileOrBlob: Blob | File, name: string, type: string): Promise<void> {
  try {
    // Ensure we store a pure Blob with explicit MIME type
    const pureBlob = new Blob([fileOrBlob], { type: type || fileOrBlob.type || 'audio/mpeg' });
    const db = await openDB();
    const tx = db.transaction(STORES.AUDIO_BLOBS, 'readwrite');
    const store = tx.objectStore(STORES.AUDIO_BLOBS);
    store.put({ id, blob: pureBlob, name, type, size: pureBlob.size, updatedAt: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save audio blob to IndexedDB:', err);
  }
}

/**
 * Retrieve a local audio binary Blob from IndexedDB
 */
export async function getAudioBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.AUDIO_BLOBS, 'readonly');
    const store = tx.objectStore(STORES.AUDIO_BLOBS);
    const req = store.get(id);
    const record = await new Promise<{ id: string; blob: Blob; type?: string } | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (record && record.blob) {
      return record.blob;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to get audio blob for track ${id}:`, err);
    return null;
  }
}

/**
 * Delete a local audio binary Blob from IndexedDB
 */
export async function deleteAudioBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.AUDIO_BLOBS, 'readwrite');
    const store = tx.objectStore(STORES.AUDIO_BLOBS);
    store.delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`Failed to delete audio blob for track ${id}:`, err);
  }
}

/**
 * Save tracks to storage permanently in IndexedDB.
 * Never stores transient `blob:` URLs in `url` property (they expire on reload and are re-created from audioBlobs).
 * Stores permanent `coverArt` Base64 Data URLs so they persist seamlessly across reloads!
 */
export async function saveTracks(tracks: Track[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.TRACKS, 'readwrite');
    const store = tx.objectStore(STORES.TRACKS);
    
    // Clear and re-populate
    store.clear();
    for (const track of tracks) {
      // Do not store transient blob: URLs in url property (re-created dynamically)
      const trackToStore = {
        ...track,
        url: track.isLocal ? '' : track.url,
      };
      store.put(trackToStore);

      // If track has a valid Data URL cover art, also persist in COVER_ARTS store as backup
      if (track.coverArt && track.coverArt.startsWith('data:')) {
        saveCoverArt(track.id, track.coverArt).catch(() => {});
      }
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('saveTracks IndexedDB error:', err);
  }

  // Backup tracks metadata in localStorage without exceeding quota
  try {
    const sanitized = tracks.map((t) => ({
      ...t,
      url: t.isLocal ? '' : t.url,
      coverArt: t.coverArt && t.coverArt.length > 50000 ? '' : t.coverArt,
    }));
    localStorage.setItem('playme_tracks_meta', JSON.stringify(sanitized));
  } catch (e) {
    console.warn('localStorage tracks backup error:', e);
  }
}

/**
 * Load tracks from storage (IndexedDB first, with localStorage fallback)
 */
export async function loadTracks(): Promise<Track[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.TRACKS, 'readonly');
    const store = tx.objectStore(STORES.TRACKS);
    const req = store.getAll();
    const tracks = await new Promise<Track[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (tracks && tracks.length > 0) {
      return tracks;
    }
  } catch (err) {
    console.warn('loadTracks IndexedDB error:', err);
  }

  try {
    const local = localStorage.getItem('playme_tracks_meta');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('loadTracks localStorage error:', e);
  }

  return null;
}

/**
 * Save playlists permanently
 */
export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PLAYLISTS, 'readwrite');
    const store = tx.objectStore(STORES.PLAYLISTS);
    store.clear();
    for (const pl of playlists) {
      store.put(pl);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('savePlaylists IndexedDB error:', err);
  }

  try {
    localStorage.setItem('playme_playlists', JSON.stringify(playlists));
  } catch (e) {
    console.warn('localStorage playlists save error:', e);
  }
}

/**
 * Load playlists permanently
 */
export async function loadPlaylists(): Promise<Playlist[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PLAYLISTS, 'readonly');
    const store = tx.objectStore(STORES.PLAYLISTS);
    const req = store.getAll();
    const playlists = await new Promise<Playlist[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (playlists && playlists.length > 0) {
      return playlists;
    }
  } catch (err) {
    console.warn('loadPlaylists IndexedDB error:', err);
  }

  try {
    const local = localStorage.getItem('playme_playlists');
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.warn('loadPlaylists localStorage error:', e);
  }

  return null;
}

/**
 * Cache lyrics permanently
 */
export async function saveLyricsCache(trackId: string, plainLyrics?: string, syncedLyrics?: { time: number; text: string }[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.LYRICS, 'readwrite');
    const store = tx.objectStore(STORES.LYRICS);
    store.put({ id: trackId, plainLyrics, syncedLyrics, timestamp: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('saveLyricsCache error:', e);
  }
}

/**
 * Get cached lyrics
 */
export async function getLyricsCache(trackId: string): Promise<{ plainLyrics?: string; syncedLyrics?: { time: number; text: string }[] } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.LYRICS, 'readonly');
    const store = tx.objectStore(STORES.LYRICS);
    const req = store.get(trackId);
    const result = await new Promise<{ plainLyrics?: string; syncedLyrics?: { time: number; text: string }[] } | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return result || null;
  } catch (e) {
    return null;
  }
}

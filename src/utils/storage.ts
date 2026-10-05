import { Track, Playlist, ThemeConfig, AudioFXSettings, RepeatMode } from '../types';

const DB_NAME = 'PlayMe_Music_DB';
const DB_VERSION = 2;

const STORES = {
  SETTINGS: 'settings',
  TRACKS: 'tracks',
  AUDIO_BLOBS: 'audioBlobs',
  PLAYLISTS: 'playlists',
  LYRICS: 'lyricsCache',
};

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
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
      if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
        db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.LYRICS)) {
        db.createObjectStore(STORES.LYRICS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
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
 * Save tracks to storage (metadata without huge blob URLs)
 */
export async function saveTracks(tracks: Track[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.TRACKS, 'readwrite');
    const store = tx.objectStore(STORES.TRACKS);
    
    // Clear old metadata and store new
    store.clear();
    for (const track of tracks) {
      // Do not store transient blob: URLs permanently, they get re-created from audioBlobs
      const trackToStore = {
        ...track,
        url: track.isLocal ? '' : track.url,
      };
      store.put(trackToStore);
    }

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('saveTracks IndexedDB error:', err);
  }

  // Backup tracks metadata in localStorage (sanitized)
  try {
    const sanitized = tracks.map((t) => ({
      ...t,
      url: t.isLocal ? '' : t.url,
      coverArt: t.coverArt && t.coverArt.length > 50000 ? '' : t.coverArt, // Avoid exceeding 5MB localStorage limit
    }));
    localStorage.setItem('playme_tracks_meta', JSON.stringify(sanitized));
  } catch (e) {
    console.warn('localStorage tracks backup error:', e);
  }
}

/**
 * Load tracks from storage
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
      return JSON.parse(local);
    }
  } catch (e) {
    console.warn('loadTracks localStorage error:', e);
  }

  return null;
}

/**
 * Store a local audio binary Blob (MP3/WAV/etc.) permanently in IndexedDB
 */
export async function saveAudioBlob(id: string, blob: Blob, name: string, type: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.AUDIO_BLOBS, 'readwrite');
    const store = tx.objectStore(STORES.AUDIO_BLOBS);
    store.put({ id, blob, name, type, updatedAt: Date.now() });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
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
    const record = await new Promise<{ id: string; blob: Blob } | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return record?.blob || null;
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
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`Failed to delete audio blob for track ${id}:`, err);
  }
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
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
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
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
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

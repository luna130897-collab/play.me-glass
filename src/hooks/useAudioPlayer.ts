import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, RepeatMode, AudioFXSettings, PlaybackSource, SyncedLyricLine } from '../types';
import { 
  generateSoftSpotTrack, 
  generateDevilInITrack, 
  generateWolfcatTrack, 
  generateGoldenHourTrack, 
  playTactileClick 
} from '../utils/audioSynth';
import { 
  SOFT_SPOT_COVER, 
  SLIPKNOT_COVER, 
  WOLFCAT_COVER, 
  GOLDEN_HOUR_COVER 
} from '../utils/coverArt';
import { parseAudioMetadata } from '../utils/id3Parser';
import { 
  saveTracks, 
  loadTracks, 
  saveAudioBlob, 
  getAudioBlob, 
  deleteAudioBlob,
  saveSetting,
  loadSetting,
  saveLyricsCache,
  getLyricsCache 
} from '../utils/storage';

const DEFAULT_AUDIO_FX: AudioFXSettings = {
  bassBoost: 6,
  treble: 2,
  playbackRate: 1.0,
  virtualizer: true,
};

export function useAudioPlayer() {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [activeQueue, setActiveQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>({
    type: 'playlist',
    id: 'playlist-1',
    name: 'Daftar Lagu Utama',
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [beatEnergy, setBeatEnergy] = useState<number>(0);
  const [audioFX, setAudioFXState] = useState<AudioFXSettings>(DEFAULT_AUDIO_FX);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isLoadedRef = useRef<boolean>(false);

  // Set Volume with persistent storage
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    saveSetting('volume', v);
  }, []);

  // Set Audio FX with persistent storage
  const setAudioFX = useCallback((fx: AudioFXSettings | ((prev: AudioFXSettings) => AudioFXSettings)) => {
    setAudioFXState((prev) => {
      const next = typeof fx === 'function' ? fx(prev) : fx;
      saveSetting('audioFX', next);
      return next;
    });
  }, []);

  // Initialize tracks and restore saved state on mount
  useEffect(() => {
    let isCancelled = false;

    async function loadInitialData() {
      try {
        // 1. Restore player settings
        const [savedVol, savedRepeat, savedShuffle, savedFX, savedLastTrackId, savedLastTime] = await Promise.all([
          loadSetting<number>('volume', 0.85),
          loadSetting<RepeatMode>('repeatMode', 'all'),
          loadSetting<boolean>('isShuffle', false),
          loadSetting<AudioFXSettings>('audioFX', DEFAULT_AUDIO_FX),
          loadSetting<string | null>('lastTrackId', null),
          loadSetting<number>('lastCurrentTime', 0),
        ]);

        if (isCancelled) return;

        setVolumeState(savedVol);
        setRepeatMode(savedRepeat);
        setIsShuffle(savedShuffle);
        setAudioFXState(savedFX);

        // 2. Prepare demo track URLs
        const [softSpotUrl, devilUrl, wolfcatUrl, goldenHourUrl] = await Promise.all([
          generateSoftSpotTrack(),
          generateDevilInITrack(),
          generateWolfcatTrack(),
          generateGoldenHourTrack(),
        ]);

        const demoUrls: Record<string, string> = {
          'track-1': softSpotUrl,
          'track-2': devilUrl,
          'track-3': wolfcatUrl,
          'track-4': goldenHourUrl,
        };

        // 3. Load stored tracks from IndexedDB / LocalStorage
        const storedTracks = await loadTracks();
        let resolvedTracks: Track[] = [];

        if (storedTracks && storedTracks.length > 0) {
          // Restore audio URLs for both demo tracks and user-uploaded local audio files
          for (const track of storedTracks) {
            if (track.isLocal) {
              const blob = await getAudioBlob(track.id);
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                resolvedTracks.push({ ...track, url: blobUrl });
              } else {
                resolvedTracks.push(track);
              }
            } else if (demoUrls[track.id]) {
              resolvedTracks.push({ ...track, url: demoUrls[track.id] });
            } else {
              resolvedTracks.push(track);
            }
          }
        } else {
          // First time default demo tracks
          resolvedTracks = [
            {
              id: 'track-1',
              title: 'soft spot',
              artist: 'Piri, Tommy Villiers',
              album: 'soft spot',
              dateAdded: 'July 21, 2022',
              duration: 220,
              url: softSpotUrl,
              coverArt: SOFT_SPOT_COVER,
              isLiked: true,
              format: 'FLAC 24-bit',
              bitrate: '940 kbps',
              fileSize: '24.8 MB',
              lyrics: [
                'You hit me like a summer rain',
                'Wash away all the heavy pain',
                'Got a soft spot right inside my heart',
                'Dancing through the midnight dark',
                'Every whisper feels like velvet skies',
                'I see the universe inside your eyes',
                'Never wanna wake up from this dream',
                'Drifting down the river stream',
              ],
            },
            {
              id: 'track-2',
              title: 'The Devil in I',
              artist: 'Slipknot',
              album: '.5 The Gray Chapter',
              dateAdded: 'July 19, 2022',
              duration: 343,
              url: devilUrl,
              coverArt: SLIPKNOT_COVER,
              isLiked: true,
              format: 'MP3 Stereo',
              bitrate: '320 kbps',
              fileSize: '13.2 MB',
              lyrics: [
                'Undo these handcuffs, let me breathe',
                'The world you know is crumbling deep',
                'Step inside, see the devil in I',
                'Too many times we stood and died',
                'You will not see me fall tonight',
                'Under the cold and darkened sky',
                'Step inside, walk with the fire',
                'Reaching through the barbed wire',
              ],
            },
            {
              id: 'track-3',
              title: 'Wolfcat',
              artist: 'Still Woozy',
              album: 'Wolfcat',
              dateAdded: 'July 01, 2022',
              duration: 174,
              url: wolfcatUrl,
              coverArt: WOLFCAT_COVER,
              isLiked: true,
              explicit: true,
              format: 'MP3 Stereo',
              bitrate: '320 kbps',
              fileSize: '7.1 MB',
              lyrics: [
                'Floating on a cloud in the living room',
                'Watching yellow flowers bloom',
                'Wolfcat purring on the wooden floor',
                'Tell me what we are waiting for',
                'Sunlight spilling through the kitchen glass',
                'Hoping this sunny afternoon will last',
                'Take my hand and let the world spin slow',
                'Nowhere else we need to go',
              ],
            },
            {
              id: 'track-4',
              title: 'golden hour',
              artist: 'JVKE',
              album: 'this is what ____ feels like',
              dateAdded: 'June 14, 2022',
              duration: 209,
              url: goldenHourUrl,
              coverArt: GOLDEN_HOUR_COVER,
              isLiked: true,
              format: 'AAC High-Res',
              bitrate: '320 kbps',
              fileSize: '8.2 MB',
              lyrics: [
                'It was just two lovers sittin’ in the car',
                'Listening to Blonde, fallin’ for each other',
                'Pink and orange skies, feelin’ super enterprise',
                'Ain’t nothin’ else that I’d rather do',
                'Than sit right here and look at you',
                'I was all alone with the love of my life',
                'She’s got glitter for skin, my radiant beam in the night',
                'I don’t need no light to see you shine',
                'It’s your golden hour, you slow down time',
              ],
            },
          ];

          await saveTracks(resolvedTracks);
        }

        if (isCancelled) return;

        setAllTracks(resolvedTracks);
        setActiveQueue(resolvedTracks);

        // Restore last track index if available
        let startIdx = 0;
        if (savedLastTrackId) {
          const foundIdx = resolvedTracks.findIndex((t) => t.id === savedLastTrackId);
          if (foundIdx !== -1) startIdx = foundIdx;
        }
        setCurrentIndex(startIdx);
        if (savedLastTime > 0) {
          setCurrentTime(savedLastTime);
        }

        isLoadedRef.current = true;
        setIsReady(true);
      } catch (err) {
        console.error('Failed to load initial player data:', err);
        setIsReady(true);
      }
    }

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Save tracks automatically whenever modified (e.g. liked, added, deleted, lyrics updated)
  useEffect(() => {
    if (isLoadedRef.current && allTracks.length > 0) {
      saveTracks(allTracks);
    }
  }, [allTracks]);

  // Web Audio Graph setup
  const initAudioGraph = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 180;
      bass.gain.value = audioFX.bassBoost;
      bassFilterRef.current = bass;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3500;
      treble.gain.value = audioFX.treble;
      trebleFilterRef.current = treble;

      const gain = ctx.createGain();
      gain.gain.value = 1.0;
      gainNodeRef.current = gain;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      source.connect(bass);
      bass.connect(treble);
      treble.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateEnergy = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        const lowBins = Math.min(6, bufferLength);
        for (let i = 0; i < lowBins; i++) {
          sum += dataArray[i];
        }
        const energy = sum / (lowBins * 255);
        setBeatEnergy(energy);

        animFrameRef.current = requestAnimationFrame(updateEnergy);
      };

      updateEnergy();
    } catch (e) {
      console.warn('Web Audio API setup warning:', e);
    }
  }, [audioFX.bassBoost, audioFX.treble]);

  // Audio FX adjustments
  useEffect(() => {
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = audioFX.bassBoost;
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = audioFX.treble;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = audioFX.playbackRate;
    }
  }, [audioFX]);

  // Sleep Timer countdown
  useEffect(() => {
    if (!sleepTimer || sleepTimer <= 0) return;

    const interval = setInterval(() => {
      setSleepTimer((prev) => {
        if (prev === null || prev <= 1) {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  const currentTrack = activeQueue[currentIndex] || allTracks[0] || null;

  // Sync HTML5 audio element source
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const el = audioRef.current;
    if (el.src !== currentTrack.url && currentTrack.url) {
      el.src = currentTrack.url;
      el.volume = volume;
      el.playbackRate = audioFX.playbackRate;
      el.load();

      // Save last played track ID
      saveSetting('lastTrackId', currentTrack.id);

      if (isPlaying) {
        el.play().catch((err) => {
          console.warn('Playback resume issue:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, volume, audioFX.playbackRate, isPlaying]);

  // Play from queue
  const playFromQueue = useCallback(
    (index: number, queue?: Track[], source?: PlaybackSource) => {
      playTactileClick();
      initAudioGraph();

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (source) setPlaybackSource(source);

      let targetQueue = activeQueue;
      if (queue && queue.length > 0) {
        targetQueue = queue;
        setActiveQueue(queue);
      }

      const validIdx = Math.max(0, Math.min(index, targetQueue.length - 1));
      setCurrentIndex(validIdx);
      setIsPlaying(true);

      const track = targetQueue[validIdx];
      if (audioRef.current && track?.url) {
        audioRef.current.src = track.url;
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = audioFX.playbackRate;
        audioRef.current.play().catch((err) => {
          console.warn('Audio play request failed:', err);
          setIsPlaying(false);
        });
      }
    },
    [activeQueue, volume, audioFX.playbackRate, initAudioGraph]
  );

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    playTactileClick();
    initAudioGraph();

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      saveSetting('lastCurrentTime', audioRef.current.currentTime);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play prevented:', err);
          setIsPlaying(false);
        });
    }
  }, [isPlaying, initAudioGraph]);

  // Next track
  const nextTrack = useCallback(() => {
    playTactileClick();
    if (activeQueue.length === 0) return;

    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * activeQueue.length);
      playFromQueue(nextIdx);
    } else {
      const nextIdx = (currentIndex + 1) % activeQueue.length;
      playFromQueue(nextIdx);
    }
  }, [activeQueue.length, isShuffle, currentIndex, playFromQueue]);

  // Previous track
  const prevTrack = useCallback(() => {
    playTactileClick();
    if (activeQueue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIdx = (currentIndex - 1 + activeQueue.length) % activeQueue.length;
    playFromQueue(prevIdx);
  }, [activeQueue.length, currentIndex, playFromQueue]);

  // Seek
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      saveSetting('lastCurrentTime', time);
    }
  }, []);

  // Repeat toggle with storage
  const toggleRepeat = useCallback(() => {
    playTactileClick();
    setRepeatMode((prev) => {
      let next: RepeatMode = 'off';
      if (prev === 'off') next = 'all';
      else if (prev === 'all') next = 'one';
      saveSetting('repeatMode', next);
      return next;
    });
  }, []);

  // Shuffle toggle with storage
  const toggleShuffle = useCallback(() => {
    playTactileClick();
    setIsShuffle((prev) => {
      const next = !prev;
      saveSetting('isShuffle', next);
      return next;
    });
  }, []);

  // Like toggle with storage
  const toggleLike = useCallback((id: string) => {
    playTactileClick();
    setAllTracks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, isLiked: !t.isLiked } : t));
      saveTracks(updated);
      return updated;
    });
    setActiveQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLiked: !t.isLiked } : t))
    );
  }, []);

  // Add to Queue (next up)
  const playNext = useCallback((id: string) => {
    playTactileClick();
    const trackToMove = allTracks.find((t) => t.id === id);
    if (!trackToMove) return;

    setActiveQueue((prev) => {
      const withoutTrack = prev.filter((t) => t.id !== id);
      const insertAt = Math.min(currentIndex + 1, withoutTrack.length);
      return [
        ...withoutTrack.slice(0, insertAt),
        trackToMove,
        ...withoutTrack.slice(insertAt),
      ];
    });
  }, [allTracks, currentIndex]);

  // Update track lyrics with persistent storage
  const updateTrackLyrics = useCallback(async (trackId: string, plainLyrics?: string, syncedLyrics?: SyncedLyricLine[]) => {
    // 1. Cache lyrics permanently
    await saveLyricsCache(trackId, plainLyrics, syncedLyrics);

    // 2. Update track in memory and store
    setAllTracks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            plainLyrics: plainLyrics || t.plainLyrics,
            syncedLyrics: syncedLyrics || t.syncedLyrics,
            lyrics: plainLyrics ? plainLyrics.split('\n').filter(Boolean) : t.lyrics,
          };
        }
        return t;
      });
      saveTracks(updated);
      return updated;
    });

    setActiveQueue((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            plainLyrics: plainLyrics || t.plainLyrics,
            syncedLyrics: syncedLyrics || t.syncedLyrics,
            lyrics: plainLyrics ? plainLyrics.split('\n').filter(Boolean) : t.lyrics,
          };
        }
        return t;
      })
    );
  }, []);

  // Add Local Files with ID3 extraction AND persistent IndexedDB storage
  const addLocalFiles = useCallback(async (files: FileList | File[]) => {
    playTactileClick();
    const fileArray = Array.from(files);
    const newTracks: Track[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      let title = file.name.replace(/\.[^/.]+$/, '');
      let artist = 'Local Artist';
      let album = 'Memori Internal / Unduhan';

      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      let coverArtUrl = '';
      try {
        const meta = await parseAudioMetadata(file);
        if (meta.title) title = meta.title;
        if (meta.artist) artist = meta.artist;
        if (meta.album) album = meta.album;
        if (meta.coverArtUrl) coverArtUrl = meta.coverArtUrl;
      } catch (err) {
        console.warn('ID3 parse skipped:', err);
      }

      const fileUrl = URL.createObjectURL(file);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const trackId = `local-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;

      // Save raw audio blob in IndexedDB permanently!
      await saveAudioBlob(trackId, file, file.name, file.type || 'audio/mpeg');

      newTracks.push({
        id: trackId,
        title: title || file.name,
        artist: artist,
        album: album,
        dateAdded: dateStr,
        duration: 180,
        url: fileUrl,
        coverArt: coverArtUrl,
        isLocal: true,
        isLiked: false,
        format: `${ext} Offline`,
        bitrate: '320 kbps',
        fileSize: sizeMb,
        lyrics: [
          '♪ Memutar berkas audio lokal dari perangkat',
          `Berkas: ${file.name}`,
          `Artis: ${artist} • Album: ${album}`,
          `Format: ${ext} • Ukuran: ${sizeMb}`,
          'Audio tersimpan permanen di penyimpanan lokal aplikasi',
        ],
      });
    }

    if (newTracks.length > 0) {
      setAllTracks((prev) => {
        const updated = [...prev, ...newTracks];
        saveTracks(updated);
        return updated;
      });
    }
  }, []);

  // Remove track with persistent deletion
  const removeTrack = useCallback(async (id: string) => {
    playTactileClick();
    await deleteAudioBlob(id);

    setAllTracks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTracks(updated);
      return updated;
    });

    setActiveQueue((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const updated = prev.filter((t) => t.id !== id);
      if (idx === currentIndex) {
        if (updated.length > 0) {
          const nextI = Math.min(idx, updated.length - 1);
          setCurrentIndex(nextI);
          if (audioRef.current) {
            audioRef.current.src = updated[nextI].url;
            if (isPlaying) audioRef.current.play();
          }
        } else {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
        }
      } else if (idx < currentIndex) {
        setCurrentIndex((c) => c - 1);
      }
      return updated;
    });
  }, [currentIndex, isPlaying]);

  // Audio element event listeners
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => {
      setDuration(el.duration || 0);
      setActiveQueue((prev) =>
        prev.map((t, idx) =>
          idx === currentIndex && (!t.duration || t.duration === 180)
            ? { ...t, duration: el.duration }
            : t
        )
      );
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        el.currentTime = 0;
        el.play();
      } else if (repeatMode === 'all') {
        nextTrack();
      } else {
        if (currentIndex < activeQueue.length - 1) {
          nextTrack();
        } else {
          setIsPlaying(false);
          el.currentTime = 0;
        }
      }
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
    };
  }, [currentIndex, nextTrack, activeQueue.length, repeatMode]);

  return {
    allTracks,
    activeQueue,
    currentTrack,
    currentIndex,
    playbackSource,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    volume,
    isReady,
    beatEnergy,
    audioFX,
    sleepTimer,
    audioRef,
    analyserRef,
    setVolume,
    setAudioFX,
    setSleepTimer,
    playFromQueue,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    playNext,
    addLocalFiles,
    removeTrack,
    updateTrackLyrics,
  };
}

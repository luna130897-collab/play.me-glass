import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { TopGifStage } from './components/TopGifStage';
import { ModernNavTabs } from './components/ModernNavTabs';
import { InlineNowPlayingCard } from './components/InlineNowPlayingCard';
import { UnifiedPlaylistHub } from './components/UnifiedPlaylistHub';
import { LibraryView } from './components/LibraryView';
import { LyricsVisualView } from './components/LyricsVisualView';
import { EqualizerTimerView } from './components/EqualizerTimerView';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { GifUploadModal } from './components/GifUploadModal';
import { TrackDetailModal } from './components/TrackDetailModal';
import { ThemeModal } from './components/ThemeModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ChangePlaylistCoverModal } from './components/ChangePlaylistCoverModal';
import { AddSongsToPlaylistModal } from './components/AddSongsToPlaylistModal';
import { GifPresetId, MainNavTab, Track, ThemeConfig, Playlist } from './types';
import { applyThemeColors } from './utils/themeColors';
import { 
  loadPlaylists, 
  savePlaylists, 
  loadSetting, 
  saveSetting 
} from './utils/storage';

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'Daftar Lagu Utama',
    creator: 'PlayMe User',
    coverArt: '',
    coverEmoji: '🎵',
    trackIds: ['track-1', 'track-2', 'track-3', 'track-4'],
    createdAt: 'Okt 2026',
  },
  {
    id: 'playlist-2',
    name: 'Lofi Chill Santai',
    creator: 'PlayMe User',
    coverEmoji: '☕',
    trackIds: ['track-1', 'track-3', 'track-4'],
    createdAt: 'Okt 2026',
  },
];

export default function App() {
  const {
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
    beatEnergy,
    audioFX,
    sleepTimer,
    audioRef,
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
  } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState<MainNavTab>('playlist');
  const [currentGifId, setCurrentGifId] = useState<GifPresetId>('gif-1');
  const [customMediaUrl, setCustomMediaUrl] = useState<string | undefined>(undefined);
  const [customMediaType, setCustomMediaType] = useState<'gif' | 'video' | undefined>(undefined);
  
  // Persistent Playlists & Profile
  const [creatorName, setCreatorName] = useState<string>('PlayMe User');
  const [creatorAvatar, setCreatorAvatar] = useState<string>('🐱');
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('playlist-1');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isChangeCoverOpen, setIsChangeCoverOpen] = useState<boolean>(false);
  const [isAddSongsModalOpen, setIsAddSongsModalOpen] = useState<boolean>(false);
  const [detailTrack, setDetailTrack] = useState<Track | null>(null);

  // Scroll detection to reveal Now Playing
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme Configuration (Fixed to Elegant Dark Glass)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    preset: 'dark-glass',
    customBgUrl: null,
    bgBlur: 0,
    bgDim: 0.15,
    glassOpacity: 0.20,
    glassBlur: 4,
  });

  // Restore stored playlists, profile, and theme settings on mount
  useEffect(() => {
    let isCancelled = false;

    async function restorePersistentData() {
      try {
        const [storedPlaylists, storedActiveId, storedCreator, storedAvatar, storedTheme] = await Promise.all([
          loadPlaylists(),
          loadSetting<string>('activePlaylistId', 'playlist-1'),
          loadSetting<string>('creatorName', 'PlayMe User'),
          loadSetting<string>('creatorAvatar', '🐱'),
          loadSetting<ThemeConfig>('themeConfig', {
            preset: 'dark-glass',
            customBgUrl: null,
            bgBlur: 0,
            bgDim: 0.15,
            glassOpacity: 0.20,
            glassBlur: 4,
          }),
        ]);

        if (isCancelled) return;

        if (storedPlaylists && storedPlaylists.length > 0) {
          setPlaylists(storedPlaylists);
        } else {
          await savePlaylists(DEFAULT_PLAYLISTS);
        }

        if (storedActiveId) setActivePlaylistId(storedActiveId);
        if (storedCreator) setCreatorName(storedCreator);
        if (storedAvatar) setCreatorAvatar(storedAvatar);
        if (storedTheme) {
          setThemeConfig({
            ...storedTheme,
            preset: 'dark-glass',
            glassOpacity: storedTheme.glassOpacity ?? 0.20,
            glassBlur: storedTheme.glassBlur !== undefined ? Math.min(storedTheme.glassBlur, 8) : 4,
          });
        }
      } catch (err) {
        console.warn('Error restoring persistent state:', err);
      }
    }

    restorePersistentData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Dynamically apply accent color palette and glass transparency
  useEffect(() => {
    applyThemeColors(
      'dark-glass', 
      undefined,
      themeConfig.glassOpacity,
      themeConfig.glassBlur
    );
  }, [themeConfig.glassOpacity, themeConfig.glassBlur]);

  // Active playlist resolution
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0] || {
    id: 'playlist-1',
    name: 'Daftar Lagu Utama',
    creator: creatorName,
    trackIds: ['track-1', 'track-2', 'track-3', 'track-4'],
    createdAt: 'Okt 2026',
  };

  // Tracks belonging strictly to current playlist
  const playlistTracks = allTracks.filter((t) =>
    activePlaylist.trackIds.length > 0 ? activePlaylist.trackIds.includes(t.id) : true
  );

  // Update theme and persist
  const handleUpdateTheme = (partial: Partial<ThemeConfig>) => {
    setThemeConfig((prev) => {
      const updated = { ...prev, ...partial };
      saveSetting('themeConfig', updated);
      return updated;
    });
  };

  // Create new playlist and persist
  const handleCreatePlaylist = (newPl: Playlist) => {
    setPlaylists((prev) => {
      const updated = [...prev, newPl];
      savePlaylists(updated);
      return updated;
    });
    setActivePlaylistId(newPl.id);
    saveSetting('activePlaylistId', newPl.id);
  };

  // Delete a playlist and persist
  const handleDeletePlaylist = (playlistId: string) => {
    if (playlists.length <= 1) return;
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== playlistId);
      savePlaylists(updated);
      if (activePlaylistId === playlistId) {
        const nextId = updated[0]?.id || 'playlist-1';
        setActivePlaylistId(nextId);
        saveSetting('activePlaylistId', nextId);
      }
      return updated;
    });
  };

  // Remove a song from a playlist and persist
  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            trackIds: pl.trackIds.filter((id) => id !== trackId),
          };
        }
        return pl;
      });
      savePlaylists(updated);
      return updated;
    });
  };

  // Update creator profile name & avatar and persist
  const handleSaveProfile = (name: string, avatar: string) => {
    setCreatorName(name);
    setCreatorAvatar(avatar);
    saveSetting('creatorName', name);
    saveSetting('creatorAvatar', avatar);
    setPlaylists((prev) => {
      const updated = prev.map((pl) => (pl.creator === creatorName ? { ...pl, creator: name } : pl));
      savePlaylists(updated);
      return updated;
    });
  };

  // Update playlist cover thumbnail, emoji & name and persist
  const handleSavePlaylistCover = (
    playlistId: string,
    newCoverArt?: string,
    newEmoji?: string,
    newName?: string
  ) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) =>
        pl.id === playlistId
          ? {
              ...pl,
              coverArt: newCoverArt,
              coverEmoji: newEmoji || pl.coverEmoji,
              name: newName ? newName.trim() : pl.name,
            }
          : pl
      );
      savePlaylists(updated);
      return updated;
    });
  };

  // Quick rename playlist and persist
  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    if (!newName.trim()) return;
    setPlaylists((prev) => {
      const updated = prev.map((pl) => (pl.id === playlistId ? { ...pl, name: newName.trim() } : pl));
      savePlaylists(updated);
      return updated;
    });
  };

  // Delete track permanently from library and sync with all playlists
  const handleDeleteTrackFromLibrary = async (trackId: string) => {
    await removeTrack(trackId);
    setPlaylists((prev) => {
      const updated = prev.map((pl) => ({
        ...pl,
        trackIds: pl.trackIds.filter((id) => id !== trackId),
      }));
      savePlaylists(updated);
      return updated;
    });
  };

  // Add tracks from library to a playlist and persist
  const handleAddTracksToPlaylist = (playlistId: string, trackIdsToAdd: string[]) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id === playlistId) {
          const merged = [...new Set([...pl.trackIds, ...trackIdsToAdd])];
          return { ...pl, trackIds: merged };
        }
        return pl;
      });
      savePlaylists(updated);
      return updated;
    });
  };

  const handleAddSingleTrackToPlaylist = (playlistId: string, trackId: string) => {
    handleAddTracksToPlaylist(playlistId, [trackId]);
  };

  // Add files directly to active playlist
  const handleAddFilesToPlaylist = async (files: FileList | File[]) => {
    const existingCount = allTracks.length;
    await addLocalFiles(files);

    setTimeout(() => {
      setPlaylists((prev) => {
        const updated = prev.map((pl) => {
          if (pl.id === activePlaylist.id) {
            const newlyAddedIds = allTracks.slice(existingCount).map((t) => t.id);
            return {
              ...pl,
              trackIds: [...new Set([...pl.trackIds, ...newlyAddedIds])],
            };
          }
          return pl;
        });
        savePlaylists(updated);
        return updated;
      });
    }, 400);
  };

  // Preset Theme Background Styling (Always Elegant Dark Glass)
  const getThemeBaseClass = () => {
    return themeConfig.customBgUrl 
      ? 'text-white dark-theme-mode' 
      : 'bg-[#06080d] text-white dark-theme-mode';
  };

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden pb-12 transition-colors duration-500 ${getThemeBaseClass()} ${themeConfig.customBgUrl ? 'custom-theme-active' : ''}`}>
      {/* Real HTML5 Audio Element connected to Web Audio Graph */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="auto" />

      {/* =========================================================================
          DYNAMIC BACKGROUND: CUSTOM IMAGE / WALLPAPER OR PRESET GLASS GLOW
          Rendered at z-0 with content at relative z-10 for guaranteed visibility
         ========================================================================= */}
      {themeConfig.customBgUrl ? (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={themeConfig.customBgUrl}
            alt="Custom Background"
            className="w-full h-full object-cover transition-all duration-300"
            style={{
              filter: `blur(${themeConfig.bgBlur}px)`,
              transform: `scale(${1 + (themeConfig.bgBlur > 0 ? 0.08 : 0)})`,
            }}
          />
          <div 
            className="absolute inset-0 transition-colors duration-300"
            style={{ backgroundColor: `rgba(0, 0, 0, ${themeConfig.bgDim})` }}
          />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Elegant Dark Glass Ambient Lighting */}
          <div 
            className="absolute -top-24 -left-24 w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[100px] transition-transform duration-300"
            style={{ transform: `scale(${isPlaying ? 1 + beatEnergy * 0.15 : 1})` }}
          />
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-700/20 blur-[90px]" />
          <div className="absolute -bottom-24 left-1/4 w-[450px] h-[450px] rounded-full bg-slate-800/40 blur-[100px]" />
          <div 
            className="absolute top-1/2 left-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-sky-500/15 to-indigo-600/20 blur-[105px] transition-transform duration-300"
            style={{ transform: `translate(-50%, -50%) scale(${isPlaying ? 1 + beatEnergy * 0.15 : 1})` }}
          />
        </div>
      )}

      {/* =========================================================================
          MAIN CONTAINER (Sized to Standard Android Screen: max-w-[430px])
         ========================================================================= */}
      <main className="relative z-10 w-full max-w-[430px] sm:max-w-2xl min-h-screen mx-auto px-3 sm:px-4 py-2 sm:py-4 pb-44 sm:pb-48 flex flex-col items-center">
        {/* 1. TOP HERO ANIMATION / VISUALIZER */}
        <TopGifStage
          currentGifId={currentGifId}
          onSelectGif={setCurrentGifId}
          isPlaying={isPlaying}
          beatEnergy={beatEnergy}
          customMediaUrl={customMediaUrl}
          customMediaType={customMediaType}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />

        {/* 2. MODERN NAVIGATION TAB BAR */}
        <ModernNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sleepTimerRemaining={sleepTimer}
        />

        {/* 3. CONDITIONAL MAIN VIEWS */}
        {activeTab === 'playlist' && (
          <>
            {/* Inline Now Playing Card */}
            <InlineNowPlayingCard
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              repeatMode={repeatMode}
              isShuffle={isShuffle}
              beatEnergy={beatEnergy}
              playlistName={playbackSource.name}
              className="mb-3"
              onTogglePlay={togglePlay}
              onNext={nextTrack}
              onPrev={prevTrack}
              onSeek={seek}
              onToggleRepeat={toggleRepeat}
              onToggleShuffle={toggleShuffle}
              onToggleLike={toggleLike}
            />

            {/* UNIFIED PLAYLIST HUB (Daftar Playlist + Playlist Aktif + Isi Lagu Jadi Satu) */}
            <UnifiedPlaylistHub
              playlists={playlists}
              activePlaylist={activePlaylist}
              allTracks={allTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              creatorName={creatorName}
              creatorAvatar={creatorAvatar}
              onSelectPlaylist={(id) => {
                setActivePlaylistId(id);
                saveSetting('activePlaylistId', id);
              }}
              onPlayTrack={(idx) => {
                playFromQueue(idx, playlistTracks, {
                  type: 'playlist',
                  id: activePlaylist.id,
                  name: activePlaylist.name,
                });
              }}
              onPlayAll={() => {
                if (playlistTracks.length > 0) {
                  playFromQueue(0, playlistTracks, {
                    type: 'playlist',
                    id: activePlaylist.id,
                    name: activePlaylist.name,
                  });
                }
              }}
              onShufflePlay={() => {
                if (playlistTracks.length > 0) {
                  const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                  playFromQueue(0, shuffled, {
                    type: 'playlist',
                    id: activePlaylist.id,
                    name: activePlaylist.name,
                  });
                }
              }}
              onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              onOpenAddSongsModal={() => setIsAddSongsModalOpen(true)}
              onOpenThemeModal={() => setIsThemeModalOpen(true)}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              onOpenChangeCover={() => setIsChangeCoverOpen(true)}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
              onDeleteTrackFromLibrary={handleDeleteTrackFromLibrary}
              onToggleLike={toggleLike}
              onPlayNext={playNext}
              onOpenDetailModal={(t) => setDetailTrack(t)}
            />
          </>
        )}

        {/* TAB 2: LIBRARY VIEW */}
        {activeTab === 'library' && (
          <LibraryView
            tracks={allTracks}
            playlists={playlists}
            onPlayTrack={(idx) => {
              playFromQueue(idx, allTracks, {
                type: 'library',
                id: 'library-all',
                name: 'Semua Koleksi Audio',
              });
            }}
            onAddFiles={addLocalFiles}
            onAddTrackToPlaylist={handleAddSingleTrackToPlaylist}
            onDeleteTrack={handleDeleteTrackFromLibrary}
            onOpenBatchAddModal={() => setIsAddSongsModalOpen(true)}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
          />
        )}

        {/* TAB 3: LYRICS VIEW WITH ONLINE SEARCH & REAL-TIME SYNC */}
        {activeTab === 'lyrics' && (
          <LyricsVisualView
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            beatEnergy={beatEnergy}
            currentGifId={currentGifId}
            onSeek={seek}
            onUpdateLyrics={updateTrackLyrics}
          />
        )}

        {/* TAB 4: EQUALIZER & SLEEP TIMER */}
        {activeTab === 'equalizer' && (
          <EqualizerTimerView
            audioFX={audioFX}
            onChangeFX={(partial) => setAudioFX((prev) => ({ ...prev, ...partial }))}
            sleepTimer={sleepTimer}
            onSetSleepTimer={setSleepTimer}
          />
        )}
      </main>

      {/* =========================================================================
          BOTTOM DOCKED PLAYER BAR (Shown when scrolled down)
         ========================================================================= */}
      <BottomPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        volume={volume}
        sleepTimer={sleepTimer}
        isVisible={isScrolledDown}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        onSeek={seek}
        onVolumeChange={setVolume}
        onToggleRepeat={toggleRepeat}
        onToggleShuffle={toggleShuffle}
        onToggleLike={toggleLike}
        onOpenLyricsVisual={() => setActiveTab('lyrics')}
      />

      {/* =========================================================================
          MODALS & OVERLAYS
         ========================================================================= */}
      <GifUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadMedia={(file: File) => {
          const url = URL.createObjectURL(file);
          const isVideo = file.type.startsWith('video/');
          setCustomMediaUrl(url);
          setCustomMediaType(isVideo ? 'video' : 'gif');
          setCurrentGifId('custom');
          setIsUploadModalOpen(false);
        }}
        onSetMediaUrl={(url: string, type: 'gif' | 'video') => {
          setCustomMediaUrl(url);
          setCustomMediaType(type);
          setCurrentGifId('custom');
          setIsUploadModalOpen(false);
        }}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themeConfig={themeConfig}
        onUpdateTheme={handleUpdateTheme}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        availableTracks={allTracks}
        creatorName={creatorName}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
        onSaveProfile={handleSaveProfile}
      />

      <ChangePlaylistCoverModal
        isOpen={isChangeCoverOpen}
        onClose={() => setIsChangeCoverOpen(false)}
        playlist={activePlaylist}
        onSaveCover={handleSavePlaylistCover}
      />

      <AddSongsToPlaylistModal
        isOpen={isAddSongsModalOpen}
        onClose={() => setIsAddSongsModalOpen(false)}
        playlist={activePlaylist}
        availableTracks={allTracks}
        onAddTracksToPlaylist={handleAddTracksToPlaylist}
        onScanNewFiles={handleAddFilesToPlaylist}
      />

      <TrackDetailModal
        isOpen={Boolean(detailTrack)}
        onClose={() => setDetailTrack(null)}
        track={detailTrack}
        onPlayNext={playNext}
        onToggleLike={toggleLike}
        onRemoveTrack={(id: string) => {
          handleDeleteTrackFromLibrary(id);
          setDetailTrack(null);
        }}
      />
    </div>
  );
}

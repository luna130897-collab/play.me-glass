import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Shuffle, 
  Plus, 
  Palette, 
  Pencil, 
  Camera, 
  Check, 
  X, 
  Trash2, 
  Music, 
  Volume2, 
  Heart, 
  MoreVertical, 
  Info, 
  FolderOpen, 
  Clock, 
  ListMusic, 
  Search,
  Sparkles,
  FileText
} from 'lucide-react';
import { Playlist, Track } from '../types';
import { playTactileClick } from '../utils/audioSynth';

interface UnifiedPlaylistHubProps {
  playlists: Playlist[];
  activePlaylist: Playlist;
  allTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  creatorName: string;
  creatorAvatar: string;
  onSelectPlaylist: (id: string) => void;
  onPlayTrack: (indexInPlaylist: number) => void;
  onPlayAll: () => void;
  onShufflePlay: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenAddSongsModal: () => void;
  onOpenThemeModal: () => void;
  onOpenEditProfile: () => void;
  onOpenChangeCover: () => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  onDeleteTrackFromLibrary?: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
  onPlayNext: (trackId: string) => void;
  onOpenDetailModal: (track: Track) => void;
}

export const UnifiedPlaylistHub: React.FC<UnifiedPlaylistHubProps> = ({
  playlists,
  activePlaylist,
  allTracks,
  currentTrack,
  isPlaying,
  creatorName,
  creatorAvatar,
  onSelectPlaylist,
  onPlayTrack,
  onPlayAll,
  onShufflePlay,
  onOpenCreatePlaylist,
  onOpenAddSongsModal,
  onOpenThemeModal,
  onOpenEditProfile,
  onOpenChangeCover,
  onRenamePlaylist,
  onDeletePlaylist,
  onRemoveTrackFromPlaylist,
  onDeleteTrackFromLibrary,
  onToggleLike,
  onPlayNext,
  onOpenDetailModal,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(activePlaylist.name);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [confirmingDeleteTrackId, setConfirmingDeleteTrackId] = useState<string | null>(null);
  const activePlaylistButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setEditName(activePlaylist.name);
    setIsEditingName(false);
    setSearchQuery('');
    setConfirmingDeleteTrackId(null);

    // Ensure active playlist tab is smoothly visible and not clipped
    if (activePlaylistButtonRef.current) {
      activePlaylistButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activePlaylist.id, activePlaylist.name]);

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== activePlaylist.name) {
      onRenamePlaylist(activePlaylist.id, editName.trim());
    }
    setIsEditingName(false);
  };

  // Filter tracks belonging to the active playlist
  const playlistTracks = allTracks.filter((t) =>
    activePlaylist.trackIds.length > 0 ? activePlaylist.trackIds.includes(t.id) : true
  );

  // Filtered by search query
  const filteredTracks = playlistTracks.map((track, originalIndex) => ({ track, originalIndex })).filter(({ track }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.album.toLowerCase().includes(q)
    );
  });

  // Calculate total playlist duration
  const totalSeconds = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="w-full space-y-3 mb-20 select-none">
      {/* =========================================================================
          1. DAFTAR PLAYLIST SELECTOR BAR (HORIZONTAL SCROLL CHIPS)
         ========================================================================= */}
      <div className="glass-morph rounded-2xl p-3 sm:p-4 border border-white/15 shadow-md">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-white" />
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
              Pilih &amp; Kelola Playlist
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playTactileClick();
                onOpenCreatePlaylist();
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.12] hover:bg-white/[0.22] text-white text-xs font-bold border border-white/25 shadow-md shadow-black/30 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
              title="Buat Playlist Baru"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] text-white" />
              <span>Playlist</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onOpenThemeModal();
              }}
              className="p-1.5 rounded-full bg-white/[0.10] hover:bg-white/[0.20] text-white border border-white/25 shadow-md backdrop-blur-md transition-colors cursor-pointer"
              title="Ganti Wallpaper & Transparansi Kaca"
            >
              <Palette className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Horizontal Playlist Scroll Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1.5 px-2 -mx-1 y2k-scrollbar scroll-smooth">
          {playlists.map((pl) => {
            const isActive = pl.id === activePlaylist.id;
            return (
              <button
                key={pl.id}
                ref={isActive ? activePlaylistButtonRef : undefined}
                onClick={() => {
                  playTactileClick();
                  onSelectPlaylist(pl.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left shrink-0 transition-all cursor-pointer select-none min-w-fit ${
                  isActive
                    ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/30'
                    : 'bg-white/[0.08] hover:bg-white/[0.16] text-white/80 border border-white/15'
                }`}
              >
                {/* Emoji / Mini Cover */}
                <div className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs ${
                  isActive ? 'bg-white/25 text-white' : 'bg-white/10 text-white'
                }`}>
                  {pl.coverArt ? (
                    <img src={pl.coverArt} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{pl.coverEmoji || '🎵'}</span>
                  )}
                </div>

                <div className="min-w-0 pr-1">
                  <p className="text-xs font-black truncate max-w-[130px] leading-tight text-white">
                    {pl.name}
                  </p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-white/80 font-bold' : 'text-white/60'}`}>
                    {pl.trackIds.length} Lagu
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. KARTU HEADER PLAYLIST AKTIF (INFO + KONTROL LENGKAP)
         ========================================================================= */}
      <div className="glass-morph rounded-2xl p-3.5 sm:p-4 border border-white/15 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
          {/* Cover Art Frame */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-sky-400">
              {activePlaylist.coverArt ? (
                <img
                  src={activePlaylist.coverArt}
                  alt={activePlaylist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl sm:text-5xl select-none">
                  {activePlaylist.coverEmoji || '☕'}
                </div>
              )}
            </div>

            {/* Change Cover Hover Button */}
            <button
              onClick={() => {
                playTactileClick();
                onOpenChangeCover();
              }}
              className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
              title="Ganti Foto atau Emoji Cover"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">Ganti Cover</span>
            </button>
          </div>

          {/* Playlist Title, Creator & Stats */}
          <div className="flex-1 text-center sm:text-left min-w-0 w-full">
            {/* Title / Inline Edit */}
            {isEditingName ? (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  autoFocus
                  className="px-2.5 py-1 text-sm font-black rounded-lg border border-sky-400 bg-slate-900 text-white w-full max-w-[200px] outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                  title="Simpan Nama"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600"
                  title="Batal"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 group mb-0.5">
                <h1 className="text-base sm:text-lg font-black text-white truncate drop-shadow-xs">
                  {activePlaylist.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-sky-400 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Ubah Nama Playlist"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Creator & Duration Metadata */}
            <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1 flex-wrap font-medium">
              <span>Dibuat oleh</span>
              <button
                onClick={() => {
                  playTactileClick();
                  onOpenEditProfile();
                }}
                className="font-bold text-sky-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                title="Edit Profil Pembuat"
              >
                <span>{creatorAvatar}</span>
                <span>{creatorName}</span>
              </button>
              <span>•</span>
              <span className="font-semibold">{playlistTracks.length} Lagu</span>
              <span>•</span>
              <span className="font-semibold">~{totalMinutes} Menit</span>
            </p>

            {/* Main Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              {/* Play All */}
              <button
                onClick={() => {
                  playTactileClick();
                  onPlayAll();
                }}
                disabled={playlistTracks.length === 0}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.18] hover:bg-white/[0.28] text-white font-black text-xs border border-white/35 shadow-lg shadow-black/30 backdrop-blur-md inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Putar Semua</span>
              </button>

              {/* Shuffle */}
              <button
                onClick={() => {
                  playTactileClick();
                  onShufflePlay();
                }}
                disabled={playlistTracks.length === 0}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.10] hover:bg-white/[0.20] text-white font-bold text-xs border border-white/20 shadow-md backdrop-blur-md inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <Shuffle className="w-3.5 h-3.5 text-white" />
                <span>Acak</span>
              </button>

              {/* Tambah Lagu */}
              <button
                onClick={() => {
                  playTactileClick();
                  onOpenAddSongsModal();
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.10] hover:bg-white/[0.20] text-white font-bold text-xs border border-white/20 shadow-md backdrop-blur-md inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5] text-white" />
                <span>Tambah Lagu</span>
              </button>

              {/* Delete Playlist (only if user has > 1 playlist) */}
              {playlists.length > 1 && (
                <button
                  onClick={() => {
                    playTactileClick();
                    if (confirm(`Yakin ingin menghapus playlist "${activePlaylist.name}"?`)) {
                      onDeletePlaylist(activePlaylist.id);
                    }
                  }}
                  className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white/70 hover:text-white border border-white/20 shadow-md backdrop-blur-md transition-colors cursor-pointer"
                  title="Hapus Playlist Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. ISI LAGU PLAYLIST (TABEL & SEARCH BAR DALAM SATU TAMPILAN)
         ========================================================================= */}
      <div className="glass-morph rounded-2xl p-3 sm:p-4 border border-white/15 shadow-md">
        {/* Search Bar inside this playlist */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari lagu di "${activePlaylist.name}"...`}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-slate-900/80 focus:bg-slate-900 text-white placeholder-slate-400 border border-white/15 focus:border-sky-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-300 shrink-0 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/10">
            {filteredTracks.length} / {playlistTracks.length} Lagu
          </span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-2 py-1.5 border-b border-white/10 text-[11px] font-black text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7 sm:col-span-5">JUDUL &amp; ARTIS</div>
          <div className="hidden sm:block sm:col-span-3">ALBUM</div>
          <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>DURASI</span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/5 mt-1">
          {filteredTracks.length === 0 ? (
            <div className="py-8 text-center text-slate-300 font-semibold text-xs space-y-2.5">
              <Music className="w-8 h-8 mx-auto text-sky-400/60" />
              <p className="font-bold text-white">
                {searchQuery
                  ? 'Tidak ada lagu yang cocok dengan pencarian.'
                  : 'Belum ada lagu di playlist ini.'}
              </p>
              <button
                onClick={() => {
                  playTactileClick();
                  onOpenAddSongsModal();
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.12] hover:bg-white/[0.22] text-white font-black text-xs border border-white/25 shadow-md shadow-black/30 backdrop-blur-md inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <FolderOpen className="w-4 h-4 stroke-[2.5] text-white" />
                <span>Tambah Lagu dari Pustaka Lokal</span>
              </button>
            </div>
          ) : (
            filteredTracks.map(({ track, originalIndex }, idx) => {
              const isCurrent = currentTrack ? track.id === currentTrack.id : false;
              const hasLyrics = Boolean(track.syncedLyrics?.length || track.plainLyrics);
              const isNearBottom = idx >= Math.max(0, filteredTracks.length - 2);

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    playTactileClick();
                    onPlayTrack(originalIndex);
                  }}
                  className={`grid grid-cols-12 gap-2 px-2 py-2.5 rounded-xl cursor-pointer items-center transition-all group relative ${
                    isCurrent
                      ? 'bg-white/[0.15] shadow-md border border-white/35 backdrop-blur-md'
                      : 'hover:bg-white/[0.08]'
                  }`}
                >
                  {/* Track Number / Animated Equalizer */}
                  <div className="col-span-1 text-center text-xs font-bold text-white/60">
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-3.5 h-3.5 text-white mx-auto animate-pulse" />
                    ) : (
                      <span>{originalIndex + 1}</span>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="col-span-7 sm:col-span-5 flex items-center gap-2.5 truncate">
                    {/* Thumbnail */}
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/20 shadow-2xs bg-slate-900 flex items-center justify-center">
                      {track.coverArt ? (
                        <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">♪</span>
                      )}
                    </div>

                    <div className="truncate min-w-0">
                      <p className="text-xs sm:text-sm font-black truncate leading-tight text-white">
                        {track.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium truncate mt-0.5">
                        <span className="truncate">{track.artist}</span>
                        {hasLyrics && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white/[0.10] text-white border border-white/20 shrink-0 inline-flex items-center gap-0.5" title="Tersedia Lirik">
                            <FileText className="w-2.5 h-2.5" />
                            Lirik
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="hidden sm:block sm:col-span-3 text-xs text-slate-400 font-medium truncate">
                    {track.album}
                  </div>

                  {/* Duration & Track Action Menu */}
                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {formatDuration(track.duration)}
                    </span>

                    {/* Like button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      title={track.isLiked ? 'Batal Suka' : 'Sukai Lagu'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          track.isLiked
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-slate-500 hover:text-rose-400'
                        }`}
                      />
                    </button>

                    {/* Popover / Options Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTactileClick();
                          setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuTrackId === track.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 ${
                            isNearBottom 
                              ? 'bottom-full mb-1.5 origin-bottom-right' 
                              : 'top-full mt-1.5 origin-top-right'
                          } w-48 rounded-xl glass-morph p-1.5 shadow-2xl border border-white/20 z-50 animate-fadeIn text-xs text-white`}
                        >
                          <button
                            onClick={() => {
                              onPlayNext(track.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 font-medium text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Play className="w-3 h-3 text-sky-400" />
                            <span>Putar Berikutnya</span>
                          </button>

                          <button
                            onClick={() => {
                              onOpenDetailModal(track);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 font-medium text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Info className="w-3 h-3 text-sky-400" />
                            <span>Detail &amp; Info Audio</span>
                          </button>

                          {onDeleteTrackFromLibrary && (
                            confirmingDeleteTrackId === track.id ? (
                              <div className="p-2 my-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-center animate-fadeIn">
                                <p className="text-[11px] font-bold text-rose-200 mb-1.5 leading-tight">
                                  Hapus dari pustaka?
                                </p>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playTactileClick();
                                      onDeleteTrackFromLibrary(track.id);
                                      setConfirmingDeleteTrackId(null);
                                      setActiveMenuTrackId(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer transition-transform active:scale-95 shadow-xs"
                                  >
                                    Ya, Hapus
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playTactileClick();
                                      setConfirmingDeleteTrackId(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-slate-200 text-[10px] font-bold hover:bg-white/20 cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playTactileClick();
                                  setConfirmingDeleteTrackId(track.id);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 font-bold text-rose-400 flex items-center gap-2 cursor-pointer"
                                title="Hapus lagu ini dari penyimpanan lokal"
                              >
                                <Trash2 className="w-3 h-3 text-rose-400" />
                                <span>Hapus dari Pustaka</span>
                              </button>
                            )
                          )}

                          <button
                            onClick={() => {
                              onRemoveTrackFromPlaylist(activePlaylist.id, track.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 font-semibold text-rose-400 flex items-center gap-2 cursor-pointer border-t border-white/10 mt-0.5"
                          >
                            <X className="w-3 h-3" />
                            <span>Hapus dari Playlist</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

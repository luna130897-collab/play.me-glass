import React, { useState, useRef } from 'react';
import { Track, Playlist } from '../types';
import { 
  FolderPlus, 
  Search, 
  Plus, 
  HardDrive, 
  ShieldCheck, 
  User, 
  Disc, 
  Folder, 
  FolderOpen,
  Volume2,
  Trash2,
  Check
} from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

interface LibraryViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (index: number) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onOpenBatchAddModal?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  playlists,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onAddFiles,
  onAddTrackToPlaylist,
  onDeleteTrack,
  onOpenBatchAddModal,
}) => {
  const [subTab, setSubTab] = useState<'tracks' | 'artists' | 'albums' | 'folders'>('tracks');
  const [search, setSearch] = useState('');
  const [openMenuTrackId, setOpenMenuTrackId] = useState<string | null>(null);
  const [confirmingDeleteTrackId, setConfirmingDeleteTrackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMins = Math.floor(totalDuration / 60);

  // Group by artist
  const artistsMap = tracks.reduce((acc, t) => {
    acc[t.artist] = (acc[t.artist] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by album
  const albumsMap = tracks.reduce((acc, t) => {
    acc[t.album] = (acc[t.album] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredTracks = tracks.map((track, originalIndex) => ({ track, originalIndex }))
    .filter(({ track }) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q)
      );
    });

  return (
    <div className="w-full glass-morph rounded-2xl p-3 sm:p-4 mb-20 select-none border border-white/20 shadow-lg">
      {/* Offline Storage Card Banner */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/15 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-xs shrink-0">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-black text-white truncate">
                Penyimpanan Pustaka Lokal
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/60 truncate">
              {tracks.length} Berkas Audio • ±{totalMins} Menit Offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenBatchAddModal && (
            <button
              onClick={() => {
                playTactileClick();
                onOpenBatchAddModal();
              }}
              className="px-2.5 py-1 sm:py-1.5 rounded-lg bg-white/[0.12] hover:bg-white/[0.22] text-white text-[11px] font-bold border border-white/25 shadow-md shadow-black/30 backdrop-blur-md flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Pilih dan masukkan lagu pustaka ke playlist"
            >
              <FolderPlus className="w-3 h-3 stroke-[2.5] text-white" />
              <span className="hidden sm:inline">Tambah ke Playlist</span>
              <span className="sm:hidden">Playlist</span>
            </button>
          )}

          <button
            onClick={() => {
              playTactileClick();
              fileInputRef.current?.click();
            }}
            className="px-2.5 py-1 sm:py-1.5 rounded-lg bg-white/[0.10] hover:bg-white/[0.20] text-white text-[11px] font-bold border border-white/20 shadow-md backdrop-blur-md flex items-center gap-1 cursor-pointer transition-colors active:scale-95 shrink-0"
            title="Pindai berkas audio lokal dari perangkat"
          >
            <Plus className="w-3 h-3 stroke-[2.5] text-white" />
            <span className="hidden sm:inline">Pindai Audio</span>
            <span className="sm:hidden">Pindai</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAddFiles(e.target.files);
            }
          }}
        />
      </div>

      {/* Sub-tabs: Semua Lagu | Artis | Album | Folder */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/15 mb-3 text-xs font-bold text-white/70">
        <button
          onClick={() => {
            playTactileClick();
            setSubTab('tracks');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            subTab === 'tracks' ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/30' : 'hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          Semua Lagu
        </button>
        <button
          onClick={() => {
            playTactileClick();
            setSubTab('artists');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            subTab === 'artists' ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/30' : 'hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          Artis
        </button>
        <button
          onClick={() => {
            playTactileClick();
            setSubTab('albums');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            subTab === 'albums' ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/30' : 'hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          Album
        </button>
        <button
          onClick={() => {
            playTactileClick();
            setSubTab('folders');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
            subTab === 'folders' ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/30' : 'hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          Folder
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cari lagu, musisi, atau album offline..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40 shadow-2xs"
        />
      </div>

      {/* CONTENT: Tracks List */}
      {subTab === 'tracks' && (
        <div className="space-y-1">
          {filteredTracks.map(({ track, originalIndex }, idx) => {
            const isCurrent = currentTrack && track.id === currentTrack.id;
            const isNearBottom = idx >= Math.max(0, filteredTracks.length - 2);
            return (
              <div
                key={track.id}
                onClick={() => {
                  playTactileClick();
                  onPlayTrack(originalIndex);
                }}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent ? 'bg-white/[0.15] border border-white/35 shadow-md backdrop-blur-md' : 'hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/20 shadow-2xs flex items-center justify-center">
                    {track.coverArt ? (
                      <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white">
                        ♫
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black truncate leading-tight text-white">
                      {track.title}
                    </p>
                    <p className="text-[11px] text-white/60 truncate">
                      {track.artist} • {track.format || 'MP3'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  {isCurrent && isPlaying && (
                    <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                  )}
                  <div>
                    <span className="text-[10px] text-white font-mono font-bold block">
                      {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-white/60 font-extrabold">
                      {track.bitrate || '320k'}
                    </span>
                  </div>

                  {/* Add to Playlist button & dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTactileClick();
                        setOpenMenuTrackId(openMenuTrackId === track.id ? null : track.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-2xs transition-colors cursor-pointer"
                      title="Tambahkan lagu ini ke Playlist"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>

                    {openMenuTrackId === track.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 ${
                          isNearBottom 
                            ? 'bottom-full mb-1.5 origin-bottom-right' 
                            : 'top-full mt-1.5 origin-top-right'
                        } w-52 rounded-xl glass-morph bg-slate-900/95 p-2 border border-white/20 shadow-2xl z-50 animate-fadeIn text-white`}
                      >
                        {/* Menu Hapus Lagu dari Pustaka */}
                        {onDeleteTrack && (
                          <div className="border-b border-white/10 pb-1.5 mb-1.5">
                            {confirmingDeleteTrackId === track.id ? (
                              <div className="p-2 rounded-lg bg-white/10 border border-white/20 text-center animate-fadeIn">
                                <p className="text-[11px] font-bold text-white mb-1.5 leading-tight">
                                  Hapus permanen lagu ini?
                                </p>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playTactileClick();
                                      onDeleteTrack(track.id);
                                      setConfirmingDeleteTrackId(null);
                                      setOpenMenuTrackId(null);
                                    }}
                                    className="px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold border border-white/30 cursor-pointer transition-transform active:scale-95 shadow-xs"
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
                                    className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white/80 text-[11px] font-bold hover:bg-white/20 cursor-pointer"
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
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                                title="Hapus lagu ini dari seluruh pustaka audio"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white shrink-0" />
                                <span>Hapus Lagu dari Pustaka</span>
                              </button>
                            )}
                          </div>
                        )}

                        <span className="text-[10px] font-extrabold text-white/60 px-2 py-1 block uppercase tracking-wider">
                          Tambah ke Playlist:
                        </span>
                        <div className="space-y-1 max-h-40 overflow-y-auto y2k-scrollbar">
                          {playlists.map((pl) => {
                            const isAlreadyIn = pl.trackIds.includes(track.id);
                            return (
                              <button
                                key={pl.id}
                                onClick={() => {
                                  playTactileClick();
                                  onAddTrackToPlaylist(pl.id, track.id);
                                  setOpenMenuTrackId(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                  isAlreadyIn
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                                }`}
                              >
                                <span className="truncate">{pl.name}</span>
                                {isAlreadyIn && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTENT: Artists List */}
      {subTab === 'artists' && (
        <div className="space-y-1.5">
          {Object.entries(artistsMap).map(([artistName, count]) => (
            <div
              key={artistName}
              className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white border border-white/20 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{artistName}</p>
                  <p className="text-[10px] text-white/60">{count} trek offline</p>
                </div>
              </div>
              <span className="text-[11px] text-white/80 font-medium">Buka ›</span>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT: Albums List */}
      {subTab === 'albums' && (
        <div className="space-y-1.5">
          {Object.entries(albumsMap).map(([albumName, count]) => (
            <div
              key={albumName}
              className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white border border-white/20 flex items-center justify-center font-bold text-sm">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{albumName}</p>
                  <p className="text-[10px] text-white/60">{count} trek</p>
                </div>
              </div>
              <span className="text-[11px] text-white/80 font-medium">Buka ›</span>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT: Folders List */}
      {subTab === 'folders' && (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-black/40 border border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-5 h-5 text-white" />
              <div>
                <p className="text-xs font-bold text-white">/storage/emulated/0/Music</p>
                <p className="text-[10px] text-white/60">Berkas musik utama Android</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-white/80">{tracks.length} berkas</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Folder className="w-5 h-5 text-white" />
              <div>
                <p className="text-xs font-bold text-white">/storage/emulated/0/Download</p>
                <p className="text-[10px] text-white/60">Unduhan lagu &amp; nada dering</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/20 font-bold hover:bg-white/20 cursor-pointer shadow-xs"
            >
              + Buka
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

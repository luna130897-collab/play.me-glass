import React, { useState, useMemo, useRef } from 'react';
import { Track, Playlist } from '../types';
import { 
  X, 
  Search, 
  Plus, 
  Check, 
  Music, 
  HardDrive, 
  CheckSquare, 
  Square, 
  FolderPlus, 
  Upload, 
  Sparkles,
  Filter
} from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

interface AddSongsToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  availableTracks: Track[];
  onAddTracksToPlaylist: (playlistId: string, trackIds: string[]) => void;
  onScanNewFiles: (files: FileList | File[]) => void;
}

export const AddSongsToPlaylistModal: React.FC<AddSongsToPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlist,
  availableTracks,
  onAddTracksToPlaylist,
  onScanNewFiles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'notInPlaylist' | 'localOnly'>('notInPlaylist');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Existing tracks in this playlist
  const existingSet = useMemo(() => new Set(playlist.trackIds), [playlist.trackIds]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return availableTracks.filter((track) => {
      // Filter tab
      if (filterMode === 'notInPlaylist' && existingSet.has(track.id)) return false;
      if (filterMode === 'localOnly' && !track.isLocal) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q)
      );
    });
  }, [availableTracks, existingSet, filterMode, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    playTactileClick();
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const selectAllEligible = () => {
    playTactileClick();
    const eligible = filteredTracks
      .filter((t) => !existingSet.has(t.id))
      .map((t) => t.id);
    setSelectedTrackIds((prev) => [...new Set([...prev, ...eligible])]);
  };

  const clearSelection = () => {
    playTactileClick();
    setSelectedTrackIds([]);
  };

  const handleSave = () => {
    if (selectedTrackIds.length === 0) return;
    playTactileClick();
    onAddTracksToPlaylist(playlist.id, selectedTrackIds);
    onClose();
    setSelectedTrackIds([]);
  };

  const handleLocalFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      playTactileClick();
      onScanNewFiles(e.target.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-lg glass-morph rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl relative flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center shadow-xs">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                Tambah Lagu ke Playlist
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Playlist target: <span className="text-sky-400 font-extrabold">{playlist.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Toolbar: Search, Filters, Scan New */}
        <div className="space-y-2.5 my-3">
          {/* Search bar & Scan button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul lagu, artis, atau album..."
                className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/20 focus:outline-none focus:border-sky-400 text-white placeholder-slate-400 font-semibold shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => {
                playTactileClick();
                fileInputRef.current?.click();
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shadow-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Pindai Berkas Lagu Baru dari HP / Komputer"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Pindai Lagu HP</span>
              <span className="sm:hidden">Pindai</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleLocalFileScan}
            />
          </div>

          {/* Filter Chips & Selection Actions */}
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  playTactileClick();
                  setFilterMode('notInPlaylist');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'notInPlaylist'
                    ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-md backdrop-blur-md ring-1 ring-white/30'
                    : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.15] border border-white/10'
                }`}
              >
                Belum di Playlist
              </button>
              <button
                onClick={() => {
                  playTactileClick();
                  setFilterMode('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-md backdrop-blur-md ring-1 ring-white/30'
                    : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.15] border border-white/10'
                }`}
              >
                Semua Pustaka ({availableTracks.length})
              </button>
              <button
                onClick={() => {
                  playTactileClick();
                  setFilterMode('localOnly');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'localOnly'
                    ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-md backdrop-blur-md ring-1 ring-white/30'
                    : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.15] border border-white/10'
                }`}
              >
                Lokal Offline
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={selectAllEligible}
                className="text-white font-bold hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              {selectedTrackIds.length > 0 && (
                <>
                  <span className="text-white/20">•</span>
                  <button
                    onClick={clearSelection}
                    className="text-white/70 hover:text-white font-bold hover:underline cursor-pointer"
                  >
                    Batal Pilih
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto y2k-scrollbar pr-1 space-y-1.5 min-h-[160px]">
          {filteredTracks.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-white/10 my-2">
              <Music className="w-8 h-8 text-sky-400/60 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {searchQuery
                  ? 'Tidak ada lagu yang cocok dengan pencarian.'
                  : filterMode === 'notInPlaylist'
                  ? 'Semua lagu di pustaka lokal sudah ada di playlist ini! 🎉'
                  : 'Belum ada lagu di pustaka.'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-md shadow-sky-500/25 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Unggah Lagu dari HP</span>
              </button>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isAlreadyIn = existingSet.has(track.id);
              const isSelected = selectedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (!isAlreadyIn) {
                      toggleSelect(track.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all select-none ${
                    isAlreadyIn
                      ? 'bg-white/[0.03] border-white/5 opacity-50 cursor-default'
                      : isSelected
                      ? 'bg-white/[0.18] border-white/40 shadow-sm cursor-pointer'
                      : 'bg-black/40 hover:bg-black/60 border-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Checkbox Icon */}
                    <div className="shrink-0">
                      {isAlreadyIn ? (
                        <div className="w-5 h-5 rounded-md bg-white/20 text-white flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : isSelected ? (
                        <CheckSquare className="w-5 h-5 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-white/40 hover:text-white" />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/20 flex items-center justify-center">
                      {track.coverArt ? (
                        <img src={track.coverArt} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate block">
                          {track.title}
                        </span>
                        {track.isLocal && (
                          <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-white/10 text-white border border-white/20 shrink-0">
                            Offline
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/60 font-medium truncate block">
                        {track.artist} • {track.album}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Duration / Status Badge */}
                  <div className="shrink-0 text-right ml-2">
                    {isAlreadyIn ? (
                      <span className="text-[10px] font-bold text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full inline-block">
                        Sudah di playlist
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-white/80 tabular-nums">
                        {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-white/80">
            {selectedTrackIds.length > 0 ? (
              <span>
                <span className="text-white font-black">{selectedTrackIds.length}</span> lagu dipilih
              </span>
            ) : (
              <span className="text-white/60">Pilih lagu untuk ditambahkan</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={selectedTrackIds.length === 0}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTrackIds.length > 0
                  ? 'bg-white/[0.20] hover:bg-white/[0.30] text-white border border-white/35 active:scale-95 shadow-black/40 backdrop-blur-md'
                  : 'bg-white/5 text-white/40 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
              <span>Tambahkan ({selectedTrackIds.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

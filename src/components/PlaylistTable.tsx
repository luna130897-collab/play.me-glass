import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Bell, 
  Search, 
  ChevronDown, 
  Clock, 
  Heart, 
  Plus, 
  Music, 
  MoreVertical,
  Volume2,
  FolderOpen
} from 'lucide-react';
import { Track } from '../types';
import { playTactileClick } from '../utils/audioSynth';

interface PlaylistTableProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (index: number) => void;
  onTogglePlay: () => void;
  onToggleLike: (id: string) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onSelectTrackForDetail: (track: Track) => void;
  onOpenAddSongsModal: () => void;
}

export const PlaylistTable: React.FC<PlaylistTableProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onToggleLike,
  onAddFiles,
  onSelectTrackForDetail,
  onOpenAddSongsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'artist'>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  // Filter and Sort tracks
  const filteredTracks = tracks.map((track, originalIndex) => ({
    track,
    originalIndex,
  })).filter(({ track }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.album.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (sortBy === 'title') return a.track.title.localeCompare(b.track.title);
    if (sortBy === 'artist') return a.track.artist.localeCompare(b.track.artist);
    return 0; // default order
  });

  return (
    <div className="w-full glass-morph rounded-2xl p-3 sm:p-4 mb-20 select-none">
      {/* Top Toolbar matching Reference: Big Play Button, Bell, Search, Date Added */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Big Pink Play Button */}
          <button
            onClick={() => {
              playTactileClick();
              onTogglePlay();
            }}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 active:scale-95 flex items-center justify-center text-white shadow-md transition-transform"
            title={isPlaying ? 'Jeda' : 'Putar Semua'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Bell Icon */}
          <button 
            onClick={() => playTactileClick()}
            className="w-8 h-8 rounded-full bg-pink-100/60 hover:bg-pink-200/70 flex items-center justify-center text-pink-600 transition-colors"
            title="Pemberitahuan Trek"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Add Song from Library button */}
          <button
            onClick={() => {
              playTactileClick();
              onOpenAddSongsModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Tambah lagu dari pustaka lokal ke playlist ini"
          >
            <FolderOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Dari Pustaka</span>
          </button>

          {/* Add Local File button */}
          <button
            onClick={() => {
              playTactileClick();
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100/80 hover:bg-pink-200 text-pink-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Tambah Berkas Lagu Offline dari HP Android"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ File HP</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Right side: Search & Sort Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {showSearchInput ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Cari trek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-24 sm:w-32 px-2 py-1 text-xs rounded-lg bg-white/80 border border-pink-300 focus:outline-none focus:border-pink-500 text-slate-800"
              />
              <button
                onClick={() => {
                  setShowSearchInput(false);
                  setSearchQuery('');
                }}
                className="absolute right-1 top-1 text-[10px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-1.5 rounded-lg hover:bg-pink-100/60 text-slate-600 transition-colors"
              title="Cari Lagu"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Date Added Dropdown matching reference */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-pink-200/50 hover:bg-pink-200/80 text-xs font-medium text-slate-700 transition-colors"
            >
              <span className="truncate max-w-[80px]">
                {sortBy === 'date' ? 'Date added' : sortBy === 'title' ? 'Judul' : 'Artis'}
              </span>
              <ChevronDown className="w-3 h-3 text-pink-700" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white/95 backdrop-blur-xl border border-pink-200 shadow-xl py-1 text-xs z-30">
                <button
                  onClick={() => {
                    setSortBy('date');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-pink-50 text-slate-700"
                >
                  Date added
                </button>
                <button
                  onClick={() => {
                    setSortBy('title');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-pink-50 text-slate-700"
                >
                  Judul Lagu
                </button>
                <button
                  onClick={() => {
                    setSortBy('artist');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-pink-50 text-slate-700"
                >
                  Nama Artis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TRACKLIST TABLE HEADERS (Matching Reference: # | TITLE | ALBUM | DATE ADDED | 🕒)
         ========================================================================= */}
      <div className="grid grid-cols-12 gap-2 px-2 py-1.5 border-b border-pink-200/70 text-[11px] font-extrabold text-black uppercase tracking-wider">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6 sm:col-span-5">TITLE</div>
        <div className="hidden sm:block sm:col-span-3">ALBUM</div>
        <div className="col-span-3 sm:col-span-2 text-right sm:text-left flex items-center gap-0.5">
          <span>DATE ADDED</span>
          <ChevronDown className="w-2.5 h-2.5 text-pink-600 hidden sm:inline" />
        </div>
        <div className="col-span-2 sm:col-span-1 flex justify-end">
          <Clock className="w-3.5 h-3.5 text-black" />
        </div>
      </div>

      {/* =========================================================================
          TRACK ROWS
         ========================================================================= */}
      <div className="divide-y divide-pink-100/60 mt-1">
        {filteredTracks.length === 0 ? (
          <div className="py-8 text-center text-black font-semibold text-xs space-y-2.5">
            <Music className="w-8 h-8 mx-auto text-pink-400 opacity-60" />
            <p className="font-bold">Belum ada lagu di playlist ini</p>
            <button
              onClick={() => {
                playTactileClick();
                onOpenAddSongsModal();
              }}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <FolderOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Lagu dari Pustaka Lokal</span>
            </button>
          </div>
        ) : (
          filteredTracks.map(({ track, originalIndex }) => {
            const isCurrent = currentTrack ? track.id === currentTrack.id : false;
            const formatSec = (s: number) => {
              const m = Math.floor(s / 60);
              const sec = Math.floor(s % 60);
              return `${m}:${sec < 10 ? '0' : ''}${sec}`;
            };

            return (
              <div
                key={track.id}
                onClick={() => {
                  playTactileClick();
                  onPlayTrack(originalIndex);
                }}
                className={`grid grid-cols-12 gap-2 px-2 py-2.5 rounded-xl cursor-pointer items-center transition-all group ${
                  isCurrent
                    ? 'bg-pink-200/60 shadow-xs border border-pink-300/60'
                    : 'hover:bg-white/40'
                }`}
              >
                {/* # Track Number / Animated Equalizer if current */}
                <div className="col-span-1 text-center text-xs font-bold text-black">
                  {isCurrent && isPlaying ? (
                    <Volume2 className="w-3.5 h-3.5 text-pink-600 mx-auto animate-pulse" />
                  ) : (
                    <span>{originalIndex + 1}</span>
                  )}
                </div>

                {/* Title + Thumbnail + Artist */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 truncate">
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-pink-200/80 shadow-2xs bg-pink-100 flex items-center justify-center">
                    {track.coverArt ? (
                      <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-pink-300 to-rose-200 flex items-center justify-center text-xs font-bold text-pink-800">
                        ♪
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="truncate">
                    <p className={`text-xs sm:text-sm font-extrabold truncate leading-tight ${isCurrent ? 'text-pink-900' : 'text-black'}`}>
                      {track.title}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-black font-semibold truncate mt-0.5">
                      {track.explicit && (
                        <span className="text-[9px] font-bold px-1 bg-black text-white rounded">
                          E
                        </span>
                      )}
                      <span className="truncate">{track.artist}</span>
                    </div>
                  </div>
                </div>

                {/* Album (visible on standard viewports) */}
                <div className="hidden sm:block sm:col-span-3 text-xs text-black font-semibold truncate">
                  {track.album}
                </div>

                {/* Date Added */}
                <div className="col-span-3 sm:col-span-2 text-[11px] text-black font-semibold truncate text-right sm:text-left">
                  {track.dateAdded}
                </div>

                {/* Heart & Duration & Detail Menu */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick();
                      onToggleLike(track.id);
                    }}
                    className="p-1 hover:scale-110 transition-transform"
                    title={track.isLiked ? 'Suka' : 'Tambah ke Favorit'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        track.isLiked
                          ? 'fill-pink-500 text-pink-500'
                          : 'text-black/40 hover:text-pink-600'
                      }`}
                    />
                  </button>

                  <span className="text-xs text-black font-bold tabular-nums hidden sm:inline">
                    {formatSec(track.duration)}
                  </span>

                  {/* 3 dots menu button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick();
                      onSelectTrackForDetail(track);
                    }}
                    className="p-1 rounded-md hover:bg-pink-200/50 text-black hover:text-pink-600 transition-colors"
                    title="Menu Opsi Lagu"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

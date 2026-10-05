import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  Palette, 
  Plus, 
  FolderPlus, 
  ListMusic, 
  Check,
  Sparkles,
  Music2,
  Camera,
  Pencil,
  X
} from 'lucide-react';
import { Playlist } from '../types';
import { playTactileClick } from '../utils/audioSynth';

interface PlaylistHeaderProps {
  playlists: Playlist[];
  activePlaylist: Playlist;
  onSelectPlaylist: (id: string) => void;
  creatorName: string;
  creatorAvatar: string;
  songCount: number;
  onOpenThemeModal: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenEditProfile: () => void;
  onOpenChangeCover: () => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ 
  playlists,
  activePlaylist,
  onSelectPlaylist,
  creatorName,
  creatorAvatar,
  songCount,
  onOpenThemeModal,
  onOpenCreatePlaylist,
  onOpenEditProfile,
  onOpenChangeCover,
  onRenamePlaylist,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(activePlaylist.name);

  useEffect(() => {
    setEditName(activePlaylist.name);
    setIsEditingName(false);
  }, [activePlaylist.id, activePlaylist.name]);

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== activePlaylist.name) {
      onRenamePlaylist(activePlaylist.id, editName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setEditName(activePlaylist.name);
    setIsEditingName(false);
  };
  return (
    <div className="w-full glass-morph rounded-2xl p-3.5 sm:p-4 mb-3 relative select-none border border-white/80 shadow-md">
      {/* Panel Title & Quick Playlist Switcher Row */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-pink-200/60">
        <div className="flex items-center gap-1.5 text-black">
          <ListMusic className="w-3.5 h-3.5 text-pink-600" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black">
            PANEL MENU PLAYLIST
          </span>
        </div>

        {/* Action Buttons: Buat Playlist & Tema */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playTactileClick();
              onOpenCreatePlaylist();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Buat Playlist & Impor Lagu dari Perpustakaan Lokal"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>+ Playlist Baru</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              onOpenThemeModal();
            }}
            className="p-1.5 rounded-full bg-white/70 hover:bg-white text-pink-700 border border-pink-200 transition-colors cursor-pointer"
            title="Ganti Tema & Wallpaper"
          >
            <Palette className="w-3.5 h-3.5 text-pink-600" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Playlist Selection Chips / Menu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 y2k-scrollbar">
        {playlists.map((pl) => {
          const isActive = pl.id === activePlaylist.id;
          return (
            <button
              key={pl.id}
              onClick={() => {
                playTactileClick();
                onSelectPlaylist(pl.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-pink-500 text-white shadow-sm scale-102 ring-2 ring-pink-300'
                  : 'bg-white/70 hover:bg-white text-black border border-pink-200'
              }`}
            >
              <span>{pl.coverEmoji || (pl.id === 'playlist-1' ? '👟' : '🎵')}</span>
              <span className="truncate max-w-[120px]">{pl.name}</span>
              {isActive && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Main Active Playlist Information Card */}
      <div className="flex items-center gap-3.5 sm:gap-4 p-2.5 rounded-xl bg-white/40 border border-pink-200/50">
        {/* Playlist Cover Art with clickable change trigger */}
        <div 
          onClick={() => {
            playTactileClick();
            onOpenChangeCover();
          }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-pink-300/60 shadow-md shrink-0 bg-pink-100 relative group flex items-center justify-center cursor-pointer transition-transform hover:scale-102 active:scale-98"
          title="Klik untuk ganti sampul playlist ini"
        >
          {activePlaylist.coverArt ? (
            <img src={activePlaylist.coverArt} alt="" className="w-full h-full object-cover" />
          ) : activePlaylist.id === 'playlist-1' ? (
            /* Stylized sneakers artwork matching reference */
            <svg className="w-full h-full object-cover" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#a8a29e" />
              <circle cx="20" cy="20" r="12" fill="#78716c" opacity="0.6" />
              <circle cx="65" cy="18" r="10" fill="#57534e" opacity="0.5" />
              <circle cx="45" cy="35" r="8" fill="#44403c" opacity="0.4" />
              <circle cx="85" cy="30" r="14" fill="#78716c" opacity="0.5" />
              <circle cx="15" cy="70" r="10" fill="#57534e" opacity="0.5" />
              <path d="M-5,105 L30,45 L50,55 L25,105 Z" fill="#2d4263" />
              <rect x="26" y="47" width="22" height="6" transform="rotate(-30 26 47)" fill="#cbd5e1" rx="2" />
              <path d="M55,105 L80,48 L100,56 L85,105 Z" fill="#2d4263" />
              <rect x="76" y="50" width="22" height="6" transform="rotate(-25 76 50)" fill="#cbd5e1" rx="2" />
              <ellipse cx="44" cy="50" rx="14" ry="10" transform="rotate(-35 44 50)" fill="#1c1917" />
              <ellipse cx="49" cy="46" rx="6" ry="6" fill="#f8fafc" />
              <line x1="38" y1="52" x2="48" y2="48" stroke="#ffffff" strokeWidth="2" />
              <ellipse cx="78" cy="58" rx="15" ry="10" transform="rotate(-15 78 58)" fill="#1c1917" />
              <ellipse cx="85" cy="56" rx="6" ry="6" fill="#f8fafc" />
              <line x1="72" y1="59" x2="82" y2="57" stroke="#ffffff" strokeWidth="2" />
            </svg>
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-pink-300 to-rose-200 flex flex-col items-center justify-center text-3xl">
              <span>{activePlaylist.coverEmoji || '🎧'}</span>
            </div>
          )}

          {/* Hover / Tap overlay with Camera icon */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-2xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 mb-0.5 text-pink-300 animate-bounce" />
            <span className="text-[9px] font-extrabold tracking-wide uppercase">Ganti Sampul</span>
          </div>

          {/* Mini Camera Badge corner */}
          <div className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 shadow-xs backdrop-blur-xs text-white">
            <Camera className="w-3 h-3 text-pink-300" />
          </div>
        </div>

        {/* Text Details & Creator Info */}
        <div className="flex-1 flex flex-col justify-center select-none overflow-hidden min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-100 px-2 py-0.5 rounded-md">
              PLAYLIST AKTIF
            </span>
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-1.5 my-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelName();
                }}
                autoFocus
                className="text-base sm:text-lg font-black text-black bg-white/95 border-2 border-pink-400 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm w-full max-w-[280px]"
                placeholder="Nama playlist..."
              />
              <button
                onClick={() => {
                  playTactileClick();
                  handleSaveName();
                }}
                className="p-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-xs transition-colors cursor-pointer"
                title="Simpan Nama"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
              <button
                onClick={() => {
                  playTactileClick();
                  handleCancelName();
                }}
                className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-black border border-pink-200 transition-colors cursor-pointer"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => {
                playTactileClick();
                setEditName(activePlaylist.name);
                setIsEditingName(true);
              }}
              className="group/name inline-flex items-center gap-1.5 cursor-pointer my-0.5 hover:bg-white/40 px-1.5 -mx-1.5 py-0.5 rounded-xl transition-all max-w-full"
              title="Klik di sini untuk mengganti nama playlist ini"
            >
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight truncate group-hover/name:text-pink-600 transition-colors">
                {activePlaylist.name}
              </h2>
              <span className="p-1 rounded-md bg-white/60 group-hover/name:bg-pink-100 text-black/50 group-hover/name:text-pink-600 transition-colors shrink-0">
                <Pencil className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-black font-semibold truncate mt-0.5">
            <span 
              onClick={onOpenEditProfile} 
              className="font-bold text-black hover:text-pink-600 cursor-pointer underline decoration-pink-400 truncate"
              title="Klik untuk mengubah nama pembuat"
            >
              {creatorName}
            </span>
            <span>•</span>
            <span className="shrink-0 text-black font-bold">{songCount} lagu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, User, Check, Sparkles } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorAvatar: string;
  onSaveProfile: (name: string, avatar: string) => void;
}

const AVATAR_OPTIONS = ['🐱', '🐰', '🎧', '✨', '💿', '🌸', '🦊', '⚡', '🛸', '👾'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  creatorName,
  creatorAvatar,
  onSaveProfile,
}) => {
  const [nameInput, setNameInput] = useState(creatorName);
  const [selectedAvatar, setSelectedAvatar] = useState(creatorAvatar);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!nameInput.trim()) return;
    playTactileClick();
    onSaveProfile(nameInput.trim(), selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm glass-morph rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
              Ubah Nama Pembuat Playlist
            </h3>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 my-4">
          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Pilih Ikon Avatar Profil:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    playTactileClick();
                    setSelectedAvatar(emoji);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                    selectedAvatar === emoji
                      ? 'bg-white/[0.25] text-white font-black shadow-md scale-110 ring-2 ring-white/30 border border-white/40'
                      : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Nama Pembuat (Ganti nama &apos;{creatorName}&apos;):
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Masukkan nama pembuat Anda..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-sky-400 shadow-2xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Nama ini akan otomatis ditampilkan pada kartu playlist dan info trek.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!nameInput.trim()}
            className="flex-1 py-2 rounded-xl bg-white/[0.18] hover:bg-white/[0.28] disabled:opacity-40 text-white font-bold text-xs border border-white/30 shadow-lg shadow-black/40 backdrop-blur-md transition-all cursor-pointer"
          >
            Simpan Nama
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Film, Sparkles } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

interface GifUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadMedia: (file: File) => void;
  onSetMediaUrl: (url: string, type: 'gif' | 'video') => void;
}

export const GifUploadModal: React.FC<GifUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadMedia,
  onSetMediaUrl,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'gif' | 'video'>('gif');

  if (!isOpen) return null;

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    playTactileClick();
    onSetMediaUrl(urlInput.trim(), urlType);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      playTactileClick();
      onUploadMedia(e.target.files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md glass-morph rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl relative text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-white">
              Upload Animasi / GIF Kustom
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
          {/* File Upload from Device */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col items-center text-center">
            <Upload className="w-8 h-8 text-white mb-2" />
            <p className="font-black text-white text-sm">Upload File dari Perangkat</p>
            <p className="text-slate-400 text-xs mt-0.5 mb-3">
              Mendukung file .GIF, .WEBP, atau file video .MP4 / .WEBM
            </p>
            <label className="px-4 py-2 rounded-xl bg-white/[0.18] hover:bg-white/[0.28] text-white font-bold text-xs border border-white/30 shadow-lg shadow-black/40 backdrop-blur-md transition-colors cursor-pointer">
              Pilih File Animasi
              <input
                type="file"
                accept="image/gif,image/webp,video/mp4,video/webm"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* URL Input */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
            <label className="text-slate-300 font-bold text-xs block">
              Atau Tempelkan Tautan URL Animasi (.gif / video):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/aesthetic.gif"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400"
              />
              <select
                value={urlType}
                onChange={(e) => setUrlType(e.target.value as 'gif' | 'video')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
              >
                <option value="gif">.GIF</option>
                <option value="video">Video</option>
              </select>
            </div>
            <button
              onClick={handleApplyUrl}
              disabled={!urlInput.trim()}
              className="w-full py-2 rounded-lg bg-white/[0.18] hover:bg-white/[0.28] disabled:opacity-40 text-white font-bold text-xs border border-white/30 shadow-lg shadow-black/40 backdrop-blur-md transition-colors cursor-pointer"
            >
              Gunakan URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

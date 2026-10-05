import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Disc3, 
  Volume2, 
  Sparkles 
} from 'lucide-react';
import { Track, RepeatMode } from '../types';
import { playTactileClick } from '../utils/audioSynth';

interface InlineNowPlayingCardProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  beatEnergy: number;
  playlistName: string;
  className?: string;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleLike: (id: string) => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const InlineNowPlayingCard: React.FC<InlineNowPlayingCardProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  beatEnergy,
  playlistName,
  className = '',
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onToggleRepeat,
  onToggleShuffle,
  onToggleLike,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`w-full glass-morph rounded-2xl p-3 sm:p-4 relative overflow-hidden select-none border border-white/20 shadow-lg ${className}`}>
      {/* Top Banner Tag: Sedang Memutar dari Playlist */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10 text-xs">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-white">
            SEDANG MEMUTAR DARI: {playlistName}
          </span>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.08] text-white border border-white/20 shadow-xs backdrop-blur-md">
          {currentTrack.format || 'AUDIO OFFLINE'}
        </span>
      </div>

      {/* Main Track Info & Cover Area */}
      <div className="flex items-center gap-3.5 mb-3">
        {/* Cover Art Frame with spinning disc badge */}
        <div 
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-white/25 shadow-md shrink-0 bg-slate-900 flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${isPlaying ? 1 + beatEnergy * 0.05 : 1})` }}
        >
          {currentTrack.coverArt ? (
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl">
              ♪
            </div>
          )}

          {/* Mini spinning vinyl icon */}
          <div className="absolute top-1 right-1 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-sm">
            <Disc3 
              className={`w-3.5 h-3.5 text-white ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>

        {/* Track Title, Artist, Album, and Like Button */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-black text-base sm:text-lg text-white truncate leading-snug drop-shadow-xs">
              {currentTrack.title}
            </h3>
            <button
              onClick={() => {
                playTactileClick();
                onToggleLike(currentTrack.id);
              }}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-white/30 transition-all shrink-0 cursor-pointer shadow-xs"
              title={currentTrack.isLiked ? 'Hapus dari Suka' : 'Sukai Lagu'}
            >
              <Heart
                className={`w-4 h-4 ${
                  currentTrack.isLiked
                    ? 'fill-white text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              />
            </button>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-white/90 truncate">
            {currentTrack.artist}
          </p>

          <p className="text-[11px] text-white/60 font-medium truncate mt-0.5">
            Album: {currentTrack.album}
          </p>
        </div>
      </div>

      {/* =========================================================================
          TRANSPORT CONTROLS ROW & SCRUBBER SEEKBAR
         ========================================================================= */}
      <div className="flex items-center justify-center gap-3.5 mb-2.5">
        {/* Shuffle */}
        <button
          onClick={() => {
            playTactileClick();
            onToggleShuffle();
          }}
          className={`p-2 rounded-full transition-all cursor-pointer ${
            isShuffle 
              ? 'text-white bg-white/[0.22] border border-white/40 shadow-md backdrop-blur-md' 
              : 'text-white/60 hover:text-white hover:bg-white/[0.10] border border-white/10'
          }`}
          title="Acak Lagu"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          onClick={() => {
            playTactileClick();
            onPrev();
          }}
          className="p-2 rounded-full text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 shadow-md backdrop-blur-md transition-all cursor-pointer"
          title="Lagu Sebelumnya"
        >
          <SkipBack className="w-4 h-4 fill-white" />
        </button>

        {/* Big Play/Pause button: Glass Transparent Outline & Shadow */}
        <button
          onClick={() => {
            playTactileClick();
            onTogglePlay();
          }}
          className="w-12 h-12 rounded-full bg-white/[0.15] hover:bg-white/[0.25] active:scale-95 text-white border border-white/35 hover:border-white/50 shadow-xl shadow-black/40 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
          title={isPlaying ? 'Jeda' : 'Putar'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white text-white" />
          ) : (
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={() => {
            playTactileClick();
            onNext();
          }}
          className="p-2 rounded-full text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 shadow-md backdrop-blur-md transition-all cursor-pointer"
          title="Lagu Berikutnya"
        >
          <SkipForward className="w-4 h-4 fill-white" />
        </button>

        {/* Repeat */}
        <button
          onClick={() => {
            playTactileClick();
            onToggleRepeat();
          }}
          className={`p-2 rounded-full transition-all cursor-pointer ${
            repeatMode !== 'off' 
              ? 'text-white bg-white/[0.22] border border-white/40 shadow-md backdrop-blur-md' 
              : 'text-white/60 hover:text-white hover:bg-white/[0.10] border border-white/10'
          }`}
          title={`Ulangi: ${repeatMode}`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-4 h-4" />
          ) : (
            <Repeat className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Progress seekbar */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] text-white font-mono font-bold tabular-nums min-w-[28px] text-right">
          {formatTime(currentTime)}
        </span>

        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white"
            style={{
              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        <span className="text-[10px] text-white/60 font-mono font-bold tabular-nums min-w-[28px]">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

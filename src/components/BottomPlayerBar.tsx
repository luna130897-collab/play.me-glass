import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Heart,
  Moon,
  ChevronUp
} from 'lucide-react';
import { Track, RepeatMode } from '../types';
import { playTactileClick } from '../utils/audioSynth';

interface BottomPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  volume: number;
  sleepTimer: number | null;
  isVisible?: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleLike: (id: string) => void;
  onOpenLyricsVisual: () => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  volume,
  sleepTimer,
  isVisible = true,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleRepeat,
  onToggleShuffle,
  onToggleLike,
  onOpenLyricsVisual,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`fixed bottom-0 inset-x-0 z-40 p-2 sm:p-3 pointer-events-none flex justify-center transition-all duration-500 ease-out transform ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-32 opacity-0'
      }`}
    >
      <div className="w-full max-w-2xl glass-morph rounded-2xl p-2.5 sm:p-3 border border-white/15 shadow-2xl pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-2.5">
          {/* =========================================================================
              LEFT: NOW PLAYING + THUMBNAIL + TITLE + ARTIST (Clickable to open Lirik/Visual)
             ========================================================================= */}
          <div 
            onClick={() => {
              playTactileClick();
              onOpenLyricsVisual();
            }}
            className="flex items-center gap-2.5 w-full sm:w-1/3 min-w-0 cursor-pointer group"
            title="Klik untuk membuka Lirik & Visual Fullscreen"
          >
            {/* Square thumbnail */}
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/25 shadow-2xs shrink-0 bg-slate-900 flex items-center justify-center relative">
              {currentTrack?.coverArt ? (
                <img
                  src={currentTrack.coverArt}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                  ♫
                </div>
              )}
            </div>

            {/* Song Meta */}
            <div className="truncate flex-1">
              <div className="flex items-center gap-1 text-[10px] text-white/70 font-bold leading-none mb-0.5">
                <span>Now playing...</span>
                <ChevronUp className="w-3 h-3 text-white group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs sm:text-sm font-black text-white truncate transition-colors">
                  {currentTrack?.title || 'No Song Selected'}
                </span>
                {currentTrack && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick();
                      onToggleLike(currentTrack.id);
                    }}
                    className="hover:scale-110 transition-transform shrink-0 cursor-pointer p-0.5"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        currentTrack.isLiked
                          ? 'fill-white text-white'
                          : 'text-white/50 hover:text-white'
                      }`}
                    />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-white/60 font-medium truncate block">
                {currentTrack?.artist || 'Select a track to play'}
              </span>
            </div>
          </div>

          {/* =========================================================================
              CENTER: TRANSPORT CONTROLS + SCRUBBER BAR
             ========================================================================= */}
          <div className="flex flex-col items-center w-full sm:w-2/5">
            {/* Controls Row: Shuffle | Prev | Play/Pause | Next | Repeat */}
            <div className="flex items-center gap-3 mb-1">
              {/* Shuffle */}
              <button
                onClick={() => {
                  playTactileClick();
                  onToggleShuffle();
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isShuffle ? 'text-white bg-white/[0.22] border border-white/40 shadow-xs' : 'text-white/60 hover:text-white'
                }`}
                title="Acak Lagu (Shuffle)"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              {/* Prev */}
              <button
                onClick={() => {
                  playTactileClick();
                  onPrev();
                }}
                className="p-1.5 rounded-full text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 shadow-xs transition-all cursor-pointer"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-4 h-4 fill-white" />
              </button>

              {/* Play / Pause circle: Glass outline & shadow */}
              <button
                onClick={() => {
                  playTactileClick();
                  onTogglePlay();
                }}
                className="w-9 h-9 rounded-full bg-white/[0.15] hover:bg-white/[0.25] text-white border border-white/35 shadow-lg shadow-black/40 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={() => {
                  playTactileClick();
                  onNext();
                }}
                className="p-1.5 rounded-full text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 shadow-xs transition-all cursor-pointer"
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
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  repeatMode !== 'off' ? 'text-white bg-white/[0.22] border border-white/40 shadow-xs' : 'text-white/60 hover:text-white'
                }`}
                title={`Ulangi: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Seekbar: 0:35 ------○------ 1:58 */}
            <div className="w-full flex items-center gap-2">
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

          {/* =========================================================================
              RIGHT: VOLUME CONTROL & SLEEP TIMER BADGE
             ========================================================================= */}
          <div className="hidden sm:flex items-center justify-end gap-2 w-1/4">
            {sleepTimer !== null && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/[0.12] border border-white/25 px-2 py-0.5 rounded-full shadow-xs">
                <Moon className="w-3 h-3 text-white" />
                <span>{Math.ceil(sleepTimer / 60)}m</span>
              </div>
            )}

            <button
              onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
              title={volume === 0 ? 'Aktifkan Suara' : 'Bisukan Suara'}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/50" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-18 h-1.5 rounded-full appearance-none cursor-pointer accent-white bg-white/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

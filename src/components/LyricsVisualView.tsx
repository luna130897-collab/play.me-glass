import React, { useState, useEffect, useRef } from 'react';
import { Track, SyncedLyricLine } from '../types';
import { 
  Mic2, 
  Search, 
  Globe, 
  Edit3, 
  X, 
  Music, 
  Disc3, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';
import { generateCoverForTrack } from '../utils/coverArt';
import { searchLyricsComprehensive, LyricsSearchResult, parseLrc } from '../utils/lyricsApi';

interface LyricsVisualViewProps {
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  beatEnergy: number;
  currentGifId?: string;
  onSeek: (time: number) => void;
  onUpdateLyrics?: (trackId: string, plainLyrics?: string, syncedLyrics?: SyncedLyricLine[]) => void;
  onUpdateTrackLyrics?: (trackId: string, lyrics: { plainLyrics?: string; syncedLyrics?: SyncedLyricLine[] }) => void;
}

export const LyricsVisualView: React.FC<LyricsVisualViewProps> = ({
  currentTrack,
  currentTime,
  duration,
  isPlaying,
  beatEnergy,
  currentGifId,
  onSeek,
  onUpdateLyrics,
  onUpdateTrackLyrics,
}) => {
  const [viewMode, setViewMode] = useState<'lyrics' | 'artwork'>('lyrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LyricsSearchResult[]>([]);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [manualText, setManualText] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const syncedLyrics = currentTrack?.syncedLyrics;
  const plainLyrics = currentTrack?.plainLyrics;
  const legacyLyrics = currentTrack?.lyrics;

  // Determine active lyric line based on current playback timestamp
  useEffect(() => {
    if (syncedLyrics && syncedLyrics.length > 0) {
      let idx = -1;
      for (let i = 0; i < syncedLyrics.length; i++) {
        if (currentTime >= syncedLyrics[i].time - 0.25) {
          idx = i;
        } else {
          break;
        }
      }
      setActiveIndex(idx);
    } else if (legacyLyrics && legacyLyrics.length > 0 && duration > 0) {
      const progress = currentTime / duration;
      const idx = Math.min(
        Math.floor(progress * legacyLyrics.length),
        legacyLyrics.length - 1
      );
      setActiveIndex(idx);
    }
  }, [currentTime, duration, syncedLyrics, legacyLyrics]);

  // Smooth auto-scroll active lyric into view
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  // Search online lyrics using robust multi-source engine (LRCLIB exact get + full-text search + Lyrics.ovh)
  const searchOnlineLyrics = async (title: string, artist?: string) => {
    if (!title.trim()) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSearchStatus('Perangkat Anda sedang offline. Hubungkan ke internet untuk mencari lirik.');
      return;
    }

    setIsSearching(true);
    setSearchStatus('Mencari lirik sinkron & akurat di database global...');
    setSearchResults([]);

    try {
      const results = await searchLyricsComprehensive(
        title,
        artist,
        currentTrack?.album,
        currentTrack?.duration
      );

      if (results && results.length > 0) {
        setSearchResults(results);
        const syncedCount = results.filter((r) => r.isSynced).length;
        if (syncedCount > 0) {
          setSearchStatus(`Ditemukan ${results.length} hasil lirik (${syncedCount} lirik sinkron LRC)!`);
        } else {
          setSearchStatus(`Ditemukan ${results.length} hasil lirik teks.`);
        }
      } else {
        setSearchStatus('Lirik belum tersedia di database online. Anda dapat mengetik atau menempel lirik manual.');
      }
    } catch (err) {
      console.warn('Lyrics search issue:', err);
      setSearchStatus('Server lirik sedang sibuk. Silakan coba kembali atau gunakan lirik manual.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAutoSearchOnline = () => {
    if (!currentTrack) return;
    playTactileClick();
    searchOnlineLyrics(currentTrack.title, currentTrack.artist);
  };

  const handleSearchByQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    playTactileClick();
    searchOnlineLyrics(searchQuery);
  };

  const handleApplySearchResult = (item: LyricsSearchResult) => {
    if (!currentTrack) return;
    playTactileClick();

    if (item.syncedLyrics && item.syncedLyrics.length > 0) {
      if (onUpdateLyrics) {
        onUpdateLyrics(currentTrack.id, item.plainLyrics, item.syncedLyrics);
      } else if (onUpdateTrackLyrics) {
        onUpdateTrackLyrics(currentTrack.id, {
          syncedLyrics: item.syncedLyrics,
          plainLyrics: item.plainLyrics,
        });
      }
      setSearchStatus(`Lirik sinkron (LRC) "${item.trackName}" berhasil dipasang!`);
    } else if (item.plainLyrics) {
      if (onUpdateLyrics) {
        onUpdateLyrics(currentTrack.id, item.plainLyrics, undefined);
      } else if (onUpdateTrackLyrics) {
        onUpdateTrackLyrics(currentTrack.id, {
          plainLyrics: item.plainLyrics,
          syncedLyrics: undefined,
        });
      }
      setSearchStatus(`Lirik teks "${item.trackName}" berhasil dipasang!`);
    }

    setSearchResults([]);
  };

  const handleSaveManualLyrics = () => {
    if (!currentTrack) return;
    playTactileClick();

    const isLRC = manualText.includes('[00:') || manualText.includes('[01:') || manualText.includes('[02:');
    if (isLRC) {
      const parsed = parseLrc(manualText);
      if (onUpdateLyrics) {
        onUpdateLyrics(currentTrack.id, manualText, parsed);
      } else if (onUpdateTrackLyrics) {
        onUpdateTrackLyrics(currentTrack.id, {
          syncedLyrics: parsed,
          plainLyrics: manualText,
        });
      }
      setSearchStatus('Lirik manual LRC berhasil disimpan!');
    } else {
      if (onUpdateLyrics) {
        onUpdateLyrics(currentTrack.id, manualText, undefined);
      } else if (onUpdateTrackLyrics) {
        onUpdateTrackLyrics(currentTrack.id, {
          plainLyrics: manualText,
          syncedLyrics: undefined,
        });
      }
      setSearchStatus('Lirik teks manual berhasil disimpan!');
    }

    setIsManualEditOpen(false);
  };

  return (
    <div className="w-full glass-morph rounded-2xl p-4 sm:p-5 mb-20 select-none relative overflow-hidden border border-white/20 shadow-lg">
      {/* Top Header Mode Switcher: Lirik Berjalan vs Seni Cover */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-white" />
          <h3 className="font-extrabold text-sm text-white uppercase tracking-tight">
            Lirik &amp; Penampil Visual
          </h3>
        </div>

        <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/15 text-xs font-bold">
          <button
            onClick={() => {
              playTactileClick();
              setViewMode('lyrics');
            }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'lyrics' 
                ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-md backdrop-blur-md' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Lirik
          </button>
          <button
            onClick={() => {
              playTactileClick();
              setViewMode('artwork');
            }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'artwork' 
                ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-md backdrop-blur-md' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Cover Seni
          </button>
        </div>
      </div>

      {/* Track Meta Chip & Online Search Trigger */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/15 mb-3 flex-wrap gap-2">
        <div className="truncate min-w-0 flex-1">
          <p className="text-xs font-black text-white truncate">
            {currentTrack?.title || 'Belum Ada Lagu Diputar'}
          </p>
          <p className="text-[11px] text-white/60 truncate">
            {currentTrack?.artist || 'Pilih lagu untuk melihat lirik'} • {currentTrack?.album}
          </p>
        </div>

        {/* Online Lyrics Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleAutoSearchOnline}
            disabled={!currentTrack || isSearching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] active:scale-95 text-white font-bold text-[11px] border border-white/25 shadow-md shadow-black/30 backdrop-blur-md transition-all cursor-pointer disabled:opacity-40"
            title="Cari lirik otomatis di internet sesuai judul lagu ini"
          >
            {isSearching ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : (
              <Globe className="w-3 h-3 text-white" />
            )}
            <span>Cari Lirik Online</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setManualText(plainLyrics || legacyLyrics?.join('\n') || '');
              setIsManualEditOpen(true);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xs transition-colors cursor-pointer"
            title="Tempel / Ketik Lirik Sendiri"
          >
            <Edit3 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Search Input Bar for Online Lyrics */}
      <form onSubmit={handleSearchByQuery} className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lirik online manual (contoh: Piri soft spot)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/40 text-white placeholder-white/40 border border-white/15 focus:border-white/40 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!searchQuery.trim() || isSearching}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.22] text-white font-bold text-xs border border-white/25 shadow-md backdrop-blur-md transition-all cursor-pointer disabled:opacity-40"
        >
          Cari
        </button>
      </form>

      {/* Search Status & Notifications */}
      {searchStatus && (
        <div className="p-2 mb-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white flex items-center justify-between">
          <span className="truncate">{searchStatus}</span>
          <button
            onClick={() => setSearchStatus(null)}
            className="text-white/60 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Online Search Results List Dropdown */}
      {searchResults.length > 0 && (
        <div className="mb-3 p-2.5 rounded-xl bg-slate-900/95 border border-white/20 shadow-2xl max-h-56 overflow-y-auto y2k-scrollbar space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10">
            <p className="text-[10px] font-extrabold uppercase text-white/70">
              Pilih Versi Lirik ({searchResults.length} Ditemukan):
            </p>
            <button
              onClick={() => setSearchResults([])}
              className="text-[10px] font-bold text-white/50 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
            >
              Tutup
            </button>
          </div>
          {searchResults.map((res) => (
            <button
              key={res.id}
              onClick={() => handleApplySearchResult(res)}
              className="w-full text-left p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 transition-all flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="min-w-0 pr-1 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-white">
                  {res.trackName} - {res.artistName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-white/60">
                  <span className="truncate max-w-[120px]">{res.albumName || 'Single'}</span>
                  <span>•</span>
                  <span className={res.isSynced ? 'text-emerald-400 font-bold' : 'text-white/60'}>
                    {res.isSynced ? '⚡ Lirik Sinkron (LRC)' : '📝 Teks Biasa'}
                  </span>
                  <span>•</span>
                  <span className="text-white/40">{res.source}</span>
                </div>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 transition-all ${
                res.isSynced 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 group-hover:bg-emerald-500/30' 
                  : 'bg-white/15 text-white border-white/25 group-hover:bg-white/25'
              }`}>
                Pilih
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Manual Edit / Paste Lyrics Modal */}
      {isManualEditOpen && (
        <div className="mb-3 p-3 rounded-xl bg-slate-900/95 border border-white/20 shadow-2xl space-y-2 animate-fadeIn text-white">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-white">
              Tempel atau Tulis Lirik (Mendukung Format LRC [.lrc])
            </label>
            <button
              onClick={() => setIsManualEditOpen(false)}
              className="p-1 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={5}
            placeholder="Ketik atau tempel lirik di sini..."
            className="w-full p-2 text-xs rounded-lg border border-white/20 bg-black/60 text-white outline-none focus:border-white/40 font-mono"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsManualEditOpen(false)}
              className="px-3 py-1 rounded-lg text-xs font-bold text-white/70 hover:bg-white/10 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSaveManualLyrics}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-white/[0.18] hover:bg-white/[0.28] text-white border border-white/30 shadow-md cursor-pointer"
            >
              Simpan Lirik
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: SYNCHRONIZED KARAOKE LYRICS DISPLAY
         ========================================================================= */}
      {viewMode === 'lyrics' ? (
        <div 
          ref={lyricsContainerRef}
          className="space-y-3 py-3 text-center max-h-[340px] overflow-y-auto y2k-scrollbar px-2"
        >
          {syncedLyrics && syncedLyrics.length > 0 ? (
            // Synchronized LRC Lyrics
            syncedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex && isPlaying;
              const isPast = idx < activeIndex;

              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => {
                    playTactileClick();
                    onSeek(line.time);
                  }}
                  className={`transition-all duration-300 cursor-pointer py-1.5 px-2 select-none ${
                    isActive
                      ? 'text-base sm:text-xl font-black text-white scale-105 drop-shadow-md'
                      : isPast
                      ? 'text-xs sm:text-sm font-semibold text-white/60 opacity-80 hover:opacity-100'
                      : 'text-xs sm:text-sm font-semibold text-white/40 opacity-50 hover:opacity-80'
                  }`}
                  title={`Klik untuk lompat ke detik ${Math.round(line.time)}s`}
                >
                  {line.text}
                </p>
              );
            })
          ) : plainLyrics ? (
            // Plain Text Lyrics
            plainLyrics.split('\n').filter(Boolean).map((line, idx) => (
              <p
                key={idx}
                className="text-xs sm:text-sm font-semibold text-white py-1"
              >
                {line}
              </p>
            ))
          ) : legacyLyrics && legacyLyrics.length > 0 ? (
            // Legacy / Initial Demo Lyrics
            legacyLyrics.map((line, idx) => {
              const isActive = idx === activeIndex && isPlaying;
              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => {
                    playTactileClick();
                    if (duration > 0) {
                      onSeek((idx / legacyLyrics.length) * duration);
                    }
                  }}
                  className={`transition-all duration-300 cursor-pointer py-1.5 px-2 select-none ${
                    isActive
                      ? 'text-base sm:text-xl font-black text-white scale-105 drop-shadow-md'
                      : 'text-xs sm:text-sm font-semibold text-white/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  {line}
                </p>
              );
            })
          ) : (
            // Empty State
            <div className="py-8 text-center space-y-2">
              <Music className="w-8 h-8 mx-auto text-white/40" />
              <p className="text-xs font-bold text-white">
                Belum ada lirik untuk lagu ini.
              </p>
              <button
                onClick={handleAutoSearchOnline}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] text-white font-bold text-xs border border-white/25 shadow-md backdrop-blur-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>Cari Lirik Online Sekarang</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: IMMERSIVE ARTWORK COVER DISPLAY
           ========================================================================= */
        <div className="py-4 flex flex-col items-center justify-center">
          <div 
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative transition-transform duration-300 bg-slate-900 flex items-center justify-center"
            style={{ transform: `scale(${isPlaying ? 1 + beatEnergy * 0.08 : 1})` }}
          >
            {currentTrack?.coverArt ? (
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = generateCoverForTrack(currentTrack.title, currentTrack.artist);
                }}
              />
            ) : (
              <Disc3 
                className={`w-20 h-20 text-white/80 ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '4s' }}
              />
            )}
          </div>

          <div className="text-center mt-4">
            <h4 className="font-black text-base sm:text-lg text-white">
              {currentTrack?.title}
            </h4>
            <p className="text-xs font-bold text-white/80 mt-0.5">
              {currentTrack?.artist}
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              {currentTrack?.album}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

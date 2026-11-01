import React, { useState, useRef } from 'react';
import { Track } from '../types';
import { 
  X, 
  PlayCircle, 
  Heart, 
  Trash2, 
  HardDrive, 
  ShieldCheck, 
  Edit3, 
  Image as ImageIcon, 
  Save, 
  Check, 
  Music,
  FileText
} from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';
import { generateCoverForTrack } from '../utils/coverArt';

interface TrackDetailModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayNext: (id: string) => void;
  onToggleLike: (id: string) => void;
  onRemoveTrack: (id: string) => void;
  onUpdateTrackMetadata?: (trackId: string, updates: Partial<Track>) => void;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({
  track,
  isOpen,
  onClose,
  onPlayNext,
  onToggleLike,
  onRemoveTrack,
  onUpdateTrackMetadata,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverArt, setCoverArt] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when track opens
  React.useEffect(() => {
    if (track) {
      setTitle(track.title);
      setArtist(track.artist);
      setAlbum(track.album);
      setCoverArt(track.coverArt || '');
      setIsEditing(false);
      setSaveSuccess(false);
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverArt(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerateCover = () => {
    playTactileClick();
    const newCover = generateCoverForTrack(title || track.title, artist || track.artist);
    setCoverArt(newCover);
  };

  const handleSave = () => {
    playTactileClick();
    if (!onUpdateTrackMetadata) return;

    onUpdateTrackMetadata(track.id, {
      title: title.trim() || track.title,
      artist: artist.trim() || track.artist,
      album: album.trim() || track.album,
      coverArt: coverArt || track.coverArt,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 700);
  };

  const formatSecs = (sec?: number) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-morph rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl relative select-none text-white max-h-[90vh] overflow-y-auto">
        {/* Top Header with Cover and Meta */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div className="relative group w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-white/20 shrink-0 flex items-center justify-center shadow-md">
              {(isEditing ? coverArt : track.coverArt) ? (
                <img 
                  src={isEditing ? coverArt : track.coverArt} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Music className="w-6 h-6 text-white/50" />
              )}

              {isEditing && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[10px] text-white font-bold opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  title="Ganti Cover Artwork"
                >
                  <ImageIcon className="w-4 h-4 mb-0.5" />
                  <span>Ubah</span>
                </button>
              )}
            </div>

            <div className="truncate min-w-0 flex-1">
              {!isEditing ? (
                <>
                  <h4 className="text-sm font-black text-white truncate leading-tight">{track.title}</h4>
                  <p className="text-xs text-white/70 truncate mt-0.5">{track.artist}</p>
                  <p className="text-[11px] text-white/50 truncate">{track.album}</p>
                </>
              ) : (
                <div className="text-xs font-bold text-white/90">
                  Mode Pengeditan Metadata
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editing Form */}
        {isEditing ? (
          <div className="space-y-2.5 my-3">
            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">
                Judul Lagu (Title)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-white/50"
                placeholder="Judul lagu..."
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">
                Artis (Artist)
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-white/50"
                placeholder="Nama artis..."
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">
                Album
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-white/50"
                placeholder="Nama album..."
              />
            </div>

            {/* Artwork Change Actions */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Cover Baru</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerateCover}
                className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Buat Cover Artwork Vektor Otomatis"
              >
                Cover Otomatis
              </button>
            </div>

            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Save / Cancel buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white/70 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveSuccess}
                className="flex-1 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-black text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Normal Action List & Metadata Specs */
          <div className="space-y-1.5 my-3">
            {/* Storage Persistence Badge */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white">
                <HardDrive className="w-4 h-4 text-white/80 shrink-0" />
                <span className="font-bold text-[11px]">Penyimpanan Permanen</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                IndexedDB
              </span>
            </div>

            <button
              onClick={() => {
                onPlayNext(track.id);
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-white/[0.08] flex items-center gap-3 text-xs font-bold text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>Putar Berikutnya (Play Next)</span>
            </button>

            <button
              onClick={() => {
                onToggleLike(track.id);
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-white/[0.08] flex items-center gap-3 text-xs font-bold text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${track.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white/60'}`} />
              <span>{track.isLiked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}</span>
            </button>

            {onUpdateTrackMetadata && (
              <button
                onClick={() => {
                  playTactileClick();
                  setIsEditing(true);
                }}
                className="w-full p-2.5 rounded-xl hover:bg-white/[0.08] flex items-center gap-3 text-xs font-bold text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>Edit Metadata & Ganti Cover</span>
              </button>
            )}

            {/* Technical Audio Metadata Card */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/15 space-y-1.5 text-[11px] text-white/80">
              <div className="flex justify-between">
                <span className="font-semibold text-white/50">Format Berkas:</span>
                <span className="font-mono text-white font-bold">{track.format || 'MP3 Stereo'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-white/50">Bitrate Audio:</span>
                <span className="font-mono text-white font-bold">{track.bitrate || '320 kbps'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-white/50">Ukuran Berkas:</span>
                <span className="font-mono text-white font-bold">{track.fileSize || '10.2 MB'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-white/50">Durasi:</span>
                <span className="font-mono text-white font-bold">{formatSecs(track.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-white/50">Lirik:</span>
                <span className="font-mono text-white font-bold flex items-center gap-1">
                  {track.plainLyrics || track.syncedLyrics ? (
                    <>
                      <FileText className="w-3 h-3 text-emerald-400" />
                      Tersedia
                    </>
                  ) : (
                    <span className="text-white/40">Lirik Online</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-white/50">Ditambahkan:</span>
                <span className="font-mono text-white/80">{track.dateAdded}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onRemoveTrack(track.id);
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs font-bold text-white/70 hover:text-rose-400 border border-transparent hover:border-white/15 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-white/70 hover:text-rose-400" />
              <span>Hapus dari Pustaka</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

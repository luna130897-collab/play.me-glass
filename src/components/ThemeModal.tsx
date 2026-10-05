import React, { useRef } from 'react';
import { ThemeConfig } from '../types';
import { X, Image, Upload, Trash2, Sliders, Sparkles } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (partial: Partial<ThemeConfig>) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  onUpdateTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      playTactileClick();
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          onUpdateTheme({ customBgUrl: dataUrl, bgBlur: 0, bgDim: 0.15 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const glassOpacity = themeConfig.glassOpacity ?? 0.20;
  const glassBlur = themeConfig.glassBlur ?? 4;
  const percentBening = Math.round((1 - glassOpacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md glass-morph rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Wallpaper &amp; Kaca Transparan
              </h3>
              <p className="text-[10px] text-white/60">
                Tema Elegant Dark Glass
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 my-3 max-h-[75vh] overflow-y-auto y2k-scrollbar pr-1">
          {/* Section 1: Wallpaper Latar Belakang Kustom & Bawaan */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Image className="w-4 h-4 text-white" />
                <span>Wallpaper Latar Belakang</span>
              </label>

              {themeConfig.customBgUrl && (
                <button
                  onClick={() => {
                    playTactileClick();
                    onUpdateTheme({ customBgUrl: null });
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-white/80 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 shadow-xs"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                  <span>Reset Latar Bawaan</span>
                </button>
              )}
            </div>

            {themeConfig.customBgUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 shadow-inner group">
                <img
                  src={themeConfig.customBgUrl}
                  alt="Custom Wallpaper"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.20] hover:bg-white/[0.30] text-white text-xs font-bold border border-white/30 shadow-lg backdrop-blur-md cursor-pointer transition-colors"
                  >
                    Ganti Foto Lain
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-white mb-1.5" />
                <span className="text-xs font-bold text-white">
                  Pilih Foto dari Galeri HP / Komputer
                </span>
                <span className="text-[10px] text-white/60 mt-0.5">
                  Mendukung JPG, PNG, WEBP (foto pribadi, anime, pemandangan)
                </span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleCustomBgUpload}
            />

            {/* Curated Dark Wallpaper Presets */}
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5">
                Atau Pilih Wallpaper Estetik:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  {
                    name: 'Obsidian Glow',
                    url: null,
                    thumb: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950',
                  },
                  {
                    name: 'Cosmic Nebula',
                    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
                    thumb: null,
                  },
                  {
                    name: 'Aurora Night',
                    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
                    thumb: null,
                  },
                  {
                    name: 'Cyber City',
                    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
                    thumb: null,
                  },
                ].map((item) => {
                  const isSelected = item.url === themeConfig.customBgUrl;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        onUpdateTheme({
                          customBgUrl: item.url,
                          bgBlur: item.url ? 0 : 0,
                          bgDim: item.url ? 0.2 : 0,
                        });
                      }}
                      className={`relative h-14 rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col items-center justify-end p-1 select-none ${
                        isSelected
                          ? 'border-white/80 ring-2 ring-white/50 shadow-lg scale-105'
                          : 'border-white/15 hover:border-white/40'
                      }`}
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`absolute inset-0 ${item.thumb}`} />
                      )}
                      <div className="absolute inset-0 bg-black/40" />
                      <span className="relative z-10 text-[9px] font-black text-white leading-tight truncate w-full text-center drop-shadow-xs">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders for Blur & Dimming (When custom background is active) */}
            {themeConfig.customBgUrl && (
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                {/* Dimming Slider */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-white/80 mb-1">
                    <span>Kecerahan Latar Belakang:</span>
                    <span>{Math.round((1 - themeConfig.bgDim) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.65}
                    step={0.05}
                    value={themeConfig.bgDim}
                    onChange={(e) => onUpdateTheme({ bgDim: parseFloat(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white bg-white/20"
                  />
                </div>

                {/* Blur Slider */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-white/80 mb-1">
                    <span>Efek Blur Wallpaper:</span>
                    <span>{themeConfig.bgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={themeConfig.bgBlur}
                    onChange={(e) => onUpdateTheme({ bgBlur: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white bg-white/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Pengaturan Transparansi Kaca (Glass Transparency) */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-white" />
                <span>Transparansi Kaca (Glass Transparency)</span>
              </label>
              <span className="text-[11px] font-black text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-full shadow-xs">
                {percentBening}% Bening
              </span>
            </div>

            <p className="text-[11px] text-white/70 leading-tight">
              Pilih mode kaca atau geser slider. Wallpaper di belakang akan terlihat tembus pandang secara dinamis.
            </p>

            {/* Interactive Real-Time Glass Preview Banner */}
            <div className="relative w-full h-24 rounded-xl overflow-hidden p-2 flex items-center justify-center border border-white/15 shadow-inner select-none">
              {/* Ambient visualizer background behind preview */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900" />
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-blue-500/40 blur-md opacity-70 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-purple-500/40 blur-md opacity-70" />

              {/* Live Sample Glass Card */}
              <div 
                className="relative z-10 w-full max-w-[300px] p-2.5 rounded-xl border flex items-center justify-between shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: `rgba(13, 17, 28, ${glassOpacity})`,
                  backdropFilter: `blur(${glassBlur}px) saturate(140%)`,
                  WebkitBackdropFilter: `blur(${glassBlur}px) saturate(140%)`,
                  borderColor: `rgba(255, 255, 255, ${Math.min(0.85, Math.max(0.15, glassOpacity * 0.7 + 0.15))})`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/15 text-white border border-white/20 flex items-center justify-center text-xs font-black shadow-xs">
                    ♫
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white leading-tight drop-shadow-xs">
                      Pratinjau Kaca Langsung
                    </p>
                    <p className="text-[9px] font-semibold text-white/70">
                      {glassOpacity <= 0.10
                        ? '💎 Bening: Tembus Pandang Jernih'
                        : glassOpacity >= 0.45
                        ? '🌫️ Pekat: Kaca Tebal Solid'
                        : '🧊 Sedang: Kaca Frost Elegan'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/15 text-white backdrop-blur-xs border border-white/20">
                  {Math.round(glassOpacity * 100)}%
                </span>
              </div>
            </div>

            {/* Quick Transparency Presets: Bening, Sedang, Pekat (Transparent Glass Buttons) */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onUpdateTheme({ glassOpacity: 0.04, glassBlur: 0 });
                }}
                className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  glassOpacity <= 0.10
                    ? 'bg-white/[0.22] text-white border-white/50 shadow-lg shadow-black/40 backdrop-blur-md ring-1 ring-white/30 scale-[1.02]'
                    : 'bg-white/[0.08] hover:bg-white/[0.16] text-white/80 border-white/15'
                }`}
              >
                <span className="text-sm">💎</span>
                <span>Bening</span>
                <span className="text-[9px] opacity-70">(0px Blur - Kristal)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onUpdateTheme({ glassOpacity: 0.20, glassBlur: 4 });
                }}
                className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  glassOpacity > 0.10 && glassOpacity < 0.45
                    ? 'bg-white/[0.22] text-white border-white/50 shadow-lg shadow-black/40 backdrop-blur-md ring-1 ring-white/30 scale-[1.02]'
                    : 'bg-white/[0.08] hover:bg-white/[0.16] text-white/80 border-white/15'
                }`}
              >
                <span className="text-sm">🧊</span>
                <span>Sedang</span>
                <span className="text-[9px] opacity-70">(4px Blur - Terlihat)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onUpdateTheme({ glassOpacity: 0.55, glassBlur: 8 });
                }}
                className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  glassOpacity >= 0.45
                    ? 'bg-white/[0.22] text-white border-white/50 shadow-lg shadow-black/40 backdrop-blur-md ring-1 ring-white/30 scale-[1.02]'
                    : 'bg-white/[0.08] hover:bg-white/[0.16] text-white/80 border-white/15'
                }`}
              >
                <span className="text-sm">🌫️</span>
                <span>Pekat</span>
                <span className="text-[9px] opacity-70">(8px Blur - Solid)</span>
              </button>
            </div>

            {/* Opacity slider */}
            <div className="pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-white/80 mb-1">
                <span>💎 96% Tembus Pandang</span>
                <span>🌫️ 85% Pekat Solid</span>
              </div>
              <input
                type="range"
                min={0.04}
                max={0.85}
                step={0.02}
                value={glassOpacity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const dynamicBlur = Math.round(val * 10);
                  onUpdateTheme({ glassOpacity: val, glassBlur: dynamicBlur });
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white bg-white/20"
              />
            </div>
          </div>
        </div>

        {/* Footer: Glass Transparent Outline & Shadow Button */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/[0.15] hover:bg-white/[0.25] active:scale-95 text-white font-black text-xs border border-white/30 shadow-lg shadow-black/40 backdrop-blur-md transition-all cursor-pointer"
          >
            Tutup &amp; Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

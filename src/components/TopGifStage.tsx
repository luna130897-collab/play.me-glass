import React, { useEffect, useRef } from 'react';
import { GifPresetId } from '../types';
import { Upload, Sparkles, RefreshCw, Palette } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

interface TopGifStageProps {
  currentGifId: GifPresetId;
  onSelectGif: (id: GifPresetId) => void;
  isPlaying: boolean;
  beatEnergy: number;
  customMediaUrl?: string;
  customMediaType?: 'gif' | 'video';
  onOpenUploadModal: () => void;
  onOpenThemeModal?: () => void;
}

export const TopGifStage: React.FC<TopGifStageProps> = ({
  currentGifId,
  onSelectGif,
  isPlaying,
  beatEnergy,
  customMediaUrl,
  customMediaType,
  onOpenUploadModal,
  onOpenThemeModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Video play/pause sync
  useEffect(() => {
    if (customMediaType === 'video' && videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [isPlaying, customMediaType]);

  // Cycle to next GIF
  const handleCycleNextGif = () => {
    playTactileClick();
    if (currentGifId === 'gif-1') onSelectGif('gif-2');
    else if (currentGifId === 'gif-2') onSelectGif('gif-3');
    else if (currentGifId === 'gif-3') {
      if (customMediaUrl) onSelectGif('custom');
      else onSelectGif('gif-1');
    } else {
      onSelectGif('gif-1');
    }
  };

  const getGifTitle = () => {
    if (currentGifId === 'gif-1') return '1/3 Selonjoran di Rumput';
    if (currentGifId === 'gif-2') return '2/3 Lo-Fi Bedroom Cat';
    if (currentGifId === 'gif-3') return '3/3 Cyber Anime Girl';
    return 'Animasi Kustom';
  };

  // Canvas loop
  useEffect(() => {
    if (currentGifId === 'custom' && customMediaUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += isPlaying ? 0.025 : 0.01;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // =========================================================================
      // GIF 1: MORTY LYING ON GRASS WITH CD PLAYER (Matching Reference Image)
      // =========================================================================
      if (currentGifId === 'gif-1') {
        const grassGrad = ctx.createLinearGradient(0, 0, 0, h);
        grassGrad.addColorStop(0, '#2d5a27');
        grassGrad.addColorStop(0.5, '#3b6e32');
        grassGrad.addColorStop(1, '#254b20');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, 0, w, h);

        // Grass blade textures
        ctx.strokeStyle = '#4a8240';
        ctx.lineWidth = 1.5;
        for (let gx = 10; gx < w; gx += 22) {
          for (let gy = 10; gy < h; gy += 25) {
            const sway = Math.sin(t * 1.5 + gx) * 2;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx - 3 + sway, gy - 6);
            ctx.moveTo(gx + 3, gy);
            ctx.lineTo(gx + 6 + sway, gy - 7);
            ctx.stroke();
          }
        }

        // Plaid picnic blanket under head
        ctx.save();
        ctx.translate(w * 0.36, h * 0.16);
        ctx.rotate(-0.1);
        ctx.fillStyle = '#8d7b68';
        ctx.fillRect(-65, -35, 130, 80);
        ctx.fillStyle = '#b09b82';
        ctx.fillRect(-65, -15, 130, 16);
        ctx.fillRect(-25, -35, 20, 80);
        ctx.fillRect(25, -35, 20, 80);
        ctx.strokeStyle = '#5c4d3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(-65, -35, 130, 80);
        ctx.restore();

        // Guy Body / Position
        const cx = w * 0.46;
        const cy = h * 0.44;
        const breathe = Math.sin(t * 2) * (isPlaying ? 2.5 : 1.5);

        // Blue jeans legs
        ctx.fillStyle = '#2b4461';
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy + 30);
        ctx.lineTo(cx - 38, cy + 115);
        ctx.lineTo(cx - 24, cy + 115);
        ctx.lineTo(cx - 6, cy + 35);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 6, cy + 35);
        ctx.lineTo(cx + 28, cy + 115);
        ctx.lineTo(cx + 42, cy + 115);
        ctx.lineTo(cx + 18, cy + 30);
        ctx.fill();

        // White socks/shoes
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(cx - 31, cy + 117, 8, 4, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 35, cy + 117, 8, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 20);
        ctx.lineTo(cx - 75, cy + 10);
        ctx.lineTo(cx - 68, cy + 18);
        ctx.lineTo(cx - 20, cy - 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 25, cy - 20);
        ctx.lineTo(cx + 80, cy - 5);
        ctx.lineTo(cx + 75, cy + 5);
        ctx.lineTo(cx + 20, cy - 10);
        ctx.fill();

        // Black T-shirt ("Morte void")
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, 32 + breathe * 0.5, 34 + breathe, 0, 0, Math.PI * 2);
        ctx.fill();

        // Skull logo
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(cx - 2, cy + 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#111827';
        ctx.fillText('void', cx - 2, cy + 14);

        // Head
        const headX = cx - 2;
        const headY = cy - 48;
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(headX, headY, 26, 0, Math.PI * 2);
        ctx.fill();

        // Brown hair
        ctx.fillStyle = '#5c4033';
        ctx.beginPath();
        ctx.arc(headX, headY - 4, 26, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // Eyes looking up / relaxed
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX - 9, headY - 2, 7, 0, Math.PI * 2);
        ctx.arc(headX + 9, headY - 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(headX - 9, headY - 5, 2.5, 0, Math.PI * 2);
        ctx.arc(headX + 9, headY - 5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyelids
        ctx.strokeStyle = '#b08968';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(headX - 16, headY - 4);
        ctx.lineTo(headX - 2, headY - 4);
        ctx.moveTo(headX + 2, headY - 4);
        ctx.lineTo(headX + 16, headY - 4);
        ctx.stroke();

        // Mouth
        ctx.beginPath();
        ctx.moveTo(headX - 5, headY + 12);
        ctx.lineTo(headX + 6, headY + 12);
        ctx.stroke();

        // Headphones
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(headX, headY - 8, 30, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.ellipse(headX - 27, headY - 2, 6, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(headX + 27, headY - 2, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cable to CD Player
        const cdX = cx + 80;
        const cdY = cy - 25;
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(headX + 27, headY + 6);
        ctx.bezierCurveTo(headX + 45, headY + 30, cdX - 20, cdY + 10, cdX - 10, cdY);
        ctx.stroke();

        // CD Player
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.roundRect(cdX - 18, cdY - 18, 36, 36, 10);
        ctx.fill();
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Spinning CD
        const cdSpin = isPlaying ? t * 8 : t * 0.5;
        ctx.save();
        ctx.translate(cdX, cdY);
        ctx.rotate(cdSpin);
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        const cdGrad = ctx.createLinearGradient(-13, -13, 13, 13);
        cdGrad.addColorStop(0, '#f472b6');
        cdGrad.addColorStop(0.5, '#60a5fa');
        cdGrad.addColorStop(1, '#f472b6');
        ctx.fillStyle = cdGrad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#374151';
        ctx.fill();
        ctx.restore();

        // Floating notes
        if (isPlaying) {
          for (let n = 0; n < 3; n++) {
            const progress = ((t * 0.6 + n * 0.33) % 1);
            const nx = cdX - progress * 40;
            const ny = cdY - progress * 50;
            const alpha = Math.sin(progress * Math.PI);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.font = '12px monospace';
            ctx.fillText('♪', nx, ny);
          }
        }
      }

      // =========================================================================
      // GIF 2: LO-FI BEDROOM CAT & RAIN
      // =========================================================================
      else if (currentGifId === 'gif-2') {
        ctx.fillStyle = '#1e112a';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#0f0817';
        ctx.fillRect(w * 0.1, 15, w * 0.8, h * 0.65);
        ctx.strokeStyle = '#382247';
        ctx.lineWidth = 3;
        ctx.strokeRect(w * 0.1, 15, w * 0.8, h * 0.65);

        for (let b = 0; b < 12; b++) {
          const bx = w * 0.12 + b * 22;
          const bh = 30 + Math.sin(b * 33) * 20;
          ctx.fillStyle = b % 2 === 0 ? '#ff7597' : '#38bdf8';
          ctx.fillRect(bx, h * 0.65 - bh, 16, bh);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 25; r++) {
          const rx = (r * 18 + t * 40) % (w * 0.78) + w * 0.11;
          const ry = (r * 24 + t * 90) % (h * 0.62) + 16;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 8);
          ctx.stroke();
        }

        const catX = w * 0.55;
        const catY = h * 0.78;
        const catBreathe = Math.sin(t * 2.5) * 1.5;

        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(catX, catY, 26 + catBreathe, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(catX - 22, catY - 2, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(catX - 30, catY - 14);
        ctx.lineTo(catX - 22, catY - 22);
        ctx.lineTo(catX - 18, catY - 12);
        ctx.fill();

        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(catX + 22, catY);
        ctx.quadraticCurveTo(catX + 40 + Math.sin(t * 3) * 6, catY - 15, catX + 32, catY - 22);
        ctx.stroke();
      }

      // =========================================================================
      // GIF 3: PRISMATIC ANIME HEADPHONE GIRL
      // =========================================================================
      else if (currentGifId === 'gif-3') {
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#2e0828');
        bgGrad.addColorStop(1, '#0c0211');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2 + 10;
        const bob = isPlaying ? Math.sin(t * 4) * 3 : 0;

        ctx.beginPath();
        ctx.arc(cx, cy - 10 + bob, 48 + beatEnergy * 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8 + bob, 22, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(cx, cy - 14 + bob, 26, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(cx - 24, cy - 14 + bob, 8, 38);
        ctx.fillRect(cx + 16, cy - 14 + bob, 8, 38);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy - 16 + bob, 28, Math.PI * 0.95, Math.PI * 2.05);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(cx - 30, cy - 16 + bob, 8, 20, 4);
        ctx.roundRect(cx + 22, cy - 16 + bob, 8, 20, 4);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentGifId, isPlaying, beatEnergy, customMediaUrl]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Visualizer Display Box (Matching Reference Top 16:9 Image) */}
      <div className="w-full aspect-[16/9] sm:aspect-[16/8.5] rounded-2xl overflow-hidden glass-morph relative shadow-lg group">
        {currentGifId === 'custom' && customMediaUrl ? (
          customMediaType === 'video' ? (
            <video
              ref={videoRef}
              src={customMediaUrl}
              loop
              muted
              playsInline
              autoPlay={isPlaying}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={customMediaUrl}
              alt="Custom Animation"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <canvas
            ref={canvasRef}
            width={400}
            height={225}
            className="w-full h-full object-cover"
          />
        )}

        {/* Ambient glow accent line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* =========================================================================
            POJOK BAWAH LAYAR .GIF: TOMBOL UNTUK GANTI GIF & UPLOAD
            Sesuai instruksi: "hilangkan menu gif 1 gif 2 gif 3 dan tambahkan tombol untuk ganti gif di layar gif pojok bawah layar .gif yang berjalan"
           ========================================================================= */}
        {/* Bottom-left: Tombol Theme */}
        <div className="absolute bottom-2.5 left-2.5 z-20">
          <button
            onClick={() => {
              playTactileClick();
              if (onOpenThemeModal) {
                onOpenThemeModal();
              }
            }}
            className="px-3 py-1.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] active:scale-95 backdrop-blur-md border border-white/30 hover:border-white/50 text-xs text-white font-bold shadow-lg shadow-black/40 flex items-center gap-1.5 transition-all cursor-pointer group"
            title="Ganti Tema & Wallpaper Latar Belakang"
          >
            <Palette className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
            <span>Theme</span>
          </button>
        </div>

        {/* Bottom-right: Interactive Floating Glass Buttons */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-20">
          {/* Ganti GIF Button */}
          <button
            onClick={handleCycleNextGif}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] active:scale-95 backdrop-blur-md border border-white/30 hover:border-white/50 text-white text-xs font-bold shadow-lg shadow-black/40 transition-all cursor-pointer"
            title="Ganti ke Animasi GIF Berikutnya"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Ganti GIF</span>
          </button>

          {/* Upload Custom GIF / Video */}
          <button
            onClick={() => {
              playTactileClick();
              onOpenUploadModal();
            }}
            className="p-1.5 rounded-full bg-white/[0.12] hover:bg-white/[0.22] active:scale-95 backdrop-blur-md border border-white/30 hover:border-white/50 text-white shadow-lg shadow-black/40 transition-all cursor-pointer"
            title="Upload GIF / Video dari Perangkat"
          >
            <Upload className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ListMusic, Library, Mic2, Sliders, Moon } from 'lucide-react';
import { MainNavTab } from '../types';
import { playTactileClick } from '../utils/audioSynth';

interface ModernNavTabsProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  sleepTimerRemaining: number | null;
}

export const ModernNavTabs: React.FC<ModernNavTabsProps> = ({
  activeTab,
  onSelectTab,
  sleepTimerRemaining,
}) => {
  const tabs = [
    {
      id: 'playlist' as MainNavTab,
      label: 'Daftar Putar',
      icon: ListMusic,
    },
    {
      id: 'library' as MainNavTab,
      label: 'Pustaka Lokal',
      icon: Library,
    },
    {
      id: 'lyrics' as MainNavTab,
      label: 'Lirik & Visual',
      icon: Mic2,
    },
    {
      id: 'equalizer' as MainNavTab,
      label: 'Studio EQ',
      icon: Sliders,
      badge: sleepTimerRemaining ? `${Math.ceil(sleepTimerRemaining / 60)}m` : undefined,
    },
  ];

  return (
    <nav className="w-full glass-morph rounded-2xl p-1.5 my-2.5 shadow-lg border border-white/20 select-none">
      <div className="grid grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playTactileClick();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/[0.22] text-white font-black border border-white/40 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/30'
                  : 'text-white/70 font-semibold hover:text-white hover:bg-white/[0.08] border border-transparent'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 mb-0.5 text-white ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-black px-1 rounded-full bg-white/25 text-white border border-white/30 shadow-xs backdrop-blur-md">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

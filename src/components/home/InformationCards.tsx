import React, { useState, useEffect } from 'react';
import { Sun, Calendar, Heart, Droplets, CloudSun, Database } from 'lucide-react';
import { cacheManager, CachedWeatherData } from '../../services/cacheManager';

interface InformationCardsProps {
  onCardClick?: (card: 'weather' | 'today' | 'mood') => void;
  isOffline?: boolean;
}

export const InformationCards: React.FC<InformationCardsProps> = ({
  onCardClick,
  isOffline = false,
}) => {
  const [mood, setMood] = useState<'Warm' | 'Focused' | 'Energetic' | 'Calm'>('Warm');
  const [weather, setWeather] = useState<CachedWeatherData>(() => cacheManager.getWeather());

  // Dynamic date calculations
  const now = new Date();
  const dayNumber = now.getDate();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
  const month = now.toLocaleDateString('en-US', { month: 'short' });

  useEffect(() => {
    // Refresh weather from cache on mount
    setWeather(cacheManager.getWeather());
  }, []);

  const cycleMood = () => {
    const moods: ('Warm' | 'Focused' | 'Energetic' | 'Calm')[] = ['Warm', 'Focused', 'Energetic', 'Calm'];
    const nextIndex = (moods.indexOf(mood) + 1) % moods.length;
    setMood(moods[nextIndex]);
    if (onCardClick) onCardClick('mood');
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 px-4 my-2 z-10">
      {/* Weather Card */}
      <div
        onClick={() => onCardClick?.('weather')}
        className="p-3 rounded-2xl bg-[#0e172a]/70 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md active:scale-95 relative group"
      >
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Weather</span>
          </div>
          {isOffline && (
            <span className="flex items-center gap-0.5 text-[9px] text-cyan-400 font-mono" title="Loaded from offline cache">
              <Database className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
        <div className="my-1">
          <div className="text-xl font-bold text-white tracking-tight">{weather.temp}°</div>
          <div className="text-[11px] text-gray-300 font-medium truncate">{weather.condition}</div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-blue-300">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>{weather.humidity}%</span>
          </div>
          <span className="text-[9px] text-gray-400 font-sans">{weather.city}</span>
        </div>
      </div>

      {/* Today Card */}
      <div
        onClick={() => onCardClick?.('today')}
        className="p-3 rounded-2xl bg-[#0e172a]/70 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md active:scale-95"
      >
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Today</span>
        </div>
        <div className="my-1">
          <div className="text-xl font-bold text-white tracking-tight">{dayNumber}</div>
          <div className="text-[11px] text-gray-300 font-medium">
            {weekday}, {month}
          </div>
        </div>
        <div className="text-[10px] text-cyan-400 font-medium truncate">
          Active day
        </div>
      </div>

      {/* Mood Card */}
      <div
        onClick={cycleMood}
        className="p-3 rounded-2xl bg-[#0e172a]/70 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md active:scale-95 group"
      >
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
          <span>Mood</span>
        </div>
        <div className="my-1">
          <div className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            {mood}
          </div>
          <div className="text-[11px] text-gray-300 font-medium">All good</div>
        </div>
        <div className="text-[10px] text-gray-400">Tap to toggle</div>
      </div>
    </div>
  );
};

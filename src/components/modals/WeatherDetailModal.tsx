import React, { useState } from 'react';
import {
  X,
  Sun,
  CloudSun,
  Droplets,
  Wind,
  Database,
  RefreshCw,
  Volume2,
  Check,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { cacheManager, CachedWeatherData } from '../../services/cacheManager';

interface WeatherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakWeather: (text: string) => void;
  onWeatherUpdated: () => void;
}

export const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({
  isOpen,
  onClose,
  onSpeakWeather,
  onWeatherUpdated,
}) => {
  const [weather, setWeather] = useState<CachedWeatherData>(() => cacheManager.getWeather());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [simOffline, setSimOffline] = useState(() => cacheManager.getIsSimulatedOffline());

  if (!isOpen) return null;

  const timeAgo = Math.round((Date.now() - weather.cachedAt) / 60000);
  const timeDisplay = timeAgo <= 1 ? 'Just now' : `${timeAgo}m ago`;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate live weather sync or fetch
    setTimeout(() => {
      // Add slight dynamic variance to demonstrate live update
      const randomTemp = 30 + Math.floor(Math.random() * 3);
      const updated = cacheManager.saveWeather({
        temp: randomTemp,
        condition: 'Clear Skies',
        humidity: 54 + Math.floor(Math.random() * 5),
        windSpeed: `${12 + Math.floor(Math.random() * 4)} km/h`,
      });
      setWeather(updated);
      setIsRefreshing(false);
      onWeatherUpdated();
    }, 800);
  };

  const handleToggleOffline = () => {
    const next = !simOffline;
    setSimOffline(next);
    cacheManager.setSimulatedOffline(next);
    onWeatherUpdated();
  };

  const weatherText = `Weather for ${weather.city}: Current temperature is ${weather.temp}°C, condition is ${weather.condition}, humidity is ${weather.humidity}%, with winds at ${weather.windSpeed}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm rounded-[32px] bg-[#0c1322] border border-blue-500/25 p-5 shadow-2xl text-white flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Weather Forecast</h3>
              <p className="text-[11px] text-gray-400">{weather.city}, Maharashtra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Temperature Display */}
        <div className="py-5 text-center relative">
          <div className="inline-block relative">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200">
              {weather.temp}°
            </span>
            <span className="text-sm font-semibold text-cyan-400 ml-1">C</span>
          </div>
          <p className="text-sm font-medium text-gray-200 mt-1">{weather.condition}</p>
          <p className="text-xs text-gray-400 mt-0.5">High {weather.high}° • Low {weather.low}°</p>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 rounded-2xl bg-[#11192e] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Humidity</span>
              <span className="text-sm font-bold text-white">{weather.humidity}%</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#11192e] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Wind</span>
              <span className="text-sm font-bold text-white">{weather.windSpeed}</span>
            </div>
          </div>
        </div>

        {/* LocalStorage Cache Metadata Card */}
        <div className="p-3.5 rounded-2xl bg-[#09101d] border border-cyan-500/20 text-xs mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>Offline Cache Layer</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{timeDisplay}</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Stored in browser <code className="text-cyan-300 font-mono text-[10px]">localStorage (priya_cache_weather_v1)</code>. Priya can answer weather queries even when completely offline.
          </p>
        </div>

        {/* Offline Simulation Switch */}
        <div className="p-3 rounded-2xl bg-[#11192e] border border-white/5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {simOffline ? (
              <WifiOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <div>
              <span className="text-xs font-semibold text-white block">Simulate Offline Network</span>
              <span className="text-[10px] text-gray-400">Test Priya cached responses</span>
            </div>
          </div>
          <button
            onClick={handleToggleOffline}
            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
              simOffline ? 'bg-amber-600' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                simOffline ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSpeakWeather(weatherText)}
            className="py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear with Priya</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || simOffline}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

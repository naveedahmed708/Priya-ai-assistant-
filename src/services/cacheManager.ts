/**
 * Priya Offline Cache Manager
 * Provides localStorage caching for:
 * - Weather data (live updates & offline persistence)
 * - Recent conversational turns & answers
 * - Local device intelligence when network is unavailable
 */

export interface CachedWeatherData {
  temp: number;
  condition: string;
  humidity: number;
  city: string;
  windSpeed: string;
  high: number;
  low: number;
  cachedAt: number;
  isStale?: boolean;
}

export interface CachedChatEntry {
  id: string;
  query: string;
  normalizedQuery: string;
  response: string;
  toolName?: string;
  timestamp: number;
}

const STORAGE_KEY_WEATHER = 'priya_cache_weather_v1';
const STORAGE_KEY_CHAT_HISTORY = 'priya_cache_chat_v1';
const STORAGE_KEY_OFFLINE_SIM = 'priya_sim_offline_mode';

export class CacheManager {
  private static instance: CacheManager;
  private weatherCache: CachedWeatherData | null = null;
  private chatEntries: CachedChatEntry[] = [];
  private isSimulatedOffline: boolean = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private loadFromStorage() {
    try {
      const weatherRaw = localStorage.getItem(STORAGE_KEY_WEATHER);
      if (weatherRaw) {
        this.weatherCache = JSON.parse(weatherRaw);
      } else {
        // Seed initial realistic weather data
        this.weatherCache = {
          temp: 31,
          condition: 'Clear',
          humidity: 56,
          city: 'Mumbai',
          windSpeed: '14 km/h',
          high: 34,
          low: 25,
          cachedAt: Date.now(),
        };
        this.saveWeather(this.weatherCache);
      }

      const chatRaw = localStorage.getItem(STORAGE_KEY_CHAT_HISTORY);
      if (chatRaw) {
        this.chatEntries = JSON.parse(chatRaw);
      } else {
        // Seed initial helpful offline responses
        this.chatEntries = [
          {
            id: 'c_init_1',
            query: 'Who are you?',
            normalizedQuery: 'who are you priya tum kaun ho',
            response: 'I am Priya, your voice-first Android AI assistant. I help you make calls, send SMS, manage reminders, and operate your device.',
            timestamp: Date.now() - 3600000,
          },
          {
            id: 'c_init_2',
            query: 'Weather report',
            normalizedQuery: 'weather mausam barish temperature weather today',
            response: 'According to our cached weather report, it is 31°C and Clear with 56% humidity.',
            timestamp: Date.now() - 1800000,
          },
          {
            id: 'c_init_3',
            query: 'Check my schedule',
            normalizedQuery: 'schedule reminder kal kya hai memories reminders meeting',
            response: 'You have a Dentist Appointment tomorrow at 10:30 AM with Dr. Verma saved in your memories.',
            timestamp: Date.now() - 1200000,
          },
        ];
        this.persistChatEntries();
      }

      const simRaw = localStorage.getItem(STORAGE_KEY_OFFLINE_SIM);
      this.isSimulatedOffline = simRaw === 'true';
    } catch (e) {
      console.warn('Failed to load localStorage cache:', e);
    }
  }

  // --- Weather Caching ---
  public getWeather(): CachedWeatherData {
    if (!this.weatherCache) {
      return {
        temp: 31,
        condition: 'Clear',
        humidity: 56,
        city: 'Mumbai',
        windSpeed: '14 km/h',
        high: 34,
        low: 25,
        cachedAt: Date.now(),
      };
    }
    // Mark as stale if older than 2 hours
    const isStale = Date.now() - this.weatherCache.cachedAt > 7200000;
    return { ...this.weatherCache, isStale };
  }

  public saveWeather(data: Partial<CachedWeatherData>): CachedWeatherData {
    const updated: CachedWeatherData = {
      ...(this.weatherCache || {
        temp: 31,
        condition: 'Clear',
        humidity: 56,
        city: 'Mumbai',
        windSpeed: '14 km/h',
        high: 34,
        low: 25,
        cachedAt: Date.now(),
      }),
      ...data,
      cachedAt: Date.now(),
      isStale: false,
    };
    this.weatherCache = updated;
    try {
      localStorage.setItem(STORAGE_KEY_WEATHER, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save weather cache:', e);
    }
    return updated;
  }

  // --- Chat Responses Caching ---
  public cacheTurn(query: string, response: string, toolName?: string) {
    if (!query.trim() || !response.trim()) return;

    const normalized = this.normalizeQuery(query);
    // Remove duplicate entry if exists
    this.chatEntries = this.chatEntries.filter(
      (e) => e.normalizedQuery !== normalized
    );

    const newEntry: CachedChatEntry = {
      id: 'c_' + Date.now(),
      query: query.trim(),
      normalizedQuery: normalized,
      response: response.trim(),
      toolName,
      timestamp: Date.now(),
    };

    // Keep most recent 50 turns
    this.chatEntries.unshift(newEntry);
    if (this.chatEntries.length > 50) {
      this.chatEntries = this.chatEntries.slice(0, 50);
    }
    this.persistChatEntries();
  }

  public getCachedResponse(query: string): CachedChatEntry | null {
    if (!query.trim()) return null;
    const target = this.normalizeQuery(query);

    // 1. Direct exact or substring match
    const exact = this.chatEntries.find(
      (e) => e.normalizedQuery === target || e.normalizedQuery.includes(target) || target.includes(e.normalizedQuery)
    );
    if (exact) return exact;

    // 2. Weather intent match
    if (
      target.includes('weather') ||
      target.includes('mausam') ||
      target.includes('temperature') ||
      target.includes('barish') ||
      target.includes('rain') ||
      target.includes('garmi')
    ) {
      const weather = this.getWeather();
      return {
        id: 'c_weather_match',
        query,
        normalizedQuery: target,
        response: `[Offline Cache] Abhi internet offline hai, par last cached data ke mutabiq ${weather.city} mein taapmaan ${weather.temp}°C ${weather.condition} hai aur humidity ${weather.humidity}% hai.`,
        timestamp: weather.cachedAt,
      };
    }

    // 3. Keyword fuzzy match
    const words = target.split(/\s+/).filter((w) => w.length > 3);
    for (const entry of this.chatEntries) {
      const matched = words.filter((w) => entry.normalizedQuery.includes(w));
      if (matched.length >= 2 || (words.length === 1 && matched.length === 1)) {
        return entry;
      }
    }

    return null;
  }

  public getRecentEntries(limit = 10): CachedChatEntry[] {
    return this.chatEntries.slice(0, limit);
  }

  public clearCache() {
    this.chatEntries = [];
    localStorage.removeItem(STORAGE_KEY_CHAT_HISTORY);
  }

  private persistChatEntries() {
    try {
      localStorage.setItem(
        STORAGE_KEY_CHAT_HISTORY,
        JSON.stringify(this.chatEntries)
      );
    } catch (e) {
      console.warn('Failed to persist chat cache:', e);
    }
  }

  private normalizeQuery(q: string): string {
    return q
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF\u0900-\u097F]/g, '')
      .trim();
  }

  // --- Network State & Offline Simulation ---
  public isNetworkOffline(): boolean {
    if (this.isSimulatedOffline) return true;
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return !navigator.onLine;
    }
    return false;
  }

  public setSimulatedOffline(val: boolean) {
    this.isSimulatedOffline = val;
    try {
      localStorage.setItem(STORAGE_KEY_OFFLINE_SIM, val ? 'true' : 'false');
    } catch {}
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }
}

export const cacheManager = CacheManager.getInstance();

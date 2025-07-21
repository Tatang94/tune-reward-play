import { Song } from './types';

// YouTube Music API integration using server-side ytmusicapi
export class YTMusicAPI {
  private static readonly BASE_URL = '/api/ytmusic';

  // Search songs using real YouTube Music API
  static async searchSongs(query: string): Promise<Song[]> {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(`${this.BASE_URL}/search?q=${encodeURIComponent(query)}&type=songs&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.songs || [];
    } catch (error) {
      console.error('Error searching songs:', error);
      throw new Error('Gagal mencari lagu. Pastikan koneksi internet stabil.');
    }
  }

  // Get trending songs from YouTube Music charts
  static async getTrendingSongs(): Promise<Song[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/charts`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.songs?.slice(0, 6) || [];
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      throw new Error('Gagal memuat lagu trending. Pastikan koneksi internet stabil.');
    }
  }

  // Get song details by ID
  static async getSongById(id: string): Promise<Song | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/song/${id}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.song || null;
    } catch (error) {
      console.error('Error fetching song details:', error);
      return null;
    }
  }

  // Get song stream URL
  static async getSongStreamUrl(videoId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/stream/${videoId}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.streamUrl || null;
    } catch (error) {
      console.error('Error getting stream URL:', error);
      return null;
    }
  }
}

// Helper functions for local storage
export const StorageKeys = {
  USER_DATA: 'musicapp_user',
  WITHDRAW_REQUESTS: 'musicapp_withdrawals',
  PLAY_HISTORY: 'musicapp_history'
} as const;

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};
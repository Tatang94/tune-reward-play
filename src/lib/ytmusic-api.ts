import { Song } from './types';

// Mock data for development - replace with actual ytmusicapi integration
const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: 200,
    thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    duration: 235,
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    duration: 194,
    thumbnail: 'https://i.ytimg.com/vi/DyDfgMOUjCI/maxresdefault.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '4',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    duration: 174,
    thumbnail: 'https://i.ytimg.com/vi/E07s5ZYygMg/maxresdefault.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: '5',
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: 203,
    thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/maxresdefault.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  }
];

export class YTMusicAPI {
  // Mock search function - will be replaced with actual ytmusicapi calls
  static async searchSongs(query: string): Promise<Song[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!query.trim()) return [];
    
    // Filter mock songs based on query
    return mockSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get trending songs
  static async getTrendingSongs(): Promise<Song[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSongs.slice(0, 3);
  }

  // Get song by ID
  static async getSongById(id: string): Promise<Song | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSongs.find(song => song.id === id) || null;
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
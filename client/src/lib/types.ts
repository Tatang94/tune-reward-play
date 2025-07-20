export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  audioUrl: string;
}

export interface User {
  id: string;
  balance: number;
  walletAddress?: string;
  totalEarnings: number;
  songsPlayed: number;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface PlayHistory {
  id: string;
  userId: string;
  songId: string;
  playedAt: string;
  duration: number;
  earnedAmount: number;
}
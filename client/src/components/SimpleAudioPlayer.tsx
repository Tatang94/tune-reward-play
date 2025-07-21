import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ExternalLink, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Song } from '@/lib/types';
import { getStorageData, setStorageData, StorageKeys } from '@/lib/ytmusic-api';

interface SimpleAudioPlayerProps {
  currentSong: Song | null;
  onSongComplete?: () => void;
  onEarningsUpdate?: (newBalance: number) => void;
}

export const SimpleAudioPlayer = ({ 
  currentSong, 
  onSongComplete, 
  onEarningsUpdate 
}: SimpleAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime] = useState(30); // Fixed 30 seconds for earning
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentSong && hasStartedPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalTime) {
            // Award earnings after 30 seconds
            const userData = getStorageData(StorageKeys.USER_DATA, {
              id: '1',
              balance: 0,
              totalEarnings: 0,
              songsPlayed: 0
            });
            
            const newBalance = userData.balance + 5;
            const updatedUser = {
              ...userData,
              balance: newBalance,
              totalEarnings: userData.totalEarnings + 5,
              songsPlayed: userData.songsPlayed + 1
            };
            
            setStorageData(StorageKeys.USER_DATA, updatedUser);
            onEarningsUpdate?.(newBalance);
            
            // Reset player
            setIsPlaying(false);
            setCurrentTime(0);
            setHasStartedPlaying(false);
            setShowPlayer(false);
            onSongComplete?.();
            
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSong, totalTime, onSongComplete, onEarningsUpdate, hasStartedPlaying]);

  const handlePlayPause = () => {
    if (!currentSong) return;
    
    if (!isPlaying) {
      setHasStartedPlaying(true);
      setShowPlayer(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (!currentSong) {
    return (
      <Card className="p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 rounded-full flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Pemutar Musik</h3>
            <p className="text-muted-foreground">Pilih lagu dari tab "Temukan Musik" untuk mulai mendengarkan</p>
          </div>
        </div>
      </Card>
    );
  }

  const videoId = getYouTubeVideoId(currentSong.audioUrl);

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <div className="flex flex-col gap-6">
        {/* Song Info */}
        <div className="flex gap-4">
          <img 
            src={currentSong.thumbnail} 
            alt={currentSong.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{currentSong.title}</h3>
            <p className="text-muted-foreground mb-2">{currentSong.artist}</p>
            <div className="text-sm text-success font-medium">
              💰 Reward: Rp 5 setelah 30 detik
            </div>
          </div>
        </div>

        {/* YouTube Player */}
        {videoId && showPlayer && (
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&start=0`}
              title={currentSong.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg"
            />
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              🎵 Player Aktif
            </div>
          </div>
        )}

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <Button
              onClick={() => window.open(currentSong.audioUrl, '_blank')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Buka di YouTube
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Audio Player</span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-md text-center">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 border">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-linear flex items-center justify-end pr-1"
                style={{ width: `${(currentTime / totalTime) * 100}%` }}
              >
                {currentTime > 0 && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </div>
            </div>
            {isPlaying && (
              <p className="text-sm text-success mt-2 font-medium">
                ⏱️ Mendengarkan untuk mendapat Rp 5... ({totalTime - currentTime}s lagi)
              </p>
            )}
            {!isPlaying && hasStartedPlaying && (
              <p className="text-xs text-muted-foreground mt-2">
                ⏸️ Tekan Play untuk melanjutkan dan mendapat reward
              </p>
            )}
            {!hasStartedPlaying && (
              <p className="text-xs text-muted-foreground mt-2">
                🎵 Tekan Play untuk mulai mendengarkan dan mendapat reward
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
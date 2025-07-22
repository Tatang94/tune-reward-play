import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ExternalLink, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Song } from '@/lib/types';
import { getStorageData, setStorageData, StorageKeys } from '@/lib/ytmusic-api';

// Declare YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [rewardCounter, setRewardCounter] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<string>(`youtube-player-${Date.now()}`);
  
  // Extract video ID from YouTube URL for player
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = currentSong ? getYouTubeVideoId(currentSong.audioUrl) : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentSong && hasStartedPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Give reward every 30 seconds
          if (newTime > 0 && newTime % 30 === 0) {
            const userData = getStorageData(StorageKeys.USER_DATA, {
              id: '1',
              balance: 0,
              totalEarnings: 0,
              songsPlayed: 0
            });
            
            const newBalance = userData.balance + 1;
            const updatedUser = {
              ...userData,
              balance: newBalance,
              totalEarnings: userData.totalEarnings + 1,
            };
            
            setStorageData(StorageKeys.USER_DATA, updatedUser);
            onEarningsUpdate?.(newBalance);
            setTotalRewards(prev => prev + 1);
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSong, onEarningsUpdate, hasStartedPlaying]);

  // Reset timers when song changes
  useEffect(() => {
    setCurrentTime(0);
    setRewardCounter(0);
    setTotalRewards(0);
    setHasStartedPlaying(false);
    setShowPlayer(false);
    setIsPlaying(false);
  }, [currentSong]);

  // Load YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player when showPlayer changes
  useEffect(() => {
    if (showPlayer && videoId && window.YT && window.YT.Player) {
      initializePlayer();
    }
  }, [showPlayer, videoId]);

  const initializePlayer = () => {
    if (!videoId) return;
    
    const containerId = playerContainerRef.current;
    playerRef.current = new window.YT.Player(containerId, {
      height: '200',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0, // Hide YouTube controls
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        disablekb: 1, // Disable keyboard controls
        fs: 0, // Disable fullscreen button
        iv_load_policy: 3, // Hide annotations
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          }
        }
      }
    });
  };

  const handlePlayPause = () => {
    if (!currentSong) return;
    
    if (!hasStartedPlaying) {
      setHasStartedPlaying(true);
      setShowPlayer(true);
      // Player will be initialized by useEffect
      setTimeout(() => {
        if (playerRef.current && playerRef.current.playVideo) {
          playerRef.current.playVideo();
        }
      }, 1000);
    } else if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <p className="text-muted-foreground">Admin belum mengatur lagu untuk diputar.</p>
            <p className="text-sm text-muted-foreground mt-2">Akses admin panel di <a href="/monk" className="text-primary hover:underline">/monk</a> untuk menambah musik.</p>
          </div>
        </div>
      </Card>
    );
  }



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
              💰 Reward: Rp 1 per 30 detik
              {totalRewards > 0 && (
                <span className="ml-2 text-green-600 font-bold">
                  (+Rp {totalRewards} diterima)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* YouTube Player */}
        {videoId && showPlayer && (
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden max-w-md mx-auto">
            <div
              id={playerContainerRef.current}
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
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Audio Player</span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-md text-center">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{formatTime(currentTime)}</span>
              <span className="text-green-600 font-medium">Rp {totalRewards}</span>
            </div>
            
            {/* Progress bar for next reward */}
            <div className="w-full bg-muted rounded-full h-3 border mb-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-linear flex items-center justify-end pr-1"
                style={{ width: `${((currentTime % 30) / 30) * 100}%` }}
              >
                {currentTime > 0 && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </div>
            </div>
            
            {isPlaying && (
              <p className="text-sm text-success mt-2 font-medium">
                ⏱️ Reward berikutnya dalam {30 - (currentTime % 30)}s | Total: Rp {totalRewards}
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
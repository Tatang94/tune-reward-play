import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Song, User } from '@/lib/types';
import { StorageKeys, getStorageData, setStorageData } from '@/lib/ytmusic-api';
import { useToast } from '@/hooks/use-toast';

interface SimpleAudioPlayerProps {
  currentSong: Song | null;
  onSongComplete: () => void;
  onEarningsUpdate: (newBalance: number) => void;
}

export function SimpleAudioPlayer({ currentSong, onSongComplete, onEarningsUpdate }: SimpleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default 3 minutes
  const [hasEarned, setHasEarned] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentSong) return;
    
    setHasEarned(false);
    setCurrentTime(0);
    setIsPlaying(false);
    setDuration(180); // Reset to 3 minutes for demo
  }, [currentSong]);

  // Simulate playback progress for reward system
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentSong) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Award earnings after 30 seconds
          if (!hasEarned && newTime >= 30) {
            awardEarnings();
            setHasEarned(true);
          }
          
          // Auto complete after duration
          if (newTime >= duration) {
            setIsPlaying(false);
            onSongComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, hasEarned, duration, onSongComplete, currentSong]);

  const awardEarnings = () => {
    const userData = getStorageData<User>(StorageKeys.USER_DATA, {
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
    onEarningsUpdate(newBalance);

    toast({
      title: "Selamat! 🎉",
      description: "Anda mendapat Rp 5 karena telah mendengarkan lagu selama 30 detik!",
      className: "bg-success text-success-foreground"
    });
  };

  const togglePlayPause = () => {
    if (!currentSong) return;
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Open YouTube in new tab for actual music listening
      window.open(`https://music.youtube.com/watch?v=${currentSong.id}`, '_blank');
    }
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return (
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="text-center text-muted-foreground">
          <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Pilih lagu untuk mulai memutar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      {/* Visual Player */}
      <div className="mb-4 relative">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
          <img 
            src={currentSong.thumbnail} 
            alt={currentSong.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
          <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg mr-4"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
            <Button
              onClick={() => window.open(`https://music.youtube.com/watch?v=${currentSong.id}`, '_blank')}
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full shadow-lg"
            >
              <ExternalLink className="h-8 w-8" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Song Info */}
      <div className="flex items-center gap-4 mb-6">
        <img 
          src={currentSong.thumbnail} 
          alt={currentSong.title}
          className="w-16 h-16 rounded-lg object-cover shadow-glow"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{currentSong.title}</h3>
          <p className="text-muted-foreground">{currentSong.artist}</p>
          <p className="text-xs text-muted-foreground">Klik Play untuk mendengarkan di YouTube Music</p>
        </div>
        {currentTime >= 30 && hasEarned && (
          <div className="text-right">
            <div className="text-success font-semibold">+Rp 5</div>
            <div className="text-xs text-muted-foreground">Earned!</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button variant="ghost" size="icon" className="hover:bg-secondary">
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={togglePlayPause}
          size="lg"
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>
        
        <Button variant="ghost" size="icon" className="hover:bg-secondary">
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[70]}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-8">70</span>
      </div>

      {/* Play Status */}
      {isPlaying && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-primary font-medium">
            ⏯️ Sedang bermain di YouTube Music
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Timer reward akan terus berjalan selama Anda mendengarkan
          </p>
        </div>
      )}
    </Card>
  );
}
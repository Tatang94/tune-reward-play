import { useState, useEffect } from 'react';
import { Play, Pause, ExternalLink, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  const [progress, setProgress] = useState(0);
  const [hasEarned, setHasEarned] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { toast } = useToast();

  // Timer untuk simulasi playback dan earnings
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentSong && !hasEarned) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          setProgress(((30 - newTime) / 30) * 100);

          if (newTime <= 0) {
            awardEarnings();
            setHasEarned(true);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSong, hasEarned]);

  // Reset saat lagu berubah
  useEffect(() => {
    if (currentSong) {
      setHasEarned(false);
      setProgress(0);
      setTimeRemaining(30);
      setIsPlaying(false);
    }
  }, [currentSong]);

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
    });
  };

  const togglePlayPause = () => {
    if (!currentSong) return;

    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // Buka YouTube Music di tab baru untuk listening experience
      window.open(`https://music.youtube.com/watch?v=${currentSong.id}`, '_blank');
      setIsPlaying(true);
      
      toast({
        title: "🎵 Musik sedang diputar",
        description: "YouTube Music dibuka di tab baru. Timer reward dimulai!",
      });
    }
  };

  if (!currentSong) {
    return (
      <Card className="p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 rounded-full flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Pilih Lagu untuk Diputar</h3>
            <p className="text-muted-foreground">Pilih lagu dari tab "Temukan Musik" untuk mulai mendengarkan dan mendapat reward</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative">
          <img 
            src={currentSong.thumbnail} 
            alt={currentSong.title}
            className="w-20 h-20 object-cover rounded-lg shadow-md"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Song Info dan Controls */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 leading-tight">{currentSong.title}</h3>
          <p className="text-muted-foreground mb-3">{currentSong.artist}</p>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={togglePlayPause}
              size="lg"
              className={`w-12 h-12 rounded-full ${
                isPlaying 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://music.youtube.com/watch?v=${currentSong.id}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              YouTube Music
            </Button>
          </div>
        </div>
      </div>

      {/* Progress dan Earnings Info */}
      {isPlaying && !hasEarned && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress untuk reward:</span>
            <span className="text-sm text-green-600 font-mono">{timeRemaining}s</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Dengarkan selama 30 detik untuk mendapat Rp 5
          </p>
        </div>
      )}

      {hasEarned && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Reward sudah diterima! Rp 5 ditambahkan ke saldo Anda</span>
          </div>
        </div>
      )}
    </Card>
  );
}
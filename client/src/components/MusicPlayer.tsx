import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Song, User } from '@/lib/types';
import { StorageKeys, getStorageData, setStorageData } from '@/lib/ytmusic-api';
import { useToast } from '@/hooks/use-toast';

interface MusicPlayerProps {
  currentSong: Song | null;
  onSongComplete: () => void;
  onEarningsUpdate: (newBalance: number) => void;
}

export function MusicPlayer({ currentSong, onSongComplete, onEarningsUpdate }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [hasEarned, setHasEarned] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.audioUrl;
    audio.volume = volume / 100;
    setHasEarned(false);
    setCurrentTime(0);
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Award earnings after 30 seconds
      if (!hasEarned && audio.currentTime >= 30) {
        awardEarnings();
        setHasEarned(true);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onSongComplete();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, hasEarned, onSongComplete]);

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
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume / 100;
    }
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
      <audio ref={audioRef} />
      
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
        </div>
        {currentTime >= 30 && hasEarned && (
          <div className="text-right">
            <div className="text-success font-semibold">+Rp 50</div>
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
          size="icon"
          className="h-12 w-12 bg-primary hover:bg-primary/90 shadow-glow"
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
          value={[volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-8">{volume}</span>
      </div>

      {/* Earning Progress */}
      {currentTime < 30 && (
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span>Dengarkan {30 - Math.floor(currentTime)} detik lagi untuk mendapat Rp 5</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
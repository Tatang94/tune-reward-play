import { Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Song } from '@/lib/types';

interface SimpleAudioPlayerProps {
  currentSong: Song | null;
  onSongComplete: () => void;
  onEarningsUpdate: (newBalance: number) => void;
}

export function SimpleAudioPlayer({ currentSong }: SimpleAudioPlayerProps) {
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

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <div className="flex items-start gap-4">
        <img 
          src={currentSong.thumbnail} 
          alt={currentSong.title}
          className="w-20 h-20 object-cover rounded-lg shadow-md"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 leading-tight">{currentSong.title}</h3>
          <p className="text-muted-foreground mb-3">{currentSong.artist}</p>
          <p className="text-sm text-muted-foreground">Pemutar akan segera tersedia</p>
        </div>
      </div>
    </Card>
  );
}
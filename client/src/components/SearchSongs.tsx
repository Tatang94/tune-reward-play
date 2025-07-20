import { useState } from 'react';
import { Search, Play, Music, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { YTMusicAPI } from '@/lib/ytmusic-api';
import { Song } from '@/lib/types';

interface SearchSongsProps {
  onSongSelect: (song: Song) => void;
}

export function SearchSongs({ onSongSelect }: SearchSongsProps) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await YTMusicAPI.searchSongs(query);
      setSongs(results);
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari lagu atau artis..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading || !query.trim()}
            className="bg-primary hover:bg-primary/90 shadow-glow"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Cari
          </Button>
        </div>
      </Card>

      {/* Search Results */}
      {loading && (
        <Card className="p-8 bg-gradient-card border-border/50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Mencari lagu...</p>
          </div>
        </Card>
      )}

      {!loading && searched && songs.length === 0 && (
        <Card className="p-8 bg-gradient-card border-border/50">
          <div className="text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada hasil</h3>
            <p className="text-muted-foreground">
              Coba kata kunci yang berbeda untuk menemukan lagu yang Anda cari.
            </p>
          </div>
        </Card>
      )}

      {songs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Hasil Pencarian ({songs.length} lagu)
          </h3>
          
          {songs.map((song) => (
            <Card 
              key={song.id} 
              className="p-4 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={song.thumbnail} 
                    alt={song.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {song.title}
                  </h4>
                  <p className="text-muted-foreground">{song.artist}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(song.duration)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Button 
                    onClick={() => onSongSelect(song)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 shadow-glow"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Putar
                  </Button>
                  <div className="text-xs text-success font-medium">
                    +Rp 50 / 30s
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
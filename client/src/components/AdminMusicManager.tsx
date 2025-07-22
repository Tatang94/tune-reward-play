import { useState, useEffect } from 'react';
import { Search, Plus, X, Move, Eye, EyeOff, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
  audioUrl?: string;
}

interface FeaturedSong {
  id: number;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  isActive: boolean;
  displayOrder: number;
}

export function AdminMusicManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get featured songs
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['/api/admin/featured-songs'],
  });

  const featuredSongs = (featuredData as { songs?: FeaturedSong[] })?.songs || [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/ytmusic/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSearchResults(data.songs || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Error',
        description: 'Gagal mencari lagu. Pastikan koneksi internet stabil.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addToFeaturedMutation = useMutation({
    mutationFn: async (song: Song) => {
      return await apiRequest('/api/admin/featured-songs', {
        method: 'POST',
        body: JSON.stringify({
          videoId: song.id,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          duration: song.duration || 180,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-songs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ytmusic/charts'] });
      toast({
        title: 'Berhasil',
        description: 'Lagu ditambahkan ke daftar featured',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menambahkan lagu',
        variant: 'destructive',
      });
    },
  });

  const removeFeaturedMutation = useMutation({
    mutationFn: async (songId: number) => {
      return await apiRequest(`/api/admin/featured-songs/${songId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-songs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ytmusic/charts'] });
      toast({
        title: 'Berhasil',
        description: 'Lagu dihapus dari daftar featured',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Gagal menghapus lagu',
        variant: 'destructive',
      });
    },
  });

  const toggleSongMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/admin/featured-songs/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-songs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ytmusic/charts'] });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Cari & Tambah Lagu
        </h3>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu di YouTube..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Mencari...' : 'Cari'}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-sm text-muted-foreground">
              Hasil Pencarian ({searchResults.length})
            </h4>
            {searchResults.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium truncate">{song.title}</h5>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist}
                  </p>
                  {song.duration && (
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(song.duration)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => addToFeaturedMutation.mutate(song)}
                  disabled={addToFeaturedMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Featured Songs Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Music className="h-5 w-5" />
          Daftar Lagu Featured ({featuredSongs.length || 0})
        </h3>
        
        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : featuredSongs.length === 0 ? (
          <div className="text-center py-8">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada lagu featured</p>
            <p className="text-sm text-muted-foreground">
              Gunakan pencarian di atas untuk menambah lagu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {featuredSongs.map((song: FeaturedSong, index: number) => (
              <div
                key={song.id}
                className={`flex items-center gap-3 p-4 border rounded-lg ${
                  !song.isActive ? 'opacity-60 bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Move className="h-4 w-4" />
                  #{index + 1}
                </div>
                
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-16 h-16 rounded object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium truncate">{song.title}</h5>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(song.duration)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={song.isActive ? 'default' : 'secondary'}>
                    {song.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => 
                      toggleSongMutation.mutate({ 
                        id: song.id, 
                        isActive: !song.isActive 
                      })
                    }
                  >
                    {song.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFeaturedMutation.mutate(song.id)}
                    disabled={removeFeaturedMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
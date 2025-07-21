import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Music, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
}

export default function FeaturedSongsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get featured songs
  const { data: featuredSongs, isLoading } = useQuery({
    queryKey: ["/api/admin/featured-songs"],
    enabled: !!localStorage.getItem("adminToken"),
  });

  // Search songs mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/ytmusic/search?q=${encodeURIComponent(query)}&limit=20`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.songs || []);
      setIsSearching(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mencari lagu",
        variant: "destructive",
      });
      setIsSearching(false);
    },
  });

  // Add featured song mutation
  const addSongMutation = useMutation({
    mutationFn: async (song: Omit<FeaturedSong, "id" | "isActive" | "displayOrder">) => {
      const songs = (featuredSongs as any)?.songs || [];
      return apiRequest("/api/admin/featured-songs", {
        method: "POST",
        body: JSON.stringify({
          ...song,
          displayOrder: songs.length + 1,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-songs"] });
      toast({
        title: "Berhasil",
        description: "Lagu berhasil ditambahkan ke featured songs",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Gagal menambahkan lagu",
        variant: "destructive",
      });
    },
  });

  // Remove featured song mutation
  const removeSongMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/featured-songs/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-songs"] });
      toast({
        title: "Berhasil",
        description: "Lagu berhasil dihapus dari featured songs",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus lagu",
        variant: "destructive",
      });
    },
  });

  // Update song order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: "up" | "down" }) => {
      const songs = (featuredSongs as any)?.songs || [];
      const currentSong = songs.find((s: FeaturedSong) => s.id === id);
      if (!currentSong) return;

      const currentOrder = currentSong.displayOrder;
      const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;

      return apiRequest(`/api/admin/featured-songs/${id}/order`, {
        method: "PATCH",
        body: JSON.stringify({ displayOrder: newOrder }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/featured-songs"] });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    searchMutation.mutate(searchQuery);
  };

  const handleAddSong = (song: SearchResult) => {
    addSongMutation.mutate({
      videoId: song.id,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail,
      duration: song.duration,
    });
  };

  const songs = (featuredSongs as any)?.songs || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Kelola Musik Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Cari lagu untuk ditambahkan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? "Mencari..." : "Cari"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Hasil Pencarian:</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddSong(song)}
                      disabled={addSongMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Songs List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Musik Trending Saat Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Memuat...</p>
          ) : songs.length === 0 ? (
            <p className="text-muted-foreground">
              Belum ada musik trending yang diatur. Cari dan tambahkan lagu di atas.
            </p>
          ) : (
            <div className="space-y-3">
              {songs
                .sort((a: FeaturedSong, b: FeaturedSong) => a.displayOrder - b.displayOrder)
                .map((song: FeaturedSong) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">#{song.displayOrder}</Badge>
                          <Badge variant={song.isActive ? "default" : "secondary"}>
                            {song.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderMutation.mutate({ id: song.id, direction: "up" })}
                        disabled={song.displayOrder === 1}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderMutation.mutate({ id: song.id, direction: "down" })}
                        disabled={song.displayOrder === songs.length}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeSongMutation.mutate(song.id)}
                        disabled={removeSongMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Music, TrendingUp, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Removed SearchSongs - only admin can add music
import { SimpleAudioPlayer } from '@/components/SimpleAudioPlayer';
import { UserDashboard } from '@/components/UserDashboard';
import { Song, User } from '@/lib/types';
import { YTMusicAPI, StorageKeys, getStorageData } from '@/lib/ytmusic-api';

const Index = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);


  useEffect(() => {
    // Load user balance
    const userData = getStorageData<User>(StorageKeys.USER_DATA, {
      id: '1',
      balance: 0,
      totalEarnings: 0,
      songsPlayed: 0
    });
    setCurrentBalance(userData.balance);

    // Load trending songs
    loadTrendingSongs();
  }, []);

  const loadTrendingSongs = async () => {
    try {
      const songs = await YTMusicAPI.getTrendingSongs();
      setTrendingSongs(songs);
    } catch (error) {
      console.error('Failed to load trending songs:', error);
    }
  };

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
  };

  const handleSongComplete = () => {
    // Auto-play next trending song if available
    if (trendingSongs.length > 0) {
      const currentIndex = trendingSongs.findIndex(s => s.id === currentSong?.id);
      const nextIndex = (currentIndex + 1) % trendingSongs.length;
      setCurrentSong(trendingSongs[nextIndex]);
    }
  };

  const handleEarningsUpdate = (newBalance: number) => {
    setCurrentBalance(newBalance);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MusicReward</h1>
                <p className="text-sm text-muted-foreground">Dengarkan musik, dapatkan reward</p>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 rounded-xl shadow-md">
              <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
              <div className="relative z-10 text-center">
                <p className="text-xs font-medium text-white/80 tracking-wide">Saldo Anda</p>
                <p className="text-xl font-bold text-white">Rp {currentBalance.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lagu Trending
            </TabsTrigger>
            <TabsTrigger value="player" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Pemutar
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6 mt-6">
            {/* Trending Songs */}
            {trendingSongs.length > 0 ? (
              <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Lagu Trending (Dikelola Admin)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingSongs.map((song) => (
                    <Card 
                      key={song.id}
                      className="p-4 bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => handleSongSelect(song)}
                    >
                      <div className="relative mb-3">
                        <img 
                          src={song.thumbnail} 
                          alt={song.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                          <Music className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-muted-foreground text-xs">{song.artist}</p>
                      <div className="mt-2 text-xs text-success font-medium">
                        +Rp 5 / 30s
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center bg-gradient-card border-border/50 shadow-card">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Music className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Belum Ada Lagu Trending</h3>
                    <p className="text-muted-foreground">Admin belum menambahkan lagu trending. Silakan hubungi admin untuk menambahkan musik.</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="player" className="mt-6">
            <SimpleAudioPlayer 
              currentSong={currentSong}
              onSongComplete={handleSongComplete}
              onEarningsUpdate={handleEarningsUpdate}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <UserDashboard currentBalance={currentBalance} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

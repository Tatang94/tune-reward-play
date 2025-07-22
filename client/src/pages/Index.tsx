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
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user balance
    const userData = getStorageData<User>(StorageKeys.USER_DATA, {
      id: '1',
      balance: 0,
      totalEarnings: 0,
      songsPlayed: 0
    });
    setCurrentBalance(userData.balance);

    // Load featured songs added by admin
    loadFeaturedSongs();
  }, []);

  const loadFeaturedSongs = async () => {
    try {
      setIsLoading(true);
      const songs = await YTMusicAPI.getFeaturedSongs();
      setFeaturedSongs(songs);
    } catch (error) {
      console.error('Failed to load featured songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongComplete = () => {
    // Song completed - user can play again
    console.log('Song completed');
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
            
            <div className="relative bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-2 rounded-lg shadow-md">
              <div className="absolute inset-0 bg-white/10 rounded-lg backdrop-blur-sm"></div>
              <div className="relative z-10 text-center">
                <p className="text-xs font-medium text-white/80 tracking-wide">Saldo Anda</p>
                <p className="text-sm font-bold text-white">Rp {currentBalance.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50">
            <TabsTrigger value="player" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Pemutar
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="mt-6">
            {isLoading ? (
              <Card className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Memuat lagu...</p>
                </div>
              </Card>
            ) : (
              <SimpleAudioPlayer 
                currentSong={featuredSongs.length > 0 ? featuredSongs[0] : null}
                onSongComplete={handleSongComplete}
                onEarningsUpdate={handleEarningsUpdate}
              />
            )}
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

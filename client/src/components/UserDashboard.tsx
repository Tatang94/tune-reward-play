import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Music, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, WithdrawRequest } from '@/lib/types';
import { StorageKeys, getStorageData, setStorageData } from '@/lib/ytmusic-api';
import { useToast } from '@/hooks/use-toast';

interface UserDashboardProps {
  currentBalance: number;
}

export function UserDashboard({ currentBalance }: UserDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load user data
    const userData = getStorageData<User>(StorageKeys.USER_DATA, {
      id: '1',
      balance: 0,
      totalEarnings: 0,
      songsPlayed: 0
    });
    setUser(userData);
    setWalletAddress(userData.walletAddress || '');

    // Load withdraw history
    const history = getStorageData<WithdrawRequest[]>(StorageKeys.WITHDRAW_REQUESTS, []);
    setWithdrawHistory(history.filter(req => req.userId === userData.id));
  }, [currentBalance]);

  const handleWithdraw = () => {
    if (!user) return;

    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 100) {
      toast({
        title: "Error",
        description: "Minimum penarikan adalah Rp 100",
        variant: "destructive"
      });
      return;
    }

    if (amount > currentBalance) {
      toast({
        title: "Error", 
        description: "Saldo tidak mencukupi",
        variant: "destructive"
      });
      return;
    }

    if (!walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Silakan masukkan alamat wallet",
        variant: "destructive"
      });
      return;
    }

    // Create withdraw request
    const withdrawRequest: WithdrawRequest = {
      id: Date.now().toString(),
      userId: user.id,
      amount,
      walletAddress: walletAddress.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Update user balance
    const updatedUser = {
      ...user,
      balance: currentBalance - amount,
      walletAddress: walletAddress.trim()
    };

    // Update storage
    setStorageData(StorageKeys.USER_DATA, updatedUser);
    
    const allWithdrawRequests = getStorageData<WithdrawRequest[]>(StorageKeys.WITHDRAW_REQUESTS, []);
    allWithdrawRequests.push(withdrawRequest);
    setStorageData(StorageKeys.WITHDRAW_REQUESTS, allWithdrawRequests);

    // Update local state
    setUser(updatedUser);
    setWithdrawHistory([withdrawRequest, ...withdrawHistory]);
    setWithdrawAmount('');

    toast({
      title: "Permintaan Penarikan Berhasil",
      description: `Permintaan penarikan Rp ${amount.toLocaleString('id-ID')} telah disubmit dan sedang diproses.`,
      className: "bg-success text-success-foreground"
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(user.totalEarnings)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 rounded-lg">
              <Music className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lagu Diputar</p>
              <p className="text-2xl font-bold text-foreground">
                {user.songsPlayed}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Withdraw Section */}
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Tarik Saldo
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="wallet">Alamat Wallet</Label>
            <Input
              id="wallet"
              placeholder="Masukkan alamat wallet Anda"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="bg-background/50 border-border"
            />
          </div>

          <div>
            <Label htmlFor="amount">Jumlah Penarikan (Minimum Rp 100)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-background/50 border-border"
            />
          </div>

          <Button 
            onClick={handleWithdraw}
            disabled={currentBalance < 100}
            className="w-full bg-primary hover:bg-primary/90 shadow-glow"
          >
            <Download className="h-4 w-4 mr-2" />
            Tarik Saldo
          </Button>

          {currentBalance < 100 && (
            <p className="text-sm text-muted-foreground text-center">
              Saldo minimum untuk penarikan adalah Rp 100
            </p>
          )}
        </div>
      </Card>

      {/* Withdraw History */}
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Riwayat Penarikan</h3>
        
        {withdrawHistory.length === 0 ? (
          <div className="text-center py-8">
            <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada riwayat penarikan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawHistory.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{formatCurrency(request.amount)}</span>
                    <Badge 
                      variant={
                        request.status === 'approved' ? 'default' : 
                        request.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {request.status === 'pending' ? 'Menunggu' :
                       request.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(request.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.walletAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Users, DollarSign, ArrowLeft, LogOut, Music, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AdminMusicManager } from '@/components/AdminMusicManager';
import { AdSettingsManager } from '@/components/AdSettingsManager';

interface WithdrawRequest {
  id: number;
  userId: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export function AdminDashboard() {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadWithdrawRequests();
  }, []);

  const loadWithdrawRequests = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals');

      if (response.ok) {
        const data = await response.json();
        const requests = data.requests || [];
        setWithdrawRequests(requests.sort((a: WithdrawRequest, b: WithdrawRequest) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        
        // Calculate stats
        const total = requests.length;
        const pending = requests.filter((r: WithdrawRequest) => r.status === 'pending').length;
        const approved = requests.filter((r: WithdrawRequest) => r.status === 'approved').length;
        const rejected = requests.filter((r: WithdrawRequest) => r.status === 'rejected').length;
        const totalAmount = requests.reduce((sum: number, r: WithdrawRequest) => sum + r.amount, 0);
        
        setStats({ total, pending, approved, rejected, totalAmount });
      }
    } catch (error) {
      console.error('Failed to load withdraw requests:', error);
    }
  };

  const updateRequestStatus = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/withdrawals/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await loadWithdrawRequests(); // Refresh data
        toast({
          title: "Status Diperbarui",
          description: `Permintaan penarikan ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
          className: status === 'approved' ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update withdraw request:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status permintaan",
        variant: "destructive"
      });
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Menunggu</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-success text-success-foreground"><CheckCircle className="h-3 w-3" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 -mx-4 -mt-8 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-sm">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel Admin</h1>
              <p className="text-sm text-muted-foreground">
                Akses Langsung - Kelola MusicReward
              </p>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="outline" size="sm" className="border-border hover:bg-accent/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="pt-6">

        <Tabs defaultValue="withdrawals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50">
            <TabsTrigger value="withdrawals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="h-4 w-4" />
              Penarikan Dana
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Music className="h-4 w-4" />
              Kelola Musik
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              Pengaturan Iklan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals" className="space-y-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Permintaan</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/20 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Nilai</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Withdraw Requests Table */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Permintaan Penarikan</h3>
          </div>
          
          <div className="p-6">
            {withdrawRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Belum ada permintaan penarikan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Alamat Wallet</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">
                          #{String(request.id).padStart(6, '0')}
                        </TableCell>
                        <TableCell>
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(request.amount)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {request.walletAddress}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'approved')}
                                className="bg-success hover:bg-success/90 text-success-foreground"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {request.processedAt && formatDate(request.processedAt)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <AdminMusicManager />
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <AdSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
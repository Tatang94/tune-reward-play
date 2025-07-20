import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { WithdrawRequest } from '@/lib/types';
import { StorageKeys, getStorageData, setStorageData } from '@/lib/ytmusic-api';
import { useToast } from '@/hooks/use-toast';

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

  const loadWithdrawRequests = () => {
    const requests = getStorageData<WithdrawRequest[]>(StorageKeys.WITHDRAW_REQUESTS, []);
    setWithdrawRequests(requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    
    // Calculate stats
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0);
    
    setStats({ total, pending, approved, rejected, totalAmount });
  };

  const updateRequestStatus = (requestId: string, status: 'approved' | 'rejected') => {
    const updatedRequests = withdrawRequests.map(request => 
      request.id === requestId 
        ? { ...request, status, processedAt: new Date().toISOString() }
        : request
    );
    
    setStorageData(StorageKeys.WITHDRAW_REQUESTS, updatedRequests);
    setWithdrawRequests(updatedRequests);
    loadWithdrawRequests(); // Refresh stats
    
    toast({
      title: "Status Diperbarui",
      description: `Permintaan penarikan ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      className: status === 'approved' ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola permintaan penarikan pengguna</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        #{request.id.slice(-6)}
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
    </div>
  );
}
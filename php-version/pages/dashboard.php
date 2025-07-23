<!-- User Dashboard Page -->
<div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">
            <i class="fas fa-tachometer-alt text-blue-600 mr-3"></i>
            Dashboard User
        </h1>
        <p class="text-gray-600">Kelola saldo dan penghasilan Anda</p>
    </div>

    <!-- Balance & Stats Cards -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Current Balance -->
        <div class="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i class="fas fa-wallet text-2xl"></i>
                </div>
                <div class="text-right">
                    <p class="text-green-100 text-sm">Saldo Tersedia</p>
                    <p class="text-2xl font-bold" id="dashboard-balance">
                        <?php echo formatCurrency(getUserBalance($pdo, getUserId())); ?>
                    </p>
                </div>
            </div>
            <div class="flex items-center text-green-100">
                <i class="fas fa-arrow-up mr-2"></i>
                <span class="text-sm">Terus bertambah setiap 30 detik</span>
            </div>
        </div>

        <!-- Today's Earnings -->
        <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i class="fas fa-coins text-2xl"></i>
                </div>
                <div class="text-right">
                    <p class="text-blue-100 text-sm">Penghasilan Hari Ini</p>
                    <p class="text-2xl font-bold" id="today-earnings">
                        <?php 
                        $today_earnings = $_SESSION['today_earnings'] ?? 0;
                        echo formatCurrency($today_earnings); 
                        ?>
                    </p>
                </div>
            </div>
            <div class="flex items-center text-blue-100">
                <i class="fas fa-calendar-day mr-2"></i>
                <span class="text-sm"><?php echo date('d M Y'); ?></span>
            </div>
        </div>

        <!-- Total Listening Time -->
        <div class="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i class="fas fa-clock text-2xl"></i>
                </div>
                <div class="text-right">
                    <p class="text-purple-100 text-sm">Waktu Mendengar</p>
                    <p class="text-2xl font-bold" id="listening-time">
                        <?php 
                        $listening_minutes = $_SESSION['listening_time'] ?? 0;
                        echo floor($listening_minutes / 60) . 'h ' . ($listening_minutes % 60) . 'm';
                        ?>
                    </p>
                </div>
            </div>
            <div class="flex items-center text-purple-100">
                <i class="fas fa-headphones mr-2"></i>
                <span class="text-sm">Total hari ini</span>
            </div>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-8">
        <!-- Withdrawal Section -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-credit-card text-green-600 mr-3"></i>
                Penarikan Dana
            </h2>

            <!-- Minimum Balance Notice -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-yellow-500 mr-3 mt-1"></i>
                    <div>
                        <p class="text-yellow-800 font-medium">Minimum Penarikan: Rp 10.000</p>
                        <p class="text-yellow-700 text-sm mt-1">
                            Saldo Anda saat ini: <span class="font-medium"><?php echo formatCurrency(getUserBalance($pdo, getUserId())); ?></span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Withdrawal Form -->
            <form id="withdrawal-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Penarikan (Rp)
                    </label>
                    <input type="number" 
                           id="withdrawal-amount" 
                           name="amount"
                           min="10000" 
                           max="<?php echo (int)(getUserBalance($pdo, getUserId()) * 100); ?>"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Masukkan jumlah (min. 10.000)">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Dompet / Rekening
                    </label>
                    <textarea id="wallet-address"
                              name="wallet_address"
                              rows="3"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan alamat dompet crypto atau nomor rekening bank"></textarea>
                </div>
                
                <button type="submit" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    <i class="fas fa-paper-plane mr-2"></i>
                    Ajukan Penarikan
                </button>
            </form>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-history text-blue-600 mr-3"></i>
                Aktivitas Terbaru
            </h2>

            <div id="recent-activities" class="space-y-4 max-h-96 overflow-y-auto">
                <!-- Recent activities will be loaded here -->
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-music text-3xl mb-3"></i>
                    <p>Mulai dengarkan musik untuk melihat aktivitas</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Withdrawal Requests History -->
    <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <i class="fas fa-list text-purple-600 mr-3"></i>
            Riwayat Penarikan
        </h2>

        <div class="overflow-x-auto">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-50">
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Jumlah</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Alamat</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                </thead>
                <tbody id="withdrawal-history">
                    <!-- Withdrawal history will be loaded here -->
                    <tr>
                        <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                            Belum ada riwayat penarikan
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
class Dashboard {
    constructor() {
        this.bindEvents();
        this.loadWithdrawalHistory();
        this.startPeriodicUpdates();
    }
    
    bindEvents() {
        document.getElementById('withdrawal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWithdrawal();
        });
    }
    
    submitWithdrawal() {
        const form = document.getElementById('withdrawal-form');
        const formData = new FormData(form);
        
        const amount = parseInt(formData.get('amount'));
        const walletAddress = formData.get('wallet_address').trim();
        
        // Validation
        if (amount < 10000) {
            alert('Jumlah minimum penarikan adalah Rp 10.000');
            return;
        }
        
        if (!walletAddress) {
            alert('Alamat dompet/rekening harus diisi');
            return;
        }
        
        // Submit withdrawal request
        fetch('api/withdraw.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                wallet_address: walletAddress
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Permintaan penarikan berhasil diajukan!');
                form.reset();
                this.loadWithdrawalHistory();
                this.updateBalance();
            } else {
                alert('Error: ' + (data.message || 'Gagal mengajukan penarikan'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengajukan penarikan');
        });
    }
    
    loadWithdrawalHistory() {
        fetch('api/withdrawal_history.php')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('withdrawal-history');
                
                if (data.requests && data.requests.length > 0) {
                    tbody.innerHTML = data.requests.map(request => `
                        <tr class="border-t border-gray-100">
                            <td class="px-4 py-3 text-sm text-gray-600">
                                ${new Date(request.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td class="px-4 py-3 text-sm font-medium text-gray-900">
                                Rp ${(request.amount / 100).toLocaleString('id-ID', {minimumFractionDigits: 1})}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600">
                                ${request.wallet_address.substring(0, 30)}...
                            </td>
                            <td class="px-4 py-3 text-sm">
                                ${this.getStatusBadge(request.status)}
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                                Belum ada riwayat penarikan
                            </td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading withdrawal history:', error);
            });
    }
    
    getStatusBadge(status) {
        const badges = {
            'pending': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>',
            'approved': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Disetujui</span>',
            'rejected': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ditolak</span>',
            'completed': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Selesai</span>'
        };
        return badges[status] || badges['pending'];
    }
    
    updateBalance() {
        fetch('api/get_balance.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('dashboard-balance').textContent = data.balance;
                    // Update withdrawal form max amount
                    const maxAmount = Math.floor(data.raw_balance * 100);
                    document.getElementById('withdrawal-amount').setAttribute('max', maxAmount);
                }
            })
            .catch(error => console.error('Error updating balance:', error));
    }
    
    startPeriodicUpdates() {
        // Update balance every 10 seconds
        setInterval(() => {
            this.updateBalance();
        }, 10000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    new Dashboard();
});
</script>
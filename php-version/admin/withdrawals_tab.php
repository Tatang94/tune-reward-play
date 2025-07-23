<!-- Withdrawals Management Tab -->
<div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-money-bill-wave text-green-600 mr-3"></i>
        Kelola Penarikan Dana
    </h3>

    <!-- Filter Section -->
    <div class="mb-6 flex flex-wrap gap-4">
        <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="completed">Selesai</option>
            <option value="rejected">Ditolak</option>
        </select>
        
        <button onclick="loadWithdrawals()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <i class="fas fa-sync-alt mr-2"></i>Refresh
        </button>
    </div>

    <!-- Withdrawals Table -->
    <div class="overflow-x-auto">
        <table class="w-full table-auto">
            <thead>
                <tr class="bg-gray-50">
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Jumlah</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Alamat/Rekening</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
            </thead>
            <tbody id="withdrawals-table">
                <?php
                $withdrawals = getWithdrawRequests($pdo);
                foreach ($withdrawals as $withdrawal):
                ?>
                <tr class="border-t border-gray-100">
                    <td class="px-4 py-3 text-sm text-gray-900">#<?php echo $withdrawal['id']; ?></td>
                    <td class="px-4 py-3 text-sm text-gray-900"><?php echo htmlspecialchars($withdrawal['user_id']); ?></td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">
                        <?php echo formatCurrency($withdrawal['amount'] / 100); ?>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                        <div class="max-w-xs truncate" title="<?php echo htmlspecialchars($withdrawal['wallet_address']); ?>">
                            <?php echo htmlspecialchars(substr($withdrawal['wallet_address'], 0, 30)); ?>...
                        </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                        <?php echo date('d/m/Y H:i', strtotime($withdrawal['created_at'])); ?>
                    </td>
                    <td class="px-4 py-3 text-sm">
                        <?php
                        $status_badges = [
                            'pending' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>',
                            'approved' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Disetujui</span>',
                            'completed' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Selesai</span>',
                            'rejected' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ditolak</span>'
                        ];
                        echo $status_badges[$withdrawal['status']] ?? $status_badges['pending'];
                        ?>
                    </td>
                    <td class="px-4 py-3 text-sm">
                        <?php if ($withdrawal['status'] === 'pending'): ?>
                        <div class="flex space-x-2">
                            <button onclick="updateWithdrawal(<?php echo $withdrawal['id']; ?>, 'approved')" 
                                    class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded">
                                <i class="fas fa-check mr-1"></i>Setuju
                            </button>
                            <button onclick="updateWithdrawal(<?php echo $withdrawal['id']; ?>, 'rejected')" 
                                    class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded">
                                <i class="fas fa-times mr-1"></i>Tolak
                            </button>
                        </div>
                        <?php elseif ($withdrawal['status'] === 'approved'): ?>
                        <button onclick="updateWithdrawal(<?php echo $withdrawal['id']; ?>, 'completed')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">
                            <i class="fas fa-check-double mr-1"></i>Selesai
                        </button>
                        <?php else: ?>
                        <span class="text-gray-400 text-xs">No action</span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
                
                <?php if (empty($withdrawals)): ?>
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-inbox text-3xl mb-3"></i>
                        <p>Belum ada permintaan penarikan</p>
                    </td>
                </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Summary Stats -->
    <div class="mt-8 grid md:grid-cols-4 gap-4">
        <?php
        $stats = [
            'pending' => 0,
            'approved' => 0,
            'completed' => 0,
            'rejected' => 0
        ];
        
        foreach ($withdrawals as $w) {
            if (isset($stats[$w['status']])) {
                $stats[$w['status']]++;
            }
        }
        
        $total_amount = array_sum(array_map(function($w) { return $w['amount']; }, $withdrawals));
        ?>
        
        <div class="bg-yellow-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-yellow-800"><?php echo $stats['pending']; ?></div>
            <div class="text-yellow-600 text-sm">Menunggu Persetujuan</div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-green-800"><?php echo $stats['approved']; ?></div>
            <div class="text-green-600 text-sm">Disetujui</div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-blue-800"><?php echo $stats['completed']; ?></div>
            <div class="text-blue-600 text-sm">Selesai</div>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-purple-800"><?php echo formatCurrency($total_amount / 100); ?></div>
            <div class="text-purple-600 text-sm">Total Penarikan</div>
        </div>
    </div>
</div>

<script>
function updateWithdrawal(id, status) {
    if (!confirm('Yakin ingin mengubah status penarikan ini?')) {
        return;
    }
    
    fetch('?page=monk&action=update_withdrawal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Gagal mengubah status penarikan');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    });
}

function loadWithdrawals() {
    location.reload();
}
</script>
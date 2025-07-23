<?php
// Admin Panel - Access via ?page=monk
$action = $_GET['action'] ?? 'dashboard';

// Handle admin login
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        
        if (adminLogin($pdo, $username, $password)) {
            header('Location: ?page=monk');
            exit;
        } else {
            $login_error = 'Username atau password salah';
        }
    }
    
    // Show login form
    ?>
    <div class="max-w-md mx-auto mt-16">
        <div class="bg-white rounded-xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-center mb-6">
                <i class="fas fa-lock text-purple-600 mr-2"></i>
                Login Admin
            </h2>
            
            <?php if (isset($login_error)): ?>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p class="text-red-800 text-sm"><?php echo $login_error; ?></p>
            </div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input type="text" name="username" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" name="password" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                </div>
                
                <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                </button>
            </form>
            
            <div class="mt-4 text-center">
                <a href="?page=home" class="text-purple-600 hover:text-purple-700 text-sm">
                    <i class="fas fa-arrow-left mr-1"></i>Kembali ke Beranda
                </a>
            </div>
        </div>
    </div>
    <?php
    return;
}

// For now, skip admin authentication (direct access like Node.js version)
// requireAdmin(); // Uncomment this to enable admin authentication

// Handle admin actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    switch ($action) {
        case 'add_song':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO featured_songs (video_id, title, artist, thumbnail, duration) VALUES (?, ?, ?, ?, ?)");
            $success = $stmt->execute([
                $input['videoId'],
                $input['title'],
                $input['artist'],
                $input['thumbnail'] ?? '',
                $input['duration'] ?? 0
            ]);
            echo json_encode(['success' => $success]);
            exit;
            
        case 'remove_song':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("DELETE FROM featured_songs WHERE id = ?");
            $success = $stmt->execute([$input['id']]);
            echo json_encode(['success' => $success]);
            exit;
            
        case 'update_withdrawal':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE withdraw_requests SET status = ?, processed_at = NOW() WHERE id = ?");
            $success = $stmt->execute([$input['status'], $input['id']]);
            echo json_encode(['success' => $success]);
            exit;
            
        case 'save_ad_settings':
            $input = json_decode(file_get_contents('php://input'), true);
            foreach ($input as $key => $value) {
                setAdminSetting($pdo, $key, $value);
            }
            echo json_encode(['success' => true]);
            exit;
    }
}
?>

<!-- Admin Panel Dashboard -->
<div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold mb-2">
                    <i class="fas fa-crown mr-3"></i>Admin Panel
                </h1>
                <p class="text-purple-100">Kelola aplikasi MusicReward</p>
            </div>
            <div class="text-right">
                <a href="?page=home" class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-home mr-2"></i>Kembali ke Beranda
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                    <i class="fas fa-music text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Lagu</p>
                    <p class="text-2xl font-semibold text-gray-900"><?php echo count(getFeaturedSongs($pdo)); ?></p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 text-green-600">
                    <i class="fas fa-money-bill-wave text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Penarikan Pending</p>
                    <p class="text-2xl font-semibold text-gray-900">
                        <?php 
                        $stmt = $pdo->prepare("SELECT COUNT(*) FROM withdraw_requests WHERE status = 'pending'");
                        $stmt->execute();
                        echo $stmt->fetchColumn();
                        ?>
                    </p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <i class="fas fa-ad text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Script Iklan</p>
                    <p class="text-2xl font-semibold text-gray-900">
                        <?php 
                        $stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_settings WHERE setting_key LIKE '%_script'");
                        $stmt->execute();
                        echo $stmt->fetchColumn();
                        ?>
                    </p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                    <i class="fas fa-cog text-xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Status</p>
                    <p class="text-lg font-semibold text-green-600">Online</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
                <button onclick="showTab('withdrawals')" class="tab-btn py-4 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600" id="withdrawals-tab">
                    <i class="fas fa-money-bill-wave mr-2"></i>Penarikan Dana
                </button>
                <button onclick="showTab('music')" class="tab-btn py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700" id="music-tab">
                    <i class="fas fa-music mr-2"></i>Kelola Musik
                </button>
                <button onclick="showTab('ads')" class="tab-btn py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700" id="ads-tab">
                    <i class="fas fa-ad mr-2"></i>Pengaturan Iklan
                </button>
            </nav>
        </div>
    </div>

    <!-- Tab Contents -->
    <div id="withdrawals-content" class="tab-content">
        <?php include 'admin/withdrawals_tab.php'; ?>
    </div>

    <div id="music-content" class="tab-content hidden">
        <?php include 'admin/music_tab.php'; ?>
    </div>

    <div id="ads-content" class="tab-content hidden">
        <?php include 'admin/ads_tab.php'; ?>
    </div>
</div>

<script>
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active state from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-purple-500', 'text-purple-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab content
    document.getElementById(tabName + '-content').classList.remove('hidden');
    
    // Add active state to selected tab
    const activeTab = document.getElementById(tabName + '-tab');
    activeTab.classList.add('border-purple-500', 'text-purple-600');
    activeTab.classList.remove('border-transparent', 'text-gray-500');
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    showTab('withdrawals');
});
</script>
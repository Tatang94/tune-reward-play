<!-- Home Page -->
<div class="text-center mb-8">
    <h1 class="text-4xl font-bold text-gray-800 mb-4">
        <i class="fas fa-music text-purple-600 mr-3"></i>
        Selamat Datang di MusicReward
    </h1>
    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Platform musik streaming dengan sistem reward. Dengarkan lagu favorit Anda dan dapatkan 
        <span class="font-bold text-green-600">Rp 0.5 setiap 30 detik!</span>
    </p>
</div>

<!-- User Balance Display -->
<div class="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 text-white text-center mb-8 max-w-md mx-auto">
    <div class="flex items-center justify-center mb-2">
        <i class="fas fa-wallet text-2xl mr-2"></i>
        <h3 class="text-lg font-semibold">Saldo Anda</h3>
    </div>
    <div class="text-3xl font-bold" id="balance-display">
        <?php echo formatCurrency(getUserBalance($pdo, getUserId())); ?>
    </div>
</div>

<!-- Feature Cards -->
<div class="grid md:grid-cols-3 gap-6 mb-12">
    <!-- Music Player Card -->
    <div class="bg-white rounded-lg shadow-lg p-6 card-hover text-center">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-play text-2xl text-purple-600"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">Pemutar Musik</h3>
        <p class="text-gray-600 mb-4">Dengarkan koleksi lagu terpilih dan dapatkan reward otomatis</p>
        <a href="?page=player" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
            Mulai Dengar <i class="fas fa-arrow-right ml-2"></i>
        </a>
    </div>

    <!-- Dashboard Card -->
    <div class="bg-white rounded-lg shadow-lg p-6 card-hover text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-chart-line text-2xl text-green-600"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">Dashboard</h3>
        <p class="text-gray-600 mb-4">Kelola saldo dan ajukan penarikan dana dengan mudah</p>
        <a href="?page=dashboard" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
            Lihat Dashboard <i class="fas fa-arrow-right ml-2"></i>
        </a>
    </div>

    <!-- How It Works Card -->
    <div class="bg-white rounded-lg shadow-lg p-6 card-hover text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-info-circle text-2xl text-blue-600"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">Cara Kerja</h3>
        <p class="text-gray-600 mb-4">Sistem reward otomatis memberikan Rp 0.5 setiap 30 detik</p>
        <div class="text-blue-600 font-medium">
            Simple & Otomatis <i class="fas fa-magic ml-2"></i>
        </div>
    </div>
</div>

<!-- How to Earn Section -->
<div class="bg-white rounded-lg shadow-lg p-8 mb-8">
    <h2 class="text-2xl font-bold text-center mb-6">
        <i class="fas fa-coins text-yellow-500 mr-2"></i>
        Cara Mendapatkan Reward
    </h2>
    <div class="grid md:grid-cols-4 gap-4 text-center">
        <div class="p-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl font-bold text-blue-600">1</span>
            </div>
            <h4 class="font-semibold mb-2">Buka Pemutar</h4>
            <p class="text-sm text-gray-600">Klik menu "Pemutar" untuk memulai</p>
        </div>
        <div class="p-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl font-bold text-green-600">2</span>
            </div>
            <h4 class="font-semibold mb-2">Play Musik</h4>
            <p class="text-sm text-gray-600">Tekan tombol play untuk memulai lagu</p>
        </div>
        <div class="p-4">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl font-bold text-purple-600">3</span>
            </div>
            <h4 class="font-semibold mb-2">Dengarkan</h4>
            <p class="text-sm text-gray-600">Nikmati musik selama 30 detik</p>
        </div>
        <div class="p-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-xl font-bold text-yellow-600">4</span>
            </div>
            <h4 class="font-semibold mb-2">Dapatkan Reward</h4>
            <p class="text-sm text-gray-600">Otomatis dapat Rp 0.5!</p>
        </div>
    </div>
</div>

<!-- Statistics -->
<div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-white text-center">
    <h2 class="text-2xl font-bold mb-6">Statistik Platform</h2>
    <div class="grid md:grid-cols-3 gap-6">
        <div>
            <div class="text-3xl font-bold mb-2"><?php echo count(getFeaturedSongs($pdo)); ?></div>
            <div class="text-purple-200">Lagu Tersedia</div>
        </div>
        <div>
            <div class="text-3xl font-bold mb-2">Rp 0.5</div>
            <div class="text-purple-200">Reward per 30 detik</div>
        </div>
        <div>
            <div class="text-3xl font-bold mb-2">24/7</div>
            <div class="text-purple-200">Tersedia Online</div>
        </div>
    </div>
</div>

<script>
// Update balance display periodically
function updateBalance() {
    fetch('api/get_balance.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('balance-display').textContent = data.balance;
            }
        })
        .catch(error => console.error('Error updating balance:', error));
}

// Update balance every 5 seconds
setInterval(updateBalance, 5000);
</script>
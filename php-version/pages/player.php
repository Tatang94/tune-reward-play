<!-- Music Player Page -->
<?php
$featured_songs = getFeaturedSongs($pdo);
$current_song = !empty($featured_songs) ? $featured_songs[0] : null;
?>

<div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">
            <i class="fas fa-headphones text-purple-600 mr-3"></i>
            Pemutar Musik
        </h1>
        <p class="text-gray-600">Dengarkan musik dan dapatkan Rp 0.5 setiap 30 detik</p>
    </div>

    <!-- Balance Display -->
    <div class="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white text-center mb-6">
        <div class="text-lg font-semibold">Saldo Saat Ini</div>
        <div class="text-2xl font-bold" id="player-balance">
            <?php echo formatCurrency(getUserBalance($pdo, getUserId())); ?>
        </div>
    </div>

    <?php if ($current_song): ?>
    <!-- Music Player Card -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <!-- Song Info -->
        <div class="p-6">
            <div class="flex items-start gap-4 mb-4">
                <img src="<?php echo $current_song['thumbnail'] ?: 'https://img.youtube.com/vi/' . $current_song['video_id'] . '/maxresdefault.jpg'; ?>" 
                     alt="<?php echo htmlspecialchars($current_song['title']); ?>"
                     class="w-24 h-24 rounded-lg object-cover">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-800 mb-1" id="song-title">
                        <?php echo htmlspecialchars($current_song['title']); ?>
                    </h3>
                    <p class="text-gray-600 mb-2" id="song-artist">
                        <?php echo htmlspecialchars($current_song['artist']); ?>
                    </p>
                    <div class="text-sm text-gray-500">
                        <span id="song-counter">Lagu 1 dari <?php echo count($featured_songs); ?></span>
                        <span class="mx-2">•</span>
                        <span class="text-green-600 font-medium" id="reward-status">Siap untuk reward</span>
                    </div>
                </div>
            </div>

            <!-- YouTube Player -->
            <div class="mb-4">
                <div id="youtube-player" class="w-full h-64 bg-black rounded-lg flex items-center justify-center">
                    <div class="text-white text-center">
                        <i class="fas fa-play-circle text-6xl mb-4"></i>
                        <p>Klik tombol play untuk memulai</p>
                    </div>
                </div>
            </div>

            <!-- Player Controls -->
            <div class="flex justify-center items-center gap-4 mb-4">
                <button id="prev-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-full transition-colors">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button id="play-pause-btn" class="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full text-xl transition-colors">
                    <i class="fas fa-play"></i>
                </button>
                <button id="next-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-full transition-colors">
                    <i class="fas fa-step-forward"></i>
                </button>
            </div>

            <!-- Progress Bar -->
            <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span id="current-time">0:00</span>
                    <span id="reward-timer" class="font-medium text-green-600">Reward dalam: --</span>
                    <span id="duration">0:00</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div id="progress-bar" class="bg-purple-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>

            <!-- Auto-play Status -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <i class="fas fa-sync-alt text-blue-600 mr-2"></i>
                <span class="text-blue-800 font-medium">Auto-play aktif</span>
                <span class="text-blue-600"> - Lagu akan berganti otomatis</span>
            </div>
        </div>
    </div>

    <?php else: ?>
    <!-- No Songs Available -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
        <i class="fas fa-music text-4xl text-yellow-600 mb-4"></i>
        <h3 class="text-xl font-bold text-yellow-800 mb-2">Belum Ada Lagu</h3>
        <p class="text-yellow-700 mb-4">Admin belum menambahkan lagu untuk diputar</p>
        <p class="text-yellow-600">Silakan hubungi admin untuk menambahkan musik</p>
    </div>
    <?php endif; ?>

    <!-- Reward History -->
    <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
            <i class="fas fa-history text-green-600 mr-2"></i>
            Riwayat Reward Hari Ini
        </h3>
        <div id="reward-history" class="space-y-2 max-h-40 overflow-y-auto">
            <!-- Reward history will be populated by JavaScript -->
            <div class="text-gray-500 text-center py-4">Mulai dengarkan musik untuk melihat riwayat reward</div>
        </div>
    </div>
</div>

<script>
class MusicPlayer {
    constructor() {
        this.songs = <?php echo json_encode($featured_songs); ?>;
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.rewardTimer = null;
        this.rewardInterval = 30; // 30 seconds
        this.rewardAmount = 0.5;
        this.timeUntilReward = 0;
        this.totalPlayTime = 0;
        
        this.initializePlayer();
        this.bindEvents();
    }
    
    initializePlayer() {
        if (this.songs.length === 0) return;
        
        this.updateSongDisplay();
        this.loadYouTubePlayer();
    }
    
    loadYouTubePlayer() {
        const currentSong = this.songs[this.currentSongIndex];
        const playerContainer = document.getElementById('youtube-player');
        
        // Create YouTube embed
        playerContainer.innerHTML = `
            <iframe width="100%" height="100%" 
                    src="https://www.youtube.com/embed/${currentSong.video_id}?enablejsapi=1&autoplay=0"
                    frameborder="0" allowfullscreen>
            </iframe>
        `;
    }
    
    bindEvents() {
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextSong();
        });
        
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.prevSong();
        });
    }
    
    togglePlayPause() {
        const btn = document.getElementById('play-pause-btn');
        const icon = btn.querySelector('i');
        
        if (this.isPlaying) {
            this.pause();
            icon.className = 'fas fa-play';
        } else {
            this.play();
            icon.className = 'fas fa-pause';
        }
    }
    
    play() {
        this.isPlaying = true;
        this.startRewardTimer();
        document.getElementById('reward-status').textContent = 'Sedang bermain...';
    }
    
    pause() {
        this.isPlaying = false;
        this.stopRewardTimer();
        document.getElementById('reward-status').textContent = 'Dijeda';
    }
    
    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.changeSong();
    }
    
    prevSong() {
        this.currentSongIndex = this.currentSongIndex > 0 ? this.currentSongIndex - 1 : this.songs.length - 1;
        this.changeSong();
    }
    
    changeSong() {
        this.pause();
        this.updateSongDisplay();
        this.loadYouTubePlayer();
        
        // Auto-play next song after 2 seconds
        setTimeout(() => {
            if (document.getElementById('play-pause-btn').querySelector('i').className.includes('pause')) {
                this.play();
            }
        }, 2000);
    }
    
    updateSongDisplay() {
        if (this.songs.length === 0) return;
        
        const currentSong = this.songs[this.currentSongIndex];
        document.getElementById('song-title').textContent = currentSong.title;
        document.getElementById('song-artist').textContent = currentSong.artist;
        document.getElementById('song-counter').textContent = `Lagu ${this.currentSongIndex + 1} dari ${this.songs.length}`;
        
        // Update thumbnail
        const img = document.querySelector('img[alt]');
        if (img) {
            img.src = currentSong.thumbnail || `https://img.youtube.com/vi/${currentSong.video_id}/maxresdefault.jpg`;
            img.alt = currentSong.title;
        }
    }
    
    startRewardTimer() {
        this.timeUntilReward = this.rewardInterval;
        this.updateRewardDisplay();
        
        this.rewardTimer = setInterval(() => {
            this.timeUntilReward--;
            this.totalPlayTime++;
            this.updateRewardDisplay();
            
            if (this.timeUntilReward <= 0) {
                this.giveReward();
                this.timeUntilReward = this.rewardInterval;
            }
        }, 1000);
    }
    
    stopRewardTimer() {
        if (this.rewardTimer) {
            clearInterval(this.rewardTimer);
            this.rewardTimer = null;
        }
    }
    
    updateRewardDisplay() {
        const timer = document.getElementById('reward-timer');
        if (this.timeUntilReward > 0) {
            timer.textContent = `Reward dalam: ${this.timeUntilReward}s`;
        } else {
            timer.textContent = 'Memberikan reward...';
        }
    }
    
    giveReward() {
        // Add reward via AJAX
        fetch('api/add_reward.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: this.rewardAmount,
                song_id: this.songs[this.currentSongIndex].video_id
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.updateBalanceDisplay(data.new_balance);
                this.addRewardHistory();
            }
        })
        .catch(error => {
            console.error('Error adding reward:', error);
            // Fallback: update local balance
            this.addRewardHistory();
        });
    }
    
    updateBalanceDisplay(newBalance) {
        const balanceElements = document.querySelectorAll('#player-balance, #balance-display');
        balanceElements.forEach(element => {
            element.textContent = newBalance;
        });
    }
    
    addRewardHistory() {
        const historyContainer = document.getElementById('reward-history');
        const currentSong = this.songs[this.currentSongIndex];
        const time = new Date().toLocaleTimeString('id-ID');
        
        // Remove "no history" message
        const noHistory = historyContainer.querySelector('.text-gray-500');
        if (noHistory) {
            noHistory.remove();
        }
        
        const rewardEntry = document.createElement('div');
        rewardEntry.className = 'flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg';
        rewardEntry.innerHTML = `
            <div>
                <div class="text-sm font-medium text-green-800">+Rp ${this.rewardAmount.toFixed(1)}</div>
                <div class="text-xs text-green-600">${currentSong.title}</div>
            </div>
            <div class="text-xs text-green-600">${time}</div>
        `;
        
        historyContainer.insertBefore(rewardEntry, historyContainer.firstChild);
        
        // Keep only last 10 entries
        const entries = historyContainer.children;
        if (entries.length > 10) {
            historyContainer.removeChild(entries[entries.length - 1]);
        }
    }
}

// Initialize player when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (<?php echo count($featured_songs); ?> > 0) {
        new MusicPlayer();
    }
});
</script>
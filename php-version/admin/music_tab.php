<!-- Music Management Tab -->
<div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-music text-blue-600 mr-3"></i>
        Kelola Musik Featured
    </h3>

    <!-- Search and Add Section -->
    <div class="mb-8 bg-gray-50 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-4">Cari & Tambah Lagu Baru</h4>
        
        <div class="flex gap-4 mb-4">
            <div class="flex-1">
                <input type="text" 
                       id="search-query" 
                       placeholder="Cari lagu di YouTube (contoh: Ed Sheeran Perfect)"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            <button onclick="searchSongs()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-search mr-2"></i>Cari
            </button>
        </div>

        <!-- Search Results -->
        <div id="search-results" class="hidden">
            <h5 class="font-medium text-gray-700 mb-3">Hasil Pencarian:</h5>
            <div id="search-results-list" class="space-y-2 max-h-96 overflow-y-auto">
                <!-- Search results will be populated here -->
            </div>
        </div>
    </div>

    <!-- Current Featured Songs -->
    <div>
        <h4 class="text-lg font-semibold text-gray-800 mb-4">Lagu Featured Saat Ini</h4>
        
        <div id="featured-songs-list" class="space-y-4">
            <?php
            $featured_songs = getFeaturedSongs($pdo);
            foreach ($featured_songs as $song):
            ?>
            <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <img src="<?php echo $song['thumbnail'] ?: 'https://img.youtube.com/vi/' . $song['video_id'] . '/maxresdefault.jpg'; ?>" 
                         alt="<?php echo htmlspecialchars($song['title']); ?>"
                         class="w-16 h-16 rounded-lg object-cover">
                    <div>
                        <h5 class="font-medium text-gray-900"><?php echo htmlspecialchars($song['title']); ?></h5>
                        <p class="text-gray-600"><?php echo htmlspecialchars($song['artist']); ?></p>
                        <div class="flex items-center space-x-2 text-sm text-gray-500">
                            <span>ID: <?php echo $song['video_id']; ?></span>
                            <span>•</span>
                            <span><?php echo $song['is_active'] ? 'Aktif' : 'Nonaktif'; ?></span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="removeSong(<?php echo $song['id']; ?>)" 
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm">
                        <i class="fas fa-trash mr-1"></i>Hapus
                    </button>
                </div>
            </div>
            <?php endforeach; ?>
            
            <?php if (empty($featured_songs)): ?>
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-music text-4xl mb-4"></i>
                <p class="text-lg mb-2">Belum ada lagu featured</p>
                <p>Gunakan fitur pencarian di atas untuk menambah lagu</p>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
async function searchSongs() {
    const query = document.getElementById('search-query').value.trim();
    if (!query) {
        alert('Masukkan kata kunci pencarian');
        return;
    }
    
    const resultsContainer = document.getElementById('search-results');
    const resultsList = document.getElementById('search-results-list');
    
    // Show loading
    resultsContainer.classList.remove('hidden');
    resultsList.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Mencari lagu...</div>';
    
    try {
        // Since we're using PHP, we'll simulate search results
        // In real implementation, you would integrate with YouTube Data API v3
        const mockResults = [
            {
                id: 'dQw4w9WgXcQ',
                title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
                artist: 'Rick Astley',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                duration: 213
            },
            {
                id: 'kJQP7kiw5Fk',
                title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
                artist: 'Luis Fonsi',
                thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
                duration: 281
            },
            {
                id: 'fJ9rUzIMcZQ',
                title: 'Queen – Bohemian Rhapsody (Official Music Video)',
                artist: 'Queen',
                thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
                duration: 355
            }
        ];
        
        // Filter results based on query
        const filteredResults = mockResults.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );
        
        displaySearchResults(filteredResults);
        
    } catch (error) {
        console.error('Error searching songs:', error);
        resultsList.innerHTML = '<div class="text-center py-4 text-red-600">Error mencari lagu. Silakan coba lagi.</div>';
    }
}

function displaySearchResults(songs) {
    const resultsList = document.getElementById('search-results-list');
    
    if (songs.length === 0) {
        resultsList.innerHTML = '<div class="text-center py-4 text-gray-500">Tidak ada hasil ditemukan</div>';
        return;
    }
    
    resultsList.innerHTML = songs.map(song => `
        <div class="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200">
            <div class="flex items-center space-x-4">
                <img src="${song.thumbnail}" 
                     alt="${song.title}"
                     class="w-16 h-16 rounded-lg object-cover">
                <div>
                    <h5 class="font-medium text-gray-900">${song.title}</h5>
                    <p class="text-gray-600">${song.artist}</p>
                    <p class="text-sm text-gray-500">Duration: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
                </div>
            </div>
            <button onclick="addSong('${song.id}', '${song.title.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}', '${song.thumbnail}', ${song.duration})" 
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-plus mr-1"></i>Tambah
            </button>
        </div>
    `).join('');
}

async function addSong(videoId, title, artist, thumbnail, duration) {
    try {
        const response = await fetch('?page=monk&action=add_song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoId: videoId,
                title: title,
                artist: artist,
                thumbnail: thumbnail,
                duration: duration
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Lagu berhasil ditambahkan!');
            location.reload(); // Refresh to show new song
        } else {
            alert('Gagal menambahkan lagu');
        }
    } catch (error) {
        console.error('Error adding song:', error);
        alert('Terjadi kesalahan saat menambahkan lagu');
    }
}

async function removeSong(songId) {
    if (!confirm('Yakin ingin menghapus lagu ini?')) {
        return;
    }
    
    try {
        const response = await fetch('?page=monk&action=remove_song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: songId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Lagu berhasil dihapus!');
            location.reload(); // Refresh to remove song from list
        } else {
            alert('Gagal menghapus lagu');
        }
    } catch (error) {
        console.error('Error removing song:', error);
        alert('Terjadi kesalahan saat menghapus lagu');
    }
}

// Allow enter key to search
document.getElementById('search-query').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchSongs();
    }
});
</script>
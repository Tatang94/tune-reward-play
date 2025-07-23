<!-- Ads Settings Tab -->
<div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-ad text-yellow-600 mr-3"></i>
        Pengaturan Iklan Adsterra
    </h3>

    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div class="flex items-start">
            <i class="fas fa-info-circle text-blue-500 mr-3 mt-1"></i>
            <div>
                <h4 class="font-semibold text-blue-800">Cara Menggunakan:</h4>
                <ol class="text-blue-700 text-sm mt-2 space-y-1 ml-4">
                    <li>1. Daftar akun di <a href="https://adsterra.com" target="_blank" class="underline">Adsterra.com</a></li>
                    <li>2. Buat zone iklan sesuai jenis yang diinginkan</li>
                    <li>3. Copy script yang diberikan Adsterra</li>
                    <li>4. Paste di form di bawah ini dan aktifkan</li>
                </ol>
            </div>
        </div>
    </div>

    <!-- Ad Settings Form -->
    <form id="ads-form" class="space-y-8">
        <!-- Header Script -->
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-800">
                    <i class="fas fa-code text-purple-600 mr-2"></i>
                    Header Script
                </h4>
                <label class="inline-flex items-center">
                    <input type="checkbox" 
                           name="header_active" 
                           id="header_active"
                           class="rounded border-gray-300 text-purple-600 focus:border-purple-300 focus:ring focus:ring-purple-200"
                           <?php echo getAdminSetting($pdo, 'header_active') ? 'checked' : ''; ?>>
                    <span class="ml-2 text-sm text-gray-700">Aktifkan</span>
                </label>
            </div>
            <textarea name="header_script" 
                      id="header_script"
                      rows="5" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Paste script header Adsterra di sini..."><?php echo htmlspecialchars(getAdminSetting($pdo, 'header_script')); ?></textarea>
            <p class="text-sm text-gray-600 mt-2">Script ini akan dimuat di bagian &lt;head&gt; website</p>
        </div>

        <!-- Footer Script -->
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-800">
                    <i class="fas fa-code text-green-600 mr-2"></i>
                    Footer Script
                </h4>
                <label class="inline-flex items-center">
                    <input type="checkbox" 
                           name="footer_active" 
                           id="footer_active"
                           class="rounded border-gray-300 text-green-600 focus:border-green-300 focus:ring focus:ring-green-200"
                           <?php echo getAdminSetting($pdo, 'footer_active') ? 'checked' : ''; ?>>
                    <span class="ml-2 text-sm text-gray-700">Aktifkan</span>
                </label>
            </div>
            <textarea name="footer_script" 
                      id="footer_script"
                      rows="5" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Paste script footer Adsterra di sini..."><?php echo htmlspecialchars(getAdminSetting($pdo, 'footer_script')); ?></textarea>
            <p class="text-sm text-gray-600 mt-2">Script ini akan dimuat di bagian bawah website</p>
        </div>

        <!-- Banner Script -->
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-800">
                    <i class="fas fa-rectangle-ad text-blue-600 mr-2"></i>
                    Banner Script
                </h4>
                <label class="inline-flex items-center">
                    <input type="checkbox" 
                           name="banner_active" 
                           id="banner_active"
                           class="rounded border-gray-300 text-blue-600 focus:border-blue-300 focus:ring focus:ring-blue-200"
                           <?php echo getAdminSetting($pdo, 'banner_active') ? 'checked' : ''; ?>>
                    <span class="ml-2 text-sm text-gray-700">Aktifkan</span>
                </label>
            </div>
            <textarea name="banner_script" 
                      id="banner_script"
                      rows="5" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Paste script banner Adsterra di sini..."><?php echo htmlspecialchars(getAdminSetting($pdo, 'banner_script')); ?></textarea>
            <p class="text-sm text-gray-600 mt-2">Banner akan ditampilkan di area konten utama</p>
        </div>

        <!-- Popup/Native Script -->
        <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-800">
                    <i class="fas fa-window-maximize text-red-600 mr-2"></i>
                    Popup/Native Script
                </h4>
                <label class="inline-flex items-center">
                    <input type="checkbox" 
                           name="popup_active" 
                           id="popup_active"
                           class="rounded border-gray-300 text-red-600 focus:border-red-300 focus:ring focus:ring-red-200"
                           <?php echo getAdminSetting($pdo, 'popup_active') ? 'checked' : ''; ?>>
                    <span class="ml-2 text-sm text-gray-700">Aktifkan</span>
                </label>
            </div>
            <textarea name="popup_script" 
                      id="popup_script"
                      rows="5" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Paste script popup/native Adsterra di sini..."><?php echo htmlspecialchars(getAdminSetting($pdo, 'popup_script')); ?></textarea>
            <p class="text-sm text-gray-600 mt-2">Script untuk iklan popup atau native ads</p>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end space-x-4">
            <button type="button" onclick="previewAds()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-eye mr-2"></i>Preview
            </button>
            <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-save mr-2"></i>Simpan Pengaturan
            </button>
        </div>
    </form>

    <!-- Current Status -->
    <div class="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 class="font-semibold text-gray-800 mb-4">Status Iklan Saat Ini</h4>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="text-center">
                <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center <?php echo getAdminSetting($pdo, 'header_active') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'; ?>">
                    <i class="fas fa-code"></i>
                </div>
                <p class="text-sm font-medium">Header</p>
                <p class="text-xs text-gray-600"><?php echo getAdminSetting($pdo, 'header_active') ? 'Aktif' : 'Nonaktif'; ?></p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center <?php echo getAdminSetting($pdo, 'footer_active') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'; ?>">
                    <i class="fas fa-code"></i>
                </div>
                <p class="text-sm font-medium">Footer</p>
                <p class="text-xs text-gray-600"><?php echo getAdminSetting($pdo, 'footer_active') ? 'Aktif' : 'Nonaktif'; ?></p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center <?php echo getAdminSetting($pdo, 'banner_active') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'; ?>">
                    <i class="fas fa-rectangle-ad"></i>
                </div>
                <p class="text-sm font-medium">Banner</p>
                <p class="text-xs text-gray-600"><?php echo getAdminSetting($pdo, 'banner_active') ? 'Aktif' : 'Nonaktif'; ?></p>
            </div>
            <div class="text-center">
                <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center <?php echo getAdminSetting($pdo, 'popup_active') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'; ?>">
                    <i class="fas fa-window-maximize"></i>
                </div>
                <p class="text-sm font-medium">Popup</p>
                <p class="text-xs text-gray-600"><?php echo getAdminSetting($pdo, 'popup_active') ? 'Aktif' : 'Nonaktif'; ?></p>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('ads-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const settings = {};
    
    // Collect all form data
    for (let [key, value] of formData.entries()) {
        if (key.endsWith('_active')) {
            settings[key] = true;
        } else {
            settings[key] = value;
        }
    }
    
    // Add unchecked checkboxes as false
    ['header_active', 'footer_active', 'banner_active', 'popup_active'].forEach(key => {
        if (!(key in settings)) {
            settings[key] = false;
        }
    });
    
    try {
        const response = await fetch('?page=monk&action=save_ad_settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Pengaturan iklan berhasil disimpan!');
            location.reload(); // Refresh to show updated status
        } else {
            alert('Gagal menyimpan pengaturan iklan');
        }
    } catch (error) {
        console.error('Error saving ad settings:', error);
        alert('Terjadi kesalahan saat menyimpan pengaturan');
    }
});

function previewAds() {
    const scripts = {
        header: document.getElementById('header_script').value,
        footer: document.getElementById('footer_script').value,
        banner: document.getElementById('banner_script').value,
        popup: document.getElementById('popup_script').value
    };
    
    let preview = 'Preview Script Iklan:\n\n';
    
    Object.entries(scripts).forEach(([type, script]) => {
        if (script.trim()) {
            preview += `${type.toUpperCase()}:\n${script}\n\n`;
        }
    });
    
    if (preview === 'Preview Script Iklan:\n\n') {
        preview = 'Tidak ada script yang diisi';
    }
    
    alert(preview);
}

// Auto-save draft functionality
let saveTimeout;
function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        console.log('Auto-saving draft...');
        // You could implement auto-save to localStorage here
    }, 2000);
}

// Add auto-save to all textareas
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', autoSave);
});
</script>
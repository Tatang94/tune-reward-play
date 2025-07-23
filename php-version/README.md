# MusicReward PHP Version

Aplikasi musik streaming dengan sistem reward yang dibangun menggunakan PHP murni, MySQL, dan vanilla JavaScript.

## 🚀 Fitur Utama

- **Streaming Musik**: Integrasi dengan YouTube untuk pemutaran musik
- **Sistem Reward**: Dapatkan Rp 0.5 setiap 30 detik mendengarkan musik
- **Dashboard User**: Kelola saldo dan ajukan penarikan dana
- **Admin Panel**: Kelola musik, penarikan, dan pengaturan iklan
- **Integrasi Adsterra**: Sistem monetisasi melalui iklan

## 📋 Persyaratan Sistem

- PHP 7.4+ dengan PDO MySQL
- MySQL 5.7+ atau MariaDB 10.3+
- Web Server (Apache/Nginx)
- Akun Adsterra (opsional, untuk monetisasi)

## 🛠️ Instalasi

### 1. Persiapan Database

```bash
# Masuk ke MySQL
mysql -u root -p

# Buat database dan import schema
mysql -u root -p < database.sql
```

### 2. Konfigurasi Database

Edit file `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'musicreward');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. Setup Web Server

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### 4. Permissions

```bash
chmod 755 -R /path/to/musicreward
chmod 777 -R /path/to/musicreward/cache  # jika ada folder cache
```

## 🎵 Cara Penggunaan

### Untuk User

1. **Akses Website**: Buka `http://yourdomain.com`
2. **Mulai Mendengar**: Klik menu "Pemutar" 
3. **Play Musik**: Tekan tombol play untuk memulai
4. **Dapatkan Reward**: Otomatis dapat Rp 0.5 setiap 30 detik
5. **Kelola Saldo**: Buka "Dashboard" untuk melihat saldo
6. **Tarik Dana**: Ajukan penarikan minimum Rp 10.000

### Untuk Admin

1. **Login Admin**: Akses `http://yourdomain.com/?page=monk`
2. **Kredensial Default**: 
   - Username: `admin`
   - Password: `audio`
3. **Kelola Musik**: Tab "Kelola Musik" untuk menambah/hapus lagu
4. **Proses Penarikan**: Tab "Penarikan Dana" untuk approve/reject
5. **Setup Iklan**: Tab "Pengaturan Iklan" untuk script Adsterra

## 🔧 Konfigurasi Lanjutan

### Integrasi YouTube API (Opsional)

Untuk pencarian musik yang lebih akurat, daftarkan YouTube Data API v3:

1. Daftar di [Google Cloud Console](https://console.cloud.google.com/)
2. Aktifkan YouTube Data API v3
3. Dapatkan API Key
4. Edit `includes/functions.php` dan ganti function `searchYouTubeSongs()`

### Pengaturan Adsterra

1. Daftar akun di [Adsterra](https://adsterra.com/)
2. Buat zone iklan sesuai kebutuhan:
   - **Header Script**: Untuk tracking/analytics
   - **Footer Script**: Untuk iklan bawah halaman
   - **Banner Script**: Untuk banner display ads
   - **Popup Script**: Untuk popup/native ads
3. Copy script yang diberikan Adsterra
4. Paste di Admin Panel → Pengaturan Iklan

## 📊 Database Schema

### Tabel Utama:
- `users`: Data pengguna
- `admins`: Data admin
- `featured_songs`: Lagu yang ditampilkan
- `withdraw_requests`: Permintaan penarikan
- `admin_settings`: Pengaturan sistem
- `reward_history`: Riwayat reward
- `daily_stats`: Statistik harian

### Struktur File:
```
php-version/
├── index.php              # Entry point utama
├── config/
│   └── database.php       # Konfigurasi database
├── includes/
│   └── functions.php      # Helper functions
├── pages/
│   ├── home.php          # Halaman beranda
│   ├── player.php        # Pemutar musik
│   └── dashboard.php     # Dashboard user
├── admin/
│   ├── admin_panel.php   # Panel admin utama
│   ├── withdrawals_tab.php
│   ├── music_tab.php
│   └── ads_tab.php
├── api/
│   ├── get_balance.php   # API saldo
│   ├── add_reward.php    # API tambah reward
│   ├── withdraw.php      # API penarikan
│   └── withdrawal_history.php
├── assets/
│   └── js/
│       └── app.js        # JavaScript utama
└── database.sql          # Schema database
```

## 🚀 Deployment

### Shared Hosting

1. Upload semua file ke public_html
2. Import database.sql via cPanel/phpMyAdmin
3. Edit config/database.php sesuai kredensial hosting
4. Akses website dan login admin

### VPS/Dedicated Server

```bash
# Clone/upload files
cd /var/www/html
# Upload atau clone repository

# Set permissions
chown -R www-data:www-data musicreward/
chmod -R 755 musicreward/

# Restart web server
systemctl restart apache2  # atau nginx
```

## 🔐 Keamanan

### Rekomendasi:
1. **Ganti Password Admin**: Login dan ganti password default
2. **SSL Certificate**: Gunakan HTTPS untuk keamanan data
3. **Regular Backup**: Backup database secara berkala
4. **Update PHP**: Selalu gunakan PHP versi terbaru
5. **Input Validation**: Sudah ada validasi built-in

### File .htaccess tambahan untuk keamanan:
```apache
# Protect config files
<Files "config/*.php">
    deny from all
</Files>

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "^(database\.sql|\.env|config\.php)$">
    deny from all
</FilesMatch>
```

## 📈 Monetisasi

### Sumber Revenue:
1. **Iklan Adsterra**: Header, footer, banner, popup ads
2. **Affiliate Marketing**: Bisa tambahkan link affiliate di UI
3. **Premium Features**: Bisa develop fitur premium
4. **Sponsored Content**: Lagu/playlist sponsor

### Tips Optimasi:
- Gunakan Google Analytics untuk tracking user
- A/B test posisi iklan untuk CTR maksimal
- Monitor performance dengan tools seperti GTmetrix
- Optimize loading time untuk user experience

## 🐛 Troubleshooting

### Error Database Connection:
```php
// Cek di config/database.php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=musicreward", $username, $password);
    echo "Connected successfully";
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
```

### Error YouTube Embed:
- Pastikan video_id valid
- Cek apakah video tidak di-restrict
- Gunakan HTTPS untuk embed

### Session Issues:
```php
// Tambahkan di awal file jika diperlukan
ini_set('session.cookie_secure', 1);   // Untuk HTTPS
ini_set('session.cookie_httponly', 1); // XSS protection
```

## 📞 Support

Untuk pertanyaan atau dukungan:
- Email: support@yourdomain.com
- Documentation: Wiki ini
- Issues: Catat di issue tracker

## 📄 License

MIT License - Bebas untuk digunakan dan dimodifikasi.

---

**🎵 Happy Music Streaming & Earning! 🎵**
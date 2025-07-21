# MusicReward App - Replit Migration

## Project Overview
A music streaming reward application that allows users to listen to music and earn rewards. Users can discover trending songs, play music, and accumulate earnings that can be withdrawn through an admin dashboard.

## Recent Changes
- **July 21, 2025**: Pembersihan Kode dan Simplifikasi Player
  - Hapus ytdl-core dependency dan semua referensi Python service
  - Player musik disederhanakan menjadi placeholder yang menampilkan info lagu
  - API endpoints menggunakan featured songs dari database admin saja
  - Pembersihan file Python yang tidak diperlukan (ytmusic_service.py, audio_service.py)
  - Aplikasi berjalan lancar tanpa dependency eksternal yang kompleks
  - Focus pada admin panel untuk mengelola featured songs manual
- **Juli 21, 2025**: Migrasi Berhasil dari Replit Agent ke Replit Environment
  - ytmusicapi Python package berhasil diinstall dan berfungsi dengan baik
  - Tampilan saldo diperbaiki dengan desain modern gradient dan shadow
  - Konfigurasi Vercel dioptimalkan dengan Python runtime untuk ytmusicapi
  - Semua API endpoints berfungsi normal termasuk YouTube Music integration
  - Aplikasi siap deploy ke Vercel dengan konfigurasi lengkap
- **July 21, 2025**: Solusi Audio Player dengan YouTube Music Integration
  - Buat SimpleAudioPlayer sebagai solusi praktis untuk audio playback
  - Player membuka YouTube Music di tab baru untuk listening experience
  - Sistem reward tetap berjalan dengan timer simulasi yang akurat
  - Visual player yang menarik dengan thumbnail dan kontrol play/pause
  - Solusi stabil tanpa masalah ytdl-core yang sering berubah
  - User experience yang smooth dengan fallback ke YouTube Music
- **July 21, 2025**: Admin Login System Dihapus - Akses Langsung ke /monk
  - Sistem autentikasi admin dihapus sepenuhnya untuk kemudahan akses
  - Admin panel dapat diakses langsung melalui URL /monk tanpa login
  - Semua API endpoints admin tidak memerlukan token autentikasi lagi
  - AdminLogin.tsx dihapus dan diganti dengan akses langsung ke AdminDashboard
  - Navigasi admin disederhanakan dengan tombol "Kembali" ke beranda
  - Update untuk Vercel: Semua requireAdminAuth() dihapus dari api/index.ts
  - Kedua environment (Replit + Vercel) sekarang support akses admin tanpa login
- **July 21, 2025**: Migration from Replit Agent to Standard Replit Environment COMPLETED
  - Database configuration converted to memory storage for Replit compatibility
  - ytmusicapi Python package successfully installed and configured
  - Application running perfectly on port 5000 with all features functional
  - Dual environment support maintained: Replit (memory) + Vercel (Postgres)
  - All checklist items completed: packages installed, workflow restarted, project verified
- **July 21, 2025**: Fixed Vercel API Handler & Serverless Function Configuration
  - Rebuilt API handler khusus untuk Vercel serverless functions
  - Hapus Express.js dependency dari Vercel API handler
  - Perbaiki routing manual untuk semua API endpoints
  - Enhanced error handling dan authentication untuk serverless environment
  - CORS configuration yang proper untuk Vercel deployment
  - Database initialization dan admin account setup yang robust
  - Admin login API sekarang compatible dengan Vercel serverless architecture
- **July 21, 2025**: Completed Vercel SQL Database Configuration & Project Cleanup
  - Dibuat konfigurasi database khusus untuk Vercel Postgres (@vercel/postgres)
  - File baru: server/db-vercel.ts untuk database connection
  - File baru: server/storage-vercel.ts untuk data operations
  - Update api/index.ts untuk menggunakan Vercel database configuration
  - Database tables akan dibuat otomatis saat deploy ke Vercel
  - Admin account (admin/audio) auto-generated pada first deploy
  - Clean setup tanpa data demo - admin mengelola musik dari nol
  - Cleanup project: hapus file SQL sampah dan dokumentasi yang tidak terpakai
- **July 21, 2025**: Fixed Vercel Configuration & YouTube Integration
  - Perbaiki vercel.json dengan routing SPA yang tepat untuk mengatasi tampilan kode mentah
  - Integrasi YouTube player untuk streaming musik asli
  - Semua fitur admin siap untuk Vercel deployment
  - Routing yang benar: API ke serverless function, frontend ke index.html
- **July 21, 2025**: Vercel Deployment Configuration & Reward Adjustment
  - Setup vercel.json dengan konfigurasi lengkap untuk deployment
  - Buat API handler terpisah di /api/index.ts untuk Vercel
  - Tambah build script khusus untuk Vercel deployment
  - Ubah reward system dari 50 Rp menjadi 5 Rp per 30 detik
  - Documentation lengkap di README.md
  - Semua fitur tetap berfungsi di kedua environment (Replit & Vercel)
- **July 21, 2025**: Enhanced Admin Features & Search Improvements
  - Pencarian musik ditingkatkan dari 20 menjadi 50 lagu
  - Admin dapat mengelola musik trending sendiri melalui dashboard
  - Fitur admin untuk menambah, hapus, dan reorder featured songs
  - Charts endpoint sekarang menggunakan featured songs yang diatur admin
  - Tabs interface di admin dashboard untuk memisahkan penarikan dan musik
- **July 21, 2025**: Migrasi Berhasil ke Replit Environment
  - Database PostgreSQL berhasil dibuat dan tabel di-migrate
  - Python ytmusicapi service berfungsi dengan baik
  - Aplikasi berjalan lancar di port 5000
  - Admin dashboard dapat diakses di /admin
  - Semua fitur musik streaming dan reward system aktif
- **July 21, 2025**: Admin Authentication System with Supabase
  - Sistem login admin dengan database PostgreSQL (Supabase)
  - Kredensial admin: username "admin", password "audio"
  - Autentikasi aman dengan bcrypt dan session tokens
  - Protected admin routes dengan middleware authentication
  - Admin dashboard dengan fungsi logout dan navigasi
  - Database tables: admins, admin_sessions, users, withdraw_requests
- **July 21, 2025**: Enhanced Balance Display and YouTube Music Integration
  - Improved balance display styling with larger text and gradient background
  - Integrated real YouTube Music API using ytmusicapi Python library
  - Created Python service for YouTube Music data fetching
  - Added Express API routes for search, charts, and song details
  - Removed admin button from main header per user request
- **July 20, 2025**: Migrated from Lovable to Replit environment
  - Converted routing from react-router-dom to wouter
  - Set up proper QueryClient configuration
  - Fixed styling to use Tailwind CSS variables for theme consistency
  - Configured proper client/server separation with Express backend
- **July 20, 2025**: Moved admin access from landing page
  - Removed admin button from main header per user request
  - Added proper admin header with navigation back to home
  - Admin panel accessible only via direct URL /admin

## Project Architecture
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js server serving both API and frontend
- **Routing**: wouter for client-side routing
- **State Management**: TanStack Query for server state, localStorage for user data
- **Storage**: In-memory storage for backend, localStorage for frontend user data

## Key Features
- Music discovery with enhanced search (50 songs per search)
- Admin-controlled trending/featured songs
- Music player with earnings system (5 Rp per 30 seconds)
- User dashboard with balance tracking
- Admin dashboard for withdrawal request management
- Admin music management (add, remove, reorder featured songs)
- Real YouTube Music API integration via ytmusicapi

## User Preferences
- Indonesian language interface (Bahasa Indonesia) - untuk semua komunikasi dan interface
- Reward-based music streaming concept
- Simple, clean UI with card-based layouts
- Admin panel dengan kredensial: admin/audio
- Database menggunakan Supabase

## Technical Notes
- Uses real YouTube Music API via ytmusicapi Python library
- Python backend service provides authentic music data
- Express API routes proxy requests to Python ytmusicapi service
- Earnings system awards 5 Rp after 30 seconds of listening
- Admin panel accessible only via direct URL /admin
- Enhanced balance display with gradient styling
- Responsive design with Tailwind CSS
- TypeScript throughout for type safety

## Deployment Configuration
- **Replit**: Ready dengan workflow otomatis di port 5000
  - PostgreSQL database tersedia melalui DATABASE_URL
  - ytmusicapi Python package terinstall
- **Vercel**: Konfigurasi lengkap dengan Vercel Postgres
  - Frontend build ke /dist untuk static hosting
  - API endpoints di /api/index.ts sebagai Vercel function
  - Database: Vercel Postgres dengan @vercel/postgres driver
  - Auto-initialization: tables dan admin account dibuat otomatis
  - Python ytmusicapi tetap berfungsi di Vercel environment
  - Clean deployment tanpa file sampah atau data demo
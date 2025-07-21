# MusicReward App - Replit Migration

## Project Overview
A music streaming reward application that allows users to listen to music and earn rewards. Users can discover trending songs, play music, and accumulate earnings that can be withdrawn through an admin dashboard.

## Recent Changes
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
- **Vercel**: Konfigurasi lengkap dengan serverless functions
  - Frontend build ke /dist untuk static hosting
  - API endpoints di /api/index.ts sebagai Vercel function
  - Python ytmusicapi tetap berfungsi di Vercel environment
  - Database PostgreSQL ready untuk produksi
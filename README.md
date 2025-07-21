# MusicReward App

Aplikasi streaming musik dengan sistem reward yang memungkinkan pengguna mendengarkan musik dan mendapatkan reward. Pengguna dapat menemukan lagu trending, memutar musik, dan mengumpulkan penghasilan yang dapat ditarik melalui dashboard admin.

## Fitur Utama

- ✅ Pencarian musik dengan hasil hingga 50 lagu
- ✅ Sistem musik trending yang dapat diatur admin
- ✅ Music player dengan sistem reward (50 Rp per 30 detik)
- ✅ Dashboard pengguna dengan tracking saldo
- ✅ Dashboard admin untuk manajemen penarikan dana
- ✅ Manajemen musik admin (tambah, hapus, urutkan featured songs)
- ✅ Integrasi real YouTube Music API via ytmusicapi

## Teknologi

- **Frontend**: React dengan TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js server untuk API dan frontend
- **Database**: PostgreSQL dengan Drizzle ORM
- **Routing**: wouter untuk client-side routing
- **State Management**: TanStack Query untuk server state
- **Music API**: ytmusicapi Python library untuk data musik asli

## Deployment

### Replit
Aplikasi sudah dikonfigurasi untuk berjalan di Replit dengan workflow otomatis.

### Vercel
Untuk deployment di Vercel:

1. Clone repository ini
2. Install dependencies: \`npm install\`
3. Setup environment variables:
   - \`DATABASE_URL\`: PostgreSQL connection string
   - \`PGHOST\`, \`PGPORT\`, \`PGUSER\`, \`PGPASSWORD\`, \`PGDATABASE\`
4. Build project: \`node build.js\`
5. Deploy ke Vercel: \`vercel --prod\`

## Admin Access

- URL: \`/admin\`
- Username: \`admin\`
- Password: \`audio\`

## Struktur Database

- \`admins\`: Data admin dan autentikasi
- \`admin_sessions\`: Session tokens untuk admin
- \`users\`: Data pengguna (untuk future use)
- \`withdraw_requests\`: Permintaan penarikan dana
- \`admin_settings\`: Pengaturan admin
- \`featured_songs\`: Daftar musik trending yang diatur admin

## API Endpoints

### Admin
- \`POST /api/admin/login\` - Login admin
- \`POST /api/admin/logout\` - Logout admin
- \`GET /api/admin/profile\` - Profile admin
- \`GET /api/admin/withdrawals\` - Daftar penarikan
- \`PATCH /api/admin/withdrawals/:id\` - Update status penarikan
- \`GET /api/admin/featured-songs\` - Daftar featured songs
- \`POST /api/admin/featured-songs\` - Tambah featured song
- \`DELETE /api/admin/featured-songs/:id\` - Hapus featured song
- \`PATCH /api/admin/featured-songs/:id/order\` - Update urutan
- \`PATCH /api/admin/featured-songs/:id/status\` - Update status aktif

### YouTube Music
- \`GET /api/ytmusic/search?q=query&limit=50\` - Cari lagu
- \`GET /api/ytmusic/charts?country=ID\` - Charts/featured songs
- \`GET /api/ytmusic/song/:videoId\` - Detail lagu

## Development

1. Install dependencies: \`npm install\`
2. Setup database dan environment variables
3. Run migrations: \`npm run db:push\`
4. Start development server: \`npm run dev\`

Server akan berjalan di port 5000 dengan frontend dan API terintegrasi.
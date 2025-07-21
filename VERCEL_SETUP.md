# Vercel Deployment Setup Guide

## Langkah-Langkah Deploy ke Vercel

### 1. Persiapan Database Vercel Postgres

1. **Buat Vercel Postgres Database**:
   - Login ke Vercel Dashboard
   - Buka project yang akan di-deploy
   - Masuk ke tab "Storage"
   - Klik "Create Database" → Pilih "Postgres"
   - Berikan nama database (contoh: `musicreward-db`)
   - Pilih region yang sesuai (Jakarta/Singapore untuk performa optimal)

2. **Konfigurasi Environment Variables**:
   Vercel akan otomatis menambahkan environment variables setelah database dibuat:
   ```bash
   POSTGRES_DATABASE
   POSTGRES_HOST
   POSTGRES_PASSWORD
   POSTGRES_PRISMA_URL
   POSTGRES_URL
   POSTGRES_URL_NON_POOLING
   POSTGRES_USER
   ```

### 2. File Konfigurasi yang Sudah Disiapkan

#### a. `server/db-vercel.ts`
- Konfigurasi database khusus untuk Vercel menggunakan `@vercel/postgres`
- Fungsi `initializeVercelDatabase()` untuk membuat tabel otomatis

#### b. `server/storage-vercel.ts`
- Storage layer khusus untuk Vercel Postgres
- Semua operasi database menggunakan Drizzle ORM dengan Vercel Postgres

#### c. `api/index.ts`
- API handler utama untuk Vercel serverless functions
- Terintegrasi dengan Vercel Postgres
- Inisialisasi database dan admin account otomatis

### 3. Proses Deployment

1. **Hubungkan Repository ke Vercel**:
   - Import project dari GitHub/GitLab ke Vercel
   - Pilih repository MusicReward App

2. **Konfigurasi Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

3. **Deploy**:
   - Klik "Deploy"
   - Vercel akan otomatis build dan deploy aplikasi

### 4. Fitur yang Tersedia di Vercel

✅ **Database Features**:
- PostgreSQL dengan auto-scaling
- Connection pooling otomatis
- Backup dan restore otomatis
- Clean setup tanpa data demo - admin mengelola sendiri

✅ **Application Features**:
- Admin authentication dengan credentials: `admin/audio`
- YouTube Music integration (ytmusicapi)
- Featured songs management (mulai dari kosong)
- Withdrawal requests management
- Responsive design

✅ **Performance**:
- Serverless functions untuk API
- Static hosting untuk frontend
- Global CDN
- Automatic HTTPS

### 5. Monitoring dan Maintenance

1. **Database Monitoring**:
   - Akses Vercel Dashboard → Storage → Database
   - Monitor query performance dan storage usage

2. **Function Logs**:
   - Vercel Dashboard → Functions
   - Monitor API calls dan error logs

3. **Admin Access**:
   - URL: `https://your-domain.vercel.app/admin`
   - Credentials: `admin/audio`

### 6. Environment Variables (Opsional)

Jika perlu konfigurasi tambahan:

```bash
# YouTube Music API (opsional, untuk rate limiting)
YTMUSIC_API_KEY=your-key-here

# Node Environment
NODE_ENV=production
```

### 7. Troubleshooting

**Jika Database Connection Gagal**:
1. Pastikan Vercel Postgres database sudah dibuat
2. Check environment variables di Vercel Dashboard
3. Restart deployment jika perlu

**Jika Python Service Gagal**:
1. Pastikan ytmusicapi compatible dengan Vercel runtime
2. Check function timeout settings (max 30 detik)

## Keunggulan Deployment Vercel

- **Zero Configuration**: Database dan environment setup otomatis
- **Auto Scaling**: Handle traffic spikes secara otomatis  
- **Global Performance**: CDN worldwide untuk akses cepat
- **Secure**: HTTPS dan database encryption by default
- **Cost Effective**: Pay per usage, free tier tersedia

Dengan konfigurasi ini, aplikasi MusicReward siap untuk production deployment di Vercel dengan database PostgreSQL yang robust dan scalable.
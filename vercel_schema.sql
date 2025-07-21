-- MusicReward App - Vercel Postgres Database Schema
-- Schema untuk Vercel Postgres deployment - Clean setup tanpa data demo

-- 1. Tabel Users untuk sistem user management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- 2. Tabel Admins untuk sistem admin authentication
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabel Admin Sessions untuk manage session tokens
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabel Withdraw Requests untuk manage penarikan saldo
CREATE TABLE IF NOT EXISTS withdraw_requests (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    wallet_address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- 5. Tabel Admin Settings untuk konfigurasi aplikasi
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabel Featured Songs untuk manage musik trending yang diatur admin
CREATE TABLE IF NOT EXISTS featured_songs (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    thumbnail TEXT,
    duration INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Buat indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON withdraw_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id ON withdraw_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_featured_songs_active ON featured_songs(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_songs_order ON featured_songs(display_order);

-- Default admin account akan dibuat otomatis oleh aplikasi pada first deploy
-- Username: admin, Password: audio

-- Cleanup old sessions (maintenance)
DELETE FROM admin_sessions WHERE expires_at < NOW();

-- Verify tables created successfully
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'admins', 'admin_sessions', 'withdraw_requests', 'admin_settings', 'featured_songs');
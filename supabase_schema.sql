-- MusicReward App - Supabase Database Schema
-- Copy dan jalankan script ini di Supabase SQL Editor

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

-- Insert default admin account (password: "audio" di-hash dengan bcrypt)
-- Password hash untuk "audio" adalah: $2b$10$rJm8FZQQQpZ1qXqNlOQ1Ee8YvYvF9xqXqZ1qXqNlOQ1Ee8YvYvF9x
INSERT INTO admins (username, password) 
VALUES ('admin', '$2b$10$rJm8FZQQQpZ1qXqNlOQ1Ee8YvYvF9xqXqZ1qXqNlOQ1Ee8YvYvF9x')
ON CONFLICT (username) DO NOTHING;

-- Beberapa contoh featured songs (opsional)
INSERT INTO featured_songs (video_id, title, artist, thumbnail, duration, display_order, is_active) VALUES
('k1BfsO0mxWQ', 'Dan...', 'Sheila On 7', 'https://lh3.googleusercontent.com/h52YQ8oAiGCiZFp5W1RGaj8GQMde1hNmYV7_ad3XgWcygvz7riguymmuvMj2yUoP1qhU2C3zoDJu72w=w120-h120-l90-rj', 289, 1, true),
('n8rLISm84_k', 'Kenangan Terindah', 'SAMSONS', 'https://lh3.googleusercontent.com/XW4hSDaZw1EuQ2IPDFBtM8DrEvwSpZnYpIbsBB_TJeeCJ7ZbesyY3EMQUi_i5FjC2lpoEJxNvqZAXLbj=w120-h120-s-l90-rj', 247, 2, true),
('k2XdBPv0D3Y', 'Surat Cinta Untuk Starla', 'Virgoun', 'https://lh3.googleusercontent.com/4vDNSRQJkhhZjHK1xeBZuwYea4U4fa8ZLFMOKTqXpJoh0a3lbcG4GDWBqpXUpdOq2w2UbgAIdz9aKcm7=w120-h120-l90-rj', 309, 3, true)
ON CONFLICT DO NOTHING;

-- Cleanup old sessions (optional, untuk maintenance)
DELETE FROM admin_sessions WHERE expires_at < NOW();

-- Verify tables created successfully
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'admins', 'admin_sessions', 'withdraw_requests', 'admin_settings', 'featured_songs');

-- Show sample data
SELECT 'Admins:' as info, count(*) as count FROM admins
UNION ALL
SELECT 'Featured Songs:', count(*) FROM featured_songs;
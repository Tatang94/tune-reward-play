-- MusicReward PHP Version Database Schema
-- MySQL/MariaDB Compatible

CREATE DATABASE IF NOT EXISTS musicreward;
USE musicreward;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_listening_time INT DEFAULT 0, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Withdraw requests table
CREATE TABLE withdraw_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount INT NOT NULL, -- amount in cents (multiply by 100)
    wallet_address TEXT NOT NULL,
    payment_method ENUM('crypto', 'bank', 'ewallet') DEFAULT 'crypto',
    status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Admin settings table
CREATE TABLE admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Featured songs table
CREATE TABLE featured_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(20) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    thumbnail TEXT,
    duration INT DEFAULT 0, -- in seconds
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    play_count INT DEFAULT 0,
    reward_amount DECIMAL(4,2) DEFAULT 0.50, -- reward per 30 seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reward history table
CREATE TABLE reward_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    song_id INT,
    amount DECIMAL(4,2) NOT NULL,
    listening_duration INT DEFAULT 30, -- seconds listened
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES featured_songs(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_song_date (song_id, created_at)
);

-- User sessions table (for tracking user activity)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_activity (user_id, last_activity),
    INDEX idx_token (session_token)
);

-- Statistics table
CREATE TABLE daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_listening_time INT DEFAULT 0, -- in seconds
    total_rewards_given DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
    songs_played INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin account
INSERT INTO admins (username, password) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: 'audio'

-- Insert default admin settings for ads
INSERT INTO admin_settings (setting_key, setting_value, setting_type) VALUES 
('header_script', '', 'string'),
('header_active', '0', 'boolean'),
('footer_script', '', 'string'),
('footer_active', '0', 'boolean'),
('banner_script', '', 'string'),
('banner_active', '0', 'boolean'),
('popup_script', '', 'string'),
('popup_active', '0', 'boolean'),
('reward_per_30s', '0.50', 'number'),
('min_withdrawal', '10000', 'number'),
('site_maintenance', '0', 'boolean');

-- Insert sample featured songs (optional)
INSERT INTO featured_songs (video_id, title, artist, thumbnail, duration, display_order) VALUES 
('dQw4w9WgXcQ', 'Never Gonna Give You Up', 'Rick Astley', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 213, 1),
('kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi ft. Daddy Yankee', 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg', 281, 2),
('fJ9rUzIMcZQ', 'Bohemian Rhapsody', 'Queen', 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg', 355, 3);

-- Create indexes for better performance
CREATE INDEX idx_withdraw_status ON withdraw_requests(status);
CREATE INDEX idx_withdraw_user ON withdraw_requests(user_id);
CREATE INDEX idx_featured_active ON featured_songs(is_active, display_order);
CREATE INDEX idx_reward_user_date ON reward_history(user_id, created_at);
CREATE INDEX idx_sessions_activity ON user_sessions(last_activity);

-- Create views for easier reporting
CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM withdraw_requests WHERE status = 'pending') as pending_withdrawals,
    (SELECT COUNT(*) FROM featured_songs WHERE is_active = 1) as active_songs,
    (SELECT COUNT(*) FROM reward_history WHERE DATE(created_at) = CURDATE()) as today_rewards,
    (SELECT COALESCE(SUM(amount), 0) FROM reward_history WHERE DATE(created_at) = CURDATE()) as today_total_rewards;

CREATE VIEW user_stats AS
SELECT 
    user_id,
    COUNT(*) as total_sessions,
    SUM(amount) as total_earned,
    SUM(listening_duration) as total_listening_time,
    MAX(created_at) as last_activity
FROM reward_history 
GROUP BY user_id;

-- Stored procedures for common operations
DELIMITER //

CREATE PROCEDURE AddReward(
    IN p_user_id VARCHAR(50),
    IN p_song_id INT,
    IN p_amount DECIMAL(4,2),
    IN p_duration INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Add reward to history
    INSERT INTO reward_history (user_id, song_id, amount, listening_duration) 
    VALUES (p_user_id, p_song_id, p_amount, p_duration);
    
    -- Update song play count
    UPDATE featured_songs 
    SET play_count = play_count + 1 
    WHERE id = p_song_id;
    
    COMMIT;
END //

CREATE PROCEDURE ProcessWithdrawal(
    IN p_withdrawal_id INT,
    IN p_status VARCHAR(20),
    IN p_admin_id INT,
    IN p_notes TEXT
)
BEGIN
    UPDATE withdraw_requests 
    SET status = p_status,
        processed_at = NOW(),
        processed_by = p_admin_id,
        admin_notes = p_notes
    WHERE id = p_withdrawal_id;
END //

DELIMITER ;

-- Triggers for automatic stats updates
DELIMITER //

CREATE TRIGGER update_daily_stats_after_reward
    AFTER INSERT ON reward_history
    FOR EACH ROW
BEGIN
    INSERT INTO daily_stats (stat_date, songs_played, total_rewards_given)
    VALUES (CURDATE(), 1, NEW.amount)
    ON DUPLICATE KEY UPDATE
        songs_played = songs_played + 1,
        total_rewards_given = total_rewards_given + NEW.amount,
        updated_at = NOW();
END //

DELIMITER ;

-- Sample data cleanup events (optional)
-- Clean old sessions (older than 30 days)
CREATE EVENT cleanup_old_sessions
ON SCHEDULE EVERY 1 DAY
DO
DELETE FROM user_sessions 
WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Clean old reward history (older than 1 year, keep only summary)
CREATE EVENT cleanup_old_rewards
ON SCHEDULE EVERY 1 MONTH
DO
DELETE FROM reward_history 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Final note: Make sure to enable events if you want automatic cleanup
-- SET GLOBAL event_scheduler = ON;
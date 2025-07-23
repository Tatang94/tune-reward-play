<?php
// Helper Functions for MusicReward PHP

function getUserId() {
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 'user_' . uniqid();
    }
    return $_SESSION['user_id'];
}

function getUserBalance($pdo, $user_id) {
    if (!isset($_SESSION['balance'])) {
        $_SESSION['balance'] = 0.0;
    }
    return $_SESSION['balance'];
}

function addReward($amount = 0.5) {
    if (!isset($_SESSION['balance'])) {
        $_SESSION['balance'] = 0.0;
    }
    $_SESSION['balance'] += $amount;
    return $_SESSION['balance'];
}

function formatCurrency($amount) {
    return 'Rp ' . number_format($amount, 1, ',', '.');
}

function getFeaturedSongs($pdo) {
    $stmt = $pdo->prepare("SELECT * FROM featured_songs WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC");
    $stmt->execute();
    return $stmt->fetchAll();
}

function getWithdrawRequests($pdo) {
    $stmt = $pdo->prepare("SELECT * FROM withdraw_requests ORDER BY created_at DESC");
    $stmt->execute();
    return $stmt->fetchAll();
}

function getAdminSetting($pdo, $key, $default = '') {
    $stmt = $pdo->prepare("SELECT setting_value FROM admin_settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $result = $stmt->fetch();
    return $result ? $result['setting_value'] : $default;
}

function setAdminSetting($pdo, $key, $value) {
    $stmt = $pdo->prepare("INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) 
                          ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP");
    $stmt->execute([$key, $value, $value]);
}

function searchYouTubeSongs($query, $maxResults = 50) {
    // Simulate YouTube search API
    // In real implementation, you would use YouTube Data API v3
    $songs = [
        [
            'id' => 'dQw4w9WgXcQ',
            'title' => 'Rick Astley - Never Gonna Give You Up',
            'artist' => 'Rick Astley',
            'thumbnail' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            'duration' => 213
        ],
        [
            'id' => 'kJQP7kiw5Fk',
            'title' => 'Luis Fonsi - Despacito ft. Daddy Yankee',
            'artist' => 'Luis Fonsi',
            'thumbnail' => 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
            'duration' => 281
        ],
        [
            'id' => 'fJ9rUzIMcZQ',
            'title' => 'Queen - Bohemian Rhapsody',
            'artist' => 'Queen',
            'thumbnail' => 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
            'duration' => 355
        ]
    ];
    
    // Filter by search query
    if (!empty($query)) {
        $songs = array_filter($songs, function($song) use ($query) {
            return stripos($song['title'], $query) !== false || stripos($song['artist'], $query) !== false;
        });
    }
    
    return array_slice($songs, 0, $maxResults);
}

function isAdminLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

function adminLogin($pdo, $username, $password) {
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        return true;
    }
    
    return false;
}

function adminLogout() {
    unset($_SESSION['admin_logged_in']);
    unset($_SESSION['admin_id']);
    unset($_SESSION['admin_username']);
}

function requireAdmin() {
    if (!isAdminLoggedIn()) {
        header('Location: ?page=monk&action=login');
        exit;
    }
}
?>
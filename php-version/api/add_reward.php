<?php
session_start();
require_once '../includes/functions.php';

header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $amount = $input['amount'] ?? 0.5;
    $song_id = $input['song_id'] ?? '';
    
    if ($amount <= 0) {
        throw new Exception('Invalid reward amount');
    }
    
    // Add reward to balance
    $new_balance = addReward($amount);
    
    // Update today's earnings
    if (!isset($_SESSION['today_earnings'])) {
        $_SESSION['today_earnings'] = 0.0;
    }
    $_SESSION['today_earnings'] += $amount;
    
    // Update listening time (increment by 30 seconds)
    if (!isset($_SESSION['listening_time'])) {
        $_SESSION['listening_time'] = 0;
    }
    $_SESSION['listening_time'] += 0.5; // 30 seconds = 0.5 minutes
    
    echo json_encode([
        'success' => true,
        'new_balance' => formatCurrency($new_balance),
        'raw_balance' => $new_balance,
        'reward_amount' => $amount,
        'song_id' => $song_id
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
<?php
session_start();
require_once '../config/database.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $amount = (int)($input['amount'] ?? 0);
    $wallet_address = trim($input['wallet_address'] ?? '');
    $user_id = getUserId();
    $current_balance = getUserBalance($pdo, $user_id);
    
    // Validation
    if ($amount < 10000) {
        throw new Exception('Minimum withdrawal amount is Rp 10,000');
    }
    
    if (empty($wallet_address)) {
        throw new Exception('Wallet address is required');
    }
    
    if ($current_balance < ($amount / 100)) {
        throw new Exception('Insufficient balance');
    }
    
    // Create withdrawal request
    $stmt = $pdo->prepare("INSERT INTO withdraw_requests (user_id, amount, wallet_address, status) VALUES (?, ?, ?, 'pending')");
    $success = $stmt->execute([$user_id, $amount, $wallet_address]);
    
    if ($success) {
        // Deduct from session balance (temporary until approved)
        $_SESSION['balance'] = $current_balance - ($amount / 100);
        
        echo json_encode([
            'success' => true,
            'message' => 'Withdrawal request submitted successfully',
            'new_balance' => formatCurrency($_SESSION['balance'])
        ]);
    } else {
        throw new Exception('Failed to create withdrawal request');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
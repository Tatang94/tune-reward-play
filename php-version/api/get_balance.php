<?php
session_start();
require_once '../includes/functions.php';

header('Content-Type: application/json');

try {
    $user_id = getUserId();
    $balance = getUserBalance(null, $user_id);
    
    echo json_encode([
        'success' => true,
        'balance' => formatCurrency($balance),
        'raw_balance' => $balance
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
<?php
session_start();
require_once 'config/database.php';
require_once 'includes/functions.php';

// Get current page
$page = $_GET['page'] ?? 'home';
$allowed_pages = ['home', 'player', 'dashboard', 'monk'];

if (!in_array($page, $allowed_pages)) {
    $page = 'home';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MusicReward - Dengarkan Musik & Dapatkan Reward</title>
    <meta name="description" content="Platform musik streaming dengan sistem reward. Dengarkan lagu favorit dan dapatkan Rp 0.5 setiap 30 detik!">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
                        <i class="fas fa-music mr-2"></i>MusicReward
                    </h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="?page=home" class="<?php echo $page === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'; ?>">
                        <i class="fas fa-home mr-1"></i>Beranda
                    </a>
                    <a href="?page=player" class="<?php echo $page === 'player' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'; ?>">
                        <i class="fas fa-play mr-1"></i>Pemutar
                    </a>
                    <a href="?page=dashboard" class="<?php echo $page === 'dashboard' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'; ?>">
                        <i class="fas fa-chart-line mr-1"></i>Dashboard
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4">
        <?php
        switch ($page) {
            case 'home':
                include 'pages/home.php';
                break;
            case 'player':
                include 'pages/player.php';
                break;
            case 'dashboard':
                include 'pages/dashboard.php';
                break;
            case 'monk':
                include 'admin/admin_panel.php';
                break;
            default:
                include 'pages/home.php';
                break;
        }
        ?>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2025 MusicReward. Dengarkan musik, dapatkan reward!</p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="assets/js/app.js"></script>
</body>
</html>
// MusicReward PHP Version - Main JavaScript

// Utility functions
function formatCurrency(amount) {
    return 'Rp ' + parseFloat(amount).toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-3"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Loading spinner utility
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
    element.disabled = true;
    return originalContent;
}

function hideLoading(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
        element.innerHTML = originalContent;
        delete element.dataset.originalContent;
    }
    element.disabled = false;
}

// API wrapper function
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Global balance updater
let balanceUpdateInterval;

function startBalanceUpdater() {
    if (balanceUpdateInterval) {
        clearInterval(balanceUpdateInterval);
    }
    
    balanceUpdateInterval = setInterval(async () => {
        try {
            const response = await apiRequest('api/get_balance.php');
            if (response.success) {
                // Update all balance displays
                const balanceElements = document.querySelectorAll('[id*="balance"]');
                balanceElements.forEach(element => {
                    if (element.textContent.includes('Rp')) {
                        element.textContent = response.balance;
                    }
                });
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    }, 10000); // Update every 10 seconds
}

function stopBalanceUpdater() {
    if (balanceUpdateInterval) {
        clearInterval(balanceUpdateInterval);
        balanceUpdateInterval = null;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Start balance updater on pages that need it
    const currentPage = new URLSearchParams(window.location.search).get('page') || 'home';
    if (['home', 'player', 'dashboard'].includes(currentPage)) {
        startBalanceUpdater();
    }
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add click effects to cards
    document.querySelectorAll('.card-hover').forEach(card => {
        card.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'absolute inset-0 bg-white opacity-20 rounded-lg transform scale-0';
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            // Animate ripple
            ripple.style.transform = 'scale(1)';
            ripple.style.transition = 'transform 0.3s ease-out';
            
            setTimeout(() => {
                ripple.remove();
            }, 300);
        });
    });
    
    // Add form validation styles
    document.querySelectorAll('input, textarea, select').forEach(element => {
        element.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('border-red-500');
                this.classList.remove('border-gray-300');
            } else {
                this.classList.remove('border-red-500');
                this.classList.add('border-gray-300');
            }
        });
        
        element.addEventListener('input', function() {
            if (this.classList.contains('border-red-500') && this.value.trim()) {
                this.classList.remove('border-red-500');
                this.classList.add('border-gray-300');
            }
        });
    });
    
    // Auto-hide alerts after 10 seconds
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 10000);
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopBalanceUpdater();
});

// Export functions for global use
window.MusicReward = {
    formatCurrency,
    showNotification,
    showLoading,
    hideLoading,
    apiRequest,
    startBalanceUpdater,
    stopBalanceUpdater
};
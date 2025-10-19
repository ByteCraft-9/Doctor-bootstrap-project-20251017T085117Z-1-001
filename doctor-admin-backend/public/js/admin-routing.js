// Admin URL Routing
document.addEventListener('DOMContentLoaded', () => {
    // Check if the current URL contains '/admin'
    if (window.location.pathname.includes('/admin')) {
        // Check if user is already logged in
        const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        // If not on login page and not logged in, redirect to login
        if (!window.location.pathname.endsWith('login.html') && !isAdminLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
        
        // If on login page and already logged in, redirect to admin dashboard
        if (window.location.pathname.endsWith('login.html') && isAdminLoggedIn) {
            window.location.href = 'index.html';
            return;
        }
    }
});

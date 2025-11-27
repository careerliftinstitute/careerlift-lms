/* js/main.js */

// 1. SELECT ELEMENTS
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('mobile-menu');
const navLinksContainer = document.querySelector('.nav-links'); // Renamed for clarity

// 2. STICKY NAVBAR LOGIC
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 3. MOBILE MENU TOGGLE
if(menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        
        const icon = menuToggle.querySelector('i');
        if(navLinksContainer.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
}

// 4. USER PROFILE LOGIC (The New Part)
function updateUserNavbar() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Only run if user is logged in
    if (userStr && token) {
        const user = JSON.parse(userStr);
        
        // 1. Find the Login and Register buttons to hide them
        const loginBtn = document.querySelector('a[href="login.html"]');
        const registerBtn = document.querySelector('a[href="register.html"]');

        // Hide the parent <li> elements if the buttons exist
        if (loginBtn) loginBtn.parentElement.style.display = 'none';
        if (registerBtn) registerBtn.parentElement.style.display = 'none';

        // 2. Create the Profile Element
        // We check if it already exists to avoid duplicates
        if (!document.getElementById('user-profile-li')) {
            const profileLi = document.createElement('li');
            profileLi.id = 'user-profile-li';
            
            // Get first letter of name for Avatar
            const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

            // Style matches your Glassmorphism theme
            profileLi.innerHTML = `
                <div class="user-badge" style="display: flex; align-items: center; gap: 10px; padding: 5px 15px; background: rgba(255,255,255,0.1); border-radius: 50px; border: 1px solid var(--glass-border);">
                    <div style="width: 32px; height: 32px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0f172a; font-weight: bold;">
                        ${initial}
                    </div>
                    <span style="color: #fff; font-size: 0.9rem; font-weight: 500;">${user.name}</span>
                    <button onclick="handleLogout()" style="background: none; border: none; color: var(--color-text-muted); cursor: pointer; margin-left: 5px;" title="Logout">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            `;

            // Append to the navbar
            navLinksContainer.appendChild(profileLi);
        }
    }
}

// 5. LOGOUT FUNCTION
window.handleLogout = function() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html'; // Redirect to home
    }
};

// 6. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    updateUserNavbar();
    
    // Close mobile menu when link clicked
    const navItems = document.querySelectorAll('.nav-links li a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if(navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });
});
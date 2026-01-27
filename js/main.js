/* js/main.js */

/* ================================
   1. DOM ELEMENTS
================================ */
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('mobile-menu');
const navMenu = document.getElementById('navMenu');

/* ================================
   2. STICKY NAVBAR
================================ */
window.addEventListener('scroll', () => {
    if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else if (navbar) {
        navbar.classList.remove('scrolled');
    }
});

/* ================================
   3. MOBILE MENU TOGGLE
================================ */
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');

        // Toggle icon bars <-> X
        const icon = menuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
}

/* ================================
   4. AUTH NAVBAR SWITCHER
================================ */
function updateNavbarAuth() {
    const userStr = localStorage.getItem('user');
    
    // Only try to update if navMenu exists (avoids errors on blank pages)
    if (!navMenu) return;

    if (userStr) {
        try {
            const user = JSON.parse(userStr);

            /* A. Hide Login + Register */
            const loginBtn = document.querySelector('a[href="login.html"]');
            const registerBtn = document.querySelector('a[href="register.html"]');

            if (loginBtn && loginBtn.parentElement)
                loginBtn.parentElement.style.display = 'none';
            if (registerBtn && registerBtn.parentElement)
                registerBtn.parentElement.style.display = 'none';

            /* =============================================
               B. Add Smart Profile Badge
            ============================================= */
            if (!document.getElementById('nav-profile-item')) {
                const li = document.createElement('li');
                li.id = 'nav-profile-item';

                // 1. First name only
                let firstName = user.name ? user.name.split(' ')[0] : 'User';

                // 2. Capitalize first letter
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

                // 3. Smart icon + name
                li.innerHTML = `
                    <a href="profile.html" class="nav-profile-smart">
                        <i class="fa-regular fa-user"></i>
                        <span>${firstName}</span>
                    </a>
                `;

                navMenu.appendChild(li);
            }

        } catch (e) {
            console.error("Error loading user profile:", e);
            localStorage.removeItem('user');
        }
    }
}

/* ================================
   5. GLOBAL LOGOUT FUNCTION
================================ */
window.handleLogout = function () {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
};

/* ================================
   6. PAGE TRANSITION HANDLER (Optimized)
================================ */
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    
    // Only intercept if it's a valid internal link
    if (anchor && anchor.href && anchor.target !== '_blank') {
        const targetUrl = new URL(anchor.href);
        
        // Check if link is same origin and not a hash link (e.g., #contact)
        if (targetUrl.origin === window.location.origin && !anchor.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            
            // Fade Out
            document.body.classList.remove('loaded');
            
            // Wait 200ms then navigate (Fast transition)
            setTimeout(() => {
                window.location.href = anchor.href;
            }, 200); 
        }
    }
});

/* ================================
   7. INITIALIZE
================================ */
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuth();
    
    // Trigger Fade In on load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 50);
});
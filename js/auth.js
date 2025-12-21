/* js/auth.js */

/* =============================
   1. API CONFIGURATION
============================= */
const API_URL = 'http://localhost:5000/api/auth';

/* =============================
   2. LOGIN LOGIC
============================= */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // 🔥 GET LOGIN TYPE (Student or Admin)
        // This input exists in login.html and changes when Admin Mode is toggled
        const typeInput = document.getElementById('loginType'); 
        const loginType = typeInput ? typeInput.value : 'student';

        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 🔥 Sending loginType to backend
                body: JSON.stringify({ email, password, loginType }) 
            });

            const data = await response.json();

            // Handle Errors
            if (!response.ok) {
                alert(data.message || "Login failed");
                btn.innerText = originalText;
                btn.disabled = false;
                return;
            }

            // SUCCESS: Save Token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }

        } catch (err) {
            console.error("Login Error:", err);
            alert("Server connection failed. Ensure the backend is running.");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

/* =============================
   3. REGISTER LOGIC
============================= */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value || "";
        const gender = document.getElementById('gender')?.value;
        const age = parseInt(document.getElementById('age')?.value);
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            document.getElementById('password').focus();
            return;
        }

        const btn = registerForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Creating Account...";
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, gender, age, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! Please log in.");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Registration failed");
                btn.innerText = originalText;
                btn.disabled = false;
            }

        } catch (error) {
            console.error("Register Error:", error);
            alert("Server connection failed.");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

/* =============================
   4. LOGOUT FUNCTION
============================= */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/* =============================
   5. CHECK AUTH STATUS (UPDATED UI)
============================= */
function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Navbar Elements
    const loginBtn = document.querySelector('a[href="login.html"]');
    const registerBtn = document.querySelector('a[href="register.html"]');
    
    // Profile Page Element (The Admin Button in profile.html)
    const profileAdminBtn = document.getElementById('profileAdminBtn'); 

    if (token && userStr) {
        const user = JSON.parse(userStr);

        // 1. Change "Login" button to "Profile"
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fa-regular fa-user"></i> Profile';
            loginBtn.href = "profile.html"; 
            loginBtn.classList.remove('btn-outline');
            
            // Remove old listeners (clone node trick)
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        }

        // 2. Hide "Join Free" button
        if (registerBtn) {
            registerBtn.style.display = "none"; 
        }

        // 3. PROFILE PAGE LOGIC: Show Admin Button if Admin
        if (profileAdminBtn && user.role === 'admin') {
            profileAdminBtn.style.display = "inline-flex"; 
        }
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', checkAuth);
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
        const btn = loginForm.querySelector('button');

        const originalText = btn.innerText;
        btn.innerText = 'Logging in...';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            alert('Login Successful!');

            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }

        } catch (err) {
            console.error(err);
            alert("Server not responding. Is backend running?");
        } finally {
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

        // ✅ Password confirmation check
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
            }

        } catch (error) {
            console.error(error);
            alert("Server not responding.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

/* =============================
   4. LOGOUT
============================= */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/* =============================
   5. CHECK AUTH STATUS
============================= */
function checkAuth() {
    const token = localStorage.getItem('token');
    const loginBtn = document.querySelector('a[href="login.html"]');
    const registerBtn = document.querySelector('a[href="register.html"]');

    if (token && loginBtn) {
        loginBtn.innerText = "Logout";
        loginBtn.href = "#";
        loginBtn.addEventListener('click', logout);

        if (registerBtn) registerBtn.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);

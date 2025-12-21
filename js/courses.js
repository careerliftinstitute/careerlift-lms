/* js/courses.js */

const API_URL = 'http://localhost:5000/api';

// ELEMENTS
const grid = document.getElementById('courseGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const successModal = document.getElementById('successModal');
const successTitle = document.getElementById('successTitle');
const successMessage = document.getElementById('successMessage');

let allCourses = [];
let myEnrollments = []; // Changed from ID array to Object Array

// ==========================================
// [NEW] GOOGLE DRIVE MAGIC LINK HELPER
// ==========================================
function processDriveLink(url) {
    if (url && url.includes('drive.google.com')) {
        try {
            const idPart = url.split('/d/')[1];
            const imageId = idPart.split('/')[0];
            // Magic Link Format
            return `https://lh3.googleusercontent.com/d/${imageId}`;
        } catch (err) {
            console.error("Link conversion failed", err);
            return url;
        }
    }
    return url;
}

// ====================
// 1. AUTH HELPERS
// ====================
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

function getUserId() {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    try {
        const user = JSON.parse(userString);
        return user.id || user._id; 
    } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
    }
}

// ====================
// 2. FETCH DATA
// ====================
async function loadPageData() {
    if (!grid) return;
    grid.innerHTML = '<h3 style="color:white; text-align:center;">Loading Courses...</h3>';

    try {
        // Step A: Fetch Enrollments (if logged in)
        if (isLoggedIn()) {
            const userId = getUserId();
            if (userId) {
                try {
                    const enrollRes = await fetch(`${API_URL}/enrollments/my-enrollments/${userId}`);
                    if (enrollRes.ok) {
                        myEnrollments = await enrollRes.json(); // [{ id: "...", status: "..." }]
                    }
                } catch (err) {
                    console.error("Failed to fetch enrollments", err);
                }
            }
        }

        // Step B: Fetch Courses
        const res = await fetch(`${API_URL}/courses`);
        if (!res.ok) throw new Error("Failed to fetch courses");
        allCourses = await res.json();

        // Step C: Render
        renderCourses(allCourses);

    } catch (err) {
        console.error(err);
        grid.innerHTML = '<h3 style="color:red; text-align:center;">Server Error. Backend might be down.</h3>';
    }
}

// ====================
// 3. RENDER COURSES (UPDATED LOGIC + IMG FIX)
// ====================
function renderCourses(data) {
    grid.innerHTML = '';
    if (data.length === 0) {
        grid.innerHTML = '<h3 style="grid-column:1/-1; text-align:center; color:#fff;">No courses found.</h3>';
        return;
    }

    data.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';

        // [FIX] Process the thumbnail link here
        const thumbUrl = processDriveLink(course.thumbnail);

        const badgeClass = course.type === 'free' ? 'badge free' : 'badge';
        let actionButtons = '';

        // Find user's specific enrollment for this course
        const enrollment = myEnrollments.find(e => e.id === course._id);

        // --- LOGIC START ---
        if (enrollment && enrollment.status === 'active') {
            // CASE 1: ACTIVE -> View Course
            actionButtons = `
                <button class="btn-enroll" style="width:100%; background: #8b5cf6;" onclick="window.location.href='course-view.html?id=${course._id}'">
                    View Course <i class="fa-solid fa-arrow-right"></i>
                </button>`;
        } else {
            // CASE 2: NOT ACTIVE (Free or Paid)
            if (course.type === 'free') {
                actionButtons = `<button class="btn-enroll" style="width:100%; background:#22c55e;" onclick="handleFreeEnroll('${course._id}')">Enroll Free</button>`;
            } else {
                // Paid Course Logic
                let prebookBtn = `<button class="btn-prebook" onclick="openPrebook('${course._id}')">Pre-book</button>`;
                
                // If already prebooked, disable the Pre-book button
                if (enrollment && enrollment.status === 'prebooked') {
                    prebookBtn = `<button class="btn-prebook" style="opacity:0.6; cursor:not-allowed; background:#fbbf24; color:#000;">Request Sent</button>`;
                }

                actionButtons = `
                    <div class="btn-group">
                        ${prebookBtn}
                        <button class="btn-enroll" onclick="openPaidEnroll('${course._id}')">Enroll (Code)</button>
                    </div>`;
            }
        }
        // --- LOGIC END ---

        card.innerHTML = `
            <img src="${thumbUrl}" alt="${course.title}" class="course-image" referrerpolicy="no-referrer" loading="lazy">
            <div class="${badgeClass}">${course.category}</div>
            <div class="course-info">
                <h3>${course.title}</h3>
                <div class="course-meta">
                    <span><i class="fa-solid fa-star"></i> ${course.rating || 5.0}</span>
                    <span><i class="fa-solid fa-tag"></i> ${course.type}</span>
                </div>
                <div class="course-footer">
                    <span class="price">${course.type === 'free' ? 'Free' : course.price}</span>
                    ${actionButtons}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ====================
// 4. FILTERS
// ====================
function filterCourses() {
    const searchText = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;

    const filtered = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchText);
        const matchesCategory = categoryValue === 'all' || course.category === categoryValue || (categoryValue === 'free' && course.type === 'free');
        return matchesSearch && matchesCategory;
    });
    renderCourses(filtered);
}

if (searchInput) searchInput.addEventListener('input', filterCourses);
if (categoryFilter) categoryFilter.addEventListener('change', filterCourses);

// ====================
// 5. MODAL LOGIC
// ====================
const prebookModal = document.getElementById('prebookModal');
const enrollPaidModal = document.getElementById('enrollPaidModal');

window.closeModals = function () {
    prebookModal?.classList.remove('active');
    enrollPaidModal?.classList.remove('active');
    successModal?.classList.remove('active');
};

window.openPrebook = function (id) {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    document.getElementById('prebookCourseId').value = id;
    prebookModal.classList.add('active');
};

window.openPaidEnroll = function (id) {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    document.getElementById('enrollCourseId').value = id;
    enrollPaidModal.classList.add('active');
};

function showSuccess(title, message) {
    successTitle.innerText = title;
    successMessage.innerText = message;
    successModal.classList.add('active');
}

// ====================
// 6. HANDLERS
// ====================

// FREE ENROLL
window.handleFreeEnroll = async function (courseId) {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    const userId = getUserId();

    try {
        const res = await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId })
        });
        const data = await res.json();
        
        if (res.ok) {
            showSuccess("Enrolled Successfully!", "Redirecting...");
            setTimeout(() => { window.location.href = `course-view.html?id=${courseId}`; }, 1500);
        } else {
            if(data.message.includes("already")) window.location.href = `course-view.html?id=${courseId}`;
            else alert(data.message);
        }
    } catch (err) { showSuccess("Error", "Connection failed."); }
};

// PRE-BOOK SUBMIT
document.getElementById('prebookForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const courseId = document.getElementById('prebookCourseId').value;
    const userId = getUserId();

    try {
        const res = await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId, status: 'prebooked' })
        });
        const data = await res.json();
        
        if (res.ok) {
            closeModals();
            showSuccess("Request Received!", "We will contact you shortly.");
            loadPageData(); // Refresh to show "Request Sent" button
        } else {
            alert(data.message || "Failed");
        }
    } catch (err) { alert("Error connecting to server"); }
});

// PAID ENROLL SUBMIT
document.getElementById('enrollPaidForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const courseId = document.getElementById('enrollCourseId').value;
    const userId = getUserId();
    const code = document.getElementById('enCode').value;

    if (!code || code.length < 3) return alert("Please enter valid code");

    try {
        const res = await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId, status: 'active', code: code })
        });
        const data = await res.json();
        
        if (res.ok) {
            closeModals();
            showSuccess("Enrollment Successful", "Redirecting...");
            setTimeout(() => { window.location.href = `course-view.html?id=${courseId}`; }, 1500);
        } else {
            alert(data.message || "Invalid Code");
        }
    } catch (err) { alert("Error connecting to server"); }
});

// INIT
loadPageData();
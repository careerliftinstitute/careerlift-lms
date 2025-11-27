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
let myEnrolledCourseIds = []; 

// ====================
// 1. AUTH HELPERS
// ====================
function isLoggedIn() {
    return localStorage.getItem('user') !== null && localStorage.getItem('token') !== null;
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
// 2. FETCH DATA (Sequential Loading)
// ====================
async function loadPageData() {
    if (!grid) return;
    grid.innerHTML = '<h3 style="color:white; text-align:center;">Loading Courses...</h3>';

    try {
        // Step A: If logged in, fetch enrollments FIRST
        if (isLoggedIn()) {
            const userId = getUserId();
            if (userId) {
                try {
                    const enrollRes = await fetch(`${API_URL}/enrollments/my-enrollments/${userId}`);
                    if (enrollRes.ok) {
                        myEnrolledCourseIds = await enrollRes.json(); // ["id1", "id2"]
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
// 3. RENDER COURSES (Smart Buttons)
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

        const badgeClass = course.type === 'free' ? 'badge free' : 'badge';
        let actionButtons = '';

        // Check if user owns this course
        const isEnrolled = myEnrolledCourseIds.includes(course._id);

        if (isEnrolled) {
            // CASE 1: ALREADY ENROLLED -> VIEW BUTTON
            actionButtons = `
                <button class="btn-enroll" style="width:100%; background: #8b5cf6;" onclick="window.location.href='course-view.html?id=${course._id}'">
                    View Course <i class="fa-solid fa-arrow-right"></i>
                </button>`;
        } else {
            // CASE 2: NOT ENROLLED
            if (course.type === 'free') {
                actionButtons = `<button class="btn-enroll" style="width:100%; background:#22c55e;" onclick="handleFreeEnroll('${course._id}')">Enroll Free</button>`;
            } else {
                actionButtons = `
                    <div class="btn-group">
                        <button class="btn-prebook" onclick="openPrebook('${course._id}')">Pre-book</button>
                        <button class="btn-enroll" onclick="openPaidEnroll('${course._id}')">Enroll</button>
                    </div>`;
            }
        }

        card.innerHTML = `
            <img src="${course.thumbnail}" alt="${course.title}" class="course-image">
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
// 4. FILTERS & SEARCH
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
// 6. ENROLLMENT HANDLERS
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
            // If duplicate, just redirect
            if(data.message.includes("already")) window.location.href = `course-view.html?id=${courseId}`;
            else alert(data.message);
        }
    } catch (err) {
        showSuccess("Error", "Connection failed.");
    }
};

// PRE-BOOK SUBMIT
document.getElementById('prebookForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const courseId = document.getElementById('prebookCourseId').value;
    const userId = getUserId();
    const contactName = document.getElementById('pbName').value;
    const contactPhone = document.getElementById('pbPhone').value;

    try {
        const res = await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId, contactName, contactPhone, status: 'prebooked' })
        });
        const data = await res.json();
        
        if (res.ok) {
            closeModals();
            showSuccess("Pre-book Successful", "We will contact you at " + contactPhone);
            // Reload to update UI if needed
            loadPageData();
        } else {
            alert(data.message);
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
            showSuccess("Enrollment Successful", "Redirecting to course...");
            setTimeout(() => { window.location.href = `course-view.html?id=${courseId}`; }, 1500);
        } else {
            if(data.message.includes("already")) window.location.href = `course-view.html?id=${courseId}`;
            else alert(data.message);
        }
    } catch (err) { alert("Error connecting to server"); }
});

// INIT
loadPageData();
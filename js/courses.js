/* js/courses.js */

const API_URL = 'https://careerlift-lms.onrender.com/api';

// ELEMENTS
const grid = document.getElementById('courseGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

let allCourses = [];
let myEnrollments = []; // স্টুডেন্টের এনরোল করা কোর্সের লিস্ট

// ==========================================
// [HELPER] GOOGLE DRIVE LINK FIX
// ==========================================
function processDriveLink(url) {
    if (url && url.includes('drive.google.com')) {
        try {
            const idPart = url.split('/d/')[1];
            const imageId = idPart.split('/')[0];
            return `https://lh3.googleusercontent.com/d/${imageId}`;
        } catch (err) {
            return url;
        }
    }
    return url;
}

// ==========================================
// 1. FETCH DATA (Courses + User Status)
// ==========================================
async function loadPageData() {
    if (!grid) return;
    
    // Loader
    grid.innerHTML = `
        <div class="loader-box">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:#0ea5e9;"></i>
            <p style="margin-top:15px;">Loading Courses...</p>
        </div>`;

    try {
        // A. Fetch All Courses
        const courseRes = await fetch(`${API_URL}/courses`);
        if (!courseRes.ok) throw new Error("Failed to fetch courses");
        allCourses = await courseRes.json();

        // B. Fetch Enrollments (If Logged In)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const enrollRes = await fetch(`${API_URL}/enrollments/my-enrollments/${user.id}`);
                if (enrollRes.ok) {
                    myEnrollments = await enrollRes.json(); // Returns array of { id: "...", status: "..." }
                }
            } catch (e) {
                console.log("User not logged in or fetch failed");
            }
        }

        // C. Render
        renderCourses(allCourses);

    } catch (err) {
        console.error(err);
        grid.innerHTML = '<h3 style="grid-column:1/-1; color:red; text-align:center;">Server Error. Please try again later.</h3>';
    }
}

// ==========================================
// 2. RENDER COURSES (SMART LOGIC)
// ==========================================
function renderCourses(data) {
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = '<h3 style="grid-column:1/-1; text-align:center; color:#94a3b8;">No courses found.</h3>';
        return;
    }

    data.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';

        // 1. Check Enrollment Status
        const enrolledInfo = myEnrollments.find(e => e.id === course._id);
        const isEnrolled = enrolledInfo && enrolledInfo.status === 'active';
        const isPending = enrolledInfo && enrolledInfo.status === 'prebooked';

        // 2. Thumbnail
        const thumbUrl = processDriveLink(course.thumbnail);

        // 3. Badge Color Logic
        let badgeClass = 'badge-blue';
        const catLower = (course.category || '').toLowerCase();
        if (catLower.includes('it') || catLower.includes('freelancing') || catLower.includes('programming')) badgeClass = 'badge-purple';
        if (catLower.includes('medical') || catLower.includes('care')) badgeClass = 'badge-green';

        // 4. Student Text Logic
        let studentText = course.students || "0";
        // যদি টেক্সটে 'Students' শব্দটি না থাকে, তাহলে যোগ করে দাও
        if(!studentText.toLowerCase().includes('students')) {
            studentText += " Students";
        }

        // 5. Price & Button Logic
        let priceHtml = '';
        let buttonHtml = '';

        if (isEnrolled) {
            // CASE: ENROLLED
            priceHtml = `<span class="price-tag" style="color:#22c55e;"><i class="fa-solid fa-circle-check"></i> Enrolled</span>`;
            buttonHtml = `
                <a href="course-view.html?id=${course._id}" class="btn-view-details" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
                    Continue Learning <i class="fa-solid fa-play"></i>
                </a>`;
        } else if (isPending) {
            // CASE: PENDING
            priceHtml = `<span class="price-tag" style="color:#fbbf24;">Request Sent</span>`;
            buttonHtml = `
                <button class="btn-view-details" style="background: #334155; cursor: default; opacity: 0.7;">
                    Pending Approval <i class="fa-solid fa-clock"></i>
                </button>`;
        } else {
            // CASE: NEW USER
            if (course.type === 'free') {
                priceHtml = `<span class="price-tag free">Free Access</span>`;
            } else {
                // Show Price
                priceHtml = `<span class="price-tag">${course.price}</span>`;
            }

            buttonHtml = `
                <a href="course-details.html?id=${course._id}" class="btn-view-details">
                    View Details <i class="fa-solid fa-arrow-right"></i>
                </a>`;
        }

        // 6. Render HTML
        card.innerHTML = `
            <div class="card-thumb-wrapper">
                <img src="${thumbUrl}" alt="${course.title}" class="course-image" loading="lazy">
                <span class="badge ${badgeClass}">${course.category || 'General'}</span>
            </div>
            
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                
                <div class="rating-row">
                    <i class="fa-solid fa-star"></i>
                    <span>${course.rating || 5.0} (${studentText})</span>
                </div>
                
                <div class="course-footer">
                    <div>${priceHtml}</div>
                    ${buttonHtml}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// 3. FILTER LOGIC
// ==========================================
function filterCourses() {
    const searchText = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;

    const filtered = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchText);
        
        let matchesCategory = true;
        if (categoryValue === 'free') matchesCategory = (course.type === 'free');
        else if (categoryValue === 'paid') matchesCategory = (course.type === 'paid');
        else if (categoryValue === 'medical') matchesCategory = (course.category.toLowerCase().includes('medical'));
        else if (categoryValue === 'freelancing') matchesCategory = (course.category.toLowerCase().includes('freelancing') || course.category.toLowerCase().includes('it'));
        else if (categoryValue !== 'all') matchesCategory = (course.category === categoryValue);

        return matchesSearch && matchesCategory;
    });
    renderCourses(filtered);
}

// Event Listeners
if (searchInput) searchInput.addEventListener('input', filterCourses);
if (categoryFilter) categoryFilter.addEventListener('change', filterCourses);

// ==========================================
// 4. INIT
// ==========================================
loadPageData();
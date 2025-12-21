/* js/admin.js */

// 🔥 FIX: Renamed variable to avoid conflict with auth.js
/* js/admin.js */

// আগের localhost লিংকটি মুছে নিচেরটি বসান:
const ADMIN_API = "https://careerlift-lms.onrender.com/api";

// ==========================================
// GOOGLE DRIVE MAGIC LINK
// ==========================================
function processDriveLink(url) {
    if (url && url.includes('drive.google.com')) {
        try {
            const idPart = url.split('/d/')[1];
            const imageId = idPart.split('/')[0];
            return `https://lh3.googleusercontent.com/d/${imageId}`;
        } catch (err) {
            console.error("Link conversion failed", err);
            return url;
        }
    }
    return url;
}

// ==============================
// ADMIN AUTH CHECK & INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Check Login
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        window.location.href = "login.html";
        return;
    }

    // 2. Check Admin Role
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
        alert("Access Denied: Admins only!");
        window.location.href = "index.html";
        return;
    }

    // 3. Load Data
    console.log("Admin Loaded. Fetching data...");
    fetchUsers();
    fetchCourses();
    fetchEnrollments();
});

// ===========================
// SECTION NAVIGATION
// ===========================
function showSection(id) {
    // Hide all sections
    document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
    // Show clicked section
    const activeSection = document.getElementById(id);
    if (activeSection) activeSection.classList.add("active");

    // Update Menu Active State
    // (We use a simple approach to find the clicked menu item based on text or icon logic is hard from JS alone, 
    // so we rely on the HTML onclick to handle the visual toggle if needed, or simply reset all)
    document.querySelectorAll(".menu li").forEach(li => li.classList.remove("active"));
    
    // Attempt to highlight the clicked item if event exists
    if(window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active");
    }
}

// ===========================
// TOGGLE PAID/FREE FIELDS
// ===========================
function toggleCourseFields() {
    const type = document.getElementById("cType").value;
    document.getElementById("freeFields").style.display = type === "free" ? "block" : "none";
    document.getElementById("paidFields").style.display = type === "paid" ? "block" : "none";
}

// ===========================
// ADD LECTURE INPUT
// ===========================
function addLectureField() {
    const container = document.getElementById("lectureContainer");
    const div = document.createElement("div");
    div.className = "lecture-row form-row"; 
    div.innerHTML = `
        <input type="text" class="lec-title" placeholder="Lecture Title">
        <input type="text" class="lec-link" placeholder="Meeting Link">
    `;
    container.appendChild(div);
}

// ===========================
// ADD COURSE
// ===========================
const addCourseForm = document.getElementById("addCourseForm");
if (addCourseForm) {
    addCourseForm.addEventListener("submit", async e => {
        e.preventDefault();

        const type = document.getElementById("cType").value;
        const rawThumb = document.getElementById("cThumb").value;
        const processedThumb = processDriveLink(rawThumb);

        const courseData = {
            title: document.getElementById("cTitle").value,
            category: document.getElementById("cCategory").value,
            thumbnail: processedThumb,
            type,
            price: type === "free" ? "Free" : document.getElementById("cPrice").value,
        };

        if (type === "free") {
            courseData.syllabus = document.getElementById("cSyllabus").value;
            courseData.classNote = document.getElementById("cNote").value;
            courseData.videoLink = document.getElementById("cVideo").value;
        } else {
            courseData.overview = document.getElementById("cOverview").value;
            courseData.paidNote = document.getElementById("cPaidNote").value;
            courseData.specialCode = document.getElementById("cCode").value;

            courseData.lectures = [];
            const titles = document.querySelectorAll(".lec-title");
            const links = document.querySelectorAll(".lec-link");

            titles.forEach((t, i) => {
                if (t.value.trim() !== "") {
                    courseData.lectures.push({ title: t.value, link: links[i].value });
                }
            });
        }

        try {
            // 🔥 FIX: Use ADMIN_API
            const res = await fetch(`${ADMIN_API}/courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseData)
            });

            if (res.ok) {
                alert("Course added successfully!");
                fetchCourses();
                e.target.reset();
                showSection('manage-courses'); // Auto switch to list
            } else {
                alert("Failed to add course.");
            }
        } catch (err) {
            console.error("Add course error:", err);
            alert("Error adding course.");
        }
    });
}

// ===========================
// FETCH COURSES
// ===========================
async function fetchCourses() {
    try {
        // 🔥 FIX: Use ADMIN_API
        const res = await fetch(`${ADMIN_API}/courses`);
        const data = await res.json();

        const grid = document.getElementById("adminCourseGrid");
        if (!grid) return;
        
        grid.innerHTML = "";

        data.forEach(c => {
            grid.innerHTML += `
                <div class="dash-card" style="flex-direction:row; align-items:center; padding:10px; gap:15px; height:auto;">
                    <img src="${c.thumbnail || ''}" style="width:80px; height:60px; object-fit:cover; border-radius:6px;" referrerpolicy="no-referrer">
                    <div style="flex:1;">
                        <h4 style="margin:0; color:#fff;">${c.title}</h4>
                        <p style="margin:0; font-size:0.8rem; color:#94a3b8;">${c.type} • ${c.category}</p>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-small" onclick='openEditModal(${JSON.stringify(c)})'>Edit</button>
                        <button class="btn-small" style="color:#ef4444; border-color:#ef4444;" onclick="deleteCourse('${c._id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error fetching courses:", err);
    }
}

// ===========================
// DELETE COURSE
// ===========================
async function deleteCourse(id) {
    if (!confirm("Delete this course?")) return;
    try {
        await fetch(`${ADMIN_API}/courses/${id}`, { method: "DELETE" });
        fetchCourses();
    } catch (err) {
        console.error("Delete course error:", err);
    }
}

// ===========================
// EDIT COURSE LOGIC
// ===========================
function openEditModal(course) {
    document.getElementById('editId').value = course._id;
    document.getElementById('editTitle').value = course.title;
    document.getElementById('editCategory').value = course.category;
    document.getElementById('editThumb').value = course.thumbnail;
    document.getElementById('editPrice').value = course.price;
    document.getElementById('editOverview').value = course.overview || course.syllabus || "";

    document.getElementById('editCourseModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editCourseModal').style.display = 'none';
}

const editForm = document.getElementById('editCourseForm');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editId').value;
        const rawThumb = document.getElementById('editThumb').value;
        const processedThumb = processDriveLink(rawThumb);

        const updatedData = {
            title: document.getElementById('editTitle').value,
            category: document.getElementById('editCategory').value,
            thumbnail: processedThumb,
            price: document.getElementById('editPrice').value,
            overview: document.getElementById('editOverview').value
        };

        try {
            const res = await fetch(`${ADMIN_API}/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                alert("Course Updated Successfully!");
                closeEditModal();
                fetchCourses();
            } else {
                alert("Update failed.");
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    });
}

// ===========================
// FETCH USERS
// ===========================
async function fetchUsers() {
    try {
        const res = await fetch(`${ADMIN_API}/users`);
        const users = await res.json();

        const tbody = document.getElementById("userTableBody");
        if (!tbody) return;
        
        tbody.innerHTML = "";

        users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span style="padding:3px 8px; background:${u.role==='admin'?'#059669':'#2563eb'}; border-radius:4px; font-size:0.8rem;">${u.role}</span></td>
                    <td>${u.phone || 'N/A'}</td>
                    <td>
                        <button class="btn-small" onclick='openEditUserModal(${JSON.stringify(u)})'>Edit</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching users:", err);
    }
}


// ===========================
// EDIT USER LOGIC
// ===========================
function openEditUserModal(user) {
    document.getElementById('editUserId').value = user._id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPhone').value = user.phone || "";
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserModal').style.display = 'flex';
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

const editUserForm = document.getElementById('editUserForm');
if (editUserForm) {
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editUserId').value;
        const updatedData = {
            name: document.getElementById('editUserName').value,
            email: document.getElementById('editUserEmail').value,
            phone: document.getElementById('editUserPhone').value,
            role: document.getElementById('editUserRole').value
        };

        try {
            const res = await fetch(`${ADMIN_API}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                alert("User Updated Successfully!");
                closeEditUserModal();
                fetchUsers();
            } else {
                alert("Update failed.");
            }
        } catch (err) {
            console.error("Error updating user:", err);
        }
    });
}

// ===========================
// ENROLLMENT MANAGEMENT
// ===========================
async function fetchEnrollments() {
    try {
        const res = await fetch(`${ADMIN_API}/enrollments/all`);
        const data = await res.json();
        const tbody = document.getElementById('enrollmentTableBody');
        if(!tbody) return;

        tbody.innerHTML = '';
        data.forEach(e => {
            let color = e.status === 'prebooked' ? '#fbbf24' : '#22c55e';
            const name = e.contactName || (e.user ? e.user.name : 'Unknown');
            const phone = e.contactPhone || (e.user ? e.user.phone : 'N/A');

            let actionButtons = `
                <button class="btn-small" style="color:#ef4444; border-color:#ef4444;" onclick="deleteEnrollment('${e._id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            if(e.status === 'prebooked') {
                actionButtons = `
                    <button class="btn-small" style="color:#22c55e; border-color:#22c55e; margin-right:5px;" onclick="approveEnrollment('${e._id}')">
                        <i class="fa-solid fa-check"></i> Approve
                    </button>
                    ${actionButtons}
                `;
            }

            tbody.innerHTML += `
                <tr>
                    <td>
                        <strong style="color:#fff;">${name}</strong><br>
                        <small style="color:#94a3b8;">${phone}</small>
                    </td>
                    <td>${e.course ? e.course.title : 'Unknown'}</td>
                    <td>
                        <span style="padding:4px 8px; border:1px solid ${color}; color:${color}; border-radius:4px; font-size:0.75rem; text-transform:uppercase;">
                            ${e.status}
                        </span>
                    </td>
                    <td>${new Date(e.enrolledAt).toLocaleDateString()}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });
    } catch(err) { console.error(err); }
}

// APPROVE
async function approveEnrollment(id) {
    if(!confirm("Approve this student?")) return;
    try {
        const res = await fetch(`${ADMIN_API}/enrollments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
        });
        if(res.ok) {
            alert("Student Approved!");
            fetchEnrollments();
        }
    } catch(err) { console.error(err); }
}

// DELETE
async function deleteEnrollment(id) {
    if(!confirm("Delete enrollment?")) return;
    try {
        const res = await fetch(`${ADMIN_API}/enrollments/${id}`, { method: 'DELETE' });
        if(res.ok) {
            fetchEnrollments();
        }
    } catch(err) { console.error(err); }
}
/* js/admin.js */

const API_URL = "http://localhost:5000/api";

// ==============================
// ADMIN AUTH CHECK
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        alert("Unauthorized access");
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userStr);

    if (user.role !== "admin") {
        alert("Admins only!");
        window.location.href = "index.html";
        return;
    }

    fetchUsers();
    fetchCourses();
    fetchEnrollments();
});

// ===========================
// SECTION NAVIGATION
// ===========================
function showSection(id) {
    document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".menu li").forEach(li => li.classList.remove("active"));
    
    // Find the link that was clicked and add active class
    // Note: 'event' works because it is passed from the inline onclick in HTML
    if(event && event.currentTarget) {
        event.currentTarget.classList.add("active");
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
    div.className = "lecture-row form-row"; // Ensure both classes for CSS
    div.innerHTML = `
        <input type="text" class="lec-title" placeholder="Lecture Title">
        <input type="text" class="lec-link" placeholder="Meeting Link">
    `;
    container.appendChild(div);
}

// ===========================
// ADD COURSE
// ===========================
document.getElementById("addCourseForm").addEventListener("submit", async e => {
    e.preventDefault();

    const type = document.getElementById("cType").value;
    const courseData = {
        title: document.getElementById("cTitle").value,
        category: document.getElementById("cCategory").value,
        thumbnail: document.getElementById("cThumb").value,
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
        const res = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData)
        });

        if (res.ok) {
            alert("Course added successfully!");
            fetchCourses();
            e.target.reset();
        } else {
            alert("Failed to add course.");
        }
    } catch (err) {
        console.error("Add course error:", err);
        alert("Error adding course.");
    }
});

// ===========================
// FETCH COURSES
// ===========================
async function fetchCourses() {
    try {
        const res = await fetch(`${API_URL}/courses`);
        const data = await res.json();

        const grid = document.getElementById("adminCourseGrid");
        grid.innerHTML = "";

        data.forEach(c => {
            grid.innerHTML += `
                <div class="admin-card">
                    <img src="${c.thumbnail || ''}">
                    <h4>${c.title}</h4>
                    <p>${c.type || ''}</p>
                    <div style="display:flex; gap:8px; margin-top:8px;">
                        <button class="btn-small" onclick='openEditModal(${JSON.stringify(c)})'>Edit</button>
                        <button class="btn-small" style="color:red;border-color:red;" onclick="deleteCourse('${c._id}')">Delete</button>
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
        await fetch(`${API_URL}/courses/${id}`, { method: "DELETE" });
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

document.getElementById('editCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const updatedData = {
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value,
        thumbnail: document.getElementById('editThumb').value,
        price: document.getElementById('editPrice').value,
        overview: document.getElementById('editOverview').value
    };

    try {
        const res = await fetch(`${API_URL}/courses/${id}`, {
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
        alert("Error updating course.");
    }
});

// ===========================
// FETCH USERS
// ===========================
async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();

        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";

        users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span style="padding:3px 8px; background:${u.role==='admin'?'#0b4005ff':'#011f8cff'}; border-radius:4px;">${u.role}</span></td>
                    <td>${u.phone || 'N/A'}</td>
                    <td>
                        <button class="btn-small" onclick='openEditUserModal(${JSON.stringify(u)})'>Edit</button>
                        <button class="btn-small" onclick='viewUser("${u._id}")' style="margin-left:5px;">View</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching users:", err);
    }
}

// ===========================
// VIEW USER
// ===========================
async function viewUser(id) {
    try {
        const res = await fetch(`${API_URL}/users/${id}`);
        const u = await res.json();

        document.getElementById("mName").innerText = u.name;
        document.getElementById("mEmail").innerText = u.email;
        document.getElementById("mRole").innerText = u.role;
        document.getElementById("mPhone").innerText = u.phone || "N/A";
        document.getElementById("mDate").innerText = new Date(u.createdAt).toLocaleString();

        document.getElementById("userModal").style.display = "flex";
    } catch (err) {
        console.error("Error viewing user:", err);
    }
}

function closeUserModal() {
    document.getElementById("userModal").style.display = "none";
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

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const updatedData = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        phone: document.getElementById('editUserPhone').value,
        role: document.getElementById('editUserRole').value
    };

    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
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

// ===========================
// ENROLLMENT MANAGEMENT
// ===========================
async function fetchEnrollments() {
    try {
        const res = await fetch(`${API_URL}/enrollments/all`);
        const data = await res.json();
        const tbody = document.getElementById('enrollmentTableBody');
        if(!tbody) return;

        tbody.innerHTML = '';
        data.forEach(e => {
            let color = e.status === 'prebooked' ? '#fbbf24' : '#22c55e'; // Orange vs Green
            const name = e.contactName || (e.user ? e.user.name : 'Unknown');
            const phone = e.contactPhone || (e.user ? e.user.phone : 'N/A');

            // Logic to show Approve button ONLY if status is 'prebooked'
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

// 1. APPROVE (Pre-book -> Active)
async function approveEnrollment(id) {
    if(!confirm("Approve this student? They will get access to the course.")) return;
    try {
        const res = await fetch(`${API_URL}/enrollments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
        });
        if(res.ok) {
            alert("Student Approved!");
            fetchEnrollments();
        } else {
            alert("Failed to approve.");
        }
    } catch(err) { console.error(err); }
}

// 2. DELETE Enrollment
async function deleteEnrollment(id) {
    if(!confirm("Remove this student from the course? This cannot be undone.")) return;
    try {
        const res = await fetch(`${API_URL}/enrollments/${id}`, { method: 'DELETE' });
        if(res.ok) {
            alert("Enrollment Removed.");
            fetchEnrollments();
        } else {
            alert("Failed to delete.");
        }
    } catch(err) { console.error(err); }
}

// ===========================
// LOGOUT
// ===========================
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
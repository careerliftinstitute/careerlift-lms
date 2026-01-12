/* js/admin.js */

 const ADMIN_API = "https://careerlift-lms.onrender.com/api";
//const ADMIN_API = "http://localhost:5000/api";
let allCoursesList = []; // ডাটা স্টোর করার জন্য গ্লোবাল ভেরিয়েবল

// Google Drive Link Helper
function processDriveLink(url) {
    if (url && url.includes('drive.google.com')) {
        try {
            const id = url.split('/d/')[1].split('/')[0];
            return `https://lh3.googleusercontent.com/d/${id}`;
        } catch (err) { return url; }
    }
    return url;
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { window.location.href = "login.html"; return; }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") { alert("Access Denied!"); window.location.href = "index.html"; return; }
    
    fetchUsers();
    fetchCourses();
    fetchEnrollments();
});

// GLOBAL FUNCTIONS
window.showSection = function(id) {
    document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".menu li").forEach(li => li.classList.remove("active"));
    
    const activeSection = document.getElementById(id);
    if (activeSection) activeSection.classList.add("active");
    
    if(event && event.currentTarget) event.currentTarget.classList.add("active");
};

window.toggleCourseFields = function() {
    const type = document.getElementById("cType").value;
    document.getElementById("freeFields").style.display = type === "free" ? "block" : "none";
    document.getElementById("paidFields").style.display = type === "paid" ? "block" : "none";
};

window.addLectureField = function() {
    const container = document.getElementById("lectureContainer");
    const div = document.createElement("div");
    div.className = "lecture-row form-row"; 
    div.innerHTML = `<input type="text" class="lec-title" placeholder="Title"><input type="text" class="lec-link" placeholder="Link">`;
    container.appendChild(div);
};

// === 1. FETCH COURSES ===
async function fetchCourses() {
    try {
        const res = await fetch(`${ADMIN_API}/courses`);
        const data = await res.json();
        
        allCoursesList = data; // Save locally

        if(document.getElementById('statCourses')) {
            document.getElementById('statCourses').innerText = data.length;
        }

        const grid = document.getElementById("adminCourseGrid");
        if(grid) {
            grid.innerHTML = data.map(c => `
                <div class="dash-card" style="flex-direction:row; align-items:center; gap:15px; padding:10px;">
                    <img src="${processDriveLink(c.thumbnail)}" style="width:70px; height:50px; border-radius:5px; object-fit:cover;">
                    <div style="flex:1;">
                        <h4 style="margin:0; color:#fff; font-size:1rem;">${c.title}</h4>
                        <small style="color:#94a3b8;">${c.category} • ${c.type.toUpperCase()}</small>
                    </div>
                    <button class="btn-small" onclick="openEditModal('${c._id}')">Edit</button>
                    <button class="btn-small" style="color:#ef4444; border-color:#ef4444;" onclick="deleteCourse('${c._id}')">Del</button>
                </div>
            `).join('');
        }
    } catch(e) { console.error(e); }
}

// === 2. EDIT LOGIC (FIXED) ===
window.openEditModal = function(id) {
    const c = allCoursesList.find(course => course._id === id);
    if (!c) { alert("Course data not found!"); return; }

    // Populate Basic Fields
    document.getElementById('editId').value = c._id;
    document.getElementById('editTitle').value = c.title;
    document.getElementById('editCategory').value = c.category;
    document.getElementById('editPrice').value = c.price;
    document.getElementById('editOldPrice').value = c.oldPrice || "";
    document.getElementById('editThumb').value = c.thumbnail;
    
    // Populate Media & Details
    document.getElementById('editVideo').value = c.videoLink || "";
    document.getElementById('editOverview').value = c.overview || "";
    
    // 🔥 NEW FIELDS (Duration, Students, Audience)
    document.getElementById('editDuration').value = c.duration || "";
    document.getElementById('editStudents').value = c.students || "";
    document.getElementById('editAudience').value = c.audience || "";
    
    // Array Fields (Convert to Text)
    document.getElementById('editLearnings').value = (c.learnings && c.learnings.length > 0) ? c.learnings.join('\n') : "";
    document.getElementById('editFeatures').value = (c.features && c.features.length > 0) ? c.features.join('\n') : "";
    
    document.getElementById('editCourseModal').style.display = 'flex';
};

window.closeEditModal = function() {
    document.getElementById('editCourseModal').style.display = 'none';
};

// UPDATE SUBMIT
document.getElementById('editCourseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    
    const data = {
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value,
        thumbnail: processDriveLink(document.getElementById('editThumb').value),
        price: document.getElementById('editPrice').value,
        oldPrice: document.getElementById('editOldPrice').value,
        
        videoLink: document.getElementById('editVideo').value,
        overview: document.getElementById('editOverview').value,
        
        // 🔥 Sending New Fields
        duration: document.getElementById('editDuration').value,
        students: document.getElementById('editStudents').value,
        audience: document.getElementById('editAudience').value,
        
        // Convert Text to Array
        learnings: document.getElementById('editLearnings').value.split('\n').filter(i=>i.trim()),
        features: document.getElementById('editFeatures').value.split('\n').filter(i=>i.trim())
    };
    
    try {
        const res = await fetch(`${ADMIN_API}/courses/${id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        });

        if (res.ok) {
            alert("Updated Successfully!"); 
            closeEditModal(); 
            fetchCourses(); // Refresh list
        } else {
            alert("Update Failed");
        }
    } catch(err) { alert("Server Error"); }
});

// === 3. ADD COURSE LOGIC ===
document.getElementById("addCourseForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const type = document.getElementById("cType").value;
    const learningsRaw = document.getElementById("cLearnings").value;
    const featuresRaw = document.getElementById("cFeatures").value;

    const courseData = {
        title: document.getElementById("cTitle").value,
        category: document.getElementById("cCategory").value,
        thumbnail: processDriveLink(document.getElementById("cThumb").value),
        type, 
        price: type === "free" ? "Free" : document.getElementById("cPrice").value,
        
        videoLink: document.getElementById("cVideo").value,
        duration: document.getElementById("cDuration").value,
        students: document.getElementById("cStudents").value,
        overview: document.getElementById("cOverview").value,
        audience: document.getElementById("cAudience").value,
        
        learnings: learningsRaw.split('\n').filter(i=>i.trim()),
        features: featuresRaw.split('\n').filter(i=>i.trim())
    };

    if (type === "free") {
        courseData.syllabus = document.getElementById("cSyllabus").value;
        courseData.classNote = document.getElementById("cNote").value;
    } else {
        courseData.oldPrice = document.getElementById("cOldPrice").value;
        courseData.paidNote = document.getElementById("cPaidNote").value;
        courseData.specialCode = document.getElementById("cCode").value;
        
        courseData.lectures = [];
        document.querySelectorAll(".lec-title").forEach((t, i) => {
            if (t.value.trim()) courseData.lectures.push({ title: t.value, link: document.querySelectorAll(".lec-link")[i].value });
        });
    }

    try {
        const res = await fetch(`${ADMIN_API}/courses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(courseData) });
        if (res.ok) { alert("Added!"); e.target.reset(); fetchCourses(); showSection('manage-courses'); }
        else alert("Failed");
    } catch (err) { alert("Error"); }
});

// === 4. OTHER HELPERS ===
window.deleteCourse = async function(id) {
    if(confirm("Delete?")) { await fetch(`${ADMIN_API}/courses/${id}`, { method: "DELETE" }); fetchCourses(); }
};

window.approveEnrollment = async function(id) {
    if(confirm("Approve?")) {
        await fetch(`${ADMIN_API}/enrollments/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status: 'active'}) });
        fetchEnrollments();
    }
};

window.deleteEnrollment = async function(id) {
    if(confirm("Delete?")) { await fetch(`${ADMIN_API}/enrollments/${id}`, { method: 'DELETE' }); fetchEnrollments(); }
};

async function fetchUsers() {
    try {
        const res = await fetch(`${ADMIN_API}/users`);
        const users = await res.json();
        
        if(document.getElementById('statUsers')) document.getElementById('statUsers').innerText = users.length + "+";

        const tbody = document.getElementById("userTableBody");
        if(tbody) {
            tbody.innerHTML = users.map(u => `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span style="background:${u.role==='admin'?'#059669':'#3b82f6'}; padding:2px 8px; border-radius:10px; font-size:0.75rem;">${u.role}</span></td>
                    <td>${u.phone || '-'}</td>
                    <td><button class="btn-small" onclick='openEditUserModal(${JSON.stringify(u)})'>Edit</button></td>
                </tr>
            `).join('');
        }
    } catch(e) {}
}

async function fetchEnrollments() {
    try {
        const res = await fetch(`${ADMIN_API}/enrollments/all`);
        const data = await res.json();

        if(document.getElementById('statPending')) {
            const pendingCount = data.filter(e => e.status === 'prebooked').length;
            document.getElementById('statPending').innerText = pendingCount;
        }

        const tbody = document.getElementById('enrollmentTableBody');
        if(tbody) {
            tbody.innerHTML = data.map(e => `
                <tr>
                    <td><strong style="color:#fff;">${e.contactName || (e.user ? e.user.name : 'Unknown')}</strong><br><small style="color:#94a3b8;">${e.contactPhone || (e.user ? e.user.phone : '-')}</small></td>
                    <td>${e.course ? e.course.title : '<span style="color:red">Deleted</span>'}</td>
                    <td><span style="color:${e.status==='active'?'#22c55e':'#fbbf24'}; text-transform:uppercase;">${e.status}</span></td>
                    <td>${new Date(e.enrolledAt).toLocaleDateString()}</td>
                    <td>
                        ${e.status==='prebooked' ? `<button class="btn-small" style="color:#22c55e;" onclick="approveEnrollment('${e._id}')">Approve</button>` : ''}
                        <button class="btn-small" style="color:#ef4444;" onclick="deleteEnrollment('${e._id}')">Del</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch(e) {}
}

window.openEditUserModal = function(u) {
    document.getElementById('editUserId').value = u._id;
    document.getElementById('editUserName').value = u.name;
    document.getElementById('editUserEmail').value = u.email;
    document.getElementById('editUserPhone').value = u.phone || "";
    document.getElementById('editUserRole').value = u.role;
    document.getElementById('editUserModal').style.display = 'flex';
};

window.closeEditUserModal = function() { document.getElementById('editUserModal').style.display = 'none'; };

document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const data = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        phone: document.getElementById('editUserPhone').value,
        role: document.getElementById('editUserRole').value
    };
    await fetch(`${ADMIN_API}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    alert("User Updated!"); closeEditUserModal(); fetchUsers();
});
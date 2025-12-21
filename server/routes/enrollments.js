/* server/routes/enrollments.js */
const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course'); 

// 1. ENROLL / PRE-BOOK USER
router.post('/', async (req, res) => {
    const { userId, courseId, status, contactName, contactPhone, code } = req.body; 

    if (!userId || !courseId) {
        return res.status(400).json({ message: "Missing User ID or Course ID" });
    }

    try {
        // --- SECURITY CHECK (Only for Active Paid Enrollment) ---
        if (status === 'active') { 
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });

            if (course.type === 'paid') {
                const dbCode = course.specialCode ? course.specialCode.trim() : "";
                const inputCode = code ? code.trim() : "";

                if (!inputCode || inputCode.toLowerCase() !== dbCode.toLowerCase()) {
                    return res.status(403).json({ message: "❌ Invalid Special Code. Access Denied." });
                }
            }
        }

        // --- CHECK IF ALREADY ENROLLED ---
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        
        if (existingEnrollment) {
            // Upgrade Prebooked -> Active
            if (existingEnrollment.status === 'prebooked' && status === 'active') {
                existingEnrollment.status = 'active';
                await existingEnrollment.save();
                return res.json({ message: "Account Upgraded to Active! Welcome." });
            }
            return res.status(400).json({ message: "You have already requested this course." });
        }

        // --- CREATE NEW ENROLLMENT ---
        const newEnrollment = new Enrollment({
            user: userId,
            course: courseId,
            status: status || 'active', 
            contactName, 
            contactPhone
        });

        await newEnrollment.save();
        res.status(201).json({ message: "Request Successful", enrollment: newEnrollment });

    } catch (err) {
        console.error("Enrollment Error:", err);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// 2. GET MY ENROLLMENTS (UPDATED: Returns ID AND STATUS)
router.get('/my-enrollments/:userId', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.params.userId });
        // Return array of objects: [{ id: "...", status: "active/prebooked" }]
        const data = enrollments.map(e => ({
            id: e.course.toString(),
            status: e.status
        }));
        res.json(data); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. GET ALL ENROLLMENTS (Admin)
router.get('/all', async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('user', 'name email phone') 
            .populate('course', 'title type') 
            .sort({ enrolledAt: -1 });
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. GET FULL ENROLLED COURSE DETAILS (Profile)
router.get('/user/:userId', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.params.userId })
            .populate('course')
            .sort({ enrolledAt: -1 });
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. UPDATE STATUS (Admin)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );
        res.json(updatedEnrollment);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

// 6. DELETE ENROLLMENT (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Enrollment.findByIdAndDelete(req.params.id);
        res.json({ message: "Enrollment removed" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;
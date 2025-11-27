/* server/routes/courses.js */
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// ========== 1. GET ALL COURSES (Public) ==========
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ========== 2. GET SINGLE COURSE ==========
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ========== 3. CREATE COURSE (Admin Only) ==========
router.post('/', async (req, res) => {
    try {
        const course = new Course(req.body);
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ========== 4. UPDATE COURSE ==========
router.put('/:id', async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // return updated document
        );
        if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
        res.json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ========== 5. DELETE COURSE ==========
router.delete('/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: "Course Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;

/* server/routes/users.js */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ================================
// 1. GET ALL USERS
// ================================
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ================================
// 2. GET SINGLE USER BY ID
// ================================
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ================================
// 3. UPDATE USER (ADMIN ONLY)
// ================================
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, role },
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ================================
// 4. DELETE USER
// ================================
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);

        if (!deleted) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

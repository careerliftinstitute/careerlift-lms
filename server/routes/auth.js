/* server/routes/auth.js */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔥 SAFETY FALLBACK: Use env key, or a default one if env fails
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
    const { name, email, password, phone, gender, age } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            gender,
            age,
            role: 'student'
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. LOGIN ROUTE (STRICT SECURITY CHECK)
router.post('/login', async (req, res) => {
    const { email, password, loginType } = req.body;

    try {
        // ==========================================
        // CASE A: ADMIN LOGIN ATTEMPT
        // ==========================================
        if (loginType === 'admin') {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
                
                // 🔥 Using the safe JWT_SECRET constant
                const token = jwt.sign(
                    { id: 'super_admin_id', role: 'admin' }, 
                    JWT_SECRET, 
                    { expiresIn: '2h' }
                );

                return res.json({
                    token,
                    user: {
                        name: 'Super Admin',
                        email: email,
                        role: 'admin'
                    }
                });
            } else {
                return res.status(400).json({ message: "Invalid Admin Credentials" });
            }
        }

        // ==========================================
        // CASE B: STUDENT LOGIN ATTEMPT
        // ==========================================
        else {
            if (email === process.env.ADMIN_EMAIL) {
                return res.status(403).json({ message: "Admins must use Admin Portal" });
            }

            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: "Student not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

            // 🔥 Using the safe JWT_SECRET constant
            const token = jwt.sign(
                { id: user._id, role: 'student' }, 
                JWT_SECRET, 
                { expiresIn: '1h' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: 'student'
                }
            });
        }

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
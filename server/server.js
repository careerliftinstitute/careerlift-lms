/* server/server.js */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 1. IMPORT ROUTES
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const enrollmentRoutes = require('./routes/enrollments'); // <--- NEW: Import this

// 2. CONFIG
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// Serving Admin Panel, JS, CSS, etc.
app.use(express.static(path.join(__dirname, '../')));

// 4. USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollmentRoutes); // <--- NEW: Register the route here

// 5. DATABASE CONNECTION
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// 6. TEST ROUTE
app.get('/', (req, res) => {
    res.send('API is running...');
});

// 7. START SERVER
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
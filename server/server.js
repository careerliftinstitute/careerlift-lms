/* server/server.js */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // 🔥 ১. fs মডিউল ইমপোর্ট করা হলো

// 1. IMPORT ROUTES
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const enrollmentRoutes = require('./routes/enrollments'); 
const assetRoutes = require('./routes/assetRoutes'); 

// 2. CONFIG
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔥 ৪. AUTO-CREATE UPLOADS FOLDER (Render Fix)
// সার্ভার চালু হওয়ার সময় uploads ফোল্ডার না থাকলে বানিয়ে নিবে
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('✅ Created uploads folder successfully');
}

// 5. SERVING STATIC FILES
// Uploaded Images (Photos/CVs) -> Public URL
app.use('/uploads', express.static(uploadDir));

// Frontend Static Files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));

// 6. USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/asset', assetRoutes); 

// 7. DATABASE CONNECTION (Main DB)
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// 8. TEST ROUTE
app.get('/', (req, res) => {
    res.send('API is running...');
});

// 9. START SERVER
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
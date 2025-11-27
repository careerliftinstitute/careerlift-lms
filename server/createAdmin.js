const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load environment variables from .env file
dotenv.config();

const createSuperAdmin = async () => {
    try {
        // 1. Validate .env variables
        if (!process.env.MONGO_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASS) {
            console.error("❌ Error: Missing variables in .env file.");
            console.error("Make sure MONGO_URI, ADMIN_EMAIL, and ADMIN_PASS are set.");
            process.exit(1);
        }

        // 2. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected...');

        // 3. Check if admin already exists
        const userExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (userExists) {
            console.log('⚠️  Super Admin already exists in the database.');
            process.exit();
        }

        // 4. Encrypt the Password from .env
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, salt);

        // 5. Create Admin User
        const adminUser = new User({
            name: "Super Admin",
            email: process.env.ADMIN_EMAIL,  // Read from .env
            password: hashedPassword,        // Saved encrypted password
            phone: "01700000000",            // Default phone (you can change this later in profile)
            role: 'admin'                    // <--- CRITICAL: Sets the role to admin
        });

        await adminUser.save();
        
        console.log('=========================================');
        console.log('✅ Super Admin Created Successfully!');
        console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${process.env.ADMIN_PASS}`);
        console.log('=========================================');
        console.log('You can now log in at login.html');
        
        process.exit();
    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
        process.exit(1);
    }
};

createSuperAdmin();
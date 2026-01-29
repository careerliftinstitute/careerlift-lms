// server/routes/assetRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const AssetRegistration = require('../models/AssetRegistration');

// --- Multer Storage Config ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // ফাইলগুলো server/uploads ফোল্ডারে জমা হবে
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB per file
});

// --- API Route ---
router.post('/register', upload.fields([
    { name: 'photo', maxCount: 1 }, 
    { name: 'nid', maxCount: 1 },             // ✅ New Field
    { name: 'ssc_certificate', maxCount: 1 }  // ✅ New Field
]), async (req, res) => {
    try {
        console.log("Req Body:", req.body); 
        console.log("Files:", req.files); // Debugging to see if files arrived

        // ✅ Extract 3 File Paths safely
        const photoPath = req.files?.['photo']?.[0]?.path || null;
        const nidPath = req.files?.['nid']?.[0]?.path || null;
        const sscPath = req.files?.['ssc_certificate']?.[0]?.path || null;

        const newRegistration = new AssetRegistration({
            ...req.body,
            photoPath: photoPath,
            nidPath: nidPath,
            sscPath: sscPath
        });

        await newRegistration.save();

        res.status(200).json({ success: true, message: "Registration successful!" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// ... (উপরে আগের কোড থাকবে) ...

// ✅ GET: সব অ্যাপ্লিকেন্টের লিস্ট দেখার জন্য
router.get('/all', async (req, res) => {
    try {
        // নতুন আবেদন সবার উপরে দেখাবে (sort by date desc)
        const applicants = await AssetRegistration.find().sort({ registrationDate: -1 });
        res.status(200).json(applicants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE: কোনো আবেদন ডিলিট করার জন্য
router.delete('/:id', async (req, res) => {
    try {
        await AssetRegistration.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

module.exports = router;
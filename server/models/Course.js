/* server/models/Course.js */
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    // --- BASIC INFO ---
    title: { type: String, required: true },
    thumbnail: { type: String, required: true }, // Image URL
    type: { type: String, enum: ['free', 'paid'], required: true },
    category: { type: String, required: true }, // medical, freelancing, etc.
    
    // --- PRICING ---
    price: { type: String, default: "Free" },
    oldPrice: { type: String }, // e.g. "10,000 BDT" (New Field for Promo Price)

    // --- META DATA ---
    rating: { type: Number, default: 5.0 },
    students: { type: String, default: "0" }, // e.g. "500+"
    duration: { type: String, default: "Self Paced" }, // e.g. "3 Months"

    // --- DETAILS PAGE CONTENT (COMMON) ---
    videoLink: { type: String }, // Promo/Trailer Video (YouTube Link)
    overview: { type: String },  // Short description
    audience: { type: String },  // Who is this course for?
    
    // Arrays for bullet points
    learnings: [String], // What you will learn
    features: [String],  // Key features (Certificate, Support etc.)

    // --- CLASSROOM CONTENT ---
    // Free Course Specific
    syllabus: { type: String },
    classNote: { type: String }, 

    // Paid Course Specific
    paidNote: { type: String }, // Dashboard Instruction
    specialCode: { type: String }, // Verification Code e.g. CL-2025
    
    // Curriculum / Playlist
    lectures: [
        {
            title: { type: String },
            link: { type: String } // Zoom/Meet/YouTube Link
        }
    ],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
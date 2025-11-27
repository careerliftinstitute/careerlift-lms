/* server/models/Course.js */
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String, required: true }, // URL of image
    type: { type: String, enum: ['free', 'paid'], required: true },
    category: { type: String, required: true }, // medical, freelancing, etc.
    price: { type: String, default: "Free" },
    
    // Common Fields
    rating: { type: Number, default: 5.0 },
    students: { type: String, default: "0 Students" },

    // --- FREE COURSE SPECIFIC ---
    syllabus: { type: String },
    classNote: { type: String },
    videoLink: { type: String }, // Single link for Free course

    // --- PAID COURSE SPECIFIC ---
    overview: { type: String },
    paidNote: { type: String },
    lectures: [
        {
            title: { type: String },
            link: { type: String } // Zoom/Meet Link
        }
    ],
    specialCode: { type: String }, // e.g., CL-2025-001

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
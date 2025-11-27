/* server/models/Enrollment.js */
const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['prebooked', 'active', 'completed'],
        default: 'active'
    },
    contactName: { type: String },  // Name entered in Pre-book form
    contactPhone: { type: String }, // Phone entered in Pre-book form
    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
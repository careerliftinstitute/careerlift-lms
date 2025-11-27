/* server/models/User.js */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String }, // New Field
    age: { type: Number },    // New Field
    role: { 
        type: String, 
        default: 'student', 
        enum: ['student', 'admin'] 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

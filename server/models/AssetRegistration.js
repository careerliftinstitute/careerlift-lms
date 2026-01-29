// server/models/AssetRegistration.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars to get the ASSET_DB_URI
dotenv.config();

// 🔥 Create a separate connection for this specific feature
// This ensures data goes to 'alfaravi17_db_user' database
const assetDbConnection = mongoose.createConnection(process.env.ASSET_DB_URI);

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: String, required: true },
    district: { type: String, required: true },
    education: { type: String, required: true },
    course: { type: String, required: true },
    
    // ✅ Updated File Paths for 3 specific files
    photoPath: { type: String, default: null },
    nidPath: { type: String, default: null },
    sscPath: { type: String, default: null },
    
    registrationDate: { type: Date, default: Date.now }
});

// Export the model using the separate connection
module.exports = assetDbConnection.model('AssetRegistration', assetSchema);
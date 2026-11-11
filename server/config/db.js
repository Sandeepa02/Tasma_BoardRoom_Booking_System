const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.warn('⚠️ MONGODB_URI is not defined in .env. Falling back to local mongodb://localhost:27017/boardroom_db');
        }
        const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/boardroom_db');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Do not crash server, allow retry or fallback
    }
};

module.exports = connectDB;

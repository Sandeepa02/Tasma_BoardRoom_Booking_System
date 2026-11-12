const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / ISP DNS SRV record lookup issues (ECONNREFUSED)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
    // ignore if restricted
}

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

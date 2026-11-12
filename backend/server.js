const dns = require('dns');
// Route DNS queries through public DNS to resolve MongoDB SRV records on Windows/ISPs
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const seedData = require('./seed');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
    seedData();
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString()
    });
});

// Serve frontend static files from frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Fallback to index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 TASMA Boardroom Server running!`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`📡 API URL:   http://localhost:${PORT}/api`);
    console.log(`=========================================`);
});

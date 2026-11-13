const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const query = { email: email.trim().toLowerCase() };
        if (role) {
            query.role = role;
        }

        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Auto-upgrade legacy plaintext password to bcrypt hash on successful login
        if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
            user.password = password;
            await user.save();
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Account pending admin approval. Please contact system admin.' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Account registration request was rejected by admin.' });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                empId: user.empId,
                department: user.department,
                role: user.role,
                status: user.status
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/status - check system status & whether admin exists
router.get('/status', async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userCount = await User.countDocuments();
        res.json({
            hasAdmin: adminCount > 0,
            adminCount,
            userCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/setup-admin - create first admin if none exists
router.post('/setup-admin', async (req, res) => {
    try {
        const { email, password, fullName, empId, department, secret } = req.body;

        const adminCount = await User.countDocuments({ role: 'admin' });
        const configuredSecret = process.env.ADMIN_SETUP_SECRET;

        // If admin already exists, require the configured secret key
        if (adminCount > 0 && (!configuredSecret || secret !== configuredSecret)) {
            return res.status(403).json({
                error: 'Administrator already exists. Use the Admin portal or CLI to manage users.'
            });
        }

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let adminUser = await User.findOne({ email: normalizedEmail });

        if (adminUser) {
            adminUser.password = password;
            adminUser.role = 'admin';
            adminUser.status = 'approved';
            if (fullName) adminUser.fullName = fullName;
            if (empId) adminUser.empId = empId;
            if (department) adminUser.department = department;
            await adminUser.save();
        } else {
            adminUser = new User({
                id: 'USR-ADMIN-' + Date.now(),
                email: normalizedEmail,
                password,
                fullName: fullName.trim(),
                empId: (empId || 'ADM-001').trim(),
                department: department || 'IT Department',
                role: 'admin',
                status: 'approved'
            });
            await adminUser.save();
        }

        res.status(201).json({
            message: 'Administrator account configured successfully',
            user: {
                id: adminUser.id,
                email: adminUser.email,
                fullName: adminUser.fullName,
                role: adminUser.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

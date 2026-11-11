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

        const query = { email: email.trim().toLowerCase(), password };
        if (role) {
            query.role = role;
        }

        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
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

module.exports = router;

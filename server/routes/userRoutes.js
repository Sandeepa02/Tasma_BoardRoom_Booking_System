const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - list all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users - create new user (e.g. from Admin portal or register)
router.post('/', async (req, res) => {
    try {
        const { fullName, empId, email, password, department, role, status } = req.body;

        if (!fullName || !empId || !email || !password || !department) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ error: 'Email address is already registered.' });
        }

        // Check department quota (max 3 approved)
        const approvedInDept = await User.countDocuments({
            department,
            status: 'approved'
        });

        if (status === 'approved' && approvedInDept >= 3) {
            return res.status(400).json({
                error: `Department '${department}' has reached maximum 3 members.`
            });
        }

        const newUser = new User({
            id: 'USR-' + Date.now(),
            fullName: fullName.trim(),
            empId: empId.trim(),
            email: normalizedEmail,
            password,
            department,
            role: role || 'employee',
            status: status || 'approved'
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/users/:id/status - approve or reject user
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value.' });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (status === 'approved') {
            const count = await User.countDocuments({
                department: user.department,
                status: 'approved',
                id: { $ne: id }
            });
            if (count >= 3) {
                return res.status(400).json({
                    error: `Cannot approve. ${user.department} has already reached maximum of 3 members.`
                });
            }
        }

        user.status = status;
        await user.save();
        res.json({ message: `User status updated to ${status}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/users/:id - update profile
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, department } = req.body;

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (fullName) user.fullName = fullName.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (department) user.department = department;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

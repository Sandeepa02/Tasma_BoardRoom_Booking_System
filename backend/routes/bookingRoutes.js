const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { dispatchBookingEmails } = require('../config/email');

// GET /api/bookings - get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bookings - create a new booking
router.post('/', async (req, res) => {
    try {
        const {
            token,
            userId,
            userName,
            empId,
            email,
            boardroom,
            date,
            startTime,
            endTime,
            purpose,
            fullDay,
            bookingCreatedAt
        } = req.body;

        if (!token || !userId || !boardroom || !date || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required booking fields.' });
        }

        // Check for double bookings on the same date and boardroom
        const conflicts = await Booking.find({
            date,
            boardroom,
            status: 'Confirmed'
        });

        const hasConflict = conflicts.some(b => {
            if (fullDay || b.fullDay) return true;
            return b.startTime === startTime;
        });

        if (hasConflict) {
            return res.status(409).json({ error: 'Slot already booked! Please select another time.' });
        }

        // Retrieve authenticated employee profile from MongoDB User collection
        let employee = null;
        if (userId) {
            employee = await User.findOne({ id: userId });
            if (!employee && mongoose.Types.ObjectId.isValid(userId)) {
                employee = await User.findById(userId);
            }
        }
        if (!employee && email) {
            employee = await User.findOne({ email: email.trim().toLowerCase() });
        }

        // Use registered employee information from MongoDB profile, falling back safely if needed
        const registeredEmail = employee ? employee.email : (email || '').trim();
        const employeeFullName = employee ? employee.fullName : (userName || 'Employee');
        const employeeEmpId = employee ? employee.empId : (empId || 'N/A');
        const employeeDept = employee ? employee.department : 'General';
        const meetingPurpose = (purpose && purpose.trim()) || 'General Business Meeting';

        // Construct booking document
        const newBooking = new Booking({
            id: req.body.id || ('BK-' + Date.now()),
            token,
            userId: employee ? employee.id : userId,
            userName: employeeFullName,
            empId: employeeEmpId,
            email: registeredEmail,
            boardroom,
            date,
            startTime,
            endTime,
            purpose: meetingPurpose,
            fullDay: !!fullDay,
            bookingCreatedAt: bookingCreatedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'Confirmed',
            adminEmailStatus: 'pending',
            userEmailStatus: 'pending'
        });

        // Save booking in MongoDB first
        await newBooking.save();

        // Respond immediately to frontend so booking is confirmed without delay
        res.status(201).json(newBooking);

        // Asynchronously dispatch email notifications (Admin & Employee)
        const employeeInfo = {
            id: employee ? employee.id : userId,
            fullName: employeeFullName,
            email: registeredEmail,
            empId: employeeEmpId,
            department: employeeDept
        };

        dispatchBookingEmails(newBooking, employeeInfo)
            .then(async (statuses) => {
                try {
                    await Booking.updateOne(
                        { _id: newBooking._id },
                        {
                            $set: {
                                adminEmailStatus: statuses.adminEmailStatus,
                                userEmailStatus: statuses.userEmailStatus
                            }
                        }
                    );
                } catch (updateErr) {
                    console.error('Failed to update email delivery statuses in booking:', updateErr.message);
                }
            })
            .catch((dispatchErr) => {
                console.error('⚠️ [Email Service] Background dispatch error:', dispatchErr.message);
            });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/bookings/:id/cancel - cancel a booking
router.patch('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findOne({ id });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

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

        const newBooking = new Booking({
            id: 'BK-' + Date.now(),
            token,
            userId,
            userName,
            empId,
            email,
            boardroom,
            date,
            startTime,
            endTime,
            fullDay: !!fullDay,
            bookingCreatedAt: bookingCreatedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'Confirmed'
        });

        await newBooking.save();
        res.status(201).json(newBooking);
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

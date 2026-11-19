const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        default: () => 'BK-' + Date.now()
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    empId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    boardroom: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    slots: {
        type: [String],
        default: []
    },
    slotLabels: {
        type: [String],
        default: []
    },
    timeLabel: {
        type: String
    },
    purpose: {
        type: String,
        default: 'General Business Meeting'
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled'],
        default: 'Confirmed'
    },
    fullDay: {
        type: Boolean,
        default: false
    },
    bookingCreatedAt: {
        type: String
    },
    adminEmailStatus: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    userEmailStatus: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);

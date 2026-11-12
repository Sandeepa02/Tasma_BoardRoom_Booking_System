const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        default: () => 'USR-' + Date.now()
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    empId: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['employee', 'admin'],
        default: 'employee'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

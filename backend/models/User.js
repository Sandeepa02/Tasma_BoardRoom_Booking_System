const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Pre-save hook: Hash password before saving to database
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    // Prevent double hashing if already a bcrypt hash
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: Verify candidate password against stored password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    // Backward compatibility: If stored password is still plain text
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        return this.password === candidatePassword;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

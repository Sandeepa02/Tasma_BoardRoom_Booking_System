const User = require('./models/User');
const Booking = require('./models/Booking');

const defaultUsers = [
    {
        id: 'USR-001',
        email: 'john@company.com',
        password: 'password123',
        fullName: 'John Silva',
        empId: 'EMP001',
        department: 'Executive',
        role: 'employee',
        status: 'approved'
    },
    {
        id: 'USR-002',
        email: 'sarah@company.com',
        password: 'password123',
        fullName: 'Sarah Jenkins',
        empId: 'EMP002',
        department: 'Engineering',
        role: 'employee',
        status: 'pending'
    },
    {
        id: 'USR-ADMIN',
        email: 'admin@tasmagroup.com',
        password: 'admin123',
        fullName: 'System Administrator',
        empId: 'ADM-001',
        department: 'IT Department',
        role: 'admin',
        status: 'approved'
    }
];

const defaultBookings = [
    {
        id: 'BK-1001',
        token: 'BR-20260925-MB-A7F92K',
        userId: 'USR-001',
        userName: 'John Silva',
        empId: 'EMP001',
        email: 'john@company.com',
        boardroom: 'Main Boardroom',
        date: '2026-09-25',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        bookingCreatedAt: '2026-09-20 10:15 AM',
        status: 'Confirmed',
        fullDay: false
    }
];

const seedData = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            await User.insertMany(defaultUsers);
            console.log('🌱 Seeded default users into MongoDB');
        }

        const bookingCount = await Booking.countDocuments();
        if (bookingCount === 0) {
            await Booking.insertMany(defaultBookings);
            console.log('🌱 Seeded default bookings into MongoDB');
        }
    } catch (err) {
        console.error('⚠️ Seeding error:', err.message);
    }
};

module.exports = seedData;

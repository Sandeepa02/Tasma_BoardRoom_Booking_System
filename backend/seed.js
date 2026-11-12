const User = require('./models/User');
const Booking = require('./models/Booking');

const seedData = async () => {
    try {
        // 1. Clean up legacy demo accounts if they were previously inserted
        const removedDemoUsers = await User.deleteMany({
            $or: [
                { email: { $in: ['john@company.com', 'sarah@company.com'] } },
                { id: { $in: ['USR-001', 'USR-002'] } }
            ]
        });
        if (removedDemoUsers.deletedCount > 0) {
            console.log(`🧹 Removed ${removedDemoUsers.deletedCount} demo user account(s) from database`);
        }

        // 2. Clean up legacy demo bookings if previously inserted
        const removedDemoBookings = await Booking.deleteMany({
            $or: [
                { id: 'BK-1001' },
                { token: 'BR-20260925-MB-A7F92K' }
            ]
        });
        if (removedDemoBookings.deletedCount > 0) {
            console.log(`🧹 Removed ${removedDemoBookings.deletedCount} demo booking(s) from database`);
        }

        // 3. Ensure an active Administrator account exists in MongoDB
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount === 0) {
            const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tasmagroup.com').trim().toLowerCase();
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const adminFullName = process.env.ADMIN_NAME || 'System Administrator';
            const adminEmpId = process.env.ADMIN_EMP_ID || 'ADM-001';
            const adminDept = process.env.ADMIN_DEPT || 'IT Department';

            await User.create({
                id: 'USR-ADMIN',
                email: adminEmail,
                password: adminPassword,
                fullName: adminFullName,
                empId: adminEmpId,
                department: adminDept,
                role: 'admin',
                status: 'approved'
            });

            console.log(`👑 Initialized Administrator account: ${adminEmail}`);
        } else {
            console.log(`✅ Administrator account verified in database (${adminCount} admin(s) present)`);
        }
    } catch (err) {
        console.error('⚠️ Database seed initialization error:', err.message);
    }
};

module.exports = seedData;

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

        // 3. Ensure configured Administrator accounts exist in MongoDB
        const rawAdminEmails = process.env.ADMIN_EMAIL || 'admin@tasmagroup.com';
        const adminEmails = rawAdminEmails.split(/[,;]/).map(e => e.trim().toLowerCase()).filter(Boolean);
        const adminPasswords = (process.env.ADMIN_PASSWORD || 'admin123').split(/[,;]/).map(p => p.trim());
        const adminNames = (process.env.ADMIN_NAME || 'System Administrator').split(/[,;]/).map(n => n.trim());
        const adminEmpIds = (process.env.ADMIN_EMP_ID || 'ADM-001').split(/[,;]/).map(id => id.trim());
        const adminDepts = (process.env.ADMIN_DEPT || 'IT Department').split(/[,;]/).map(d => d.trim());

        for (let i = 0; i < adminEmails.length; i++) {
            const email = adminEmails[i];
            const password = adminPasswords[i] || adminPasswords[0] || 'admin123';
            const fullName = adminNames[i] || adminNames[0] || 'System Administrator';
            const empId = adminEmpIds[i] || `ADM-00${i + 1}`;
            const department = adminDepts[i] || adminDepts[0] || 'IT Department';

            let admin = await User.findOne({ email });
            if (!admin) {
                await User.create({
                    id: `USR-ADMIN-${i + 1}`,
                    email,
                    password,
                    fullName,
                    empId,
                    department,
                    role: 'admin',
                    status: 'approved'
                });
                console.log(`👑 Initialized Administrator account: ${email}`);
            } else {
                let updated = false;
                if (admin.role !== 'admin') { admin.role = 'admin'; updated = true; }
                if (admin.status !== 'approved') { admin.status = 'approved'; updated = true; }
                if (fullName && admin.fullName !== fullName) { admin.fullName = fullName; updated = true; }
                if (empId && admin.empId !== empId) { admin.empId = empId; updated = true; }
                if (department && admin.department !== department) { admin.department = department; updated = true; }

                const isMatch = await admin.comparePassword(password);
                if (!isMatch) {
                    admin.password = password;
                    updated = true;
                }

                if (updated) {
                    await admin.save();
                    console.log(`👑 Synchronized Administrator account: ${email}`);
                } else {
                    console.log(`✅ Administrator verified in database: ${email}`);
                }
            }
        }
    } catch (err) {
        console.error('⚠️ Database seed initialization error:', err.message);
    }
};

module.exports = seedData;

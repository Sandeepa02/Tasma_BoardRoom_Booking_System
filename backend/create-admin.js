const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

function ask(rl, query, defaultValue) {
    return new Promise(resolve => {
        const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
        rl.question(prompt, answer => {
            resolve(answer.trim() || defaultValue || '');
        });
    });
}

async function main() {
    console.log('==============================================');
    console.log('🛡️  TASMA Boardroom - Administrator Setup CLI');
    console.log('==============================================\n');

    await connectDB();

    const args = process.argv.slice(2);
    let email, password, fullName, empId, department;

    if (args.length >= 2) {
        // Provided via command line arguments
        email = args[0];
        password = args[1];
        fullName = args[2] || 'System Administrator';
        empId = args[3] || 'ADM-' + Math.floor(100 + Math.random() * 900);
        department = args[4] || 'IT Department';
    } else {
        // Interactive prompt
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        email = await ask(rl, 'Admin Email', process.env.ADMIN_EMAIL || 'admin@tasmagroup.com');
        password = await ask(rl, 'Admin Password', process.env.ADMIN_PASSWORD || 'admin123');
        fullName = await ask(rl, 'Admin Full Name', process.env.ADMIN_NAME || 'System Administrator');
        empId = await ask(rl, 'Employee ID', process.env.ADMIN_EMP_ID || 'ADM-001');
        department = await ask(rl, 'Department', process.env.ADMIN_DEPT || 'IT Department');

        rl.close();
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        console.error('❌ Error: Email and password are required.');
        process.exit(1);
    }

    try {
        let admin = await User.findOne({ email: normalizedEmail });

        if (admin) {
            admin.password = password;
            admin.fullName = fullName;
            admin.empId = empId;
            admin.department = department;
            admin.role = 'admin';
            admin.status = 'approved';
            await admin.save();
            console.log(`\n✅ Updated existing Admin account: ${normalizedEmail}`);
        } else {
            admin = await User.create({
                id: 'USR-ADMIN-' + Date.now(),
                email: normalizedEmail,
                password,
                fullName,
                empId,
                department,
                role: 'admin',
                status: 'approved'
            });
            console.log(`\n🎉 Created new Administrator account: ${normalizedEmail}`);
        }

        console.log('----------------------------------------------');
        console.log(`👤 Name:       ${admin.fullName}`);
        console.log(`📧 Email:      ${admin.email}`);
        console.log(`🆔 Emp ID:     ${admin.empId}`);
        console.log(`🏢 Department: ${admin.department}`);
        console.log(`🔑 Role:       ${admin.role}`);
        console.log(`✨ Status:     ${admin.status}`);
        console.log('----------------------------------------------');
        console.log('You can now log in using the Admin Portal on the website.\n');
    } catch (err) {
        console.error('❌ Failed to create/update administrator:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();

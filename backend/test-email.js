require('dotenv').config();
const {
    checkEmailConfig,
    verifyTransporter,
    sendAdminBookingNotification,
    sendEmployeeBookingConfirmation
} = require('./config/email');

async function main() {
    console.log('====================================================');
    console.log('📧 TASMA LIVE EMAIL NOTIFICATION TEST UTILITY');
    console.log('====================================================\n');

    checkEmailConfig();

    console.log('\n1. Verifying SMTP Credentials Connection...');
    const verify = await verifyTransporter();
    if (!verify.success) {
        console.error('❌ SMTP verification failed:', verify.error || verify.message);
        console.log('\n💡 Tip: For Gmail SMTP:');
        console.log('   - 2-Step Verification must be enabled on your Google Account.');
        console.log('   - Create a 16-character App Password at https://myaccount.google.com/apppasswords');
        console.log('   - Set EMAIL_PASS=your_16_character_app_password in .env\n');
        process.exit(1);
    }

    const testBooking = {
        id: 'BK-' + Date.now(),
        token: 'BR-' + new Date().toISOString().substring(0, 10).replace(/-/g, '') + '-MB-DEMO99',
        boardroom: 'Main Boardroom',
        date: new Date().toISOString().substring(0, 10),
        startTime: '02:00 PM',
        endTime: '03:00 PM',
        purpose: 'Quarterly Executive Review',
        bookingCreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Confirmed'
    };

    const testEmployee = {
        fullName: 'Test Employee',
        email: process.env.ADMIN_EMAIL || 'test@tasmagroup.com',
        empId: 'EMP-001',
        department: 'Operations'
    };

    console.log('\n2. Sending Admin Notification...');
    const adminRes = await sendAdminBookingNotification(testBooking, testEmployee);
    console.log('Admin Result:', adminRes);

    console.log('\n3. Sending Employee Confirmation...');
    const employeeRes = await sendEmployeeBookingConfirmation(testBooking, testEmployee);
    console.log('Employee Result:', employeeRes);

    console.log('\n✅ Live email test completed.');
}

main().catch(console.error);

require('dotenv').config();
const nodemailer = require('nodemailer');
const {
    checkEmailConfig,
    createTransporter,
    dispatchBookingEmails
} = require('./config/email');
const Booking = require('./models/Booking');

async function runTests() {
    console.log('====================================================');
    console.log('🧪 TASMA EMAIL NOTIFICATION AUTOMATED TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName) {
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${testName}`);
            failed++;
        }
    }

    // ----------------------------------------------------
    // Test 1 & 2: Environment Configuration
    // ----------------------------------------------------
    console.log('▶ Test Suite 1: Environment & Diagnostic Logging');
    const config = checkEmailConfig();
    assert(process.env.ADMIN_EMAIL === 'sandeepasuraj80@gmail.com', 'ADMIN_EMAIL is set to sandeepasuraj80@gmail.com in .env');
    assert(Boolean(process.env.EMAIL_USER), 'EMAIL_USER is defined in .env');
    assert(Boolean(process.env.EMAIL_PASS), 'EMAIL_PASS is defined in .env');

    // ----------------------------------------------------
    // Test 3: Booking Model Schema Verification
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 2: Booking Schema Fields');
    const bookingSchemaPaths = Booking.schema.paths;
    assert(Boolean(bookingSchemaPaths['purpose']), 'Booking schema includes purpose field');
    assert(Boolean(bookingSchemaPaths['adminEmailStatus']), 'Booking schema includes adminEmailStatus field');
    assert(Boolean(bookingSchemaPaths['userEmailStatus']), 'Booking schema includes userEmailStatus field');
    assert(
        bookingSchemaPaths['adminEmailStatus'].enumValues &&
        bookingSchemaPaths['adminEmailStatus'].enumValues.includes('sent') &&
        bookingSchemaPaths['adminEmailStatus'].enumValues.includes('failed'),
        'adminEmailStatus enum includes sent and failed'
    );

    // ----------------------------------------------------
    // Test 4: Email Content & Field Integrity
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 3: Email Content & Template Integrity');
    const emailSource = require('fs').readFileSync(require('path').join(__dirname, 'config/email.js'), 'utf8');

    // Verify Admin Email Requirements:
    assert(emailSource.includes('New Boardroom Booking Received - TASMA Boardroom System'), 'Admin subject matches exactly');
    assert(emailSource.includes('New Boardroom Booking'), 'Admin email includes heading "New Boardroom Booking"');
    assert(emailSource.includes('A new boardroom booking has been submitted through the TASMA Boardroom Booking System. Please review the booking details.'), 'Admin email includes required notification message');
    assert(emailSource.includes('employeeName') && emailSource.includes('employeeEmail'), 'Admin email includes employee name and registered email');
    assert(emailSource.includes('booking.boardroom') && emailSource.includes('booking.purpose'), 'Admin email includes boardroom and purpose');
    assert(emailSource.includes('formattedDate') && emailSource.includes('timeSlot'), 'Admin email includes date and time slot');
    assert(emailSource.includes('booking.status') && emailSource.includes('createdAt'), 'Admin email includes booking status and creation timestamp');

    // Verify Employee Confirmation Requirements:
    assert(emailSource.includes('Reservation Confirmed'), 'Employee confirmation includes heading');
    assert(emailSource.includes('Boardroom Reservation Confirmation'), 'Employee subject matches pattern');

    // ----------------------------------------------------
    // Test 5: Error Isolation & Separate Delivery Status
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 4: Separate Error Handling & Pipeline Isolation');

    const mockBooking = {
        id: 'BK-TEST-101',
        token: 'BR-20261116-MB-TEST',
        boardroom: 'Main Boardroom',
        date: '2026-11-16',
        startTime: '04:00 PM',
        endTime: '05:00 PM',
        purpose: 'Annual Budget Review',
        bookingCreatedAt: '2026-11-16 16:00',
        status: 'Confirmed'
    };

    // Mock createTransport so sendMail simulates delivery without network socket delays
    const origCreateTransport = nodemailer.createTransport;
    let simulateAdminFail = false;
    let simulateUserFail = false;

    nodemailer.createTransport = function() {
        return {
            async sendMail(opts) {
                if (opts.to === process.env.ADMIN_EMAIL && simulateAdminFail) {
                    throw new Error('Simulated SMTP Failure for Admin');
                }
                if (opts.to !== process.env.ADMIN_EMAIL && simulateUserFail) {
                    throw new Error('Simulated SMTP Failure for Employee');
                }
                return { messageId: '<mock-id-' + Date.now() + '@tasmagroup.com>' };
            },
            async verify() {
                return true;
            }
        };
    };

    try {
        // Case A: Normal operation - both sent
        simulateAdminFail = false;
        simulateUserFail = false;
        const bothSuccess = await dispatchBookingEmails(mockBooking, { email: 'employee@test.com', fullName: 'Test Employee' });
        assert(bothSuccess.adminEmailStatus === 'sent', 'Both success: Admin email status is "sent"');
        assert(bothSuccess.userEmailStatus === 'sent', 'Both success: User email status is "sent"');

        // Case B: Admin fails, Employee succeeds
        simulateAdminFail = true;
        simulateUserFail = false;
        const adminFails = await dispatchBookingEmails(mockBooking, { email: 'employee@test.com', fullName: 'Test Employee' });
        assert(adminFails.adminEmailStatus === 'failed', 'Admin failure isolation: Admin status is "failed"');
        assert(adminFails.userEmailStatus === 'sent', 'Admin failure isolation: Employee still receives confirmation ("sent")');

        // Case C: Employee fails, Admin succeeds
        simulateAdminFail = false;
        simulateUserFail = true;
        const userFails = await dispatchBookingEmails(mockBooking, { email: 'employee@test.com', fullName: 'Test Employee' });
        assert(userFails.adminEmailStatus === 'sent', 'Employee failure isolation: Admin still receives notification ("sent")');
        assert(userFails.userEmailStatus === 'failed', 'Employee failure isolation: Employee status is "failed"');
    } finally {
        nodemailer.createTransport = origCreateTransport;
    }

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});

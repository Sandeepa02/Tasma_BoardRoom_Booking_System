const nodemailer = require('nodemailer');

/**
 * Creates and returns a reusable Nodemailer transporter using Gmail SMTP
 */
function createTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: user.trim(),
            pass: pass.trim().replace(/\s+/g, '') // remove spaces from Gmail app passwords if any
        }
    });
}

/**
 * Diagnostic logger for email configuration without exposing secrets
 */
function checkEmailConfig() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;

    console.log('----------------------------------------------------');
    console.log('📧 [Email Service] Configuration Status:');
    if (user) {
        const maskedUser = user.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c);
        console.log(`   • EMAIL_USER:  ${maskedUser}`);
    } else {
        console.log('   • EMAIL_USER:  ❌ Not configured in .env');
    }

    if (pass) {
        console.log('   • EMAIL_PASS:  •••••••• (Configured)');
    } else {
        console.log('   • EMAIL_PASS:  ❌ Not configured in .env');
    }

    if (adminEmail) {
        console.log(`   • ADMIN_EMAIL: ${adminEmail} (Admin recipient)`);
    } else {
        console.log('   • ADMIN_EMAIL: ❌ Not configured in .env');
    }
    console.log('----------------------------------------------------');

    return {
        configured: Boolean(user && pass),
        hasAdmin: Boolean(adminEmail)
    };
}

/**
 * Verifies the Gmail SMTP transporter connection
 */
async function verifyTransporter() {
    const transporter = createTransporter();
    if (!transporter) {
        return {
            success: false,
            message: 'EMAIL_USER or EMAIL_PASS missing in environment.'
        };
    }

    try {
        await transporter.verify();
        console.log('✅ [Email Service] SMTP connection to Gmail verified successfully.');
        return { success: true };
    } catch (err) {
        console.warn('⚠️ [Email Service] SMTP connection verification failed:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Helper to format date strings like "2026-11-16" into "16 November 2026"
 */
function formatDisplayDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    } catch (e) {}
    return dateStr;
}

/**
 * Generates responsive corporate HTML for Admin New Booking Notification
 */
function generateAdminEmailHTML(booking, employee) {
    const employeeName = employee.fullName || booking.userName || 'Employee';
    const employeeEmail = employee.email || booking.email || 'N/A';
    const employeeEmpId = employee.empId || booking.empId || 'N/A';
    const employeeDept = employee.department || 'N/A';
    const formattedDate = formatDisplayDate(booking.date);
    const purpose = booking.purpose || 'General Business Meeting';
    const bookingId = booking.token || booking.id;
    const createdAt = booking.bookingCreatedAt || new Date().toISOString().replace('T', ' ').substring(0, 16);
    const timeSlot = booking.fullDay ? '08:00 AM - 06:00 PM (Full Day)' : `${booking.startTime} - ${booking.endTime}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Boardroom Booking Received</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); }
    .header { background: linear-gradient(135deg, #0a192f 0%, #1e293b 100%); padding: 32px 30px 24px; text-align: left; border-bottom: 4px solid #f97316; }
    .brand-title { color: #f97316; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .content { padding: 32px 30px; }
    .intro-box { background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; }
    .intro-box p { margin: 0; color: #9a3412; font-size: 14px; line-height: 1.5; font-weight: 500; }
    .section-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 10px; }
    .detail-table { width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; }
    .detail-table td { padding: 11px 16px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
    .detail-table tr:last-child td { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; width: 38%; }
    .detail-val { color: #0f172a; font-weight: 700; }
    .badge-confirmed { display: inline-block; padding: 3px 10px; background-color: #dcfce7; color: #166534; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-token { display: inline-block; padding: 3px 8px; background-color: #0a192f; color: #f97316; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; }
    .footer { background-color: #f8fafc; padding: 22px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">TASMA Group • Corporate Portal</div>
      <h1>New Boardroom Booking</h1>
    </div>

    <div class="content">
      <div class="intro-box">
        <p>A new boardroom booking has been submitted through the TASMA Boardroom Booking System. Please review the booking details.</p>
      </div>

      <div class="section-title">Reservation Details</div>
      <table class="detail-table">
        <tr>
          <td class="detail-label">Booking ID / Token</td>
          <td class="detail-val"><span class="badge-token">${bookingId}</span></td>
        </tr>
        <tr>
          <td class="detail-label">Status</td>
          <td class="detail-val"><span class="badge-confirmed">${booking.status || 'Confirmed'}</span></td>
        </tr>
        <tr>
          <td class="detail-label">Boardroom</td>
          <td class="detail-val">${booking.boardroom}</td>
        </tr>
        <tr>
          <td class="detail-label">Booking Date</td>
          <td class="detail-val">${formattedDate}</td>
        </tr>
        <tr>
          <td class="detail-label">Time Slot</td>
          <td class="detail-val">${timeSlot}</td>
        </tr>
        <tr>
          <td class="detail-label">Meeting Purpose</td>
          <td class="detail-val">${purpose}</td>
        </tr>
        <tr>
          <td class="detail-label">Submission Time</td>
          <td class="detail-val">${createdAt}</td>
        </tr>
      </table>

      <div class="section-title">Employee Information</div>
      <table class="detail-table">
        <tr>
          <td class="detail-label">Employee Name</td>
          <td class="detail-val">${employeeName}</td>
        </tr>
        <tr>
          <td class="detail-label">Registered Email</td>
          <td class="detail-val"><a href="mailto:${employeeEmail}" style="color: #f97316; text-decoration: none; font-weight: 600;">${employeeEmail}</a></td>
        </tr>
        <tr>
          <td class="detail-label">Employee ID</td>
          <td class="detail-val">${employeeEmpId}</td>
        </tr>
        <tr>
          <td class="detail-label">Department</td>
          <td class="detail-val">${employeeDept}</td>
        </tr>
      </table>

      <p style="margin-top: 26px; font-size: 13px; color: #475569; line-height: 1.6;">
        Please log in to the TASMA Boardroom Booking System to review this booking or manage reservations.
      </p>
    </div>

    <div class="footer">
      <p><strong>TASMA Boardroom Booking System</strong></p>
      <p>This is an automated administrative notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
}

/**
 * Generates responsive corporate HTML for Employee Confirmation Email
 */
function generateEmployeeEmailHTML(booking, employee) {
    const employeeName = employee.fullName || booking.userName || 'Valued Team Member';
    const formattedDate = formatDisplayDate(booking.date);
    const purpose = booking.purpose || 'General Business Meeting';
    const bookingId = booking.token || booking.id;
    const timeSlot = booking.fullDay ? '08:00 AM - 06:00 PM (Full Day)' : `${booking.startTime} - ${booking.endTime}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boardroom Reservation Confirmation</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); }
    .header { background: linear-gradient(135deg, #0a192f 0%, #1e293b 100%); padding: 32px 30px 24px; text-align: left; border-bottom: 4px solid #f97316; }
    .brand-title { color: #f97316; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .content { padding: 32px 30px; }
    .badge-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .token-display { text-align: center; margin: 10px 0 20px; }
    .token-box { display: inline-block; background-color: #0a192f; color: #f97316; font-family: monospace; font-size: 16px; font-weight: 700; padding: 8px 16px; border-radius: 8px; letter-spacing: 1.5px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-val { color: #0f172a; font-weight: 700; }
    .footer { background-color: #f8fafc; padding: 22px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">TASMA Group • Corporate Portal</div>
      <h1>Reservation Confirmed</h1>
    </div>

    <div class="content">
      <p style="font-size: 15px; margin: 0 0 16px;">Dear <strong>${employeeName}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
        Your reservation for the <strong>${booking.boardroom}</strong> has been confirmed. Below are your booking details and access pass token:
      </p>

      <div class="token-display">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px; font-weight: 700;">Access Token</div>
        <div class="token-box">${bookingId}</div>
      </div>

      <div class="badge-card">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Boardroom:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${booking.boardroom}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Date:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Time Slot:</td>
            <td style="padding: 6px 0; color: #f97316; font-weight: 700; text-align: right;">${timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Purpose:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${purpose}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Status:</td>
            <td style="padding: 6px 0; color: #166534; font-weight: 700; text-align: right;">Confirmed</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
        You can view, present, or download your PDF entrance pass anytime by logging into the TASMA Boardroom Portal.
      </p>
    </div>

    <div class="footer">
      <p><strong>TASMA Boardroom Booking System</strong></p>
      <p>TASMA International Manpower • Corporate Services</p>
    </div>
  </div>
</body>
</html>
    `.trim();
}

/**
 * Sends Admin Notification Email
 */
async function sendAdminBookingNotification(booking, employee = {}) {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim();

    if (!adminEmail) {
        console.warn('⚠️ [Admin Email] Skipped: ADMIN_EMAIL is not configured in .env');
        return { success: false, reason: 'ADMIN_EMAIL not set' };
    }

    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️ [Admin Email] Skipped: EMAIL_USER or EMAIL_PASS not configured in .env');
        return { success: false, reason: 'Credentials missing' };
    }

    const sender = process.env.EMAIL_USER;
    const subject = 'New Boardroom Booking Received - TASMA Boardroom System';
    const html = generateAdminEmailHTML(booking, employee);

    console.log(`📨 [Admin Email] Sending notification to administrator: ${adminEmail}`);

    try {
        const info = await transporter.sendMail({
            from: `"TASMA Boardroom System" <${sender}>`,
            to: adminEmail,
            subject,
            html
        });
        console.log(`✅ [Admin Email] Successfully delivered to ${adminEmail} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`❌ [Admin Email] Delivery failed to ${adminEmail}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Sends Employee Booking Confirmation Email
 */
async function sendEmployeeBookingConfirmation(booking, employee = {}) {
    const recipient = (employee.email || booking.email || '').trim();

    if (!recipient) {
        console.warn('⚠️ [Employee Email] Skipped: No registered employee email address found.');
        return { success: false, reason: 'No recipient email' };
    }

    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️ [Employee Email] Skipped: EMAIL_USER or EMAIL_PASS not configured in .env');
        return { success: false, reason: 'Credentials missing' };
    }

    const sender = process.env.EMAIL_USER;
    const subject = `Boardroom Reservation Confirmation - ${booking.boardroom}`;
    const html = generateEmployeeEmailHTML(booking, employee);

    console.log(`📨 [Employee Email] Sending confirmation to employee: ${recipient}`);

    try {
        const info = await transporter.sendMail({
            from: `"TASMA Boardroom System" <${sender}>`,
            to: recipient,
            subject,
            html
        });
        console.log(`✅ [Employee Email] Successfully delivered to ${recipient} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`❌ [Employee Email] Delivery failed to ${recipient}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Dispatches both Admin and Employee emails with separate error handling
 * and returns their delivery statuses
 */
async function dispatchBookingEmails(booking, employee = {}) {
    const [adminResult, userResult] = await Promise.allSettled([
        sendAdminBookingNotification(booking, employee),
        sendEmployeeBookingConfirmation(booking, employee)
    ]);

    const adminEmailStatus = (adminResult.status === 'fulfilled' && adminResult.value.success)
        ? 'sent'
        : 'failed';

    const userEmailStatus = (userResult.status === 'fulfilled' && userResult.value.success)
        ? 'sent'
        : 'failed';

    return {
        adminEmailStatus,
        userEmailStatus,
        adminDetails: adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: adminResult.reason },
        userDetails: userResult.status === 'fulfilled' ? userResult.value : { success: false, error: userResult.reason }
    };
}

module.exports = {
    createTransporter,
    checkEmailConfig,
    verifyTransporter,
    sendAdminBookingNotification,
    sendEmployeeBookingConfirmation,
    dispatchBookingEmails
};

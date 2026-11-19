const nodemailer = require('nodemailer');

/**
 * Creates and returns a reusable Nodemailer transporter.
 * Supports direct SMTP (cPanel/Webmail, custom corporate servers) or predefined services (Gmail).
 */
function createTransporter() {
    const rawUser = process.env.EMAIL_USER;
    const rawPass = process.env.EMAIL_PASS;

    if (!rawUser || !rawPass) {
        return null;
    }

    // Extract single SMTP login account even if comma-separated values are present
    const user = rawUser.split(/[,;]/)[0].trim();
    const pass = rawPass.split(/[,;]/)[0].trim();

    const host = process.env.SMTP_HOST;
    if (host) {
        const rawPort = (process.env.SMTP_PORT || '465').toString().trim();
        const port = parseInt(rawPort, 10) || 465;
        const secureVal = (process.env.SMTP_SECURE || '').toString().trim().toLowerCase();
        // Port 465 is direct SSL (secure = true). Ports 25, 26, 587 use STARTTLS (secure = false)
        const secure = (secureVal === 'true' || port === 465) && port !== 25 && port !== 26 && port !== 587;

        return nodemailer.createTransport({
            host: host.trim(),
            port,
            secure,
            auth: {
                user,
                pass
            },
            tls: {
                // Allows self-signed or proxy certificates if SMTP_REJECT_UNAUTHORIZED is explicitly false
                rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
            }
        });
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user,
            pass: pass.replace(/\s+/g, '') // remove spaces from Gmail app passwords if any
        }
    });
}

/**
 * Helper to get list of admin email addresses from environment
 */
function getAdminEmails() {
    const raw = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || '';
    return raw
        .split(/[,;]/)
        .map(e => e.trim())
        .filter(Boolean);
}

/**
 * Helper to get list of user confirmation / notification email addresses from environment
 * Supports comma-separated emails for multiple recipients (up to 30+ users)
 */
function getUserNotificationEmails() {
    const raw = process.env.USER_CONFIRMATION_EMAILS || 
                process.env.USER_CONFIRMATION_EMAIL || 
                process.env.USER_EMAILS || 
                process.env.USER_EMAIL || 
                process.env.STAFF_EMAILS || '';
    if (raw) {
        return raw
            .split(/[,;]/)
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);
    }
    // Fallback: if multiple comma-separated emails were placed in EMAIL_USER
    const rawUser = process.env.EMAIL_USER || '';
    if (rawUser.includes(',') || rawUser.includes(';')) {
        return rawUser
            .split(/[,;]/)
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);
    }
    return [];
}

/**
 * Diagnostic logger for email configuration without exposing secrets
 */
function checkEmailConfig() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const adminEmails = getAdminEmails();
    const userEmails = getUserNotificationEmails();
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || (host ? '465' : 'N/A');

    console.log('----------------------------------------------------');
    console.log('📧 [Email Service] Configuration Status:');
    if (host) {
        console.log(`   • Mode:        Custom Corporate SMTP (${host}:${port})`);
    } else {
        console.log(`   • Mode:        Service Provider (${process.env.EMAIL_SERVICE || 'gmail'})`);
    }

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

    if (adminEmails.length > 0) {
        console.log(`   • ADMIN_EMAIL: ${adminEmails.join(', ')} (${adminEmails.length} recipient${adminEmails.length > 1 ? 's' : ''})`);
    } else {
        console.log('   • ADMIN_EMAIL: ❌ Not configured in .env');
    }

    if (userEmails.length > 0) {
        console.log(`   • USER_CONFIRMATION_EMAILS: ${userEmails.join(', ')} (${userEmails.length} recipient${userEmails.length > 1 ? 's' : ''})`);
    }
    console.log('----------------------------------------------------');

    return {
        configured: Boolean(user && pass),
        hasAdmin: adminEmails.length > 0
    };
}

/**
 * Verifies the SMTP transporter connection
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
        const target = process.env.SMTP_HOST || process.env.EMAIL_SERVICE || 'SMTP server';
        console.log(`✅ [Email Service] SMTP connection to ${target} verified successfully.`);
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
    const timeSlot = booking.timeLabel || (booking.fullDay ? '08:00 AM - 06:00 PM (Full Day)' : `${booking.startTime} - ${booking.endTime}`);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Boardroom Booking - TASMA Group</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="5" bgcolor="#F57A00" style="background-color: #F57A00; line-height: 5px; font-size: 5px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td bgcolor="#001C71" style="background-color: #001C71; padding: 30px 32px 26px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="color: #F57A00; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">TASMA GROUP • CORPORATE SERVICES</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 23px; font-weight: 700; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">New Boardroom Reservation</h1>
                    <div style="margin-top: 8px;">
                      <span style="display: inline-block; background-color: rgba(245, 122, 0, 0.18); border: 1px solid #F57A00; color: #ffd6ad; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">
                        🛡️ Administrator Notification
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Alert Banner -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFF7ED" style="background-color: #FFF7ED; border-left: 4px solid #F57A00; border-radius: 8px;">
                <tr>
                  <td style="padding: 14px 18px; font-size: 13px; line-height: 1.5; color: #9A3412;">
                    <strong>New Booking Submitted:</strong> An employee has reserved a boardroom. Details are summarized below for your review.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Token Box -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0A192F" style="background-color: #0A192F; border: 1px solid #1E293B; border-radius: 12px; text-align: center;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="color: #94A3B8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Reservation Token ID</div>
                    <div style="color: #F57A00; font-family: 'SF Pro Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 18px; font-weight: 800; letter-spacing: 2px;">
                      ${bookingId}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reservation Details Section -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <div style="color: #64748B; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
                📌 Reservation Overview
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; width: 38%; border-bottom: 1px solid #E2E8F0;">Boardroom:</td>
                  <td style="padding: 12px 18px; font-size: 14px; color: #001C71; font-weight: 800; border-bottom: 1px solid #E2E8F0;">${booking.boardroom}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Scheduled Date:</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #E2E8F0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Time Slot(s):</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #EA580C; font-weight: 800; font-family: monospace; border-bottom: 1px solid #E2E8F0;">${timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Status:</td>
                  <td style="padding: 12px 18px; font-size: 13px; border-bottom: 1px solid #E2E8F0;">
                    <span style="display: inline-block; background-color: #DCFCE7; color: #166534; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">● Confirmed</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Submission Date:</td>
                  <td style="padding: 12px 18px; font-size: 12px; color: #64748B; font-weight: 600;">${createdAt}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meeting Purpose Callout -->
          <tr>
            <td style="padding: 18px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #001C71; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 1.5px; margin-bottom: 4px;">🎯 Meeting Purpose</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.4;">${purpose}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Employee Details Section -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <div style="color: #64748B; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
                👤 Employee Information
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; width: 38%; border-bottom: 1px solid #E2E8F0;">Full Name:</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #E2E8F0;">${employeeName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Employee ID:</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #E2E8F0;">${employeeEmpId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Department:</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #E2E8F0;">${employeeDept}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Work Email:</td>
                  <td style="padding: 12px 18px; font-size: 13px;">
                    <a href="mailto:${employeeEmail}" style="color: #F57A00; font-weight: 700; text-decoration: none;">${employeeEmail}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Portal Access Notice -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 12px; color: #64748B; line-height: 1.5;">
                To view upcoming schedule calendars or manage reservations, access the administrator portal:
              </p>
              <a href="http://localhost:5000" style="display: inline-block; background-color: #001C71; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; letter-spacing: 0.3px;">
                Open Admin Portal &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#F8FAFC" style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 22px 32px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #001C71; margin-bottom: 4px;">TASMA Boardroom Booking System</div>
              <div style="font-size: 11px; color: #64748B; line-height: 1.5;">
                TASMA International Manpower • Corporate Services<br>
                This is an automated administrative notification. Please do not reply directly.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
    const timeSlot = booking.timeLabel || (booking.fullDay ? '08:00 AM - 06:00 PM (Full Day)' : `${booking.startTime} - ${booking.endTime}`);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boardroom Reservation Confirmed - TASMA Group</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="5" bgcolor="#F57A00" style="background-color: #F57A00; line-height: 5px; font-size: 5px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td bgcolor="#001C71" style="background-color: #001C71; padding: 30px 32px 26px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="color: #F57A00; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">TASMA GROUP • CORPORATE SERVICES</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 23px; font-weight: 700; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Reservation Confirmed</h1>
                    <div style="margin-top: 8px;">
                      <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #bbf7d0; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">
                        ✔ Booking Confirmed &amp; Pass Ready
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting & Intro -->
          <tr>
            <td style="padding: 26px 32px 0;">
              <div style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">
                Dear ${employeeName},
              </div>
              <div style="font-size: 13px; color: #475569; line-height: 1.6;">
                Your boardroom reservation for the <strong style="color: #001C71;">${booking.boardroom}</strong> has been successfully confirmed. Below is your booking summary and access token.
              </div>
            </td>
          </tr>

          <!-- Access Token Box -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0A192F" style="background-color: #0A192F; border: 1px solid #1E293B; border-radius: 12px; text-align: center;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="color: #94A3B8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Boardroom Entrance Token</div>
                    <div style="color: #F57A00; font-family: 'SF Pro Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 20px; font-weight: 800; letter-spacing: 2.5px;">
                      ${bookingId}
                    </div>
                    <div style="color: #94A3B8; font-size: 11px; margin-top: 6px;">
                      Please display or scan this token upon entering the boardroom
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reservation Details Card -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <div style="color: #64748B; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
                📋 Booking Details
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; width: 38%; border-bottom: 1px solid #E2E8F0;">Boardroom:</td>
                  <td style="padding: 12px 18px; font-size: 14px; color: #001C71; font-weight: 800; border-bottom: 1px solid #E2E8F0;">${booking.boardroom}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Scheduled Date:</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #E2E8F0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #E2E8F0;">Reserved Slot(s):</td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #EA580C; font-weight: 800; font-family: monospace; border-bottom: 1px solid #E2E8F0;">${timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B; font-weight: 600;">Reservation Status:</td>
                  <td style="padding: 12px 18px; font-size: 13px;">
                    <span style="display: inline-block; background-color: #DCFCE7; color: #166534; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">● Confirmed</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Purpose Card -->
          <tr>
            <td style="padding: 18px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #F57A00; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 1.5px; margin-bottom: 4px;">🎯 Meeting Purpose</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.4;">${purpose}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action / PDF Pass Information -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 12px; color: #64748B; line-height: 1.5;">
                You can view details, cancel reservations, or download a printable PDF pass anytime via your dashboard:
              </p>
              <a href="http://localhost:5000" style="display: inline-block; background-color: #F57A00; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; letter-spacing: 0.3px;">
                View My Bookings &amp; PDF Pass &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#F8FAFC" style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 22px 32px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: #001C71; margin-bottom: 4px;">TASMA Boardroom Booking System</div>
              <div style="font-size: 11px; color: #64748B; line-height: 1.5;">
                TASMA International Manpower • Corporate Services<br>
                Thank you for using the TASMA Boardroom Reservation Portal.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}

/**
 * Sends Admin Notification Email (supports single or multiple recipients)
 */
async function sendAdminBookingNotification(booking, employee = {}) {
    const adminEmails = getAdminEmails();

    if (adminEmails.length === 0) {
        console.warn('⚠️ [Admin Email] Skipped: ADMIN_EMAIL is not configured in .env');
        return { success: false, reason: 'ADMIN_EMAIL not set' };
    }

    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️ [Admin Email] Skipped: EMAIL_USER or EMAIL_PASS not configured in .env');
        return { success: false, reason: 'Credentials missing' };
    }

    const sender = (process.env.EMAIL_USER || '').split(/[,;]/)[0].trim();
    const subject = 'New Boardroom Booking Received - TASMA Boardroom System';
    const html = generateAdminEmailHTML(booking, employee);
    const recipients = adminEmails.join(', ');

    console.log(`📨 [Admin Email] Sending notification to administrator(s): ${recipients}`);

    try {
        const info = await transporter.sendMail({
            from: `"TASMA Boardroom System" <${sender}>`,
            to: recipients,
            subject,
            html
        });
        console.log(`✅ [Admin Email] Successfully delivered to ${recipients} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, recipients: adminEmails };
    } catch (err) {
        console.error(`❌ [Admin Email] Delivery failed to ${recipients}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Sends Employee Booking Confirmation Email
 * Delivers to the booking employee as well as all configured user notification recipients (up to 30+ users)
 */
async function sendEmployeeBookingConfirmation(booking, employee = {}) {
    const extraRecipients = getUserNotificationEmails();
    const primaryRecipient = (employee.email || booking.email || '').trim().toLowerCase();

    // Unique list of all recipients
    const allRecipients = Array.from(new Set([
        primaryRecipient,
        ...extraRecipients
    ])).filter(Boolean);

    if (allRecipients.length === 0) {
        console.warn('⚠️ [Employee Email] Skipped: No registered employee email address found.');
        return { success: false, reason: 'No recipient email' };
    }

    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️ [Employee Email] Skipped: EMAIL_USER or EMAIL_PASS not configured in .env');
        return { success: false, reason: 'Credentials missing' };
    }

    const sender = (process.env.EMAIL_USER || '').split(/[,;]/)[0].trim();
    const subject = `Boardroom Reservation Confirmation - ${booking.boardroom}`;
    const html = generateEmployeeEmailHTML(booking, employee);
    const recipients = allRecipients.join(', ');

    console.log(`📨 [Employee Email] Sending confirmation to ${allRecipients.length} user(s): ${recipients}`);

    try {
        const info = await transporter.sendMail({
            from: `"TASMA Boardroom System" <${sender}>`,
            to: recipients,
            subject,
            html
        });
        console.log(`✅ [Employee Email] Successfully delivered to ${recipients} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, recipients: allRecipients };
    } catch (err) {
        console.error(`❌ [Employee Email] Delivery failed to ${recipients}:`, err.message);
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
    getAdminEmails,
    getUserNotificationEmails,
    sendAdminBookingNotification,
    sendEmployeeBookingConfirmation,
    dispatchBookingEmails
};

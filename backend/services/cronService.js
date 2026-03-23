const cron = require('node-cron');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

const startMonthlyRetirementCron = () => {
    // Run on the 1st of every month at 8:00 AM IST
    // Note: Node-cron uses server time. For strict IST, we would set timezone config.
    cron.schedule('0 8 1 * *', async () => {
        console.log('Running Monthly Retirement Auto-Alert Scheduler');
        try {
            const [rows] = await pool.query(`
                SELECT e.emp_id, e.full_name, e.email, d.dept_name, des.desig_name, e.date_of_birth
                FROM employees e
                LEFT JOIN departments d ON e.dept_id = d.dept_id
                LEFT JOIN designations des ON e.desig_id = des.desig_id
                WHERE MONTH(DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR)) = MONTH(CURDATE())
                AND YEAR(DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR)) = YEAR(CURDATE())
                AND e.status = 'Active'
            `);

            if (rows.length === 0) {
                console.log('No retirements this month. Skipping email.');
                return;
            }

            // In reality, we'd generate a PDF and Excel buffer here.
            console.log(`Found ${rows.length} retirements. Generating mocked reports and sending emails...`);

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
                port: process.env.SMTP_PORT || 2525,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            // Fetch Admins and HR Managers
            const [admins] = await pool.query(`SELECT email FROM users WHERE role IN ('Admin', 'HR Manager')`);
            const adminEmails = admins.map(u => u.email).join(',');

            if (!adminEmails) return;

            await transporter.sendMail({
                from: process.env.ALERT_EMAIL_FROM || '"Editorial Authority" <alerts@editorialauthority.com>',
                to: adminEmails,
                subject: `Upcoming Retirements Alert - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                text: `Attached is the list of ${rows.length} employees reaching 58 years of age this month.`,
                // attachments: [{ filename: 'Report.pdf', content: pdfBuffer }]
            });

            console.log('Monthly retirement emails sent successfully.');
        } catch (err) {
            console.error('Cron job failed', err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};

module.exports = { startMonthlyRetirementCron };

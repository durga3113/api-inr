require('../settings')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: servicesmtp,
    auth: {
        user: sendemail,
        pass: sendpwmail,
    }
});

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP for Registration',
        html: `
        <html>
            <body>
                <p>Your OTP for registration is: <strong>${otp}</strong>. Please use this OTP to complete your registration process.</p>
            </body>
        </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
        console.error(`Failed to send OTP email to ${email}: ${error.message}`);
        throw error;
    }
}

async function sendReset(email, otp) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP for Password Reset',
        html: `
        <html>
            <body>
                <p>Your OTP for password reset is: <strong>${otp}</strong>. Please use this OTP to complete your registration process.</p>
            </body>
        </html>
    ` };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
        console.error(`Failed to send OTP email to ${email}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    sendOTPEmail,
    sendReset
};

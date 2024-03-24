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
        text: `Your OTP for registration is: ${otp}. Please use this OTP to complete your registration process.`
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
        text: `Your OTP for Password Reset is: ${otp}. Please use this OTP to complete your registration process.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
        console.error(`Failed to send OTP email to ${email}: ${error.message}`);
        throw error;
    }
}

module.exports = { sendOTPEmail, sendReset };

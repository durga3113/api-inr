const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: false },
    phoneNumber: { type: Number, required: false },
    otp: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true }
});

otpSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;

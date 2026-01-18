const mongoose = require('mongoose');

const UserOTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900
    },
    used_at: {
        type: Date,
    },
}, { timestamps: true });

const UserOTP = mongoose.model('UserOTP', UserOTPSchema);

module.exports = UserOTP;
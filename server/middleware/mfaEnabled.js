const User = require("../models/user.model");

module.exports = async function mfaEnabled(req, res, next) {
    try {
        const email = req.mfa.email;

        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Invalid MFA token payload"
            });
        }

        const user = await User.findOne({ email }).select("mfa.enabled");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // MFA already enabled → BLOCK
        if (user.mfa?.enabled === true) {
            return res.status(403).json({
                success: false,
                message: "MFA already enabled"
            });
        }

        // MFA disabled → ALLOW
        next();
    } catch (error) {
        console.error("mfaEnabled error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

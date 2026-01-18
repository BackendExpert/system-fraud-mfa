const jwt = require("jsonwebtoken");

module.exports = function mfaAuth(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return res.status(401).json({ message: "MFA token required" });
        }

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== "MFA") {
            return res.status(403).json({ message: "Invalid MFA token" });
        }

        req.mfa = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired MFA token" });
    }
};

const UserLogs = require("../models/userlog.model")
const User = require("../models/user.model")

class ActivityService {
    static async getUserActivities(token, req) {
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") throw new Error("Token expired");
            throw new Error("Invalid token");
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) throw new Error("User not found");

        const useractivity = await UserLogs.find()

        return useractivity;
    }
}

module.exports = ActivityService;
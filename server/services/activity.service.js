const UserLogs = require("../models/userlog.model")
const User = require("../models/user.model")
const Fraudaudit = require("../models/fraudaudit.model")

class ActivityService {
    static async getUserActivities(token) {
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

    static async getOneUserActivity(token, actId) {
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") throw new Error("Token expired");
            throw new Error("Invalid token");
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) throw new Error("User not found");

        const getactivity = await UserLogs.findById(actId)

        return getactivity
    }

    static async getFraudLogs(token) {
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") throw new Error("Token expired");
            throw new Error("Invalid token");
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) throw new Error("User not found");

        const fraudaudits = await Fraudaudit.find()

        return fraudaudits
    }

    static async getOneFraudLog(token, fraudlogId) {
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") throw new Error("Token expired");
            throw new Error("Invalid token");
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) throw new Error("User not found");

        const getfraudlog = await Fraudaudit.findById(fraudlogId)

        return getfraudlog;
    }
}

module.exports = ActivityService;
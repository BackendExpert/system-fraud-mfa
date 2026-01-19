const ActivityService = require("../services/activity.service");

const ActivityController = {
    getallActivities: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied" });

            const result = await ActivityService.getUserActivities()
            res.status(200).json(result)
        }
        catch (err) {
            res.status(400).json(ErrorResDTO(err.message));
        }
    },

    getOneActivity: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied" });

            const actId = req.params.id

            const result = await ActivityService.getOneUserActivity(actId)

            res.status(200).json(result)
        }
        catch (err) {
            res.status(400).json(ErrorResDTO(err.message));
        }
    },

    getFraudLogs: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied" });

            const result = await ActivityService.getFraudLogs()

            res.status(200).json(result)
        }
        catch (err) {
            res.status(400).json(ErrorResDTO(err.message));
        }
    },

    getoneFraudlog: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied" });

            const fraudLogID = req.params.id

            const result = await ActivityService.getOneFraudLog(fraudLogID)

            res.status(200).json(result)
        }
        catch (err) {
            res.status(400).json(ErrorResDTO(err.message));
        }
    }
};

module.exports = ActivityController;
const mongoose = require("mongoose");

const FraudAuditSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },

        ip: {
            type: String,
            required: true,
        },

        deviceId: {
            type: String,
        },

        riskScore: {
            type: Number,
            required: true,
        },

        riskLevel: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            required: true,
            index: true,
        },

        reasons: {
            type: [
                {
                    code: String,
                    message: String,
                    weight: Number,
                    meta: mongoose.Schema.Types.Mixed
                }
            ],
            default: [],
        },

        location: {
            country: String,
            city: String,
            lat: Number,
            lon: Number,
        },

        userAgent: {
            type: String,
        },

        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("FraudAudit", FraudAuditSchema);

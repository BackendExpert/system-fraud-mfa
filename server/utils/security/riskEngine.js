const resolveGeo = require("./resolveGeo");

// Calculate distance between two geo points (Haversine)
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const calculateRiskScore = ({ user, req, deviceId }) => {
    let risk = 0;
    const reasons = [];

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

    const currentLocation = resolveGeo(req);

    // IP CHANGE
    if (user.lastLoginIp && user.lastLoginIp !== ip) {
        risk += 40;
        reasons.push({
            code: "IP_CHANGE",
            message: "Login from a new IP address",
            weight: 40
        });
    }

    // UNTRUSTED DEVICE
    if (!user.trustedDevices?.includes(deviceId)) {
        risk += 30;
        reasons.push({
            code: "UNTRUSTED_DEVICE",
            message: "Login from an untrusted device",
            weight: 30
        });
    }

    // TIME ANOMALY
    const hour = new Date().getHours();
    if (hour < 5 || hour > 23) {
        risk += 20;
        reasons.push({
            code: "TIME_ANOMALY",
            message: "Login at unusual time",
            weight: 20
        });
    }

    // FAILED ATTEMPTS
    if (user.login_attempt >= 2) {
        risk += 20;
        reasons.push({
            code: "FAILED_ATTEMPTS",
            message: "Multiple failed login attempts",
            weight: 20
        });
    }

    // IMPOSSIBLE TRAVEL
    if (
        user.lastLoginLocation &&
        currentLocation &&
        user.lastLoginAt
    ) {
        const distanceKm = getDistanceKm(
            user.lastLoginLocation.lat,
            user.lastLoginLocation.lon,
            currentLocation.lat,
            currentLocation.lon
        );

        const hoursDiff =
            (Date.now() - new Date(user.lastLoginAt).getTime()) /
            (1000 * 60 * 60);

        if (distanceKm > 1000 && hoursDiff < 2) {
            risk += 50;
            reasons.push({
                code: "IMPOSSIBLE_TRAVEL",
                message: "Login from a distant location in a short time",
                meta: {
                    distanceKm: Math.round(distanceKm),
                    hoursDiff: Number(hoursDiff.toFixed(2))
                },
                weight: 50
            });
        }
    }

    return {
        riskScore: risk,
        riskLevel: riskDecision(risk),
        reasons
    };
};

const riskDecision = (risk) => {
    if (risk < 30) return "LOW";
    if (risk < 60) return "MEDIUM";
    if (risk < 85) return "HIGH";
    return "CRITICAL";
};

module.exports = {
    calculateRiskScore,
    riskDecision
};

const geoip = require("geoip-lite");

module.exports = function resolveGeo(req) {
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

    const geo = geoip.lookup(ip);

    if (!geo) return null;

    return {
        country: geo.country,
        city: geo.city,
        lat: geo.ll[0],
        lon: geo.ll[1]
    };
};

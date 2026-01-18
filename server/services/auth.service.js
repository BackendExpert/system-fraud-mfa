const bcrypt = require("bcrypt");
const MAX_ATTEMPTS = 5;

// models
const User = require("../models/user.model");
const Role = require("../models/role.model");
const UserOTP = require("../models/userotp.model");
const UserLogs = require("../models/userlog.model")

// dtos
const {
    CreateAccountResDTO,
    CreateLoginResDTO,
    VerifyLoginResDTO
} = require("../dtos/auth.dto");

// utils
const { genarateOTP } = require("../utils/others/genarateOTP");
const generateToken = require("../utils/token/generateToken");
const verifyToken = require("../utils/token/verifyToken");
const { shouldResetAttempts } = require("../utils/logins/resetLoginAttempt");
const logUserAction = require("../utils/others/logUserAction");

// email templates
const CreateAccountEmail = require("../templates/CreateAccountEmail");
const notificationEmail = require("../templates/notificationEmail");

// security
const { calculateRiskScore, riskDecision } = require("../utils/security/riskEngine");
const { generateMFASecret, verifyMFAToken } = require("../utils/security/mfaService");

const FraudAudit = require("../models/fraudaudit.model");
const resolveGeo = require("../utils/security/resolveGeo");

class AuthService {

    // =========================
    // CREATE AUTH (SEND OTP)
    // =========================
    static async createAuth(email, req) {
        const existingOTP = await UserOTP.findOne({ email });
        if (existingOTP) {
            throw new Error("OTP already sent. Check your email.");
        }

        let user = await User.findOne({ email });

        const otp = genarateOTP();
        const hashotp = await bcrypt.hash(otp, 10);

        await CreateAccountEmail(email, otp);

        await UserOTP.create({ email, otp: hashotp });

        // const otpToken = generateToken({ email, otp }, "5min");
        const otpToken = generateToken(
            { email, type: "OTP_VERIFY" },
            "5min"
        );

        if (!user) {
            const role = await Role.findOne({ name: "user" });
            if (!role) throw new Error("Default role not found");

            user = await User.create({
                email,
                role: role._id,
                isActive: true,
                isEmailVerified: false
            });

            await logUserAction(
                req,
                "REGISTER_OTP_SENT",
                "Registration OTP sent",
                this._meta(req),
                user._id
            );

            return CreateAccountResDTO(otpToken);
        }

        await logUserAction(
            req,
            "LOGIN_OTP_SENT",
            "Login OTP sent",
            this._meta(req),
            user._id
        );

        return CreateLoginResDTO(otpToken);
    }

    // =========================
    // VERIFY OTP + RISK CHECK
    // =========================
    static async verifyOTP(token, otp, req) {
        const decoded = verifyToken(token);

        if (decoded.type !== "OTP_VERIFY") {
            throw new Error("Invalid OTP token");
        }

        const email = decoded.email;
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        // Reset attempts if window passed
        if (shouldResetAttempts(user)) {
            user.login_attempt = 0;
            user.lastLoginAttemptAt = null;
            await user.save();
        }

        if (user.login_attempt >= MAX_ATTEMPTS) {
            throw new Error("Account temporarily locked");
        }

        const userOTP = await UserOTP.findOne({ email });
        if (!userOTP) {
            user.login_attempt++;
            await user.save();
            throw new Error("OTP expired or invalid");
        }

        const isValid = await bcrypt.compare(otp, userOTP.otp);
        if (!isValid) {
            user.login_attempt++;
            await user.save();
            throw new Error("Invalid OTP");
        }

        // ✅ OTP SUCCESS → DELETE IMMEDIATELY
        await UserOTP.deleteOne({ email });

        const deviceId = req.headers["x-device-id"];
        const currentLocation = resolveGeo(req);

        // =========================
        // FIRST LOGIN → FORCE MFA
        // =========================
        if (!user.lastLogin) {
            const challengeId = crypto.randomUUID();

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        mfaChallenge: {
                            id: challengeId,
                            expiresAt: Date.now() + 5 * 60 * 1000
                        }
                    }
                }
            );

            const mfaToken = generateToken(
                { email, type: "MFA", challengeId },
                "5min"
            );

            return {
                token: mfaToken,
                mfaRequired: true,
                mfaType: "AUTHENTICATOR_APP"
            };
        }

        // =========================
        // FRAUD ENGINE
        // =========================
        const { riskScore, riskLevel, reasons } = calculateRiskScore({
            user,
            req,
            deviceId
        });

        if (riskLevel === "CRITICAL") {
            throw new Error("Login blocked due to suspicious activity");
        }

        await FraudAudit.create({
            user: user._id,
            ip: this._ip(req),
            deviceId,
            riskScore,
            riskLevel,
            reasons,
            location: currentLocation,
            userAgent: req.headers["user-agent"]
        });

        // =========================
        // LOW RISK + MFA ENABLED → LOGIN
        // =========================
        if (riskLevel === "LOW" && user.mfa.enabled === true) {
            const role = await Role.findById(user.role);

            user.login_attempt = 0;
            user.lastLogin = new Date();
            user.lastLoginIp = this._ip(req);
            user.lastLoginLocation = currentLocation;

            await user.save();

            const jwt = generateToken(
                { id: user._id, email: user.email, role: role?.name },
                "1d"
            );

            return VerifyLoginResDTO(jwt);
        }

        // =========================
        // MEDIUM / HIGH → MFA STEP-UP
        // =========================
        const challengeId = crypto.randomUUID();

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    mfaChallenge: {
                        id: challengeId,
                        expiresAt: Date.now() + 5 * 60 * 1000
                    }
                }
            }
        );

        const mfaToken = generateToken(
            { email, type: "MFA", challengeId },
            "5min"
        );

        return {
            token: mfaToken,
            mfaRequired: true,
            mfaType: "AUTHENTICATOR_APP"
        };
    }
    // =========================
    // MFA ENROLL (QR CODE)
    // =========================
    static async enrollMFA(email, req) {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        if (user.mfa?.enabled) {
            return { enrolled: true };
        }

        if (user.mfa?.secret) {
            const qrCode = await generateMFAQR(user.mfa.secret, email);
            return { qrCode };
        }

        const { base32, qrCode } = await generateMFASecret(email);

        user.mfa = {
            enabled: false,
            secret: base32,
            enrolledAt: new Date()
        };

        await user.save();

        await logUserAction(
            req,
            "MFA_ENROLL_STARTED",
            "Authenticator enrollment started",
            this._meta(req),
            user._id
        );

        return { qrCode };
    }

    // =========================
    // VERIFY MFA CODE
    // =========================
    static async verifyMFA(email, token, req) {
        const { challengeId } = req.mfa;
        const deviceId = req.headers["x-device-id"];
        const currentLocation = resolveGeo(req);

        const user = await User.findOne({ email });
        if (!user || !user.mfa?.secret) {
            throw new Error("MFA not configured");
        }

        if (
            !user.mfaChallenge ||
            user.mfaChallenge.id !== challengeId ||
            user.mfaChallenge.expiresAt < Date.now()
        ) {
            throw new Error("Invalid or expired MFA challenge");
        }

        const valid = verifyMFAToken(token, user.mfa.secret);
        if (!valid) throw new Error("Invalid MFA code");

        // ✅ Finalize MFA
        user.mfa.enabled ||= true;
        user.mfaChallenge = null;
        user.login_attempt = 0;
        user.lastLogin = new Date();
        user.lastLoginIp = this._ip(req);
        user.lastLoginLocation = currentLocation;

        if (deviceId && !user.trustedDevices.includes(deviceId)) {
            user.trustedDevices.push(deviceId);
        }

        await user.save();

        const role = await Role.findById(user.role);
        const jwt = generateToken(
            { id: user._id, email: user.email, role: role?.name },
            "1d"
        );

        return VerifyLoginResDTO(jwt);
    }

    // =========================
    // HELPERS
    // =========================
    static _ip(req) {
        return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    }

    static _meta(req) {
        return {
            ipAddress: this._ip(req),
            userAgent: req.headers["user-agent"],
            timestamp: new Date()
        };
    }
}

module.exports = AuthService;

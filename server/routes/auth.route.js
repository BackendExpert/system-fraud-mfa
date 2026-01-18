const express = require('express');
const AuthController = require('../controllers/auth.controller');
const mfaAuth = require('../middleware/mfaAuth');
const mfaEnabled = require("../middleware/mfaEnabled")

const router = express.Router();


router.post('/create-auth', AuthController.createAuth);

router.post('/verify-otp', AuthController.verifyOTP);

router.post('/mfa/enroll', mfaAuth, AuthController.enrollMFA);

router.post('/mfa/verify', mfaAuth, AuthController.verifyMFA);

module.exports = router;

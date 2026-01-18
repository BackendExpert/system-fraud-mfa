const express = require('express');
const ActivityController = require('../controllers/activity.controller');
const auth = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');

const router = express.Router();

router.get('/get-activities', auth, checkPermission(['user:get-user-logs']), ActivityController.getallActivities)

module.exports = router;
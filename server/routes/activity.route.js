const express = require('express');
const ActivityController = require('../controllers/activity.controller');
const auth = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');

const router = express.Router();

router.get('/get-activities', auth, checkPermission(['user:get-user-logs']), ActivityController.getallActivities)

router.get('/get-activity/:id', auth, checkPermission(['user:get-one-user-log']), ActivityController.getOneActivity)

router.get('/get-fraudlogs', auth, checkPermission(['fraud:get-logs']), ActivityController.getFraudLogs)

router.get('/get-fraudlog/:id', auth, checkPermission(['fraud:get-one-log']), ActivityController.getoneFraudlog)

module.exports = router;
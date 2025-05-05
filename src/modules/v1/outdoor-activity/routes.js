const express=require('express');
const router = express.Router();

const controller = require('./controller');

router.get('/get-all-activity-categories', controller.getAllActivityCategories)

module.exports = router;

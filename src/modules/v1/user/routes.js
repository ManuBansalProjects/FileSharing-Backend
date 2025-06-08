const express=require('express');
const router = express.Router();

const controller = require('./controller');

router.put('/update-profile', controller.updateProfile)
router.put('/change-password', controller.changePassword)

module.exports = router;

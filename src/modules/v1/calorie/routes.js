const express=require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/add-user-calories', controller.addUserCalories)
router.get('/list-user-calories', controller.listUserCalories)
router.get('/get-user-calories', controller.getUserCalories)
router.put('/update-user-calories', controller.updateUserCalories)
router.delete('/delete-user-calories', controller.deleteUserCalories)

module.exports = router;

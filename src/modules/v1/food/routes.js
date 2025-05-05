const express=require('express');
const router = express.Router();

const controller = require('./controller');

router.get('/get-all-food-groups', controller.getAllFoodGroups)

module.exports = router;

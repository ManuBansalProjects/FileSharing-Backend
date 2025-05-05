const express=require('express');
const router = express.Router();

const userRoutes = require('./user/routes');
router.use('/user', userRoutes);

const foodRoutes = require('./food/routes');
router.use('/food', foodRoutes);

const outdoorActivityRoutes = require('./outdoor-activity/routes');
router.use('/outdoor-activity', outdoorActivityRoutes);

const calorieRoutes = require('./calorie/routes');
router.use('/calorie', calorieRoutes);

module.exports = router;

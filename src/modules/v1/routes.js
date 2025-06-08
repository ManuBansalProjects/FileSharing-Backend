const express=require('express');
const router = express.Router();

const isLoggedInMiddleware = require('../../middlewares/isLoggedInMiddleware');

const authRoutes = require('./auth/routes');
router.use('/auth', authRoutes);

const userRoutes = require('./user/routes');
router.use('/user', isLoggedInMiddleware, userRoutes);

const fileRoutes = require('./file/routes');
router.use('/file', fileRoutes);

module.exports = router;

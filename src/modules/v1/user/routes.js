const express=require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/create', controller.create)
router.get('/list', controller.list)
router.get('/get', controller.get)
router.put('/update', controller.update)
router.delete('/delete', controller.delete)

module.exports = router;

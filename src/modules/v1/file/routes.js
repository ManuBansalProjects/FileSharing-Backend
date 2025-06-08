const express=require('express');
const router = express.Router();

const controller = require('./controller');
const isLoggedInMiddleware = require('../../../middlewares/isLoggedInMiddleware');

router.post('/upload-file', isLoggedInMiddleware, controller.uploadFile)
router.post('/list-files', isLoggedInMiddleware, controller.listFiles)
router.get('/get-single-file/:fileId', controller.getSingleFile)
router.delete('/delete-file/:fileId', isLoggedInMiddleware, controller.deleteFile)

router.get('/get-file-comments/:fileId', controller.getFileComments)
router.post('/add-comment', controller.addComment)
router.post('/reply-comment', controller.replyComment)
router.post('/delete-comment', isLoggedInMiddleware, controller.deleteComment)
router.post('/delete-replied-comment', isLoggedInMiddleware, controller.deleteRepliedComment)

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); //add img
const postsCtrl = require('../controllers/post');

router.post('/', auth, multer, postsCtrl.createPost);
router.get('/:id', auth, postsCtrl.getOnePost);
router.put('/:id', auth, multer, postsCtrl.modifyPost);
router.delete('/:id', auth, postsCtrl.deletePost);
router.get('/' + '', auth, postsCtrl.getAllPost);

router.post('/:id/like', auth, postsCtrl.postLike);

module.exports = router;
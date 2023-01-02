const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); //add img
const postsCtrl = require('../controllers/post');

/**
 * Routes for access Post/Posts
 */
router.post('/', auth, multer, postsCtrl.createPost);
router.get('/:id', auth, postsCtrl.getOnePost);
router.put('/:id', auth, multer, postsCtrl.modifyPost);
router.delete('/:id', auth, postsCtrl.deletePost);
router.get('/' + '', auth, postsCtrl.getAllPost);

/**
 * Routes for access likes
 */
router.post('/:id/like', auth, postsCtrl.postLike);
router.get('/:id/likes', auth, postsCtrl.getLikes);

/**
 * Routes for access commennts
 */
router.post('/:id/comment', auth, postsCtrl.postComment);
router.get('/:id/comments', auth, postsCtrl.getComments);

module.exports = router;

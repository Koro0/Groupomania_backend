const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const userCtrl = require('../controllers/user');

/**
 *Routes for access create accoute Or LogIn
 */
router.post('/signup', userCtrl.signUp);
router.post('/login', userCtrl.logIn);

/**
 * Routes access to get User Name and User.admin
 */
router.get('/user/:id', auth, userCtrl.getName);
router.get('/admin/:id', auth, userCtrl.checkAdmin);

module.exports = router;

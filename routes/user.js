const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
//////// appel au Ctrl /////////////////////////////
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signUp);
router.post('/login', userCtrl.logIn);

router.get('/user/:id', auth, userCtrl.getPseudo);
router.get('/admin/:id', auth, userCtrl.checkAdmin);

module.exports = router;

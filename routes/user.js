const express = require('express');
const router = express.Router();

//////// appel au Ctrl /////////////////////////////
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signUp);
router.post('/login', userCtrl.logIn);
router.get('/pseudo', userCtrl.pseudo);
module.exports = router;

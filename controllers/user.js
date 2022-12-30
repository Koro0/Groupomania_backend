const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

/**
 * create a user account
 * @param {String } req email and passWord
 * @param {String} res status, message or error
 * @return
 */
exports.signUp = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 18);
    const user = new User({
      email: req.body.email,
      name: req.body.firstname + '.' + req.body.lastname,
      password: hashedPassword,
      admin: false,
    });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé!' });
  } catch (error) {
    res.status(400).json({ error: 'Email existed' });
  }
};

/**
 * connexion / login
 * @param {string} req post user.id => email and token: PSW
 * @param {string} res token is valided to 24 hours
 * @return access all posts
 */
exports.logIn = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur inconnu' });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: 'Mot de passe incorrecte!' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.KEY_TOKEN, {
              expiresIn: '24h',
            }),
          });
        })
        .catch((error) => res.status(500).json({ error: 'error bcrypt' }));
    })
    .catch((error) => res.status(500).json({ error: 'err login' }));
};

//get and put pseudo
exports.getPseudo = async (req, res, next) => {
  const user = await User.findOne({ _id: req.auth.userId });
  User.findOne({ _id: req.auth.userId })
    .then((user) => res.status(200).json(user.pseudo))
    .catch((err) => res.status(400).json(err));
};

exports.checkAdmin = async (req, res, next) => {
  User.findOne({ _id: req.auth.userId })
    .then((user) => res.status(200).json(user.admin))
    .catch((err) => res.status(400).json(err));
};

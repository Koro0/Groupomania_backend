const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 *
 * @param {*} req recois le token
 * @param {*} res si le tokken correspond, valide acces sinon err 401
 * @param {*} next valide acces
 */
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.KEY_TOKEN);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      req.auth = { userId };
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
};

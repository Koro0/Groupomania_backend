const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

mongoose
  .connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/api/auth', userRoutes);

app.use('/api/posts', postRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;

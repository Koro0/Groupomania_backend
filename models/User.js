const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  userId: { type: String },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);

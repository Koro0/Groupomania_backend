const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  likes: { type: Number, required: true },
  usersLiked: { type: [String], required: true },
  comments: { type: [Object] },
  updateDate: { type: Date },
});

module.exports = mongoose.model('Post', postSchema);

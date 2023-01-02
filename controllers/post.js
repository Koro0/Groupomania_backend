const Post = require('../models/Post');
const User = require('../models/user');
const fs = require('fs');

exports.createPost = (req, res, next) => {
  const postObjet = req.body;
  let post;
  if (req.file == null) {
    post = new Post({
      ...postObjet,
      imageUrl: null,
      userId: req.auth.userId,
      likes: 0,
      usersLiked: [],
      comments: [],
      updateDate: Date.now(),
    });
  } else {
    post = new Post({
      ...postObjet,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
      userId: req.auth.userId,
      likes: 0,
      usersLiked: [],
      comments: [],
      updateDate: Date.now(),
    });
  }
  post
    .save()
    .then(() => res.status(200).json({ message: 'Post enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyPost = async (req, res, next) => {
  console.log(req.body);
  const postObjet = req.file
    ? {
        ...req.body,
        imageUrl: `${req.protocol}:${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  if (req.file) {
    await Post.findOne({ _id: req.params.id }).then((file) => {
      if (file.imageUrl !== null) {
        const filename = file.imageUrl.split('/images/')[1];
        console.log(filename);
        fs.unlink(`images/${filename}`, () => {
          console.log('deleted image');
        });
      }
    });
  }
  await Post.updateOne(
    { _id: req.params.id },
    { ...postObjet, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: 'Post modifiée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOnePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(400).json({ error }));
};
exports.getAllPost = (req, res, next) => {
  const img = './images';
  !fs.existsSync(img)
    ? fs.mkdir(img, { recursive: true }, (err) => {
        if (err) throw err;
      })
    : null;
  Post.find()
    .then((posts) => res.status(200).json(posts))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.deletePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (post.imageUrl == null) {
        Post.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Post supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      } else {
        const filename = post.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Post.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Post supprimé !' }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error: 'error delete' }));
};

exports.postLike = async (req, res, next) => {
  const postLiked = await Post.findOne({ _id: req.params.id });
  let usersLikedTab = postLiked.usersLiked;
  //passe en boucle le tableau likes
  const userIsInLiked = usersLikedTab.includes(req.auth.userId);
  if (userIsInLiked == false && req.body.like == 1) {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        likes: postLiked.likes + 1,
        usersLiked: postLiked.usersLiked.concat([req.auth.userId]),
      }
    )
      .then(() => res.status(200).json({ message: 'liked' }))
      .catch((error) => res.status(400).json({ error }));
  } else if (userIsInLiked === true && req.body.like == 1) {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        likes: postLiked.likes - 1,
        usersLiked: postLiked.usersLiked.filter((e) => e !== req.auth.userId),
      }
    )
      .then(() => res.status(200).json({ message: 'delete liked' }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.postComment = async (req, res, next) => {
  const d = new Date();
  let date = d.toLocaleDateString();
  let hours = d.toLocaleTimeString();
  const fullDate = date + ' ' + hours;
  const postComments = await Post.findOne({ _id: req.params.id });
  console.log(postComments.comments);
  const user = await User.findOne({ _id: req.auth.userId });
  Post.findOneAndUpdate(
    { _id: req.params.id },
    {
      comments: postComments.comments.concat([
        { user: user.name, comment: req.body.commentaire, date: fullDate },
      ]),
    }
  )
    .then(() => res.status(201).json({ message: 'Send Comment' }))
    .catch((err) => res.status(400).json({ err }));
};

exports.getComments = async (req, res, next) => {
  await Post.findOne({ _id: req.params.id }).then((result) =>
    res.json(result.comments)
  );
};

exports.getLikes = async (req, res, next) => {
  await Post.findOne({ _id: req.params.id }).then((result) =>
    res.json(result.likes)
  );
};

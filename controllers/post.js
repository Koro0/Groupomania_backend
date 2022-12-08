const Post = require('../models/Post');
const fs = require('fs');

exports.createPost = (req, res, next) => {
  const d = new Date();
  const date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const hours = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  const fullDate = date + ' ' + hours;
  const postObjet = req.body;
  const post = new Post({
    ...postObjet,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    userId: req.auth.userId,
    likes: 0,
    usersLiked: [],
    comments: [],
    updateDate: fullDate,
  });
  post
    .save()
    .then(() => res.status(200).json({ message: 'Post enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyPost = (req, res, next) => {
  const postObjet = req.file
    ? {
        ...JSON.parse(req.body.post),
        imageUrl: `${req.protocol}:${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Post.updateOne({ _id: req.params.id }, { ...postObjet, _id: req.params.id })
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
      const filename = post.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Post.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Post supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error: 'error delete' }));
};

exports.postLike = async (req, res, next) => {
  const postLiked = await Post.findOne({ _id: req.params.id });
  let usersLikedTab = postLiked.usersLiked;
  //passe en boucle le tableau likes
  const userIsInLiked = usersLikedTab.includes(req.body.userId);
  if (userIsInLiked == false && req.body.like == 1) {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        likes: postLiked.likes + 1,
        usersLiked: postLiked.usersLiked.concat([req.body.userId]),
      }
    )
      .then(() => res.status(200).json({ message: 'liked' }))
      .catch((error) => res.status(400).json({ error }));
  } else if (userIsInLiked === true && req.body.like == 1) {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        likes: postLiked.likes - 1,
        usersLiked: postLiked.usersLiked.filter((e) => e !== req.body.userId),
      }
    )
      .then(() => res.status(200).json({ message: 'delete liked' }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.postComment = async (req, res, next) => {
  const postComments = await Post.findOne({ _id: req.params.id });
  console.log(req.body, postComments);
  Post.findOneAndUpdate(
    { _id: req.params.id },
    {
      comment: postComments.comments.concat([req.body]),
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

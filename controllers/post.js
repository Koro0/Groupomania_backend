const Post = require('../models/Post');
const User = require('../models/user');
const fs = require('fs');

/**
 *
 * @param {string, file} req  recois du texte: title, description, image ou juste title et description
 * @param {*} res si ca rempli les condition, return que le post est creer
 * @param {*} next
 */
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
/**
 *
 * @param {string, file} req  recoit une nouvelle image et supprime l'ancienne ou recoit du texte ou les deux
 * @param {*} res return message post modifier
 * @param {*} next
 */
exports.modifyPost = async (req, res, next) => {
  const postObjet = req.file
    ? {
        ...req.body,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  if (req.file) {
    await Post.findOne({ _id: req.params.id }).then((file) => {
      if (file.imageUrl !== null) {
        const filename = file.imageUrl.split('/images/')[1];
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

/**
 *
 * @param {*} req recoit _id post
 * @param {*} res return les données du post
 * @param {*} next
 */
exports.getOnePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(400).json({ error }));
};

/**
 *
 * @param {*} req
 * @param {*} res return tous les données de posts trouvant dans la base de données
 * @param {*} next
 */
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

/**
 *
 * @param {*} req recoit _id du post
 * @param {*} res verifie le post contient une image, si oui, supprimer le post post avec l'image stoké, sinon, juste le post
 * @param {*} next
 */
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

/**
 *
 * @param {*} req recoit _id du post et recupere id de l'utilisateur connecter via son token
 * @param {*} res  si userId existe dans le tableau de like, elle sera supprimer et on retire -1 de likes, dans le cas contre, nous ajoutons +1 a likes et userId dans le tableau des likes
 * @param {*} next
 */
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

/**
 *
 * @param {string} req recoit _id post, userId via token et commentaire
 * @param {*} res données rrecu concat avec les données existant en ajoutant le name de l'utilisateur et la date de son commentaire
 * @param {*} next
 */
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

/**
 *
 * @param {string} req recupere id post
 * @param {string} res return tous le contenu comments du post
 * @param {*} next
 */
exports.getComments = async (req, res, next) => {
  await Post.findOne({ _id: req.params.id }).then((result) =>
    res.json(result.comments)
  );
};

/**
 *
 * @param {number} req id du post
 * @param {*} res return tous les likes et tableau de likes du post concerné
 * @param {*} next
 */
exports.getLikes = async (req, res, next) => {
  await Post.findOne({ _id: req.params.id }).then((result) =>
    res.json(result.likes)
  );
};

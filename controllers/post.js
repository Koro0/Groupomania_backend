const Post = require('../models/Post');
const fs = require('fs');

exports.createPost = (req, res, next) => {
    const postObjet = JSON.parse(req.body.post);
    const post = new Post({
        ...postObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename
            }`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
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
            imageUrl: `${req.protocol}:${req.get('host')}/images/${req.file.filename
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
auce = (req, res, next) => {
    const img = './images';
    !fs.existsSync(img)
        ? fs.mkdir(img, { recursive: true }, (err) => {
            if (err) throw err;
        })
        : console.log('created');
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


exports.PostLike = async (req, res, next) => {
    const postLiked = await Post.findOne({ _id: req.params.id });
    let usersLikedTab = postLiked.usersLiked;
    let usersDislikedTab = postLiked.usersDisliked;

    //passe en boucle le tableau likes
    const userIsInLiked = usersLikedTab.includes(req.body.userId);
    //passe en boucle le tableau dislikes
    const userIsInDiskiked = usersDislikedTab.includes(req.body.userId);
    if (userIsInLiked == false && userIsInDiskiked == false) {
        if (req.body.like == 1) {
            Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    likes: postLiked.likes + 1,
                    usersLiked: postLiked.usersLiked.concat([req.body.userId]),
                }
            )
                .then(() => res.status(200).json({ message: 'liked' }))
                .catch((error) => res.status(400).json({ error }));
        } else if (req.body.like == -1) {
            Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    likes: postLiked.dislikes + 1,
                    usersLiked: postLiked.usersLiked.concat([req.body.userId]),
                }
            )
                .then(() => res.status(200).json({ message: 'disliked' }))
                .catch((error) => res.status(400).json({ error }));
        }
    } else {
        if (req.body.like == 0) {
            Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    likes: postLiked.likes - 1,
                    usersLiked: postLiked.usersLiked.filter(
                        (e) => e !== req.body.userId
                    ),
                }
            )
                .then(() => res.status(200).json({ message: 'delete liked' }))
                .catch((error) => res.status(400).json({ error }));
        } else if (req.body.like == -1) {
            Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    dislikes: postLiked.dislikes - 1, // blocker a 0 like minimum
                    usersDisliked: postLiked.usersDisliked.filter(
                        (e) => e !== req.body.userId
                    ),
                }
            )
                .then(() => res.status(200).json({ message: 'delete disliked' }))
                .catch((error) => res.status(400).json({ error }));
        }
    }
};
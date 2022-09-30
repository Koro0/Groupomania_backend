const Post = require('../models/Post');
const fs = require('fs');

exports.createPost = (req, res, next) => {
    const PostObjet = JSON.parse(req.body.Post);
    const Post = new Post({
        ...PostObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename
            }`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    Post
        .save()
        .then(() => res.status(200).json({ message: 'Post enregistrée !' }))
        .catch((error) => res.status(400).json({ error }));
};

exports.modifyPost = (req, res, next) => {
    const PostObjet = req.file
        ? {
            ...JSON.parse(req.body.Post),
            imageUrl: `${req.protocol}:${req.get('host')}/images/${req.file.filename
                }`,
        }
        : { ...req.body };
    Post.updateOne({ _id: req.params.id }, { ...PostObjet, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Post modifiée !' }))
        .catch((error) => res.status(400).json({ error }));
};

exports.getOnePost = (req, res, next) => {
    Post.findOne({ _id: req.params.id })
        .then((Post) => res.status(200).json(Post))
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
        .then((Posts) => res.status(200).json(Posts))
        .catch((error) => res.status(400).json({ error: error }));
};

exports.deletePost = (req, res, next) => {
    Post.findOne({ _id: req.params.id })
        .then((Post) => {
            const filename = Post.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Post.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Post supprimé !' }))
                    .catch((error) => res.status(400).json({ error }));
            });
        })
        .catch((error) => res.status(500).json({ error: 'error delete' }));
};


exports.PostLike = async (req, res, next) => {
    const PostLiked = await Post.findOne({ _id: req.params.id });
    let usersLikedTab = PostLiked.usersLiked;
    let usersDislikedTab = PostLiked.usersDisliked;

    //passe en boucle le tableau likes
    const userIsInLiked = usersLikedTab.includes(req.body.userId);
    //passe en boucle le tableau dislikes
    const userIsInDiskiked = usersDislikedTab.includes(req.body.userId);
    if (userIsInLiked == false && userIsInDiskiked == false) {
        if (req.body.like == 1) {
            Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    likes: PostLiked.likes + 1,
                    usersLiked: PostLiked.usersLiked.concat([req.body.userId]),
                }
            )
                .then(() => res.status(200).json({ message: 'liked' }))
                .catch((error) => res.status(400).json({ error }));
        } else if (req.body.like == -1) {
            Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    likes: PostLiked.dislikes + 1,
                    usersLiked: PostLiked.usersLiked.concat([req.body.userId]),
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
                    likes: PostLiked.likes - 1,
                    usersLiked: PostLiked.usersLiked.filter(
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
                    dislikes: PostLiked.dislikes - 1, // blocker a 0 like minimum
                    usersDisliked: PostLiked.usersDisliked.filter(
                        (e) => e !== req.body.userId
                    ),
                }
            )
                .then(() => res.status(200).json({ message: 'delete disliked' }))
                .catch((error) => res.status(400).json({ error }));
        }
    }
};
const Riak = require('basho-riak-client');
const Post = require('../models/post');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const jwt = require('jsonwebtoken');

const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

const createPost = async (req, res) => {
    const { title, content, postPrivacy } = req.body;

    try {
        const token = req.headers.authorization.split(' ')[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const username = decodedToken.username;

        // id must be greater than 1001
        const id = Math.floor(Math.random() * 1000000) + 1001;
        const postDate = new Date().toLocaleDateString();
        const postTime = new Date().toLocaleTimeString('en-US', options);
        const numLikes = 0;
        const numFavs = 0;
        const wasEdited = false;

        const post = new Post(id, title, content, postDate, postTime, numLikes, numFavs, postPrivacy, wasEdited, username);

        await post.save();

        console.log(post);
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};


const getPostsByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var posts_keys = []
        var posts = [];
        client.secondaryIndexQuery({ bucket: 'Post', indexName: 'username_bin', indexKey: username }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {

                if (rslt.values.length > 0) {
                    Array.prototype.push.apply(posts_keys,
                        rslt.values.map(function (value) {
                            return value.objectKey;
                        }));
                }

                if (rslt.done) {
                    posts_keys.forEach(function (key) {
                        client.fetchValue({ bucket: 'Post', key: key }, (err, rslt) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                if (rslt.values.length > 0) {
                                    const post = JSON.parse(rslt.values.shift().value.toString());
                                    posts.push(post);
                                }

                                if (posts.length === posts_keys.length) {
                                    resolve(posts);
                                }
                            }
                        });
                    });
                    resolve(posts);
                }
            }
        });
    });
};

const getPostById = (id) => {
    return new Promise((resolve, reject) => {
        client.fetchValue({ bucket: 'Post', key: id }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    const post = JSON.parse(rslt.values.shift().value.toString());
                    resolve(post);
                }
                else if (rslt.values.length === 0) {
                    console.log('Post not found');
                    reject(new Error('Post not found'));
                }
            }
        });
    });
};

const deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        client.deleteValue({ bucket: 'Post', key: id }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                resolve(rslt);
            }
        });
    });
};

const updatePost = async (req, res) => {
    const postId = req.params.id;
    let username = '';
    const token = req.headers.authorization.split(' ')[1];
    if (token !== 'null') {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        username = decodedToken.username;
    }

    try {
        const post = await getPostById(postId);

        if (post.username !== username) {
            res.status(403).send('You are not authorized to update this post');
            return;
        }

        const { title, content, postPrivacy } = req.body;

        post.title = title;
        post.content = content;
        post.postPrivacy = postPrivacy;
        post.wasEdited = true;

        const newPost = new Post(post.id, post.title, post.content, post.postDate, post.postTime, post.numLikes, post.numFavs, post.postPrivacy, post.wasEdited, post.username);

        await newPost.save();

        res.status(200).send(newPost);

    } catch (error) {
        if (error.message === 'Post not found') {
            res.status(404).send(error.message);
        } else {
            res.status(500).send(error);
        }
    }
}


module.exports = {
    getPostsByUsername,
    getPostById,
    deletePostById,
    updatePost,
    createPost
};


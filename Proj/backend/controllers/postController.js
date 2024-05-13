const Riak = require('basho-riak-client');
const Post = require('../models/post');
const Favorite = require('../models/favorite');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const jwt = require('jsonwebtoken');
const moment = require('moment');
const { route } = require('../routes');
const { forEach } = require('curlrequest/errors');

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
        const comments = [];
        // popularirty score is diff between post date and 1/1/2001
        const popularityScore = moment(postDate, 'MM/DD/YYYY').diff(moment('01/01/2001', 'MM/DD/YYYY'), 'days') * 10;

        const post = new Post(id, title, content, postDate, postTime, numLikes, numFavs, postPrivacy, wasEdited, username, comments, popularityScore);

        await post.save();

        console.log(post);
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};


const getPostsByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var posts = [];
        const userBucket = username; 
        client.listKeys({ bucket: userBucket }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                const postKeys = rslt.keys.filter(key => key.startsWith('post_')); 

                postKeys.forEach(key => {
                    client.fetchValue({ bucket: userBucket, key: key }, (err, rslt) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (rslt.values.length > 0) {
                                const post = JSON.parse(rslt.values.shift().value.toString());
                                posts.push(post);
                            }
                        }
                    });
                });

                if (rslt.done) {
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

const deletePostByUsernameAndTimestamp = (username, postDate, postTime) => {
    return new Promise((resolve, reject) => {
        client.deleteValue({ bucket: username, key: 'post_' + postDate + '_' + postTime }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                resolve(rslt);
            }
        });
    });
}
        

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

        const newPost = new Post(post.id, post.title, post.content, post.postDate, post.postTime, post.numLikes, post.numFavs, post.postPrivacy, post.wasEdited, post.username, post.comments, post.popularityScore);

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

const getKeywordPostIds = (keyword) => {
    return new Promise((resolve, reject) => {
        client.fetchValue({ bucket: 'Words', key: keyword }, (err, rslt) => {
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

const searchPost = async (req, res) => {

    // Convert keywords which is comma separated into array of words
    const arrayKeywords = req.query.keywords.split(',');
    const keywords = arrayKeywords.map(keyword => keyword.trim());

    console.log('keywords: ', keywords);

    try {
        // First, gather all post IDs for each keyword
        const allPostIds = [];
        for (const keyword of keywords) {
            const postIds = await getKeywordPostIds(keyword);
            allPostIds.push(postIds);
        }

        // Find the intersection of all post IDs
        const intersection = allPostIds.reduce((a, b) => a.filter(c => b.includes(c)));

        // Fetch posts for the intersection of post IDs
        const posts = [];
        for (const postId of intersection) {
            console.log('postId: ', postId);
            const post = await getPostById(postId.toString());
            posts.push(post);
        }

        // Sort by popularity score
        posts.sort((a, b) => b.popularityScore - a.popularityScore);

        res.status(200).send({ posts });


    } catch (error) {
        if (error.message === 'Post not found') {
            res.status(404).send(error.message);
        } else {
            res.status(500).send(error);
        }
    }
}

const likePost = async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await getPostById(postId);
        post.numLikes += 1;

        const popularityScore = post.popularityScore + 1;

        const newPost = new Post(post.id, post.title, post.content, post.postDate, post.postTime, post.numLikes, post.numFavs, post.postPrivacy, post.wasEdited, post.username, post.comments, popularityScore);

        await newPost.save();

        res.status(200).send(newPost);

    } catch (error) {
        if (error.message === 'Post not found') {
            res.status(404).send(error.message);
        } else {
            res.status(500).send(error);
        }
    }
};

const getPostKeysByDateRange = (startDate, endDate) => {
    const pushKeys = [];
    return new Promise((resolve, reject) => {
        client.secondaryIndexQuery({ bucket: 'Post', indexName: 'timestamp_bin', rangeStart: startDate, rangeEnd: endDate }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {

                console.log('rslt: ', rslt);
                rslt.values.forEach(value => {
                    pushKeys.push(value.objectKey);
                });

                if(rslt.done) {
                    resolve(pushKeys);
                }
            }
        });


    });
}

const getPostsByDataRange = async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const posts = [];
    const postKeys = await getPostKeysByDateRange(startDate, endDate);

    console.log('postKeys: ', postKeys);

    for(const key of postKeys) {
        const post = await getPostById(key);
        console.log('post: ', post);
        posts.push(post);
    }

    // Sort by timestamp
    posts.sort((a, b) => a.timestamp - b.timestamp);

    res.status(200).send(posts);
};



module.exports = {
    getPostsByUsername,
    getPostById,
    deletePostById,
    updatePost,
    createPost,
    searchPost,
    likePost,
    getPostsByDataRange,
    deletePostByUsernameAndTimestamp
};


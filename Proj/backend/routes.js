const express = require('express');
const router = express.Router();
const Riak = require('basho-riak-client');
const { getUserByUsername, getPostsByUsername, getCommentsByUsername, getFavoritePostsByuserID, getNumFollowersByuserID, getNumFollowingByuserID } = require('./middleware');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

router.get('/user/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const user = await getUserByUsername(username);
        const posts = await getPostsByUsername(username);
        const comments = await getCommentsByUsername(username);
        const favoritePosts = await getFavoritePostsByuserID(user.id);
        const followers = await getNumFollowersByuserID(user.id);
        const following = await getNumFollowingByuserID(user.id);~
        res.send([user, posts, comments, following, followers, favoritePosts]);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

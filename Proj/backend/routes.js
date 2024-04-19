const express = require('express');
const router = express.Router();
const Riak = require('basho-riak-client');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);


router.get('/', (req, res) => {
    res.send('Hello from route.js!');
});

// get user by username
router.get('/user/:username', (req, res) => {
    const username = req.params.username;
    client.fetchValue({ bucket: 'User', key: username }, (err, rslt) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (rslt.values.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const user = JSON.parse(rslt.values.shift().value.toString());

        var posts_keys = [];
        // get posts by user
        client.secondaryIndexQuery({ bucket: 'Post', indexName: 'username_bin', indexKey: username }, function (err, rslt) {
            if (err) {
                throw new Error(err);
            }

            if (rslt.values.length > 0) {
                Array.prototype.push.apply(posts_keys,
                    rslt.values.map(function (value) {
                        return value.objectKey;
                    }));
            }

            if (rslt.done) {
                var posts = [];
                posts_keys.forEach(function (key) {
                    client.fetchValue({ bucket: 'Post', key: key }, (err, rslt) => {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        if (rslt.values.length === 0) {
                            res.status(404).send('Post not found');
                            return;
                        }
                        posts.push(JSON.parse(rslt.values.shift().value.toString()));

                        // if already verified all posts
                        if (posts.length === posts_keys.length) {
                            return
                        }
                    }
                    );
                }
                );

                console.log("User id:", user.id.toString());
                // Fetch follows by user ID
                var following = 0;
                var followers = 0;
                client.secondaryIndexQuery({ bucket: 'Follows', indexName: 'followerId_bin', indexKey: user.id.toString() }, (err, rslt) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }

                    // Count following
                    if (rslt.values.length > 0) {
                        following += rslt.values.length;
                    }

                    
                    if (rslt.done) {
                        // Fetch follows where user is followed
                        client.secondaryIndexQuery({ bucket: 'Follows', indexName: 'followedId_bin', indexKey: user.id.toString() }, (err, rslt) => {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }

                            // Count followers
                            if (rslt.values.length > 0) {
                                followers += rslt.values.length;
                            }

                            if (rslt.done) {
                                console.log('User:', user);
                                console.log('Posts:', posts);
                                console.log('Following:', following);
                                console.log('Followers:', followers);
                                res.send({ user, posts, following, followers });
                            }
                        }
                        );
                    }
                }
                );
            }
        }
        );
    }
    );
}
);


module.exports = router;

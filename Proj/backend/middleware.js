const Riak = require('basho-riak-client');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        client.fetchValue({ bucket: 'User', key: username }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    var user = JSON.parse(rslt.values.shift().value.toString());
                }
                else if (rslt.values.length === 0) {
                    reject("User not found");
                }
                if (rslt.done) {
                    resolve(user);
                }
            }
            resolve(user);
        });
    });
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


const getCommentsByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var comments_keys = []
        var comments = [];
        client.secondaryIndexQuery({ bucket: 'Comment', indexName: 'username_bin', indexKey: username }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {

                if (rslt.values.length > 0) {
                    Array.prototype.push.apply(comments_keys,
                        rslt.values.map(function (value) {
                            return value.objectKey;
                        }));
                }

                if (rslt.done) {
                    comments_keys.forEach(function (key) {
                        client.fetchValue({ bucket: 'Comment', key: key }, (err, rslt) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                if (rslt.values.length > 0) {
                                    const comment = JSON.parse(rslt.values.shift().value.toString());
                                    comments.push(comment);
                                }

                                if (comments.length === comments_keys.length) {
                                    resolve(comments);
                                }
                            }
                        });
                    });
                    resolve(comments);
                }
            }
        });
    });
}


const getFavoritePostsByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var favoritePosts_keys = []
        var favoritePosts = [];
        client.secondaryIndexQuery({ bucket: 'Favorite', indexName: 'username_bin', indexKey: username }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    Array.prototype.push.apply(favoritePosts_keys,
                        rslt.values.map(function (value) {
                            return value.objectKey;
                        }));
                }

                if (rslt.done) {
                    favoritePosts_keys.forEach(function (key) {
                        client.fetchValue({ bucket: 'Post', key: key }, (err, rslt) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                if (rslt.values.length > 0) {
                                    const post = JSON.parse(rslt.values.shift().value.toString());
                                    favoritePosts.push(post);
                                }

                                if (favoritePosts.length === favoritePosts_keys.length) {
                                    resolve(favoritePosts);
                                }
                            }
                        });
                    });
                    resolve(favoritePosts);
                }
            }
        });
    });
}

const getNumFollowersByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var followers = 0;
        client.secondaryIndexQuery({ bucket: 'Follows', indexName: 'followed_bin', indexKey: username }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    followers += rslt.values.length;
                }
                if (rslt.done) {
                    resolve(followers);
                }
            }
        });
    });
};

const getNumFollowingByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var following = 0;
        client.secondaryIndexQuery({ bucket: 'Follows', indexName: 'follower_bin', indexKey: username }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    following += rslt.values.length;
                }
                if (rslt.done) {
                    resolve(following);
                }
            }
        });
    });
}

module.exports = {
    getUserByUsername,
    getPostsByUsername,
    getCommentsByUsername,
    getFavoritePostsByUsername,
    getNumFollowersByUsername,
    getNumFollowingByUsername
};
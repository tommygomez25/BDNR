const Riak = require('basho-riak-client');
const Favorite = require('../models/favorite');

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

const getFavoritePostsByUsername = (username) => {
    return new Promise((resolve, reject) => {
        client.fetchValue({ bucket: 'Favorite', key: username }, (err, result) => {
            if (err) {
                return reject(err);
            }
            if (result.values.length === 0) {
                console.log('No favorites found');
                return resolve([]); // No favorites found
            }

            const postIds = JSON.parse(result.values.length > 0 ? result.values[0].value.toString() : '{}');
            console.log('Post IDs:', postIds);
            // make postIds an array of strings
            const postIdsArray = postIds.postIDs.map(postId => postId.toString());
            console.log('Post IDs:', postIdsArray);

            const fetchPostPromises = postIdsArray.map(postId => {
                return new Promise((resolve, reject) => {
                    client.fetchValue({ bucket: 'Post', key
                        : postId }, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        if (result.values.length === 0) {
                            return resolve(null); // Post not found
                        }
                        const post = JSON.parse(result.values[0].value.toString());
                        resolve(post);
                    });
                });
            }
            );

            Promise.all(fetchPostPromises).then(posts => {
                resolve(posts.filter(post => post !== null)); // Filtering out nulls if posts not found
            }).catch(err => {
                reject(err);
            });
        });
    });
};



const getNumFollowersByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var followers = 0;
        client.fetchValue({ bucket: 'Followers', key:username}, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    followers = JSON.parse(rslt.values.shift().value.toString()).followers.length;
                    resolve(followers);
                }
                else if (rslt.values.length === 0) {
                    followers = 0;
                    resolve(followers);
                }
            }
        });
    });
};

const getNumFollowingByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var follows = 0;
        client.fetchValue({ bucket: 'Follows', key:username}, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    follows = JSON.parse(rslt.values.shift().value.toString()).follows.length;
                    resolve(follows);
                }
                else if (rslt.values.length === 0) {
                    follows = 0;
                    resolve(follows);
                }
            }
        });
    });
}

const getUsersFollowingByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var usersFollowing = [];
        client.fetchValue({ bucket: 'Follows', key:username}, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                if (rslt.values.length > 0) {
                    usersFollowing = JSON.parse(rslt.values.shift().value.toString()).follows;
                    resolve(usersFollowing);
                }
                else if (rslt.values.length === 0) {
                    resolve(usersFollowing);
                }
            }
        });
    });
}

const getTotalNumLikesByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var mapReduceQuery = {
            inputs: { bucket: username, key_filters: [['matches', '.*']] },
            query: [
                {
                    map: {
                        language: 'erlang',
                        source: `
                            fun(RiakObject, _KeyData, _Arg) ->
                                {struct, Map} = mochijson2:decode(riak_object:get_value(RiakObject)),
                                NumLikes = proplists:get_value(<<"numLikes">>, Map),
                                [NumLikes]
                            end.
                        `
                    },
                },
                {
                    reduce: {
                        language: 'erlang',
                        source: `
                            fun(Values, _Arg) ->
                                Res = lists:sum(Values),
                                [Res]
                            end.
                        `
                    }
                }
            ]
        };


        var mapReduceString = JSON.stringify(mapReduceQuery);


        var curl = require('curlrequest');
        curl.request({ url: 'http://localhost:8098/mapred', method: 'POST', data: mapReduceString, headers: { 'Content-Type': 'application/json' } }, function (err, data) {
            if (err) {
                reject(err);
            }
            console.log("data:", data);
            var result = JSON.parse(data);

            var numLikes = result[0];
            resolve(numLikes);
        });
    });
}

module.exports = {
    getUserByUsername,
    getFavoritePostsByUsername,
    getNumFollowersByUsername,
    getNumFollowingByUsername,
    getUsersFollowingByUsername,
    getTotalNumLikesByUsername,
};
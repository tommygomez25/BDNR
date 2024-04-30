const Riak = require('basho-riak-client');
const Post = require('../models/post');


const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const jwt = require('jsonwebtoken');

const getCommentsByUsername = (username) => {
    return new Promise((resolve, reject) => {
        var comments = [];
        const userBucket = username; 

        client.listKeys({ bucket: userBucket }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                const postKeys = rslt.keys.filter(key => key.startsWith('comment_')); 
                console.log('PostKeys: ', postKeys)
                postKeys.forEach(key => {
                    client.fetchValue({ bucket: userBucket, key: key }, (err, rslt) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (rslt.values.length > 0) {
                                const post = JSON.parse(rslt.values.shift().value.toString());
                                comments.push(post);
                            }
                        }
                    });
                });
                
                if (rslt.done) {
                    resolve(comments);
                }
            }
        });

    });
};

module.exports = {
    getCommentsByUsername
};


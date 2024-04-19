'use strict';

var async = require('async');
var assert = require('assert');
var logger = require('winston');
var fs = require('fs');
var Riak = require('basho-riak-client');
var nodes = [
    new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 })
];
var cluster = new Riak.Cluster({ nodes: nodes });

var client = new Riak.Client(cluster, function (err, c) {
    if (err) {
        throw new Error(err);
    }
    console.log('Connection to Riak established');
    storeUserData();
});

async function storeUserData() {
    try {
        // Load data from JSON files
        const usersData = JSON.parse(fs.readFileSync('../data/users.json', 'utf8'));
        const postsData = JSON.parse(fs.readFileSync('../data/posts.json', 'utf8'));
        const commentsData = JSON.parse(fs.readFileSync('../data/comments.json', 'utf8'));
        const messagesData = JSON.parse(fs.readFileSync('../data/messages.json', 'utf8'));
        const chatsData = JSON.parse(fs.readFileSync('../data/chats.json', 'utf8'));
        const followsData = JSON.parse(fs.readFileSync('../data/follows.json', 'utf8'));
        const favoritesData = JSON.parse(fs.readFileSync('../data/favorites.json', 'utf8'));

        // Store users data
        for (let i = 0; i < usersData.length; i += 100) {
            const batch = usersData.slice(i, i + 100);
            await Promise.all(batch.map(user => storeData('User', user.username, user)));
        }

        // Store comments data
        for (let i = 0; i < commentsData.length; i += 100) {
            const batch = commentsData.slice(i, i + 100);
            await Promise.all(batch.map(comment => storeDataWithSecIndex('Comment', comment.id.toString(), comment)));
        }

        // Store chats data
        for (let i = 0; i < chatsData.length; i += 100) {
            const batch = chatsData.slice(i, i + 100);
            await Promise.all(batch.map(chat => storeData('Chat', chat.id.toString(), chat)));
        }

        // Store follows data
        const batchSize = 100;
        for (let i = 0; i < followsData.length; i += batchSize) {
            const batch = followsData.slice(i, i + batchSize);
            await Promise.all(batch.map(follow => storeDataWithSecIndex('Follows', follow.id.toString(), follow)));
        }

        // check if the data was actually stored in the bucket
        client.fetchValue({ bucket: 'Follows', key: '1' }, function (err, rslt) {
            if (err) {
                console.error('Error reading Follows:', err);
            } else {
                if (rslt.values.length > 0) {
                    const value = rslt.values[0].value;
                    console.log('Follows read successfully:', JSON.parse(value.toString()));
                }
            }
        });

        // Store messages data
        for (let i = 0; i < messagesData.length; i += batchSize) {
            const batch = messagesData.slice(i, i + batchSize);
            await Promise.all(batch.map(message => storeData('Message', message.id.toString(), message)));
        }

        client.fetchValue({ bucket: 'Message', key: '1' }, function (err, rslt) {
            if (err) {
                console.error('Error reading Message:', err);
            } else {
                if (rslt.values.length > 0) {
                    const value = rslt.values[0].value;
                    console.log('Message read successfully:', JSON.parse(value.toString()));
                }
            }
        });

        // Store favorites data
        for (let i = 0; i < favoritesData.length; i += batchSize) {
            const batch = favoritesData.slice(i, i + batchSize);
            await Promise.all(batch.map(favorite => storeDataWithSecIndex('Favorite', favorite.id.toString(), favorite)));
        }

        client.fetchValue({ bucket: 'Favorite', key: '1' }, function (err, rslt) {
            if (err) {
                console.error('Error reading Favorite:', err);
            } else {
                if (rslt.values.length > 0) {
                    const value = rslt.values[0].value;
                    console.log('Favorite read successfully:', JSON.parse(value.toString()));
                }
            }
        });

        // store posts data with secondary index being the user id
        for (let i = 0; i < postsData.length; i += batchSize) {
            const batch = postsData.slice(i, i + batchSize);
            await Promise.all(batch.map(function(post) { 
                storeDataWithSecIndex('Post', post.id.toString(), post);
            }));
        }

        // check if the data was actually stored in the bucket
        client.fetchValue({ bucket: 'Post', key: '1' }, function (err, rslt) {
            if (err) {
                console.error('Error reading Post:', err);
            } else {
                if (rslt.values.length > 0) {
                    const value = rslt.values[0].value;
                    console.log('Post read successfully:', JSON.parse(value.toString()));
                }
            }
        });


        console.log('Data stored successfully.');
    } catch (err) {
        console.error('Error storing data:', err);
    }
}

async function storeDataWithSecIndex(bucket, key, value) {

    if (bucket === 'Follows') {
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));

            riakObj.addToIndex('follower_bin', value.follower.toString());

            riakObj.addToIndex('followed_bin', value.followed.toString());
            await new Promise((resolve, reject) => {
                client.storeValue({ bucket: bucket, key: key, value: riakObj }, (err, rslt) => {
                    if (err) {
                        console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
                        reject(err);
                    } else {
                        resolve(rslt);
                    }
                });
            });
        } catch (err) {
            console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
            throw err;
        }
    }
    else if (bucket === 'Post') {
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));
            riakObj.addToIndex('username_bin', value.username);
            await new Promise((resolve, reject) => {
                client.storeValue({ bucket: bucket, key: key, value: riakObj }, (err, rslt) => {
                    if (err) {
                        console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
                        reject(err);
                    } else {
                        resolve(rslt);
                    }
                });
            });
        } catch (err) {
            console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
            throw err;
        }
    }

    else if (bucket === 'Comment') {
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));
            riakObj.addToIndex('username_bin', value.username);
            await new Promise((resolve, reject) => {
                client.storeValue({ bucket: bucket, key: key, value: riakObj }, (err, rslt) => {
                    if (err) {
                        console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
                        reject(err);
                    } else {
                        resolve(rslt);
                    }
                });
            });
        } catch (err) {
            console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
            throw err;
        }
    }

    else if (bucket === 'Favorite') {
        // sec index for postID and userID
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));
            riakObj.addToIndex('postID_bin', value.postID.toString());
            riakObj.addToIndex('username_bin', value.username.toString());
            await new Promise((resolve, reject) => {
                client.storeValue({ bucket: bucket, key: key, value: riakObj }, (err, rslt) => {
                    if (err) {
                        console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
                        reject(err);
                    } else {
                        resolve(rslt);
                    }
                });
            });
        } catch (err) {
            console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
            throw err;
        }
    }
}

async function storeData(bucket, key, value) {
    try {
        const riakObj = new Riak.Commands.KV.RiakObject();
        riakObj.setContentType('application/json');
        riakObj.setValue(JSON.stringify(value));
        await new Promise((resolve, reject) => {
            client.storeValue({ bucket: bucket, key: key, value: riakObj }, (err, rslt) => {
                if (err) {
                    // key is string , < 100
                    if ( parseInt(key) < 1000) {
                        console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
                    }
                    
                    reject(err);
                } else {
                    resolve(rslt);
                }
            });
        });
    } catch (err) {
        console.error(`Error storing data in bucket '${bucket}' with key '${key}':`, err);
        throw err;
    }
}

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
    storeAllData();
});


async function storeAllData() {
    try {
        // Load data from JSON files
        const usersData = JSON.parse(fs.readFileSync('../data/users.json', 'utf8'));
        const postsData = JSON.parse(fs.readFileSync('../data/date_posts.json', 'utf8'));
        const commentsData = JSON.parse(fs.readFileSync('../data/comments.json', 'utf8'));
        const messagesData = JSON.parse(fs.readFileSync('../data/user_messages.json', 'utf8'));
        const chatsData = JSON.parse(fs.readFileSync('../data/user_chats.json', 'utf8'));
        const followsData = JSON.parse(fs.readFileSync('../data/follows.json', 'utf8'));
        const followersData = JSON.parse(fs.readFileSync('../data/followers.json', 'utf8'));
        const favoritesData = JSON.parse(fs.readFileSync('../data/favorites.json', 'utf8'));
        const wordsData = JSON.parse(fs.readFileSync('../data/words.json', 'utf8'));

        for (const key of Object.keys(wordsData)) {
            const arrayData = wordsData[key];
            await storeSet('Words', key, arrayData);
        }

        // Store users data
        for (let i = 0; i < usersData.length; i += 100) {
            const batch = usersData.slice(i, i + 100);
            await Promise.all(batch.map(user => storeData('User', user.username, user)));
        }

        // store posts data with secondary index being the user id
        for (let i = 0; i < postsData.length; i += 100) {
            const batch = postsData.slice(i, i + 100);
            await Promise.all(batch.map(post => storeDataWithSecIndex('Post', post.id.toString(), post)));
        }

        // Store chats data
        for (let i = 0; i < chatsData.length; i += 100) {
            const batch = chatsData.slice(i, i + 100);
            await Promise.all(batch.map(chat => storeDataWithSecIndex('Chat', chat.id, chat)));
        }

        // Check how many chats are stored

        await checkDataStored('Chat', 'faylesburyci:gpaice38');

        const batchSize = 100;

        // Store messages data
        for (let i = 0; i < messagesData.length; i += batchSize) {
            const batch = messagesData.slice(i, i + batchSize);
            await Promise.all(batch.map(message => storeData('Message', message.id.toString(), message)));
        }

        await checkDataStored('Message', 'faylesburyci:gpaice38:1');
        console.log('Message data stored successfully.');

        // Store follows data
        for (let i = 0; i < followsData.length; i += batchSize) {
            const batch = followsData.slice(i, i + batchSize);
            await Promise.all(batch.map(follow => storeData('Follows', follow.username, follow)));
        }

        await checkDataStored('Follows', 'gwindram0');

        // Store followers data
        for (let i = 0; i < followersData.length; i += batchSize) {
            const batch = followersData.slice(i, i + batchSize);
            await Promise.all(batch.map(follower => storeData('Followers', follower.username, follower)));
        }

        await checkDataStored('Followers', 'gwindram0');

        // Store favorites data
        for (let i = 0; i < favoritesData.length; i += batchSize) {
            const batch = favoritesData.slice(i, i + batchSize);
            await Promise.all(batch.map(favorite => storeDataWithSecIndex('Favorite', favorite.id.toString(), favorite)));
        }

        await checkDataStored('Favorite', '1');

        await checkDataStored('Post', '1');

        console.log('Post data stored successfully.');

        for (const user of usersData) {
            const userBucket = user.username;
            const userPosts = postsData.filter(post => post.username === user.username);
            const userComments = commentsData.filter(comment => comment.username === user.username);

            for (let i = 0; i < userPosts.length; i += batchSize) {
                const batch = userPosts.slice(i, i + batchSize);
                await Promise.all(batch.map(post => storeData(userBucket, 'post_' +post.postDate + '_' + post.postTime, post)));
            }

            for (let i = 0; i < userComments.length; i += batchSize) {
                const batch = userComments.slice(i, i + batchSize);
                await Promise.all(batch.map(comment => storeData(userBucket, 'comment_' + comment.commentDate + '_' + comment.commentTime, comment)));
            }
            
        }

        console.log('Data stored successfully.');
    } catch (err) {
        console.error('Error storing data:', err);
    }
}

async function storeDataWithSecIndex(bucket, key, value) {

    if (bucket === 'Post') {
        console.log('Storing data in bucket:', bucket, 'with value:', value);
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));
            riakObj.addToIndex('timestamp_bin', value.timestamp);
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
        // secondary index for postID and userID
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

    else if (bucket === 'Chat') {
        // secondary index for user1 and user2
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));
            const users = key.split(':');
            riakObj.addToIndex('users_bin', users[0]);
            riakObj.addToIndex('users_bin', users[1]);
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

async function storeSet(bucket, key, value) {
    try {
        const riakSet = new Riak.Commands.KV.RiakObject();
        riakSet.setContentType('application/json');
        riakSet.setValue(value);

        // key to lower case
        key = key.toLowerCase();
    
        await new Promise((resolve, reject) => {
            client.storeValue({ bucket: bucket, key: key, value: riakSet }, (err, rslt) => {
                if (err) {
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

async function checkDataStored(bucket, key) {
    try {
        await new Promise((resolve, reject) => {
            client.fetchValue({ bucket: bucket, key: key }, (err, rslt) => {
                if (err) {
                    console.error(`Error reading data from bucket '${bucket}' with key '${key}':`, err);
                    reject(err);
                } else {
                    resolve(rslt);
                }
            });
        });
    } catch (err) {
        console.error(`Error reading data from bucket '${bucket}' with key '${key}':`, err);
        throw err;
    }
}

async function clearData(bucket) {
    try {
        await new Promise((resolve, reject) => {
            client.listKeys({ bucket: bucket }, (err, rslt) => {
                if (err) {
                    console.error(`Error listing keys in bucket '${bucket}':`, err);
                    reject(err);
                } else {
                    rslt.keys.forEach(key => {
                        client.deleteValue({ bucket: bucket, key: key }, (err, rslt) => {
                            if (err) {
                                console.error(`Error deleting key '${key}' from bucket '${bucket}':`, err);
                                reject(err);
                            }
                        });
                    });
                    resolve(rslt);
                }
            });
        });
    } catch (err) {
        console.error(`Error clearing data from bucket '${bucket}':`, err);
        throw err;
    }
}

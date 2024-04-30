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
        const postsData = JSON.parse(fs.readFileSync('../data/posts.json', 'utf8'));
        const commentsData = JSON.parse(fs.readFileSync('../data/comments.json', 'utf8'));
        const messagesData = JSON.parse(fs.readFileSync('../data/messages.json', 'utf8'));
        const chatsData = JSON.parse(fs.readFileSync('../data/chats.json', 'utf8'));
        const followsData = JSON.parse(fs.readFileSync('../data/follows.json', 'utf8'));
        const followersData = JSON.parse(fs.readFileSync('../data/followers.json', 'utf8'));
        const favoritesData = JSON.parse(fs.readFileSync('../data/favorites.json', 'utf8'));

        // Store users data
        for (let i = 0; i < usersData.length; i += 100) {
            const batch = usersData.slice(i, i + 100);
            await Promise.all(batch.map(user => storeData('User', user.username, user)));
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
            await Promise.all(batch.map(follow => storeData('Follows', follow.username, follow)));
        }

        await checkDataStored('Follows', 'gwindram0');

        // Store followers data
        for (let i = 0; i < followersData.length; i += batchSize) {
            const batch = followersData.slice(i, i + batchSize);
            await Promise.all(batch.map(follower => storeData('Followers', follower.username, follower)));
        }

        await checkDataStored('Followers', 'gwindram0');

        // Store messages data
        for (let i = 0; i < messagesData.length; i += batchSize) {
            const batch = messagesData.slice(i, i + batchSize);
            await Promise.all(batch.map(message => storeData('Message', message.id.toString(), message)));
        }

        await checkDataStored('Message', '1');

        // Store favorites data
        for (let i = 0; i < favoritesData.length; i += batchSize) {
            const batch = favoritesData.slice(i, i + batchSize);
            await Promise.all(batch.map(favorite => storeDataWithSecIndex('Favorite', favorite.id.toString(), favorite)));
        }

        await checkDataStored('Favorite', '1');

        // store posts data with secondary index being the user id
        for (let i = 0; i < postsData.length; i += batchSize) {
            const batch = postsData.slice(i, i + batchSize);
            await Promise.all(batch.map(function(post) { 
                storeDataWithSecIndex('Post', post.id.toString(), post);
            }));
        }

        await checkDataStored('Post', '1');

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
        try {
            const riakObj = new Riak.Commands.KV.RiakObject();
            riakObj.setContentType('application/json');
            riakObj.setValue(JSON.stringify(value));
            riakObj.addToIndex('username_bin', value.username);
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

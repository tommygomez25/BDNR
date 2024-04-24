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
    deleteAllData();
});


async function deleteAllData() {
    try {
        const buckets = ['User', 'Comment', 'Chat', 'Follows', 'Followers', 'Message', 'Favorite', 'Post']; 

        // Iterate over each bucket and delete its contents
        await Promise.all(buckets.map(bucket => deleteBucketData(bucket)));

        console.log('All data deleted successfully.');
    } catch (err) {
        console.error('Error deleting data:', err);
    }
}

async function deleteBucketData(bucket) {
    try {
        // Fetch keys from the bucket
        const keys = await fetchKeys(bucket);

        console.log('Keys:', keys)

        // Delete each key from the bucket
        await Promise.all(keys.map(key => deleteData(bucket, key)));

        console.log(`Deleted all data from bucket '${bucket}'.`);
    } catch (err) {
        console.error(`Error deleting data from bucket '${bucket}':`, err);
        throw err;
    }
}

async function fetchKeys(bucket) {
    return new Promise((resolve, reject) => {
        client.listKeys({ bucket: bucket }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                resolve(rslt.keys);
            }
        });
    });
}

async function deleteData(bucket, key) {
    return new Promise((resolve, reject) => {
        client.deleteValue({ bucket: bucket, key: key }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                resolve(rslt);
            }
        });
    });
}

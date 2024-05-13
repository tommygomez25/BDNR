'use strict';

var async = require('async');
var assert = require('assert');
var logger = require('winston');
var fs = require('fs');
var Riak = require('basho-riak-client');
var http = require('http');
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

        await Promise.all(buckets.map(bucket => deleteBucketData(bucket)));

        console.log('All data deleted successfully.');
    } catch (err) {
        console.error('Error deleting data:', err);
    }
}

async function deleteBucketData(bucket) {
    try {
        const keys = await fetchKeys(bucket);

        console.log('KEYS: ', keys)
        
        await Promise.all(keys.map(key => deleteData(bucket, key)));

        console.log(`Deleted all data from bucket '${bucket}'.`);
    } catch (err) {
        console.error(`Error deleting data from bucket '${bucket}':`, err);
        throw err;
    }
}

async function fetchKeys(bucket) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            hostname: 'localhost',
            port: 8098,
            path: `/buckets/${bucket}/keys?keys=true`,
            method: 'GET'
        };

        const req = http.request(requestOptions, (res) => {
            if (res.statusCode === 200) {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const keys = JSON.parse(data).keys;
                    resolve(keys);
                });
            } else {
                reject(`Failed to fetch keys from bucket '${bucket}'. Status code: ${res.statusCode}`);
            }
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function deleteData(bucket, key) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            hostname: 'localhost',
            port: 8098,
            path: `/buckets/${bucket}/key/${key}`,
            method: 'DELETE'
        };

        const req = http.request(requestOptions, (res) => {
            if (res.statusCode === 204) {
                resolve();
            } else {
                reject(`Failed to delete data from bucket '${bucket}'. Status code: ${res.statusCode}`);
            }
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

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
});

async function listAndPrintBucketContent(bucket) {
    try {
        const response = await new Promise((resolve, reject) => {
            client.listKeys({ bucket: bucket }, (err, response) => {
                if (err) {
                    console.error(`Error listing keys from bucket '${bucket}':`, err);
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
        const keys = response.keys;

        console.log('keys: ', keys);

        for (const key of keys) {
            const result = await new Promise((resolve, reject) => {
                client.fetchValue({ bucket: bucket, key: key }, (err, rslt) => {
                    if (err) {
                        console.error(`Error reading data from bucket '${bucket}' with key '${key}':`, err);
                        reject(err);
                    } else {
                        resolve(rslt);
                    }
                });
            });

            if (result.content) {
                console.log(`Value for key '${key}' in bucket '${bucket}':`, result.content.value);
            } else {
                console.log(`No value found for key '${key}' in bucket '${bucket}'`);
            }
        }
    } catch (err) {
        console.error(`Error processing bucket '${bucket}':`, err);
        throw err;
    }
};


listAndPrintBucketContent('Words');

'use strict';

var async = require('async');
var assert = require('assert');
var logger = require('winston');
var fs = require('fs');
var Riak = require('basho-riak-client');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

var query_keys = [];
function query_cb(err, rslt) {
    if (err) {
        throw new Error(err);
    }

    if (rslt.done) {
        query_keys.forEach(function (key) {
            logger.info("2i query key: '%s'", key);
        });
    }

    if (rslt.values.length > 0) {
        Array.prototype.push.apply(query_keys,
            rslt.values.map(function (value) {
                return value.objectKey;
            }));
    }
}


var cmd = new Riak.Commands.KV.SecondaryIndexQuery.Builder()
    .withBucketType('default')
    .withBucket('Comment')
    .withIndexName('username_bin')
    .withIndexKey('dcoughlanrq')
    .withCallback(query_cb)
    .build();

var cmd = new Riak.Commands.KV.SecondaryIndexQuery.Builder()
    .withBucketType('default')
    .withBucket('Favorite')
    .withIndexName('userId_bin')
    .withIndexKey('13')
    .withCallback(query_cb)
    .build();

var cmd = new Riak.Commands.KV.FetchValue.Builder()
    .withBucketType('default')
    .withBucket('User')
    .withKey('adad')
    .withCallback(function (err, rslt) {
        if (err) {
            throw new Error(err);
        }

        if (rslt.values.length > 0) {
            var user = JSON.parse(rslt.values.shift().value.toString());
            logger.info("User: '%s'", user.username);
        }
    })
    .build();

var cmd = new Riak.Commands.KV.FetchValue.Builder()
    .withBucketType('default')
    .withBucket('Post')
    .withKey('591997')
    .withCallback(function (err, rslt) {
        if (err) {
            throw new Error(err);
        }

        if (rslt.values.length > 0) {
            var post = JSON.parse(rslt.values.shift().value.toString());
            logger.info("Post: '%s'", post.title);
        }
    })
    .build();

var cmd = new Riak.Commands.KV.FetchValue.Builder()
.withBucketType('default')
.withBucket('Post')
.withKey('1')
.withCallback(function (err, rslt) {
    if (err) {
        throw new Error(err);
    }

    if (rslt.values.length > 0) {
        var post = JSON.parse(rslt.values.shift().value.toString());
        logger.info("Post: '%s'", post);
    }
    else if (rslt.values.length === 0) {
        logger.info("No values found");
    }
    else if (rslt.done) {
        logger.info("Done");
    }
})
.build();


client.execute(cmd);

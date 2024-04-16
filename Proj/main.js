var Riak = require('basho-riak-client');
var async = require('async');
var fs = require('fs');

var nodes = ['localhost:8087'];

var client = new Riak.Client(nodes, function (err, c) {
    if (err) {
        throw new Error(err);
    } else {
        console.log('Connection to Riak cluster established');
    }
});

fs.readFile('./data/users.json', 'utf8', function (err, data) {
    if (err) {
        throw new Error(err);
    } else {
        var users = JSON.parse(data);

        console.log('Data loaded from file: ' + users.length + ' users');

        var storeFuncs = [];
        users.forEach(function (user) {
            // create functions execute in parallel
            storeFuncs.push(function (async_cb) {
                client.storeValue({
                        bucket: 'user',
                        key: user.username,
                        value: user
                    },
                    function (err, rslt) {
                        async_cb(err, rslt);
                    }
                );
            });
        });

        async.parallel(storeFuncs, function (err, rslts) {
            if (err) {
                throw new Error(err);
            } else {
                console.log('Data saved in bucket User');
            }
        });
    }
});

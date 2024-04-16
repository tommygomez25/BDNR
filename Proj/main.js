var Riak = require('basho-riak-client');

var nodes = [
    'localhost:8087'
];

var client = new Riak.Client(nodes, function (err, c) {
    if (err) {
        throw new Error(err);
    } else {
        console.log('Connection to Riak cluster established');
    }
});

client.ping(function (err, rslt) {
    if (err) {
        throw new Error(err);
    } else {
        console.log(rslt);
    }
});

var async = require('async');

var people = [
    {
        emailAddress: "bashoman@riak.com",
        firstName: "Riak",
        lastName: "Man"
    },
    {
        emailAddress: "johndoe@gmail.com",
        firstName: "John",
        lastName: "Doe"
    }
];

var storeFuncs = [];
people.forEach(function (person) {
    // Create functions to execute in parallel to store people
    storeFuncs.push(function (async_cb) {
        client.storeValue({
                bucket: 'contributors',
                key: person.emailAddress,
                value: person
            },
            function(err, rslt) {
                async_cb(err, rslt);
            }
        );
    });
});

async.parallel(storeFuncs, function (err, rslts) {
    if (err) {
        throw new Error(err);
    }
});

var logger = require('winston');

client.fetchValue({ bucket: 'contributors', key: 'bashoman@riak.com', convertToJs: true },
    function (err, rslt) {
        if (err) {
            throw new Error(err);
        } else {
            var riakObj = rslt.values.shift();
            var bashoman = riakObj.value;
            logger.info("I found %s in 'contributors'", bashoman.emailAddress);
            bashoman.FirstName = "Riak";
            riakObj.setValue(bashoman);
            client.storeValue({ value: riakObj }, function (err, rslt) {
                if (err) {
                    throw new Error(err);
                }
            });
        
        }
    }
);

// print first names of all contributors
client.listKeys({ bucket: 'contributors' }, function (err, rslt) {
    if (err) {
        throw new Error(err);
    } else {
        rslt.keys.forEach(function (key) {
            client.fetchValue({ bucket: 'contributors', key: key, convertToJs: true },
                function (err, rslt) {
                    if (err) {
                        throw new Error(err);
                    } else {
                        var riakObj = rslt.values.shift();
                        var person = riakObj.value;
                        logger.info("Contributor: %s", person.firstName);
                    }
                }
            );
        });
    }
});
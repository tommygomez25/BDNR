const express = require('express');
const router = express.Router();
const Riak = require('basho-riak-client');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);


router.get('/', (req, res) => {
    res.send('Hello from route.js!');
});

// get user by username
router.get('/user/:username', (req, res) => {
    const username = req.params.username;
    client.fetchValue({ bucket: 'User', key: username }, (err, rslt) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        const user = rslt.values.shift().value;
        res.send(user);
    }
    );
});


module.exports = router;
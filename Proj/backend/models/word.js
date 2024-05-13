const Riak = require('basho-riak-client');
const { word } = require('../routes');

class Word {
constructor(word, posts) {
    this.word = word;
    this.posts = posts;
}

save() {
    const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
    const cluster = new Riak.Cluster({ nodes: [node] });
    const client = new Riak.Client(cluster);

    const riakSet = new Riak.Commands.KV.RiakObject();
    riakSet.setContentType('application/json');
    riakSet.setValue(this.posts);

    return new Promise((resolve, reject) => {
        client.storeValue({ bucket: 'Words', key: this.word, value: riakSet }, (err, rslt) => {
            if (err) {
                // key is string , < 100
                if ( parseInt(key) < 1000) {
                    console.error(`Error storing data in bucket 'words' with key '${this.word}':`, err);
                }
                
                reject(err);
            } else {
                console.log(`Data stored in bucket bucket 'words' with key '${this.word}' and value '${this.posts}'`);
                resolve(rslt);
            }
        });
    });
}
}

module.exports = Word;

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

    const riakObj = new Riak.Commands.KV.RiakObject();
    riakObj.setContentType('application/json');
    riakObj.setValue(JSON.stringify(this.posts));
    return new Promise((resolve, reject) => {
        client.storeValue({ bucket: 'Word', value: riakObj, key: this.id.toString() }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                client.storeValue({ bucket: 'Word', value: riakObj, key: this.word }, (err, rslt) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rslt);
                    }
                }
                );
            }
        }
        );
    }
    );
}
}

module.exports = Word;

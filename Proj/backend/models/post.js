const Riak = require('basho-riak-client');
const { post } = require('../routes');

class Post {
constructor(id, title, content, postDate, postTime, numLikes, numFavs, postPrivacy, wasEdited, username,comments, popularityScore) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.postDate = postDate;
    this.postTime = postTime;
    this.numLikes = numLikes;
    this.numFavs = numFavs;
    this.postPrivacy = postPrivacy;
    this.wasEdited = wasEdited;
    this.username = username;
    this.popularityScore = popularityScore;
    this.comments = comments;
}

save() {
    const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
    const cluster = new Riak.Cluster({ nodes: [node] });
    const client = new Riak.Client(cluster);

    const riakObj = new Riak.Commands.KV.RiakObject();
    riakObj.setContentType('application/json');
    riakObj.setValue(JSON.stringify(this));
    riakObj.addToIndex('username_bin', this.username);
    return new Promise((resolve, reject) => {
        client.storeValue({ bucket: 'Post', value: riakObj, key: this.id.toString() }, (err, rslt) => {
            if (err) {
                reject(err);
            } else {
                client.storeValue({ bucket: this.username, value: riakObj, key: 'post_' + this.postDate + '_' + this.postTime }, (err, rslt) => {
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

module.exports = Post;

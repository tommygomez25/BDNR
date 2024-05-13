const Riak = require('basho-riak-client');
const { keys } = require('curlrequest/errors');

class Chat {
    constructor(id, title, dateCreated, timeCreated) {
        this.id = id;
        this.title = title;
        this.dateCreated = dateCreated;
        this.timeCreated = timeCreated;
    }

    save() {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        const users = this.id.split(':');

        const riakObj = new Riak.Commands.KV.RiakObject();
        riakObj.setContentType('application/json');
        riakObj.setValue(JSON.stringify(this));

        riakObj.addToIndex('user1_bin', users[0]);
        riakObj.addToIndex('user2_bin', users[1]);

        return new Promise((resolve, reject) => {
            client.storeValue({ bucket: 'Chat', value: riakObj, key: this.id.toString() }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rslt);
                }
            });
        });
    }

    static getChatKeysByUsername(username) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        const pushKeys = [];
        
        return new Promise((resolve, reject) => {
            client.secondaryIndexQuery({ bucket: 'Chat', indexName: 'users_bin', indexKey: username }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Rslt:", rslt);
                    rslt.values.forEach(value => {
                        pushKeys.push(value.objectKey);
                    });
    
                    if(rslt.done) {
                        resolve(pushKeys);
                    }
                }
            });
        });
    };

    static getChatById(id) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        return new Promise((resolve, reject) => {
            client.fetchValue({ bucket: 'Chat', key: id }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    const chat = JSON.parse(rslt.values.shift().value.toString());
                    resolve(chat);
                }
            });
        }
        );
    }

    static getChatByUsername(username) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        return new Promise((resolve, reject) => {
            let chats = [];
            client.listKeys({ bucket: 'Chat' }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    let processedKeys = 0;

                    console.log("Keys:", rslt.keys);
                    console.log("===");
        
                    if (rslt.keys.length === 0) {
                        resolve(chats);  // Resolve with empty array if no keys found
                    }
        
                    rslt.keys.forEach(key => {
                        key = key.toString();
                        const parts = key.split(':');
                        const left = parts[0];
                        const right = parts[1];
        
                        if (left === username || right === username) {

                            console.log("Fetching chat:", key);

                            client.fetchValue({ bucket: 'Chat', key: key }, (err, rslt) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    const chat = JSON.parse(rslt.values.shift().value.toString());
                                    console.log("Chat:", chat);
                                    chats.push(chat);
                                }
                                processedKeys++;
                                if (processedKeys === 100) {
                                    console.log("Chats:", chats);
                                    resolve(chats);
                                }
                            });
                        } else {
                            processedKeys++;
                            if (processedKeys === 100) {
                                resolve(chats);
                            }
                        }
                    });
                }
            });        
        });
    }

}

module.exports = Chat;
        


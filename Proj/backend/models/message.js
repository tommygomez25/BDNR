const Riak = require('basho-riak-client');

class Message {
    constructor(id, content, dateSent, timeSent, sender, receiver, chatID) {
        this.id = id;
        this.content = content;
        this.dateSent = dateSent;
        this.timeSent = timeSent;
        this.senderID = sender;
        this.receiverID = receiver;
        this.chatID = chatID;
    }

    save() {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        const riakObj = new Riak.Commands.KV.RiakObject();
        riakObj.setContentType('application/json');
        riakObj.setValue(JSON.stringify(this));

        return new Promise((resolve, reject) => {
            client.storeValue({ bucket: 'Message', value: riakObj, key: this.id.toString() }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rslt);
                }
            });
        });

    }

    static async sendMessage(id, content, dateSent, timeSent, sender, receiver) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        // get the length of the keys in the bucket with the id in the key
        let keyLength = 0;

        let keyLength_1 = await new Promise((resolve, reject) => {
            client.listKeys({ bucket: 'Message' }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    // iterate through the keys and get the length of the keys
                    if (rslt.keys.length === 0) {
                        resolve(keyLength);
                    }

                    rslt.keys.forEach(key => {
                        key = key.toString();

                        if (key.includes(id)) {
                            keyLength++;
                        }
                    });
                }
            });
        });

        keyLength_1 = keyLength + 1;

        // create a new message with the key length plus 1
        const message = new Message(id + ':' + keyLength_1, content, dateSent, timeSent, sender, receiver, id);
        console.log('Message:', message);
        message.save();
    }

    static getMessagesByChatID(chatID) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        console.log('chatID:', chatID);
        let messages = [];

        return new Promise((resolve, reject) => {
            client.listKeys({ bucket: 'Message' }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    let processedKeys = 0;

                    if (rslt.keys.length === 0) {
                        console.log("No keys found");
                        console.log("===");
                        console.log("Processed keys:", processedKeys);
                        console.log("Messages:", messages);
                        resolve(messages);  // Resolve with empty array if no keys found
                    }

                    rslt.keys.forEach(key => {
                        key = key.toString();
                        const parts = key.split(':');
                        const left = parts[0];
                        const right = parts[1];
                        const id = parts[2];
                        
                        // join left and right to form chatID
                        const keyChatID = left + ':' + right;

                        if(keyChatID === chatID) {
                            
                            client.fetchValue({ bucket: 'Message', key: key }, (err, rslt) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    const message = JSON.parse(rslt.values.shift().value.toString('utf8'));
                                    messages.push(message);
                                    processedKeys++;
                                }
                            });
                        }


                    });
                }
            });
        });

    }

}

module.exports = Message;
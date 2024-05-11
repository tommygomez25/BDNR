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

    static sendMessage(id, content, dateSent, timeSent, sender, receiver, chatID) {
        const message = new Message(id, content, dateSent, timeSent, sender, receiver, chatID);
        return message.save();
    }

    static getMessagesByChatID(chatID) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        console.log('chatID:', chatID);

        return new Promise((resolve, reject) => {
            let messages = [];
            client.listKeys({ bucket: 'Message' }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    let processedKeys = 0;

                    if (rslt.keys.length === 0) {
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

                        if(keyChatID !== chatID) {
                            processedKeys++;
                            if (processedKeys === rslt.keys?.length) {
                                resolve(messages);
                            }
                            return;
                        }

                        console.log('Fetching message:', key);
                        console.log('ChatID:', keyChatID);

                        client.fetchValue({ bucket: 'Message', key: key }, (err, rslt) => {
                            if (err) {
                                reject(err);
                            } else {

                                // see if message belongs to chatID
                                const message = JSON.parse(rslt.values[0].value.toString('utf8'));
                                messages.push(message);
                                console.log('Message:', message);
                                
                                processedKeys++;
                                if (processedKeys === rslt.keys?.length) {
                                    resolve(messages);

                                
                                }
                            }
                        });

                    });
                }
            });
        });

    }

}

module.exports = Message;
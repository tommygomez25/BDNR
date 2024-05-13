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

        let keyLength = 0;

        let keyLength_1 = await new Promise((resolve, reject) => {
            client.listKeys({ bucket: 'Message' }, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
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

        const message = new Message(id + ':' + keyLength_1, content, dateSent, timeSent, sender, receiver, id);
        console.log('Message:', message);
        message.save();
    }

    static getMessagesByChatID(chatID) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);
        let messages = [];
        let messageID = 1;
        let isFetchingComplete = false;
    
        function fetchNextMessage() {
            client.fetchValue({ bucket: 'Message', key: chatID + ':' + messageID }, (err, rslt) => {
                if (err) {
                    console.error(err);
                    isFetchingComplete = true;
                    return;
                }
                if (rslt.values.length === 0) {
                    isFetchingComplete = true;
                    return;
                } else {
                    const message = JSON.parse(rslt.values.shift().value.toString('utf8'));
                    messages.push(message);
                    messageID++;
                    fetchNextMessage();
                }
            });
        }
    
        fetchNextMessage();

        return new Promise((resolve) => {
            const checkCompletion = setInterval(() => {
                if (isFetchingComplete) {
                    clearInterval(checkCompletion);
                    resolve(messages);
                }
            }, 100);
        });
    };
}

module.exports = Message;
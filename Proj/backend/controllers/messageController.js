const Riak = require('basho-riak-client');
const Message = require('../models/message');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const getMessagesByChatID = async (req, res) => {
    const chatID = req.params.id;
    try {
        const messages = await Message.getMessagesByChatID(chatID);
        console.log('Messages?:', messages);
        res.status(200).send(messages);

    } catch (error) {
        res.status(400).send(error);
    }
};


const sendMessage = async (req, res) => {
    const { id, content, sender, receiver } = req.body;
    const date = new Date();
    const dateSent = date.toLocaleDateString();
    const timeSent = date.toLocaleTimeString();

    console.log('Date:', dateSent);
    console.log('Time:', timeSent);
    console.log('Sender:', sender);
    console.log('Receiver:', receiver);
    console.log('Content:', content);
    console.log('ID:', id);

    try {
        await Message.sendMessage(id, content, dateSent, timeSent, sender, receiver);
        console.log('Message sent!');
        res.status(201).send();

    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = { getMessagesByChatID, sendMessage };
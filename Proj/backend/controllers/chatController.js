const Riak = require('basho-riak-client');
const Chat = require('../models/chat');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const createChat = async (req, res) => {
    const { title, id } = req.body;

    const date = new Date();
    const dateCreated = date.toLocaleDateString();
    const timeCreated = date.toLocaleTimeString();

    const chat = new Chat(id, title, dateCreated, timeCreated);

    try {
        await chat.save();
        res.status(201).send(chat);

    } catch (error) {
        res.status(400).send(error);
    }
};

const getChats = async (req, res) => {
    const { username } = req.params;
    console.log('Username:!', username);
    try {
        const chats = await Chat.getChatByUsername(username);
        console.log('Chats:', chats);   
        res.status(200).send(chats);

    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports = { createChat, getChats };
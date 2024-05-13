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
    const chats = [];
    const chatKeys = await Chat.getChatKeysByUsername(username);

    console.log('chatKeys: ', chatKeys);

    for(const key of chatKeys) {
        const chat = await Chat.getChatById(key);
        console.log('chat: ', chat);
        chats.push(chat);
    }

    res.status(200).send(chats);
};

module.exports = { createChat, getChats };
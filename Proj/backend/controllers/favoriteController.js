const Riak = require('basho-riak-client');
const Favorite = require('../models/favorite');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const jwt = require('jsonwebtoken');
const moment = require('moment');

const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

const createFavorite = async (req, res) => {
    const { postId } = req.body;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        console.log('Username:', username);
        console.log('Post ID:', postId);

        await Favorite.addFavorite(username, postId);
        res.status(201).send();

    } catch (error) {
        res.status(400).send(error);
    }
};

const deleteFavorite = async (req, res) => {
    const postId = req.params.id;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        await Favorite.delete(username, postId);
        res.status(204).send();

    } catch (error) {
        console.log('Error deleting favorite:', error);
        res.status(400).send(error);
    }
};

const checkFavorite = async (req, res) => {
    const postId = req.params.id;

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        const isFavorited = await Favorite.checkFav(username, postId);
        res.status(200).send({ isFavorited });

    } catch (error) {
        res.status(400).send(error);
    }
};

const getFavorites = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const username = decodedToken.username;

    try {
        const favorites = await Favorite.getFavorites(username);
        console.log('Favorites:', favorites);
        res.status(200).send(favorites);
    } catch (error) {
        res.status(400).send(error);
    }
};



module.exports = { createFavorite, deleteFavorite, checkFavorite, getFavorites };
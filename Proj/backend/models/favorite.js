const Riak = require('basho-riak-client');

class Favorite {
    constructor(username, postIDs) {
        this.username = username;
        this.postIDs = postIDs;
    }

    save() {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);
    
        const riakObj = new Riak.Commands.KV.RiakObject();
        riakObj.setContentType('application/json');
        riakObj.setValue(JSON.stringify({ postIDs: this.postIDs }));
    
        console.log("Attempting to save:", { username: this.username, postID: this.postIDs });
    
        return new Promise((resolve, reject) => {
            client.storeValue({ bucket: 'Favorite', key: this.username, value: riakObj }, (err, rslt) => {
                if (err) {
                    console.error("Error saving favorite:", err);
                    reject(err);
                } else {
                    console.log("Favorite saved successfully", rslt);
                    resolve(rslt);
                }
            });
        });
    }

    static addFavorite(username, postID) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        console.log(`Adding favorite for ${username} and post ${postID}`);

        return new Promise((resolve, reject) => {
            client.fetchValue({ bucket: 'Favorite', key: username }, (err, rslt) => {
                if (err) {

                    // if the user doesn't have any favorites yet, create a new favorite object
                    if (err.message === 'notfound') {
                        const riakObj = new Riak.Commands.KV.RiakObject();
                        riakObj.setContentType('application/json');
                        riakObj.setValue(JSON.stringify({ postIDs: [postID] }));

                        client.storeValue({ bucket: 'Favorite',
                            key: username,
                            value: riakObj }, (err, rslt) => {
                            if (err) {
                                console.error("Error adding favorite:", err);
                                reject(err);
                            } else {
                                console.log("Favorite added successfully", rslt);
                                resolve(rslt);
                            }
                        });
                        return;
                    }

                    console.error("Error adding favorite:", err);
                    reject(err);

                } else {
                    const values = rslt.values.map(value => JSON.parse(value.value.toString('utf8')));
                    const postIDs = values[0].postIDs;
                    postIDs.push(postID);
                    const riakObj = new Riak.Commands.KV.RiakObject();
                    riakObj.setContentType('application/json');
                    riakObj.setValue(JSON.stringify({ postIDs }));

                    client.storeValue({ bucket: 'Favorite', key: username, value: riakObj }, (err, rslt) => {
                        if (err) {
                            console.error("Error adding favorite:", err);
                            reject(err);
                        } else {
                            console.log("Favorite added successfully", rslt);
                            resolve(rslt);
                        }
                    });
                }
            });
        });
    }
    
    static checkFav(username, postID) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);
    
        console.log(`Fetching favorite status for ${username} and post ${postID}`);
    
        return new Promise((resolve, reject) => {
            client.fetchValue({ bucket: 'Favorite', key: username }, (err, rslt) => {
                if (err) {
                    console.error("Error fetching favorite:", err);
                    reject(err);
                } else {
                    const values = rslt.values.map(value => JSON.parse(value.value.toString('utf8')));
                    console.log("Favorite values:", values);
                    console.log("Post ID:", postID);
                    // check if the postID is in the list of favorites
                    let isFavorited = false;
                    for (let i = 0; i < values[0]?.postIDs.length; i++) {
                        if(values[0].postIDs.includes(postID)) {
                            isFavorited = true;
                            break;
                        } 
                    }
                    resolve(isFavorited);
                }
            });
        });
    }

    static delete(username, postID) {

        console.log("Deleting favorite:", { username, postID });
    
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);
    
        console.log("Attempting to delete favorite:", { username, postID });
    
        return new Promise((resolve, reject) => {
            // delete the postID from the list of favorites
            client.fetchValue({ bucket: 'Favorite', key: username }, (err, rslt) => {
                if (err) {
                    console.error("Error deleting favorite:", err);
                    reject(err);
                } else {
                    const values = rslt.values.map(value => JSON.parse(value.value.toString('utf8')));
                    console.log("Favorite values:", values);
                    
                    let postIDs = [];

                    for (let i = 0; i < values[0].postIDs.length; i++) {
                        if (values[0].postIDs[i] !== postID) {
                            postIDs.push(values[0].postIDs[i]);
                        }
                    }

                    const riakObj = new Riak.Commands.KV.RiakObject();
                    riakObj.setContentType('application/json');
                    riakObj.setValue(JSON.stringify({ postIDs }));
    
                    client.storeValue({ bucket: 'Favorite', key: username, value: riakObj }, (err, rslt) => {
                        if (err) {
                            console.error("Error deleting favorite:", err);
                            reject(err);
                        } else {
                            console.log("Favorite deleted successfully", rslt);
                            resolve(rslt);
                        }
                    });
                }
            });
        });
    }

    static getFavorites(username) {
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        console.log(`Fetching favorites for ${username}`);

        return new Promise((resolve, reject) => {
            client.fetchValue({ bucket: 'Favorite', key: username }, (err, rslt) => {
                if (err) {
                    console.error("Error fetching favorites:", err);
                    reject(err);
                } else {
                    // return username and postIDs
                    const values = rslt.values.map(value => JSON.parse(value.value.toString('utf8')));
                    console.log("Favorite values!:", values);
                    resolve(values);
                }
            }
        )});

    }
    
    
}

module.exports = Favorite;
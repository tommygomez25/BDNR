// UserModel.js

const Riak = require('basho-riak-client');
const bcrypt = require('bcrypt');

class User {
    constructor(username, firstName, lastName, email, password, gender, bio, phoneNumber, birthday, location, profileVisibility, messagePrivacy) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = this.encryptPassword(password);
        this.gender = gender;
        this.bio = bio;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
        this.location = location;
        this.profileVisibility = profileVisibility;
        this.messagePrivacy = messagePrivacy;
    }

    encryptPassword(password) {
        const saltRounds = 5;
        return bcrypt.hashSync(password, saltRounds);
    }

    save() {
        
        const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
        const cluster = new Riak.Cluster({ nodes: [node] });
        const client = new Riak.Client(cluster);

        const riakObj = new Riak.Commands.KV.RiakObject();
        riakObj.setContentType('application/json');
        riakObj.setValue(JSON.stringify(this));
        return new Promise((resolve, reject) => {
            client.storeValue({ bucket: 'User', value: riakObj, key:this.username}, (err, rslt) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rslt);
                }
            });
        });
    }
}

module.exports = User;
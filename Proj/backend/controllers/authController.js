

const bcrypt = require('bcrypt');
const { getUserByUsername } = require('../middleware');
const User = require('../models/user');

// is valid password
const isValidPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const registerUser = async (req, res) => {
    try {
        console.log(req.body)

        const { username, firstName, lastName, email, password, gender, bio, phoneNumber, birthday, location, profileVisibility, messagePrivacy } = req.body;
        
        
        let existingUser = null;
        try {
            existingUser = await getUserByUsername(username);
        } catch (error) {
            console.error('The user doesnt exist, proceed to register:', error);
        }
        console.log("Passss: ", password)
        const newUser = new User(
            username,
            firstName,
            lastName,
            email,
            password,
            gender,
            bio,
            phoneNumber,
            birthday,
            location,
            profileVisibility,
            messagePrivacy
        );

        console.log("sass")
        await newUser.save();
        console.log("KDOWKD")
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};


const loginUser = async (req, res) => {
    try {
        
        const { username, password } = req.body;

        
        const user = await getUserByUsername(username);

        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const isValid = await isValidPassword(password, user.passwordHash);

        
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
};


module.exports = { registerUser, loginUser };



const bcrypt = require('bcrypt');
const { getUserByUsername } = require('../controllers/userController');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const isValidPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const registerUser = async (req, res) => {
    try {

        const { username, firstName, lastName, email, password, gender, bio, phoneNumber, birthday, location, profileVisibility, messagePrivacy } = req.body;
        
        
        let existingUser = null;
        try {
            existingUser = await getUserByUsername(username);
        } catch (error) {
            console.error('The user doesnt exist, proceed to register:', error);
        }
  
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

        await newUser.save();
        
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

        console.log('User:', user);

        if(user.passwordHash === undefined){
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
            res.status(200).json({ token });
        } else {
            const isValid = await isValidPassword(password, user.passwordHash);

            
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
            res.status(200).json({ token });
        }

    } catch (error) {
        
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
};

const validateToken = async (req, res) => {
    try {
        
        const token = req.body.token;

        
        jwt.verify(token, process.env.JWT_SECRET);

        
        res.status(200).json({ message: 'Token is valid' });

    } catch (error) {
        
        console.error('Error validating token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}

const getCurrentUser = async (req, res) => {
    try {
        
        const token = req.headers.authorization.split(' ')[1];
        console.log('Token:', token);

        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        
        const user = await getUserByUsername(decodedToken.username);

        
        res.status(200).json(user);

    } catch (error) {
        
        console.error('Error getting current user:', error);
        res.status(500).json({ message: 'Error getting current user' });
    }
};


module.exports = { registerUser, loginUser, getCurrentUser, validateToken };

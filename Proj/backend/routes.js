const express = require('express');
const router = express.Router();
const { getUserByUsername, getCommentsByUsername, getFavoritePostsByUsername, getNumFollowersByUsername, getNumFollowingByUsername } = require('./middleware');
const { registerUser,loginUser, validateToken, getCurrentUser } = require('./controllers/authController');
const { getPostsByUsername, createPost, getPostById, deletePostById, updatePost} = require('./controllers/postController');
const jwt = require('jsonwebtoken');


router.get('/user/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const user = await getUserByUsername(username);
        console.log("User: ", user  )
        const posts = await getPostsByUsername(username);
        console.log("Posts: ", posts)
        const comments = await getCommentsByUsername(username);
        console.log("Comments: ", comments)
        const favoritePosts = await getFavoritePostsByUsername(username);
        console.log("FavoritePosts: ", favoritePosts)
        const followers = await getNumFollowersByUsername(username);
        console.log("Followers: ", followers)
        const following = await getNumFollowingByUsername(username);
        console.log("Following: ", following)
        res.status(200).send([user, posts, comments, following, followers, favoritePosts]);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/validate-token', validateToken);

router.get('/current-user', getCurrentUser);

router.post('/create-post', createPost);

router.get('/post/:id', async (req, res) => {
    const postId = req.params.id;
    let username = '';
    const token = req.headers.authorization.split(' ')[1];
    if (token !== 'null') {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        username = decodedToken.username;
    }

    try {
        
        const post = await getPostById(postId);

        post.isAuthor = post.username === username;

        res.status(200).send(post);
    } catch (error) {
        if (error.message === 'Post not found') {
            res.status(404).send(error.message);
        } else {
            res.status(500).send(error);
        }
    }
});

router.delete('/post/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        await deletePostById(postId);
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error);
    }
});

// update post
router.put('/post/:id', updatePost);


module.exports = router;
